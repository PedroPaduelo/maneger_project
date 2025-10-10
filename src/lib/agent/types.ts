export type AgentActionType =
  | 'create_project'
  | 'create_tasks'
  | 'update_project'
  | 'update_requirements'
  | 'update_tasks'
  | 'review_project'
  | 'none';

export interface RawAgentAction {
  type: AgentActionType | string;
  title?: string;
  description?: string;
  priority?: 'Alta' | 'Média' | 'Baixa';
  confidence?: number;
  needsConfirmation?: boolean;
  project?: {
    id?: number;
    name?: string;
    status?: string;
    confidence?: number;
  };
  payload?: any;
  notes?: string[];
}

export interface RawAgentPlan {
  summary?: string;
  projectFocus?: string;
  missingInfo?: string[];
  risks?: string[];
  followUpQuestions?: string[];
  actions?: RawAgentAction[];
}

export interface NormalizedActionPayload {
  [key: string]: any;
}

export interface NormalizedAgentAction {
  type: Extract<AgentActionType, 'create_project' | 'create_tasks'>;
  payload: NormalizedActionPayload;
  metadata?: {
    title?: string;
    description?: string;
    priority?: 'Alta' | 'Média' | 'Baixa';
    confidence?: number;
    project?: RawAgentAction['project'];
  };
}

export interface NormalizedAgentPlan {
  version: number;
  summary?: string;
  notes?: string[];
  actions: NormalizedAgentAction[];
}
