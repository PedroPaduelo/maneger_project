import { Task } from './types';
import { TaskExecution, ExecutionLogEntry, StartExecutionRequest, StopExecutionRequest, QuickTaskInput } from '@/types/executor';

const API_BASE = '/api/projects';

export class ExecutorAPI {
  /**
   * Buscar tasks pendentes para execução
   */
  static async getTasks(projectId: number): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/${projectId}/executor/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }

  /**
   * Iniciar execução de tasks
   */
  static async startExecution(request: StartExecutionRequest): Promise<TaskExecution> {
    const response = await fetch(`${API_BASE}/${request.projectId}/executor/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to start execution');
    return response.json();
  }

  /**
   * Parar execução em andamento
   */
  static async stopExecution(request: StopExecutionRequest): Promise<void> {
    const executionId = request.executionId;
    const response = await fetch(`/api/executor/${executionId}/stop`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to stop execution');
  }

  /**
   * Buscar status da execução
   */
  static async getExecutionStatus(executionId: string): Promise<TaskExecution> {
    const response = await fetch(`/api/executor/${executionId}/status`);
    if (!response.ok) throw new Error('Failed to fetch execution status');
    return response.json();
  }

  /**
   * Adicionar task rápida
   */
  static async addQuickTask(projectId: number, task: QuickTaskInput): Promise<Task> {
    const response = await fetch(`${API_BASE}/${projectId}/executor/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to add task');
    return response.json();
  }

  /**
   * Atualizar API URL do projeto
   */
  static async updateApiUrl(projectId: number, apiUrl: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${projectId}/executor/api-url`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiUrl }),
    });
    if (!response.ok) throw new Error('Failed to update API URL');
  }

  /**
   * Buscar logs da execução
   */
  static async getLogs(executionId: string, limit?: number): Promise<ExecutionLogEntry[]> {
    const url = `/api/executor/${executionId}/logs${limit ? `?limit=${limit}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  }

  /**
   * Buscar todas as execuções de um projeto
   */
  static async getExecutions(projectId: number): Promise<TaskExecution[]> {
    const response = await fetch(`${API_BASE}/${projectId}/executor/executions`);
    if (!response.ok) throw new Error('Failed to fetch executions');
    return response.json();
  }
}
