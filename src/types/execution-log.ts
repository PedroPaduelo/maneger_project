import { LogLevel } from './executor';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  taskId?: number;
  taskTitle?: string;
  metadata?: Record<string, any>;
}

export interface LogFilter {
  levels?: LogLevel[];
  taskId?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface LogExportOptions {
  format: 'txt' | 'json' | 'csv';
  filter?: LogFilter;
  includeMetadata?: boolean;
}

export const LogLevelColors: Record<LogLevel, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-destructive',
  debug: 'text-muted-foreground',
};

export const LogLevelIcons: Record<LogLevel, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  debug: '🔍',
};
