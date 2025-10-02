'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/lib/types';
import { ExecutorAPI } from '@/lib/executor-api';
import { toast } from 'sonner';

interface UseTasksOptions {
  projectId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTasks({ projectId, autoRefresh = false, refreshInterval = 10000 }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedTasks = await ExecutorAPI.getTasks(projectId);
      setTasks(fetchedTasks);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const removeTask = useCallback((taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
  }, []);

  const updateTask = useCallback((taskId: number, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, []);

  const toggleTaskSelection = useCallback((taskId: number) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const selectAllTasks = useCallback(() => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  }, [tasks, selectedTaskIds]);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const getSelectedTasks = useCallback(() => {
    return tasks.filter((task) => selectedTaskIds.includes(task.id));
  }, [tasks, selectedTaskIds]);

  // Auto-refresh
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchTasks, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTasks, refreshInterval]);

  return {
    tasks,
    selectedTaskIds,
    isLoading,
    error,
    fetchTasks,
    addTask,
    removeTask,
    updateTask,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    getSelectedTasks,
  };
}
