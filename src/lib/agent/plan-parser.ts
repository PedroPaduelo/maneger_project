import { RawAgentPlan, RawAgentAction, NormalizedAgentAction, NormalizedAgentPlan } from './types';

const XML_PLAN_REGEX = /<agent_plan>([\s\S]*?)<\/agent_plan>/i;
const COMMENT_PLAN_REGEX = /<!--AGENT_PLAN_START-->([\s\S]*?)<!--AGENT_PLAN_END-->/i;
const CODE_FENCE_REGEX = /```[a-zA-Z]*\s*([\s\S]*?)```/;
const DEFAULT_STACK = 'Next.js, TypeScript, Prisma, Tailwind CSS, PostgreSQL';

interface ExtractResult {
  cleanedText: string;
  plan: RawAgentPlan | null;
}

export function extractPlanFromResponse(text: string): ExtractResult {
  if (!text) {
    return { cleanedText: '', plan: null };
  }

  let cleaned = text;
  let plan: RawAgentPlan | null = null;

  const xmlMatch = text.match(XML_PLAN_REGEX);
  const commentMatch = !xmlMatch ? text.match(COMMENT_PLAN_REGEX) : null;
  const match = xmlMatch || commentMatch;

  if (match) {
    const rawBlock = match[1] || '';
    const parsed = parsePlanBlock(rawBlock);
    if (parsed) {
      plan = parsed;
      cleaned = text.replace(match[0], '').trim();
    }
  }

  return { cleanedText: cleaned.trim(), plan };
}

export function normalizePlan(plan: RawAgentPlan | null): NormalizedAgentPlan | null {
  if (!plan || !Array.isArray(plan.actions) || plan.actions.length === 0) {
    return null;
  }

  const normalizedActions: NormalizedAgentAction[] = [];

  for (const action of plan.actions) {
    const result = normalizeAction(action);
    if (result.length > 0) {
      normalizedActions.push(...result);
    }
  }

  const notes = collectNotes(plan);

  return {
    version: 2,
    summary: plan.summary,
    notes: notes.length > 0 ? notes : undefined,
    actions: normalizedActions
  };
}

export function formatPlanComment(plan: NormalizedAgentPlan): string {
  return `<!--AGENT_ACTIONS_START-->${JSON.stringify(plan)}<!--AGENT_ACTIONS_END-->`;
}

function parsePlanBlock(rawBlock: string): RawAgentPlan | null {
  if (!rawBlock) return null;

  let content = rawBlock.trim();

  const fenceMatch = content.match(CODE_FENCE_REGEX);
  if (fenceMatch) {
    content = fenceMatch[1].trim();
  }

  // Remove optional XML tags if present
  content = content.replace(/^<plan>\s*/i, '').replace(/\s*<\/plan>$/i, '').trim();

  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn('Não foi possível parsear JSON do agent_plan:', error);
    return null;
  }
}

function normalizeAction(action: RawAgentAction | null | undefined): NormalizedAgentAction[] {
  if (!action || !action.type) {
    return [];
  }

  const type = action.type as string;
  if (type === 'create_project') {
    return normalizeCreateProjectAction(action);
  }

  if (type === 'create_tasks') {
    return normalizeCreateTasksAction(action);
  }

  return [];
}

function normalizeCreateProjectAction(action: RawAgentAction): NormalizedAgentAction[] {
  const payload = action.payload || {};

  const name = payload.name || action.project?.name;
  const description = payload.description || action.description;

  if (!name || !description) {
    return [];
  }

  const stack = payload.stack || DEFAULT_STACK;
  const priority = payload.priority || action.priority || 'Média';
  const tags = payload.tags || 'AI-Generated,Assistente';
  const requirements = normalizeRequirements(payload.requirements);

  const normalizedActions: NormalizedAgentAction[] = [
    {
      type: 'create_project',
      payload: {
        name,
        description,
        stack,
        priority,
        tags,
        requirements
      },
      metadata: {
        title: action.title,
        description: action.description,
        priority: action.priority,
        confidence: action.confidence,
        project: action.project
      }
    }
  ];

  const tasks = normalizeTasks(payload.tasks);
  if (tasks.length > 0) {
    normalizedActions.push({
      type: 'create_tasks',
      payload: { tasks },
      metadata: {
        title: 'Tasks iniciais para o novo projeto',
        project: {
          name,
          status: 'novo'
        }
      }
    });
  }

  return normalizedActions;
}

