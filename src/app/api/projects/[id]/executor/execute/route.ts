import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { StartExecutionRequest, TaskExecution } from '@/types/executor';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Armazenamento em memória para execuções (em produção, usar Redis ou database)
const executions = new Map<string, TaskExecution>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const body: StartExecutionRequest = await request.json();

    // Verificar se projeto pertence ao usuário
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Verificar se projeto tem caminho de execução configurado
    if (!project.executionPath) {
      return NextResponse.json(
        {
          error: 'Diretório de execução não configurado',
          message: 'Configure o diretório de execução do projeto antes de executar tasks. Vá em Editar Projeto → Diretório de Execução.'
        },
        { status: 400 }
      );
    }

    // Buscar tasks para executar
    let tasks;
    if (body.taskIds && body.taskIds.length > 0) {
      tasks = await db.task.findMany({
        where: {
          id: { in: body.taskIds },
          projectId,
        },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      tasks = await db.task.findMany({
        where: {
          projectId,
          status: { in: ['Pendente', 'Em Andamento'] },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks found to execute' },
        { status: 400 }
      );
    }

    // Criar nova execução
    const executionId = uuidv4();
    const execution: TaskExecution = {
      id: executionId,
      projectId,
      status: 'pending',
      currentTaskIndex: 0,
      totalTasks: tasks.length,
      startedAt: new Date(),
      successCount: 0,
      errorCount: 0,
      skippedCount: 0,
      logs: [
        {
          id: uuidv4(),
          timestamp: new Date(),
          level: 'info',
          message: `Execution started with ${tasks.length} tasks by ${user.email}`,
        },
        {
          id: uuidv4(),
          timestamp: new Date(),
          level: 'info',
          message: `Execution path: ${project.executionPath}`,
        },
      ],
      tasks,
    };

    // Armazenar execução
    executions.set(executionId, execution);

    // Iniciar processamento assíncrono
    processExecution(executionId, tasks, project.executionPath);

    return NextResponse.json(execution, { status: 201 });
  } catch (error) {
    console.error('Error starting execution:', error);
    return NextResponse.json(
      { error: 'Failed to start execution' },
      { status: 500 }
    );
  }
}

// Função para processar execução localmente
async function processExecution(
  executionId: string,
  tasks: any[],
  executionPath: string
) {
  const execution = executions.get(executionId);
  if (!execution) return;

  execution.status = 'running';
  executions.set(executionId, execution);

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    // Verificar se execução foi parada
    const currentExecution = executions.get(executionId);
    if (currentExecution?.status === 'stopped') {
      break;
    }

    execution.currentTaskIndex = i;
    execution.currentTask = task;

    // Log de início da task
    execution.logs.push({
      id: uuidv4(),
      timestamp: new Date(),
      level: 'info',
      message: `Starting task: ${task.title}`,
      taskId: task.id,
    });

    try {
      // Executar comandos da task localmente
      const result = await executeTaskLocally(task, executionPath);

      // Salvar resultado
      await db.task.update({
        where: { id: task.id },
        data: {
          status: 'Concluída',
          result: result.output,
        },
      });

      execution.successCount++;
      execution.logs.push({
        id: uuidv4(),
        timestamp: new Date(),
        level: 'success',
        message: `Task completed successfully: ${task.title}`,
        taskId: task.id,
      });

      // Adicionar output aos logs
      if (result.output) {
        execution.logs.push({
          id: uuidv4(),
          timestamp: new Date(),
          level: 'info',
          message: result.output,
          taskId: task.id,
        });
      }
    } catch (error: any) {
      execution.errorCount++;
      execution.logs.push({
        id: uuidv4(),
        timestamp: new Date(),
        level: 'error',
        message: `Task failed: ${task.title}`,
        taskId: task.id,
      });

      execution.logs.push({
        id: uuidv4(),
        timestamp: new Date(),
        level: 'error',
        message: error.message || 'Unknown error',
        taskId: task.id,
      });

      await db.task.update({
        where: { id: task.id },
        data: {
          status: 'Erro',
          result: error.message,
        },
      });
    }

    executions.set(executionId, execution);
  }

  // Finalizar execução
  execution.status = 'completed';
  execution.completedAt = new Date();
  execution.logs.push({
    id: uuidv4(),
    timestamp: new Date(),
    level: 'success',
    message: `Execution completed: ${execution.successCount} successful, ${execution.errorCount} failed`,
  });

  executions.set(executionId, execution);
}

// Executar task localmente usando child_process
async function executeTaskLocally(
  task: any,
  executionPath: string
): Promise<{ output: string }> {
  try {
    // Extrair comandos do guidancePrompt
    let commands = task.guidancePrompt || task.description || '';

    // Verificar se deve usar comando Claude (independentemente do conteúdo atual)
    if (shouldUseClaudeCommand(commands)) {
      commands = await interpolateClaudeCommand(task);

      // Log para debug do comando gerado
      console.log('🔧 Comando Claude gerado:', commands);
      console.log('📏 Tamanho do comando:', commands.length, 'caracteres');
    }

    // Validar se é um comando válido antes de executar
    if (!isValidCommand(commands)) {
      throw new Error(
        `Comando inválido: "${commands}". O campo guidancePrompt deve conter apenas comandos shell válidos.`
      );
    }

    // Executar comando no diretório especificado
    const { stdout, stderr } = await execAsync(commands, {
      cwd: executionPath,
      timeout: 14400000, // 4 horas timeout (para suportar tasks de 3+ horas)
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer para aumentar capacidade
    });

    const output = [stdout, stderr].filter(Boolean).join('\n');

    return { output };
  } catch (error: any) {
    let errorMessage = `Command execution failed: ${error.message}`;

    // Adicionar informações específicas se for timeout
    if (error.code === 'ETIMEDOUT') {
      errorMessage += '\n\n⚠️ ERRO DE TIMEOUT: A execução ultrapassou o tempo limite (4 horas).\nDica: Considere dividir tasks grandes em partes menores.';
    }

    // Adicionar stderr se existir
    if (error.stderr) {
      errorMessage += `\n\nStderr:\n${error.stderr}`;
    }

    // Adicionar stdout se existir (pode conter resultado parcial)
    if (error.stdout) {
      errorMessage += `\n\nStdout (saída parcial):\n${error.stdout}`;
    }

    // Adicionar comando executado para debug
    errorMessage += `\n\nComando executado:\n${commands}`;

    throw new Error(errorMessage);
  }
}

// Verificar se deve usar comando Claude
function shouldUseClaudeCommand(command: string): boolean {
  const claudePatterns = [
    /^claude\s/,
    /^claude\s+--dangerously-skip-permissions/,
    /^claude\s+--permission-mode/,
  ];

  // Se já for um comando Claude explícito
  if (claudePatterns.some(pattern => pattern.test(command.trim()))) {
    return true;
  }

  // Sempre usar Claude para interpolação de tasks
  // Se chegou aqui, é texto descritivo que precisa ser interpolado
  return true;
}

// Verificar se é um comando Claude explícito
function isClaudeCommand(command: string): boolean {
  const claudePatterns = [
    /^claude\s/,
    /^claude\s+--dangerously-skip-permissions/,
    /^claude\s+--permission-mode/,
  ];
  return claudePatterns.some(pattern => pattern.test(command.trim()));
}

// Interpolar o conteúdo da task no comando Claude
async function interpolateClaudeCommand(task: any): Promise<string> {
  const baseCommand = 'claude --dangerously-skip-permissions --permission-mode acceptEdits --verbose --print --output-format json';

  // Montar o conteúdo base como no Python
  let promptContent = task.guidancePrompt || task.title || '';

  // Adicionar descrição se existir
  if (task.description) {
    promptContent += `\n\nDescrição: ${task.description}`;
  }

  // Adicionar informações adicionais se existirem
  if (task.additionalInformation) {
    promptContent += `\n\nInformações adicionais: ${task.additionalInformation}`;
  }

  // Buscar TODOs da task no banco de dados (como no Python)
  try {
    const todos = await db.taskTodo.findMany({
      where: { taskId: task.id },
      orderBy: { sequence: 'asc' }
    });

    if (todos && todos.length > 0) {
      promptContent += `\n\n📋 ITENS TODO (${todos.length} itens):`;
      todos.forEach((todo: any, index: number) => {
        const status = todo.isCompleted ? '✅' : '⏳';
        promptContent += `\n${index + 1}. [${status}] ${todo.description}`;
      });
    }
  } catch (error) {
    console.log('Erro ao buscar TODOs da task:', error);
  }

  // Escapar aspas no conteúdo do prompt para evitar quebra do comando
  const escapedPromptContent = promptContent.replace(/"/g, '\\"');

  // Retornar o comando completo com o prompt interpolado
  return `${baseCommand} "${escapedPromptContent}"`;
}

// Função para validar se o texto contém comandos shell válidos
function isValidCommand(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const trimmedText = text.trim();

  // Verificar se é um comando Claude API válido
  const claudePatterns = [
    /^claude\s/,
    /^claude\s+--dangerously-skip-permissions/,
    /^claude\s+--permission-mode/,
  ];

  if (claudePatterns.some(pattern => pattern.test(trimmedText))) {
    return true;
  }

  // Verificar se é texto em português (descritivo) mas não um comando
  const portugueseWords = ['quero que ajuste', 'gostaria que', 'preciso que', 'crie um', 'desenvolva um', 'implemente um'];
  const lowerText = trimmedText.toLowerCase();

  // Se contiver frases descritivas completas, provavelmente não é um comando shell
  if (portugueseWords.some(phrase => lowerText.includes(phrase))) {
    return false;
  }

  // Verificar se parece com um comando shell básico
  const commandPatterns = [
    /^npm\s/,
    /^yarn\s/,
    /^node\s/,
    /^npx\s/,
    /^git\s/,
    /^ls$/,
    /^pwd$/,
    /^mkdir\s/,
    /^rm\s/,
    /^cp\s/,
    /^mv\s/,
    /^cat\s/,
    /^echo\s/,
    /^touch\s/,
    /^chmod\s/,
    /^docker\s/,
    /^python\s/,
    /^pip\s/,
    /^java\s/,
    /^javac\s/,
    /^mvn\s/,
    /^gradle\s/,
    /^./,
  ];

  return commandPatterns.some(pattern => pattern.test(trimmedText));
}

export { executions };
