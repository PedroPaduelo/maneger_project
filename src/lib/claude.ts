import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  baseURL: process.env.ANTHROPIC_BASE_URL,
});

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
      if (this.shouldCreateProject(responseText, lastUserMessage)) {
        const actionResult = await this.executeProjectCreation(responseText, context.userId);
        return {
          content: `${responseText}\n\n${actionResult}`,
          usage: response.usage ? {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens
          } : undefined
        };
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
      // Extrair informações da resposta usando análise de texto
      const projectInfo = this.extractProjectInfo(response);

      if (!projectInfo.name || !projectInfo.description) {
        return "⚠️ Não foi possível extrair informações suficientes para criar o projeto automaticamente.";
      }

      // Criar projeto diretamente via Prisma
      const { prisma } = await import('@/lib/db');

      // Criar projeto
      const project = await prisma.project.create({
        data: {
          name: projectInfo.name,
          description: projectInfo.description,
          stack: projectInfo.stack || 'Next.js, TypeScript, Prisma, Tailwind CSS',
          priority: projectInfo.priority || 'Média',
          tags: projectInfo.tags || '',
          userId: userId,
          status: 'Ativo',
          progress: 0
        }
      });

      // Se houver requisitos, criá-los
      let requirementsCount = 0;
      if (projectInfo.requirements && projectInfo.requirements.length > 0) {
        const createdRequirements = await Promise.all(
          projectInfo.requirements.map(req =>
            prisma.requirement.create({
              data: {
                title: req.title,
                description: req.description,
                type: req.type || 'Funcional',
                category: req.category || 'Geral',
                priority: req.priority || 'Média',
                projectId: project.id
              }
            })
          )
        );
        requirementsCount = createdRequirements.length;
      }

      // Se houver tasks, criar também
      let tasksCount = 0;
      if (projectInfo.tasks && projectInfo.tasks.length > 0) {
        const createdTasks = await Promise.all(
          projectInfo.tasks.map(task =>
            prisma.task.create({
              data: {
                title: task.title,
                description: task.description,
                guidancePrompt: task.guidancePrompt || task.title,
                additionalInformation: task.additionalInformation || '',
                status: 'Pendente',
                projectId: project.id,
                createdBy: 'Arquiteto AI',
                updatedBy: 'Arquiteto AI'
              }
            })
          )
        );

        // Criar todos para cada task
        await Promise.all(
          createdTasks.map(async (task, index) => {
            const taskData = projectInfo.tasks[index];
            if (taskData.todos && Array.isArray(taskData.todos)) {
              await Promise.all(
                taskData.todos.map((todo: string, todoIndex: number) =>
                  prisma.taskTodo.create({
                    data: {
                      taskId: task.id,
                      description: todo,
                      isCompleted: false,
                      sequence: todoIndex
                    }
                  })
                )
              );
            }
          })
        );

        tasksCount = createdTasks.length;
      }

      // Criar entrada no histórico
      await prisma.historySummary.create({
        data: {
          projectId: project.id,
          summary: `Projeto "${project.name}" criado pelo Arquiteto AI com ${requirementsCount} requisitos e ${tasksCount} tasks.`,
          createdBy: 'Arquiteto AI'
        }
      });

      return `✅ **Projeto criado com sucesso!**

📁 **Projeto:** ${project.name}
📝 **Descrição:** ${project.description}
🛠️ **Stack:** ${project.stack}
📊 **Prioridade:** ${project.priority}
🆔 **ID:** ${project.id}

📋 **Requisitos criados:** ${requirementsCount}
✅ **Tasks criadas:** ${tasksCount}

Você pode acessar o projeto na dashboard para ver todos os detalhes e começar a trabalhar nas tasks!`;

    } catch (error) {
      console.error('Erro ao executar criação de projeto:', error);
      return "⚠️ Ocorreu um erro ao criar o projeto no sistema, mas o plano foi elaborado com sucesso.";
    }
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