function normalizeCreateTasksAction(action: RawAgentAction): NormalizedAgentAction[] {
  const payload = action.payload || {};

  const tasks = normalizeTasks(payload.tasks);
  if (tasks.length === 0) {
    return [];
  }

  const projectId = payload.projectId || payload.project_id || action.project?.id;
  const projectName = payload.projectName || payload.project_name || action.project?.name;

  const normalized: NormalizedAgentAction = {
    type: 'create_tasks',
    payload: {
      tasks,
      ...(projectId ? { projectId } : {})
    },
    metadata: {
      title: action.title,
      description: action.description,
      priority: action.priority,
      confidence: action.confidence,
      project: projectId || projectName ? {
        id: projectId,
        name: projectName,
        status: projectId ? 'existente' : 'novo'
      } : undefined
    }
  };

  return [normalized];
}

function normalizeRequirements(requirements: any): Array<Record<string, any>> {
  if (!Array.isArray(requirements)) {
    return [];
  }

  return requirements
    .map((req: any, index: number) => {
      if (!req) return null;

      if (typeof req === 'string') {
        const trimmed = req.trim();
        if (!trimmed) return null;

        return {
          title: trimmed.substring(0, 100),
          description: trimmed,
          type: 'Funcional',
          category: inferRequirementCategory(trimmed),
          priority: 'Média'
        };
      }

      if (typeof req === 'object') {
        const title = req.title || req.name || req.description || `Requisito ${index + 1}`;
        const description = req.description || req.details || title;
        return {
          title: String(title).substring(0, 100),
          description: String(description),
          type: req.type || 'Funcional',
          category: req.category || inferRequirementCategory(description || title),
          priority: req.priority || 'Média'
        };
      }

      return null;
    })
    .filter((req): req is Record<string, any> => !!req);
}

function normalizeTasks(tasks: any): Array<Record<string, any>> {
  if (!Array.isArray(tasks)) {
    return [];
  }

  return tasks
    .map((task: any, index: number) => {
      if (!task) return null;

      if (typeof task === 'string') {
        const trimmed = task.trim();
        if (!trimmed) return null;
        return {
          title: trimmed.substring(0, 80),
          description: trimmed,
          guidancePrompt: trimmed,
          todos: []
        };
      }

      if (typeof task === 'object') {
        const title = task.title || task.name || task.description || `Task ${index + 1}`;
        const description = task.description || task.details || title;
        const todos = normalizeTodos(task.todos || task.subtasks);

        return {
          title: String(title).substring(0, 80),
          description: String(description),
          guidancePrompt: task.guidancePrompt || description || title,
          additionalInformation: task.additionalInformation,
          todos
        };
      }

      return null;
    })
    .filter((task): task is Record<string, any> => !!task);
}

function normalizeTodos(todos: any): string[] {
  if (!Array.isArray(todos)) {
    return [];
  }

  return todos
    .map((todo: any) => {
      if (!todo) return null;
      if (typeof todo === 'string') {
        const trimmed = todo.trim();
        return trimmed || null;
      }
      if (typeof todo === 'object') {
        const description = todo.description || todo.title || todo.name;
        return description ? String(description).trim() : null;
      }
      return null;
    })
    .filter((todo): todo is string => !!todo);
}

function inferRequirementCategory(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('autenticação') || lower.includes('login') || lower.includes('usuário')) return 'Autenticação';
  if (lower.includes('banco') || lower.includes('dados') || lower.includes('armazenar')) return 'Dados';
  if (lower.includes('interface') || lower.includes('tela') || lower.includes('visual')) return 'Interface';
  if (lower.includes('api') || lower.includes('integração') || lower.includes('conexão')) return 'Integração';
  if (lower.includes('relatório') || lower.includes('análise') || lower.includes('dashboard')) return 'Relatórios';

  return 'Geral';
}

function collectNotes(plan: RawAgentPlan): string[] {
  const notes: string[] = [];

  if (plan.projectFocus) {
    notes.push(`Foco atual: ${plan.projectFocus}`);
  }

  if (Array.isArray(plan.missingInfo) && plan.missingInfo.length > 0) {
    notes.push(`Informações em aberto: ${plan.missingInfo.join('; ')}`);
  }

  if (Array.isArray(plan.risks) && plan.risks.length > 0) {
    notes.push(`Riscos percebidos: ${plan.risks.join('; ')}`);
  }

  if (Array.isArray(plan.followUpQuestions) && plan.followUpQuestions.length > 0) {
    notes.push(`Perguntas sugeridas: ${plan.followUpQuestions.join('; ')}`);
  }

  return notes;
}
