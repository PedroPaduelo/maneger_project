import { Task } from '@/lib/types';

export type ExecutionStatus = 'idle' | 'pending' | 'running' | 'completed' | 'error' | 'stopped';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

export interface ExecutionLogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  taskId?: number;
  metadata?: Record<string, any>;
}

export interface TaskExecution {
  id: string;
  projectId: number;
  status: ExecutionStatus;
  currentTaskIndex: number;
  totalTasks: number;
  startedAt: Date;
  completedAt?: Date;
  stoppedAt?: Date;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  logs: ExecutionLogEntry[];
  currentTask?: Task;
  tasks: Task[];
}

export interface ExecutionProgress {
  executionId: string;
  currentTaskIndex: number;
  totalTasks: number;
  percentage: number;
  currentTask?: {
    id: number;
    title: string;
    status: string;
  };
  status: ExecutionStatus;
}

export interface ExecutionStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  pending: number;
  duration?: number;
}

export interface ExecutorConfig {
  projectId: number;
  apiUrl: string;
  autoScroll: boolean;
  maxLogLines: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface WebSocketMessage {
  type: 'execution-started' | 'execution-log' | 'execution-progress' | 'execution-completed' | 'execution-error' | 'task-status-changed' | 'execution-stopped';
  payload: any;
  timestamp: Date;
}

export interface StartExecutionRequest {
  projectId: number;
  taskIds?: number[];
  config?: Partial<ExecutorConfig>;
}

export interface StopExecutionRequest {
  executionId: string;
  reason?: string;
}

export interface QuickTaskInput {
  title: string;
  guidancePrompt: string;
  description?: string;
  additionalInformation?: string;
}
