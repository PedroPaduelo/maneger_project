"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/types';
import { toast } from 'sonner';

// Query keys para cache de tarefas
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId?: number) => [...taskKeys.lists(), { projectId }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
  todos: (taskId: number) => [...taskKeys.all, 'todos', taskId] as const,
};

// Hook para buscar todas as tarefas
export function useTasks(projectId?: number) {
  return useQuery({
    queryKey: taskKeys.list(projectId),
    queryFn: async (): Promise<Task[]> => {
      const url = projectId ? `/api/projects/${projectId}/tasks` : '/api/tasks';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    enabled: true,
  });
}

// Hook para buscar uma tarefa específica
export function useTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async (): Promise<Task> => {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para criar tarefa
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      return response.json();
    },
    onMutate: async (newTask) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Salvar estado anterior
      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Atualização otimista
      const optimisticTask: Task = {
        ...newTask,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Pendente',
      } as Task;

      queryClient.setQueryData(
        taskKeys.lists(),
        (old: Task[] | undefined) => {
          return old ? [...old, optimisticTask] : [optimisticTask];
        }
      );

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Reverter estado anterior
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
      }
      toast.error('Erro ao criar tarefa', {
        description: 'Não foi possível criar a tarefa. Tente novamente.',
      });
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Tarefa criada', {
        description: `A tarefa "${task.title}" foi criada com sucesso.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Hook para atualizar tarefa
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...taskData }: Partial<Task> & { id: number }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      return response.json();
    },
    onMutate: async ({ id, ...taskData }) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      // Salvar estados anteriores
      const previousTasks = queryClient.getQueryData(taskKeys.lists());
      const previousTask = queryClient.getQueryData(taskKeys.detail(id));

      // Atualização otimista na lista
      queryClient.setQueryData(
        taskKeys.lists(),
        (old: Task[] | undefined) => {
          return old?.map((task) =>
            task.id === id
              ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
              : task
          );
        }
      );

      // Atualização otimista no detalhe
      queryClient.setQueryData(
        taskKeys.detail(id),
        (old: Task | undefined) => {
          return old
            ? { ...old, ...taskData, updatedAt: new Date().toISOString() }
            : undefined;
        }
      );

      return { previousTasks, previousTask };
    },
    onError: (err, variables, context) => {
      // Reverter estados anteriores
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(variables.id), context.previousTask);
      }
      toast.error('Erro ao atualizar tarefa', {
        description: 'Não foi possível atualizar a tarefa. Tente novamente.',
      });
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      toast.success('Tarefa atualizada', {
        description: `A tarefa "${task.title}" foi atualizada com sucesso.`,
      });
    },
    onSettled: (task) => {
      if (task) {
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      }
    },
  });
}

// Hook para deletar tarefa
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      return id;
    },
    onMutate: async (id) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Salvar estado anterior
      const previousTasks = queryClient.getQueryData(taskKeys.lists());

      // Atualização otimista
      queryClient.setQueryData(
        taskKeys.lists(),
        (old: Task[] | undefined) => {
          return old?.filter((task) => task.id !== id);
        }
      );

      return { previousTasks };
    },
    onError: (err, id, context) => {
      // Reverter estado anterior
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
      }
      toast.error('Erro ao excluir tarefa', {
        description: 'Não foi possível excluir a tarefa. Tente novamente.',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success('Tarefa excluída', {
        description: 'A tarefa foi removida permanentemente.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Hook para atualizar status da tarefa
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      return response.json();
    },
    onMutate: async ({ id, status }) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      // Salvar estados anteriores
      const previousTasks = queryClient.getQueryData(taskKeys.lists());
      const previousTask = queryClient.getQueryData(taskKeys.detail(id));

      // Atualização otimista
      const updateStatus = (task: Task) => ({
        ...task,
        status,
        updatedAt: new Date().toISOString(),
      });

      queryClient.setQueryData(
        taskKeys.lists(),
        (old: Task[] | undefined) => {
          return old?.map((task) =>
            task.id === id ? updateStatus(task) : task
          );
        }
      );

      queryClient.setQueryData(
        taskKeys.detail(id),
        (old: Task | undefined) => {
          return old ? updateStatus(old) : undefined;
        }
      );

      return { previousTasks, previousTask };
    },
    onError: (err, variables, context) => {
      // Reverter estados
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(variables.id), context.previousTask);
      }
      toast.error('Erro ao atualizar status', {
        description: 'Não foi possível atualizar o status da tarefa.',
      });
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });

      const statusMessages = {
        'Concluída': 'concluída',
        'Em Progresso': 'iniciada',
        'Pendente': 'redefinida como pendente',
        'Bloqueada': 'bloqueada',
      };

      const status = statusMessages[task.status as keyof typeof statusMessages] || 'atualizada';

      toast.success('Status atualizado', {
        description: `Tarefa "${task.title}" foi ${status} com sucesso.`,
      });
    },
    onSettled: (task) => {
      if (task) {
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      }
    },
  });
}