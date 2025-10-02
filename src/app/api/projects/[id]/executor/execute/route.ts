import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StartExecutionRequest, TaskExecution } from '@/types/executor';
import { v4 as uuidv4 } from 'uuid';

// Armazenamento em memória para execuções (em produção, usar Redis ou database)
const executions = new Map<string, TaskExecution>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body: StartExecutionRequest = await request.json();

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
          message: `Execution started with ${tasks.length} tasks`,
        },
      ],
      tasks,
    };

    // Armazenar execução
    executions.set(executionId, execution);

    // Iniciar processamento assíncrono
    processExecution(executionId, tasks, body.config?.apiUrl);

    return NextResponse.json(execution, { status: 201 });
  } catch (error) {
    console.error('Error starting execution:', error);
    return NextResponse.json(
      { error: 'Failed to start execution' },
      { status: 500 }
    );
  }
}

// Função para processar execução (simulação - em produção, usar queue/worker)
async function processExecution(
  executionId: string,
  tasks: any[],
  apiUrl?: string
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
      // Simular execução da task (em produção, chamar API real)
      await simulateTaskExecution(task, apiUrl);

      // Atualizar status da task
      await db.task.update({
        where: { id: task.id },
        data: { status: 'Concluída' },
      });

      execution.successCount++;
      execution.logs.push({
        id: uuidv4(),
        timestamp: new Date(),
        level: 'success',
        message: `Task completed successfully: ${task.title}`,
        taskId: task.id,
      });
    } catch (error: any) {
      execution.errorCount++;
      execution.logs.push({
        id: uuidv4(),
        timestamp: new Date(),
        level: 'error',
        message: `Task failed: ${task.title} - ${error.message}`,
        taskId: task.id,
      });

      await db.task.update({
        where: { id: task.id },
        data: { status: 'Erro' },
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

// Simulação de execução de task
async function simulateTaskExecution(task: any, apiUrl?: string): Promise<void> {
  // Simular delay de 2-5 segundos
  const delay = Math.random() * 3000 + 2000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Simular chance de 10% de falha
  if (Math.random() < 0.1) {
    throw new Error('Random execution error');
  }
}

export { executions };
