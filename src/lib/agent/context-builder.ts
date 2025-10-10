import { Prisma } from '@prisma/client';

interface BuildOptions {
  userId: string;
  take?: number;
  includeHistory?: boolean;
}

interface ProjectDigest {
  id: number;
  name: string;
  status: string;
  priority: string;
  progress: number;
  description: string;
  stack: string;
  updatedAt: Date;
  requirements: Array<{ id: number; title: string; priority: string }>;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    pendingTodos: number;
    totalTodos: number;
    updatedAt: Date;
  }>;
  history?: Array<{ id: number; summary: string; createdAt: Date }>;
}

export class ProjectContextBuilder {
  async build(options: BuildOptions): Promise<string | null> {
    const { userId, take = 3, includeHistory = true } = options;
    const { prisma } = await import('@/lib/db');

    const projects = await prisma.project.findMany({
      where: {
        userId
      },
      include: {
        requirements: {
          select: {
            id: true,
            title: true,
            priority: true
          },
          orderBy: { updatedAt: 'desc' },
          take: 6
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            taskTodos: {
              select: {
                id: true,
                isCompleted: true
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5
        },
        historySummaries: includeHistory
          ? {
              select: {
                id: true,
                summary: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' },
              take: 2
            }
          : false
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take
    });

    if (projects.length === 0) {
      return null;
    }

    const contextLines = projects.map((project) => {
      const digest = this.toDigest(project);
      return this.formatDigest(digest);
    });

    return contextLines.join('\n\n');
  }

  private toDigest(project: Prisma.ProjectGetPayload<{
    include: {
      requirements: true;
      tasks: {
        select: {
          id: true;
          title: true;
          status: true;
          updatedAt: true;
          taskTodos: {
            select: { id: true; isCompleted: true };
          };
        };
      };
      historySummaries: true;
    };
  }>): ProjectDigest {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      description: project.description,
      stack: project.stack,
      updatedAt: project.updatedAt,
      requirements: project.requirements || [],
      tasks: (project.tasks || []).map((task) => {
        const totalTodos = task.taskTodos?.length || 0;
        const pendingTodos = task.taskTodos?.filter((todo) => !todo.isCompleted).length || 0;
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          pendingTodos,
          totalTodos,
          updatedAt: task.updatedAt
        };
      }),
      history: project.historySummaries?.map((item) => ({
        id: item.id,
        summary: item.summary,
        createdAt: item.createdAt
      }))
    };
  }

  private formatDigest(digest: ProjectDigest): string {
    const header = `Projeto #${digest.id} — ${digest.name} [${digest.status} | Prioridade: ${digest.priority} | Progresso: ${digest.progress}%]`;
    const description = `Descrição: ${truncate(digest.description, 280)}`;
    const stack = `Stack: ${digest.stack}`;
    const updated = `Atualizado em: ${digest.updatedAt.toISOString()}`;

    const requirements = digest.requirements.length
      ? [
          'Principais requisitos:',
          ...digest.requirements.slice(0, 5).map((req) => `- (${req.priority}) ${req.title}`)
        ].join('\n')
      : 'Sem requisitos cadastrados.';

    const tasks = digest.tasks.length
      ? [
          'Tasks recentes:',
          ...digest.tasks.map((task) => {
            const todoInfo =
              task.totalTodos > 0 ? ` • Checklist: ${task.totalTodos - task.pendingTodos}/${task.totalTodos}` : '';
            return `- [${task.status}] ${task.title}${todoInfo}`;
          })
        ].join('\n')
      : 'Sem tasks registradas ainda.';

    const history = digest.history && digest.history.length
      ? [
          'Histórico recente:',
          ...digest.history.map((entry) => `- (${entry.createdAt.toISOString()}) ${truncate(entry.summary, 160)}`)
        ].join('\n')
      : null;

    return [
      header,
      description,
      stack,
      updated,
      requirements,
      tasks,
      history
    ]
      .filter(Boolean)
      .join('\n');
  }
}

function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}
