import { MCPClient, MCPTool } from './mcp-client';

export interface ArchitectProject {
  name: string;
  description: string;
  type: string;
  requirements: string[];
  stack: string[];
  timeline?: string;
  features?: string[];
}

export interface ArchitectAnalysis {
  project: ArchitectProject;
  architecture: {
    components: string[];
    database: string;
    apis: string[];
    patterns: string[];
  };
  phases: Array<{
    name: string;
    description: string;
    tasks: string[];
    estimatedDays: number;
  }>;
  risks: string[];
  recommendations: string[];
}

export class ArchitectAgent {
  private mcpClient: MCPClient;
  private isInitialized: boolean = false;
  private tools: MCPTool[] = [];
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    const baseUrl = process.env.MCP_AGENT_BASE_URL || process.env.NEXT_PUBLIC_MCP_AGENT_BASE_URL || '';
    this.mcpClient = new MCPClient(baseUrl);
  }

  // Garante que apenas uma instância seja inicializada
  private static instance: ArchitectAgent | null = null;
  private static instancePromise: Promise<ArchitectAgent> | null = null;

  static async getInstance(): Promise<ArchitectAgent> {
    if (!ArchitectAgent.instance && !ArchitectAgent.instancePromise) {
      ArchitectAgent.instancePromise = (async () => {
        const agent = new ArchitectAgent();
        await agent.initialize();
        ArchitectAgent.instance = agent;
        return agent;
      })();
    }
    return ArchitectAgent.instancePromise!;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando Agente Arquiteto...');

      // Se não houver URL configurada, operar em modo fallback imediatamente
      // Mantém compatibilidade e evita falhas quando o MCP não está disponível
      const baseUrl = process.env.MCP_AGENT_BASE_URL || process.env.NEXT_PUBLIC_MCP_AGENT_BASE_URL || '';
      if (!baseUrl) {
        console.warn('MCP_AGENT_BASE_URL não configurada. Agente Arquiteto operará em modo fallback.');
        this.isInitialized = true;
        this.tools = [];
        return; // Finaliza inicialização em modo fallback
      }

      // Conectar ao MCP server com timeout
      await Promise.race([
        this.mcpClient.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na inicialização do Agente Arquiteto (20s)')), 20000)
        )
      ]);

      // Inicializar e listar tools com timeout
      // Dispara listagem de tools, mas não bloqueia a inicialização caso não haja resposta
      // Permite que o agente funcione em fallback enquanto as tools carregam via notificação
      this.mcpClient.initialize().catch((err) => {
        console.warn('Inicialização de tools MCP falhou (continuando em fallback):', err?.message || err);
      });

      // Aguardar um pouco para carregar as tools
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.tools = this.mcpClient.getTools();
      console.log('Tools do arquiteto carregadas:', this.tools.map(t => t.name));

      this.isInitialized = true;
      console.log('Agente Arquiteto inicializado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar Agente Arquiteto:', error);
      console.warn('Agente Arquiteto operará em modo fallback (sem tools MCP)');
      // Marcar como inicializado mesmo sem MCP para permitir operação em modo fallback
      this.isInitialized = true;
      this.tools = [];
      // Não lança erro - permite que o agente continue em modo fallback
    }
  }

  private async callArchitectTool(toolName: string, args: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Agente Arquiteto não está inicializado');
    }

    try {
      const result = await this.mcpClient.callTool(toolName, args);
      return result;
    } catch (error) {
      console.error(`Erro ao chamar tool ${toolName}:`, error);
      throw error;
    }
  }

  async analyzeProject(description: string): Promise<ArchitectAnalysis> {
    try {
      console.log('Analisando projeto:', description);

      // Procurar por tools de análise
      const analysisTool = this.tools.find(t =>
        t.name.toLowerCase().includes('analyze') ||
        t.name.toLowerCase().includes('analysis') ||
        t.name.toLowerCase().includes('project')
      );

      if (analysisTool) {
        console.log('Usando tool:', analysisTool.name);
        const result = await this.callArchitectTool(analysisTool.name, {
          description,
          analysisType: 'complete'
        });
        return this.parseAnalysisResult(result);
      }

      // Fallback: análise baseada em templates
      return this.generateTemplateAnalysis(description);
    } catch (error) {
      console.error('Erro na análise do projeto:', error);
      return this.generateTemplateAnalysis(description);
    }
  }

  async generateArchitecture(projectInfo: ArchitectProject): Promise<any> {
    try {
      console.log('Gerando arquitetura para:', projectInfo.name);

      // Procurar por tools de arquitetura
      const archTool = this.tools.find(t =>
        t.name.toLowerCase().includes('architecture') ||
        t.name.toLowerCase().includes('design') ||
        t.name.toLowerCase().includes('structure')
      );

      if (archTool) {
        console.log('Usando tool de arquitetura:', archTool.name);
        const result = await this.callArchitectTool(archTool.name, {
          project: projectInfo,
          includeDiagrams: true,
          includeTechStack: true
        });
        return result;
      }

      // Fallback: arquitetura baseada em templates
      return this.generateTemplateArchitecture(projectInfo);
    } catch (error) {
      console.error('Erro na geração de arquitetura:', error);
      return this.generateTemplateArchitecture(projectInfo);
    }
  }

  async generateTasks(projectInfo: ArchitectProject, architecture: any): Promise<any[]> {
    try {
      console.log('Gerando tasks para:', projectInfo.name);

      // Procurar por tools de geração de tasks
      const taskTool = this.tools.find(t =>
        t.name.toLowerCase().includes('task') ||
        t.name.toLowerCase().includes('planning') ||
        t.name.toLowerCase().includes('roadmap')
      );

      if (taskTool) {
        console.log('Usando tool de tasks:', taskTool.name);
        const result = await this.callArchitectTool(taskTool.name, {
          project: projectInfo,
          architecture,
          includeTimelines: true,
          includeDependencies: true
        });
        return result.tasks || result;
      }

      // Fallback: tasks baseadas em templates
      return this.generateTemplateTasks(projectInfo, architecture);
    } catch (error) {
      console.error('Erro na geração de tasks:', error);
      return this.generateTemplateTasks(projectInfo, architecture);
    }
  }

  private parseAnalysisResult(result: any): ArchitectAnalysis {
    // Implementar parsing baseado no formato retornado pelo MCP
    try {
      if (result.analysis) {
        return result.analysis;
      }

      // Fallback se o formato for diferente
      return {
        project: {
          name: result.projectName || 'Projeto',
          description: result.description || '',
          type: result.type || 'web',
          requirements: result.requirements || [],
          stack: result.stack || ['Next.js', 'TypeScript', 'Prisma'],
          features: result.features || []
        },
        architecture: {
          components: result.components || [],
          database: result.database || 'PostgreSQL',
          apis: result.apis || [],
          patterns: result.patterns || []
        },
        phases: result.phases || [],
        risks: result.risks || [],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('Erro ao parsear resultado:', error);
      throw new Error('Formato de análise inválido');
    }
  }

  private generateTemplateAnalysis(description: string): ArchitectAnalysis {
    return {
      project: {
        name: this.extractProjectName(description),
        description: description,
        type: 'web',
        requirements: this.extractRequirements(description),
        stack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS', 'PostgreSQL'],
        features: []
      },
      architecture: {
        components: ['Frontend', 'Backend', 'Database', 'API'],
        database: 'PostgreSQL',
        apis: ['REST API', 'GraphQL'],
        patterns: ['MVC', 'Repository Pattern', 'Dependency Injection']
      },
      phases: [
        {
          name: 'Setup e Configuração',
          description: 'Configuração inicial do projeto',
          tasks: ['Setup do repositório', 'Configurar ambiente', 'Instalar dependências'],
          estimatedDays: 2
        },
        {
          name: 'Desenvolvimento Core',
          description: 'Desenvolvimento das funcionalidades principais',
          tasks: ['Implementar autenticação', 'Criar CRUD básico', 'Desenvolver APIs'],
          estimatedDays: 10
        },
        {
          name: 'Refinamento e Testes',
          description: 'Ajustes finos e garantia de qualidade',
          tasks: ['Testes unitários', 'Testes de integração', 'Code review'],
          estimatedDays: 5
        }
      ],
      risks: ['Complexidade técnica', 'Prazos apertados', 'Recursos limitados'],
      recommendations: ['Começar com MVP', 'Priorizar funcionalidades essenciais', 'Documentar tudo']
    };
  }

  private generateTemplateArchitecture(projectInfo: ArchitectProject): any {
    return {
      overview: `Arquitetura para ${projectInfo.name}`,
      frontend: {
        framework: 'Next.js',
        styling: 'Tailwind CSS',
        stateManagement: 'React Hooks / Context',
        components: 'Component-based architecture'
      },
      backend: {
        runtime: 'Node.js',
        framework: 'Next.js API Routes',
        database: 'PostgreSQL com Prisma ORM',
        authentication: 'NextAuth.js'
      },
      deployment: {
        hosting: 'Vercel',
        database: 'Supabase / Railway',
        monitoring: 'Sentry'
      }
    };
  }

  private generateTemplateTasks(projectInfo: ArchitectProject, architecture: any): any[] {
    return [
      {
        title: 'Configuração do Projeto',
        description: 'Setup inicial do projeto com todas as ferramentas',
        guidancePrompt: 'Configurar o projeto Next.js com TypeScript, Prisma e Tailwind',
        todos: [
          'Criar projeto Next.js',
          'Configurar TypeScript',
          'Instalar Prisma',
          'Configurar Tailwind CSS',
          'Setup do banco de dados'
        ]
      },
      {
        title: 'Desenvolvimento da Autenticação',
        description: 'Implementar sistema de login e registro de usuários',
        guidancePrompt: 'Implementar autenticação com NextAuth.js',
        todos: [
          'Configurar NextAuth.js',
          'Criar pages de login/registro',
          'Implementar sessão',
          'Proteger rotas',
          'Criar middleware'
        ]
      },
      {
        title: 'CRUD Principal',
        description: 'Implementar as operações CRUD principais do sistema',
        guidancePrompt: 'Criar APIs e interfaces para CRUD principal',
        todos: [
          'Definir schema Prisma',
          'Criar APIs REST',
          'Implementar validações',
          'Criar interfaces',
          'Adicionar notificações'
        ]
      },
      {
        title: 'Interface e UX',
        description: 'Desenvolver a interface do usuário',
        guidancePrompt: 'Criar interface responsiva e intuitiva',
        todos: [
          'Design do layout',
          'Componentes reutilizáveis',
          'Responsividade',
          'Acessibilidade',
          'Animações'
        ]
      },
      {
        title: 'Testes e Deploy',
        description: 'Garantir qualidade e preparar para produção',
        guidancePrompt: 'Implementar testes e configurar deploy',
        todos: [
          'Testes unitários',
          'Testes de integração',
          'Configurar CI/CD',
          'Setup de produção',
          'Monitoramento'
        ]
      }
    ];
  }

  private extractProjectName(description: string): string {
    const patterns = [
      /criar (?:um|uma)?\s*([^:,\n]+)/i,
      /desenvolver (?:um|uma)?\s*([^:,\n]+)/i,
      /construir (?:um|uma)?\s*([^:,\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Novo Projeto';
  }

  private extractRequirements(description: string): string[] {
    const keywords = ['usuário', 'login', 'cadastro', 'painel', 'dashboard', 'sistema', 'api', 'banco'];
    const requirements: string[] = [];

    keywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        requirements.push(`Funcionalidade relacionada a ${keyword}`);
      }
    });

    if (requirements.length === 0) {
      requirements.push('Sistema básico de usuários', 'Interface administrativa', 'API REST');
    }

    return requirements;
  }

  getAvailableTools(): MCPTool[] {
    return this.tools;
  }

  isReady(): boolean {
    // Agora considera pronto se estiver inicializado, mesmo sem MCP (modo fallback)
    return this.isInitialized;
  }

  disconnect(): void {
    this.mcpClient.disconnect();
    this.isInitialized = false;
  }
}
