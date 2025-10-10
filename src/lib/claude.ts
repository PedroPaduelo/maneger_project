import Anthropic from '@anthropic-ai/sdk';
import { ArchitectAgent } from './architect-agent';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

// Instância singleton do agente arquiteto
let architectAgent: ArchitectAgent | null = null;
let architectAgentPromise: Promise<ArchitectAgent> | null = null;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Função para calcular créditos baseados em tokens (200k tokens = 10 créditos)
export function calculateCreditsFromTokens(totalTokens: number): number {
  const TOKENS_PER_CREDIT = 20000; // 200k tokens / 10 créditos = 20k tokens por crédito
  return Math.ceil(totalTokens / TOKENS_PER_CREDIT);
}

export interface ChatContext {
  sessionId?: number;
  userId: string;
  messages: ClaudeMessage[];
  systemPrompt?: string;
}

export class ClaudeService {
  static async sendMessage(context: ChatContext): Promise<ClaudeResponse> {
    try {
      const enhancedSystemPrompt = `${context.systemPrompt || process.env.DEFAULT_ARCHITECT_PROMPT}

IMPORTANTE: Você é um agente ativo que pode criar projetos, requisitos e tasks no sistema.
Quando o usuário pedir para criar um projeto ou estruturar algo, você deve:

1. Analisar a solicitação do usuário
2. Usar as ferramentas disponíveis para criar efetivamente os projetos no sistema
3. Fornecer feedback sobre o que foi criado

FERRAMENTAS DISPONÍVEIS:
- Criar projetos com requisitos
- Criar tasks para projetos existentes
- Estruturar planos completos

Sempre que criar algo, informe ao usuário o que foi criado e como pode acessar.`;

      const messages: Anthropic.MessageParam[] = context.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: enhancedSystemPrompt,
        messages: messages
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Resposta inválida da API Claude');
      }

      const responseText = content.text;

      // Verificar se a resposta contém indicação de criar projeto
      const lastUserMessage = context.messages[context.messages.length - 1]?.content;
      const interactive = (process.env.ARCHITECT_AGENT_INTERACTIVE || 'true') !== 'false';
      if (this.shouldCreateProject(responseText, lastUserMessage)) {
        const basicProjectInfo = this.extractProjectInfo(responseText);

        if (interactive && basicProjectInfo.name && basicProjectInfo.description) {
          // Retorna plano de ações parseável no frontend para confirmação
          const proposed = this.buildProposedActions(basicProjectInfo);
          const contentWithPlan = `${responseText}\n\n${proposed}`;
          return {
            content: contentWithPlan,
            usage: response.usage ? {
              input_tokens: response.usage.input_tokens,
              output_tokens: response.usage.output_tokens
            } : undefined
          };
        } else {
          // Modo autoexecução legacy
          const actionResult = await this.executeProjectCreation(responseText, context.userId);
          return {
            content: `${responseText}\n\n${actionResult}`,
            usage: response.usage ? {
              input_tokens: response.usage.input_tokens,
              output_tokens: response.usage.output_tokens
            } : undefined
          };
        }
      }

      return {
        content: responseText,
        usage: response.usage ? {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        } : undefined
      };
    } catch (error) {
      console.error('Erro ao comunicar com API Claude:', error);
      throw new Error('Falha ao processar mensagem com o assistente');
    }
  }

  // Constrói bloco de plano de ações parseável pela UI
  private static buildProposedActions(basicInfo: any): string {
    const actions: any[] = [];
    actions.push({
      type: 'create_project',
      payload: {
        name: basicInfo.name,
        description: basicInfo.description,
        stack: basicInfo.stack || 'Next.js, TypeScript, Prisma, Tailwind CSS, PostgreSQL',
        priority: basicInfo.priority || 'Média',
        tags: (basicInfo.tags || '') + ',AI-Generated',
        requirements: (basicInfo.requirements || []).map((r: any) => ({
          title: r.title || r,
          description: r.description || r,
          type: r.type || 'Funcional',
          category: r.category || 'Geral',
          priority: r.priority || 'Média'
        }))
      }
    });

    if (basicInfo.tasks && basicInfo.tasks.length > 0) {
      actions.push({
        type: 'create_tasks',
        payload: {
          tasks: basicInfo.tasks.map((t: any) => ({
            title: t.title || t,
            description: t.description || t,
            guidancePrompt: t.guidancePrompt || t.title || t,
            todos: Array.isArray(t.todos) ? t.todos : []
          }))
        }
      });
    }

    const plan = { version: 1, actions };
    // Delimitadores fáceis de detectar no frontend
    return `<!--AGENT_ACTIONS_START-->${JSON.stringify(plan)}<!--AGENT_ACTIONS_END-->`;
  }

  private static shouldCreateProject(response: string, userMessage?: string): boolean {
    // Keywords mais específicas que indicam intenção de criar projeto
    const createProjectKeywords = [
      'vou criar o projeto', 'vou estruturar o projeto', 'vamos criar o projeto',
      'projeto criado com sucesso', 'estrutura completa do projeto',
      'plano detalhado do projeto', 'requisitos do projeto definidos'
    ];

    // Keywords mais amplas para solicitação do usuário
    const userRequestKeywords = [
      'quero criar um projeto', 'quero desenvolver', 'preciso criar',
      'criar um sistema', 'desenvolver um aplicativo', 'construir uma plataforma',
      'quero fazer um', 'preciso desenvolver um', 'criar uma'
    ];

    // Verificar se a resposta contém indicação de criação
    const hasCreateIndicators = createProjectKeywords.some(keyword =>
      response.toLowerCase().includes(keyword)
    );

    // Verificar se o usuário está solicitando criação
    const hasUserRequest = userMessage && (
      userRequestKeywords.some(keyword =>
        userMessage.toLowerCase().includes(keyword)
      ) ||
      // Padrões mais específicos
      /^(quero|preciso|gostaria)\s+(criar|desenvolver|construir|fazer)/i.test(userMessage) ||
      /\b(sistema|aplicativo|plataforma|projeto|crm|erp|e-commerce|site)\b/i.test(userMessage)
    );

    // Só criar se houver indicação clara OU solicitação explícita do usuário
    return hasCreateIndicators || hasUserRequest;
  }

  private static async executeProjectCreation(response: string, userId: string): Promise<string> {
    try {
      // Extrair informações básicas da resposta
      const basicProjectInfo = this.extractProjectInfo(response);

      if (!basicProjectInfo.name || !basicProjectInfo.description) {
        return "⚠️ Não foi possível extrair informações suficientes para criar o projeto automaticamente.";
      }

      // Obter instância singleton do agente arquiteto
      try {
        if (!architectAgent && !architectAgentPromise) {
          architectAgentPromise = ArchitectAgent.getInstance();
          architectAgent = await architectAgentPromise;
          console.log('Agente Arquiteto inicializado com sucesso!');
        } else if (architectAgentPromise) {
          architectAgent = await architectAgentPromise;
        }

        // Usar o agente arquiteto para análise detalhada
        if (architectAgent && architectAgent.isReady()) {
          return this.createProjectWithArchitect(basicProjectInfo, userId);
        } else {
          console.warn('Agente Arquiteto não está pronto, usando fallback');
          return this.createProjectWithFallback(basicProjectInfo, userId);
        }
      } catch (error) {
        console.warn('Não foi possível inicializar o Agente Arquiteto, usando fallback:', error);
        return this.createProjectWithFallback(basicProjectInfo, userId);
      }

    } catch (error) {
      console.error('Erro ao executar criação de projeto:', error);
      return "⚠️ Ocorreu um erro ao criar o projeto no sistema, mas o plano foi elaborado com sucesso.";
    }
  }

  private static async createProjectWithArchitect(basicInfo: any, userId: string): Promise<string> {
    try {
      console.log('Usando Agente Arquiteto para criar projeto:', basicInfo.name);

      // Analisar projeto com o agente arquiteto
      const analysis = await architectAgent!.analyzeProject(basicInfo.description);

      // Gerar arquitetura detalhada
      const architecture = await architectAgent!.generateArchitecture(analysis.project);

      // Gerar tasks completas
      const tasks = await architectAgent!.generateTasks(analysis.project, architecture);

      // Criar projeto no banco com informações completas usando transação
      const { prisma } = await import('@/lib/db');

      const result = await prisma.$transaction(async (tx) => {
        // Criar projeto principal
        const project = await tx.project.create({
          data: {
            name: analysis.project.name,
            description: analysis.project.description,
            stack: analysis.project.stack.join(', '),
            priority: 'Alta',
            tags: 'AI-Generated,Arquitetura-Detalhada',
            userId: userId,
            status: 'Ativo',
            progress: 0,
            metadata: {
              analysis: analysis,
              architecture: architecture,
              generatedBy: 'Arquiteto-AI-MCP'
            }
          }
        });

        // Criar requisitos se houver
        let requirementsCount = 0;
        if (analysis.project.requirements.length > 0) {
          const requirementsData = analysis.project.requirements.map((req, index) => ({
            title: `Requisito ${index + 1}: ${req}`,
            description: req,
            type: 'Funcional' as const,
            category: this.categorizeRequirement(req),
            priority: 'Alta' as const,
            projectId: project.id
          }));

          await tx.requirement.createMany({
            data: requirementsData
          });
          requirementsCount = requirementsData.length;
        }

        // Criar tasks se houver
        let tasksCount = 0;
        if (tasks && tasks.length > 0) {
          // Primeiro criar as tasks
          const tasksData = tasks.map(task => ({
            title: task.title,
            description: task.description,
            guidancePrompt: task.guidancePrompt || task.title,
            additionalInformation: `Fase: ${task.title || 'Geral'} | Estimado: ${task.estimatedDays || 3} dias`,
            status: 'Pendente' as const,
            projectId: project.id,
            createdBy: 'Arquiteto AI (MCP)',
            updatedBy: 'Arquiteto AI (MCP)'
          }));

          const createdTasks = await tx.task.createMany({
            data: tasksData
          });
          tasksCount = createdTasks.count;

          // Buscar IDs das tasks criadas para criar os todos
          if (createdTasks.count > 0) {
            const createdTasksData = await tx.task.findMany({
              where: { projectId: project.id },
              orderBy: { id: 'asc' },
              take: createdTasks.count
            });

            // Criar todos para cada task
            const todosData: any[] = [];
            createdTasksData.forEach((task, index) => {
              const taskData = tasks[index];
              if (taskData.todos && Array.isArray(taskData.todos)) {
                taskData.todos.forEach((todo: string, todoIndex: number) => {
                  todosData.push({
                    taskId: task.id,
                    description: todo,
                    isCompleted: false,
                    sequence: todoIndex
                  });
                });
              }
            });

            if (todosData.length > 0) {
              await tx.taskTodo.createMany({
                data: todosData
              });
            }
          }
        }

        // Criar entrada no histórico
        await tx.historySummary.create({
          data: {
            projectId: project.id,
            summary: `**Projeto criado pelo Arquiteto AI (MCP)**

📊 **Análise:** ${analysis.project.name} (${analysis.project.type})
🏗️ **Arquitetura:** ${architecture.overview || 'Arquitetura moderna e escalável'}
📋 **Requisitos:** ${requirementsCount} requisitos funcionais
✅ **Tasks:** ${tasksCount} tasks estruturadas
🛠️ **Stack:** ${analysis.project.stack.join(', ')}

**Componentes principais:** ${architecture.components?.join(', ') || 'Frontend, Backend, Database'}
**Banco de dados:** ${architecture.database || 'PostgreSQL'}
**Padrões:** ${architecture.patterns?.join(', ') || 'MVC, Repository, DI'}

**Fases do projeto:** ${analysis.phases.map(p => p.name).join(' → ')}

**Principais riscos identificados:** ${analysis.risks.slice(0, 2).join(', ')}
**Recomendações:** ${analysis.recommendations.slice(0, 2).join(', ')}`,
            createdBy: 'Arquiteto AI (MCP)'
          }
        });

        return { project, requirementsCount, tasksCount };
      }, {
        timeout: 30000 // 30 segundos timeout para a transação
      });

      return this.generateSuccessMessage(
        result.project,
        analysis,
        architecture,
        result.requirementsCount,
        result.tasksCount
      );

    } catch (error) {
      console.error('Erro ao criar projeto com Arquiteto AI:', error);
      return this.createProjectWithFallback(basicInfo, userId);
    }
  }

  private static async createProjectWithFallback(basicInfo: any, userId: string): Promise<string> {
    try {
      console.log('Usando fallback para criar projeto:', basicInfo.name);

      const { prisma } = await import('@/lib/db');

      const result = await prisma.$transaction(async (tx) => {
        // Criar projeto principal
        const project = await tx.project.create({
          data: {
            name: basicInfo.name,
            description: basicInfo.description,
            stack: basicInfo.stack || 'Next.js, TypeScript, Prisma, Tailwind CSS, PostgreSQL',
            priority: basicInfo.priority || 'Média',
            tags: (basicInfo.tags || '') + ',AI-Generated',
            userId: userId,
            status: 'Ativo',
            progress: 0,
            metadata: {
              generatedBy: 'Arquiteto-AI-Fallback'
            }
          }
        });

        // Criar requisitos se houver
        let requirementsCount = 0;
        if (basicInfo.requirements && basicInfo.requirements.length > 0) {
          const requirementsData = basicInfo.requirements.map(req => ({
            title: req.title,
            description: req.description,
            type: req.type || 'Funcional',
            category: req.category || 'Geral',
            priority: req.priority || 'Média',
            projectId: project.id
          }));

          await tx.requirement.createMany({
            data: requirementsData
          });
          requirementsCount = requirementsData.length;
        }

        // Criar tasks se houver
        let tasksCount = 0;
        if (basicInfo.tasks && basicInfo.tasks.length > 0) {
          const tasksData = basicInfo.tasks.map(task => ({
            title: task.title,
            description: task.description,
            guidancePrompt: task.guidancePrompt || task.title,
            additionalInformation: task.additionalInformation || '',
            status: 'Pendente',
            projectId: project.id,
            createdBy: 'Arquiteto AI (Fallback)',
            updatedBy: 'Arquiteto AI (Fallback)'
          }));

          const createdTasks = await tx.task.createMany({
            data: tasksData
          });
          tasksCount = createdTasks.count;

          // Buscar tasks criadas para adicionar todos
          if (createdTasks.count > 0) {
            const createdTasksData = await tx.task.findMany({
              where: { projectId: project.id },
              orderBy: { id: 'asc' },
              take: createdTasks.count
            });

            const todosData: any[] = [];
            createdTasksData.forEach((task, index) => {
              const taskData = basicInfo.tasks[index];
              if (taskData.todos && Array.isArray(taskData.todos)) {
                taskData.todos.forEach((todo: string, todoIndex: number) => {
                  todosData.push({
                    taskId: task.id,
                    description: todo,
                    isCompleted: false,
                    sequence: todoIndex
                  });
                });
              }
            });

            if (todosData.length > 0) {
              await tx.taskTodo.createMany({
                data: todosData
              });
            }
          }
        }

        // Criar entrada no histórico
        await tx.historySummary.create({
          data: {
            projectId: project.id,
            summary: `Projeto "${project.name}" criado pelo Arquiteto AI (Fallback) com ${requirementsCount} requisitos e ${tasksCount} tasks.`,
            createdBy: 'Arquiteto AI (Fallback)'
          }
        });

        return { project, requirementsCount, tasksCount };
      }, {
        timeout: 20000 // 20 segundos timeout
      });

      return `✅ **Projeto criado com sucesso!**

📁 **Projeto:** ${result.project.name}
📝 **Descrição:** ${result.project.description}
🛠️ **Stack:** ${result.project.stack}
📊 **Prioridade:** ${result.project.priority}
🆔 **ID:** ${result.project.id}

📋 **Requisitos criados:** ${result.requirementsCount}
✅ **Tasks criadas:** ${result.tasksCount}

Você pode acessar o projeto na dashboard para ver todos os detalhes e começar a trabalhar nas tasks!`;

    } catch (error) {
      console.error('Erro no fallback:', error);
      return "⚠️ Ocorreu um erro ao criar o projeto no sistema, mas o plano foi elaborado com sucesso.";
    }
  }

  private static categorizeRequirement(requirement: string): string {
    const lower = requirement.toLowerCase();

    if (lower.includes('autenticação') || lower.includes('login') || lower.includes('usuário')) return 'Autenticação';
    if (lower.includes('banco') || lower.includes('dados') || lower.includes('armazenar')) return 'Dados';
    if (lower.includes('interface') || lower.includes('tela') || lower.includes('visual')) return 'Interface';
    if (lower.includes('api') || lower.includes('integração') || lower.includes('conexão')) return 'Integração';
    if (lower.includes('relatório') || lower.includes('análise') || lower.includes('dashboard')) return 'Relatórios';

    return 'Geral';
  }

  private static generateSuccessMessage(project: any, analysis: any, architecture: any, requirementsCount: number, tasksCount: number): string {
    return `✅ **Projeto criado com sucesso pelo Arquiteto AI (MCP)!**

📁 **Projeto:** ${project.name}
📝 **Descrição:** ${project.description}
🛠️ **Stack:** ${project.stack}
📊 **Prioridade:** Alta
🆔 **ID:** ${project.id}

🏗️ **Arquitetura Gerada:**
${architecture.overview || 'Arquitetura moderna e escalável'}

📋 **Requisitos Criados:** ${requirementsCount}
✅ **Tasks Estruturadas:** ${tasksCount}

🎯 **Principais Componentes:**
${architecture.components?.map((c: string) => `• ${c}`).join('\n') || '• Frontend\n• Backend\n• Database\n• API'}

💾 **Banco de Dados:** ${architecture.database || 'PostgreSQL'}
🔧 **Padrões:** ${architecture.patterns?.slice(0, 3).join(', ') || 'MVC, Repository, DI'}

📅 **Fases do Projeto:**
${analysis.phases.map((phase: any) => `**${phase.name}** (${phase.estimatedDays} dias)\n${phase.description}`).join('\n\n')}

⚠️ **Riscos Identificados:**
${analysis.risks.slice(0, 3).map((risk: string) => `• ${risk}`).join('\n')}

💡 **Recomendações:**
${analysis.recommendations.slice(0, 3).map((rec: string) => `• ${rec}`).join('\n')}

O projeto está pronto para desenvolvimento! Acesse a dashboard para ver todos os detalhes e começar a trabalhar nas tasks.`;
  }

  private static extractProjectInfo(response: string): any {
    const info: any = {
      requirements: [],
      tasks: []
    };

    // Extrair nome do projeto - múltiplos padrões
    const namePatterns = [
      /(?:projeto|sistema|plataforma|aplicativo)[:\s]*([^\n]+)/i,
      /\*\*([^*]+)\*\*\s*(?=será|terá|é|consiste)/i,
      /^#\s+([^\n]+)/m,
      /criar (?:o|a)?\s*([^:?\n]+)/i
    ];

    for (const pattern of namePatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        info.name = match[1].trim().replace(/\*\*/g, '');
        break;
      }
    }

    // Se não encontrar nome específico, usar a primeira linha significativa
    if (!info.name) {
      const lines = response.split('\n').filter(line => line.trim().length > 10);
      if (lines.length > 0) {
        info.name = lines[0].substring(0, 50).trim();
      }
    }

    // Extrair descrição - múltiplos padrões
    const descPatterns = [
      /(?:descrição|objetivo|finalidade|resumo)[:\s]*([^\n]+)/i,
      /que (?:será|terá|consiste em) ([^.]+)/i,
      /(?:é|trata-se de) ([^.]+)/i
    ];

    for (const pattern of descPatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        info.description = match[1].trim();
        break;
      }
    }

    // Se não encontrar descrição, usar as primeiras frases
    if (!info.description) {
      const sentences = response.split(/[.!?]/).filter(s => s.trim().length > 20);
      if (sentences.length > 0) {
        info.description = sentences[0].trim() + '.';
      }
    }

    // Stack padrão baseado no tipo de projeto
    info.stack = 'Next.js, TypeScript, Prisma, Tailwind CSS, PostgreSQL';

    // Extrair requisitos - mais robusto
    const requirementsSections = [
      { pattern: /##?\s*(?:requisitos|funcionalidades|features)[:\s]*([^#]*?)(?=##|$)/is, priority: 'Média' },
      { pattern: /\*\*(?:requisitos|funcionalidades)[:\*]*\*\*([^#]*?)(?=\*\*|$)/is, priority: 'Média' },
      { pattern: /(?:principais funcionalidades|recursos)[:\s]*([^#]*?)(?=##|$)/is, priority: 'Alta' }
    ];

    for (const section of requirementsSections) {
      const match = response.match(section.pattern);
      if (match) {
        const reqLines = match[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-*••]\s*/, '').trim())
          .filter(req => req.length > 3 && !req.toLowerCase().includes('requisito'));

        const category = this.categorizeRequirements(info.name, reqLines);

        info.requirements = reqLines.map((req, index) => ({
          title: this.extractRequirementTitle(req),
          description: req,
          type: this.determineRequirementType(req),
          category: category[index] || 'Geral',
          priority: section.priority
        }));

        break; // Usa apenas a primeira seção encontrada
      }
    }

    // Extrair possíveis tasks do conteúdo
    const taskPatterns = [
      /(?:passos|etapas|fases)[:\s]*([^#]*?)(?=##|$)/is,
      /##?\s*(?:implementação|desenvolvimento|timeline)[:\s]*([^#]*?)(?=##|$)/is
    ];

    for (const pattern of taskPatterns) {
      const match = response.match(pattern);
      if (match) {
        const taskLines = match[1]
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[-*••]\s*/, '').trim())
          .filter(task => task.length > 3);

        info.tasks = taskLines.map((task, index) => ({
          title: this.extractTaskTitle(task),
          description: task,
          guidancePrompt: task,
          todos: this.extractTaskTodos(task)
        }));

        break;
      }
    }

    return info;
  }

  private static categorizeRequirements(projectName: string, requirements: string[]): string[] {
    const categories = [];

    for (const req of requirements) {
      const lowerReq = req.toLowerCase();

      if (lowerReq.includes('autenticação') || lowerReq.includes('login') || lowerReq.includes('usuário')) {
        categories.push('Autenticação');
      } else if (lowerReq.includes('banco') || lowerReq.includes('dados') || lowerReq.includes('armazenar')) {
        categories.push('Dados');
      } else if (lowerReq.includes('interface') || lowerReq.includes('tela') || lowerReq.includes('visual')) {
        categories.push('Interface');
      } else if (lowerReq.includes('api') || lowerReq.includes('integração') || lowerReq.includes('conexão')) {
        categories.push('Integração');
      } else if (lowerReq.includes('relatório') || lowerReq.includes('análise') || lowerReq.includes('dashboard')) {
        categories.push('Relatórios');
      } else {
        categories.push('Geral');
      }
    }

    return categories;
  }

  private static determineRequirementType(requirement: string): string {
    const lowerReq = requirement.toLowerCase();

    if (lowerReq.includes('deve') || lowerReq.includes('precisa') || lowerReq.includes('obrigatório')) {
      return 'Funcional';
    } else if (lowerReq.includes('performance') || lowerReq.includes('segurança') || lowerReq.includes('disponibilidade')) {
      return 'Não Funcional';
    }

    return 'Funcional';
  }

  private static extractRequirementTitle(requirement: string): string {
    // Pega a primeira parte da requirement como título
    const parts = requirement.split(/[.,;!]/);
    return parts[0].trim().substring(0, 100);
  }

  private static extractTaskTitle(task: string): string {
    // Remove numeração e pega o essencial
    return task.replace(/^\d+\.\s*/, '').trim().substring(0, 80);
  }

  private static extractTaskTodos(task: string): string[] {
    // Extrair sub-itens da task
    const subItems = task.match(/[0-9]+\.\s*[^.,;]+/g) || [];
    return subItems.map(item => item.replace(/^\d+\.\s*/, '').trim());
  }

  // Função calculateCost removida - usaremos apenas tokens virtuais
  // static calculateCost(tokens: { input_tokens: number; output_tokens: number }): number {
  //   // Preços aproximados para Claude 3.5 Sonnet (outubro/2024)
  //   const inputCostPerToken = 0.000003; // $3 por 1M tokens
  //   const outputCostPerToken = 0.000015; // $15 por 1M tokens

  //   const inputCost = tokens.input_tokens * inputCostPerToken;
  //   const outputCost = tokens.output_tokens * outputCostPerToken;

  //   return Number((inputCost + outputCost).toFixed(6));
  // }

  static validateApiKey(): boolean {
    return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10);
  }
}

export default ClaudeService;
