'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/lib/types';
import {
  TaskExecution,
  ExecutionStatus,
  ExecutionProgress,
  ExecutionStats,
  StartExecutionRequest,
} from '@/types/executor';
import { ExecutorAPI } from '@/lib/executor-api';
import { toast } from 'sonner';

interface UseExecutorOptions {
  projectId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useExecutor({ projectId, autoRefresh = false, refreshInterval = 5000 }: UseExecutorOptions) {
  const [execution, setExecution] = useState<TaskExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startExecution = useCallback(
    async (request: Omit<StartExecutionRequest, 'projectId'>) => {
      setIsLoading(true);
      setError(null);

      try {
        const executionData = await ExecutorAPI.startExecution({
          projectId,
          ...request,
        });

        setExecution(executionData);
        toast.success('Execução iniciada com sucesso');
        return executionData;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to start execution';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId]
  );

  const stopExecution = useCallback(async (reason?: string) => {
    if (!execution) {
      toast.error('Nenhuma execução em andamento');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ExecutorAPI.stopExecution({
        executionId: execution.id,
        reason,
      });

      setExecution((prev) =>
        prev ? { ...prev, status: 'stopped' } : null
      );
      toast.warning('Execução parada');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to stop execution';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [execution]);

  const refreshExecution = useCallback(async () => {
    if (!execution) return;

    try {
      const updated = await ExecutorAPI.getExecutionStatus(execution.id);
      setExecution(updated);
    } catch (err: any) {
      console.error('Failed to refresh execution:', err);
    }
  }, [execution]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !execution || execution.status === 'completed' || execution.status === 'stopped') {
      return;
    }

    const interval = setInterval(refreshExecution, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, execution, refreshInterval, refreshExecution]);

  const progress: ExecutionProgress | null = execution
    ? {
        executionId: execution.id,
        currentTaskIndex: execution.currentTaskIndex,
        totalTasks: execution.totalTasks,
        percentage: execution.totalTasks > 0
          ? Math.round((execution.currentTaskIndex / execution.totalTasks) * 100)
          : 0,
        currentTask: execution.currentTask
          ? {
              id: execution.currentTask.id,
              title: execution.currentTask.title,
              status: execution.currentTask.status,
            }
          : undefined,
        status: execution.status,
      }
    : null;

  const stats: ExecutionStats | null = execution
    ? {
        total: execution.totalTasks,
        successful: execution.successCount,
        failed: execution.errorCount,
        skipped: execution.skippedCount,
        pending: execution.totalTasks - execution.currentTaskIndex,
        duration: execution.startedAt
          ? Date.now() - new Date(execution.startedAt).getTime()
          : undefined,
      }
    : null;

  const status: ExecutionStatus = execution?.status || 'idle';

  return {
    execution,
    isLoading,
    error,
    status,
    progress,
    stats,
    startExecution,
    stopExecution,
    refreshExecution,
  };
}
