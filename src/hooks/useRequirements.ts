"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Requirement } from '@/lib/types';
import { toast } from 'sonner';

// Query keys para cache de requisitos
export const requirementKeys = {
  all: ['requirements'] as const,
  lists: () => [...requirementKeys.all, 'list'] as const,
  list: (projectId?: number) => [...requirementKeys.lists(), { projectId }] as const,
  details: () => [...requirementKeys.all, 'detail'] as const,
  detail: (id: number) => [...requirementKeys.details(), id] as const,
};

// Hook para buscar todos os requisitos
export function useRequirements(projectId?: number) {
  return useQuery({
    queryKey: requirementKeys.list(projectId),
    queryFn: async (): Promise<Requirement[]> => {
      const url = projectId ? `/api/projects/${projectId}/requirements` : '/api/requirements';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    enabled: true,
  });
}

// Hook para buscar um requisito específico
export function useRequirement(id: number) {
  return useQuery({
    queryKey: requirementKeys.detail(id),
    queryFn: async (): Promise<Requirement> => {
      const response = await fetch(`/api/requirements/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requirement');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para criar requisito
export function useCreateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requirementData: Partial<Requirement>) => {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirementData),
      });

      if (!response.ok) {
        throw new Error('Failed to create requirement');
      }

      return response.json();
    },
    onMutate: async (newRequirement) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: requirementKeys.lists() });

      // Salvar estado anterior
      const previousRequirements = queryClient.getQueryData(requirementKeys.lists());

      // Atualização otimista
      const optimisticRequirement: Requirement = {
        ...newRequirement,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Requirement;

      queryClient.setQueryData(
        requirementKeys.lists(),
        (old: Requirement[] | undefined) => {
          return old ? [...old, optimisticRequirement] : [optimisticRequirement];
        }
      );

      return { previousRequirements };
    },
    onError: (err, newRequirement, context) => {
      // Reverter estado anterior
      if (context?.previousRequirements) {
        queryClient.setQueryData(requirementKeys.lists(), context.previousRequirements);
      }
      toast.error('Erro ao criar requisito', {
        description: 'Não foi possível criar o requisito. Tente novamente.',
      });
    },
    onSuccess: (requirement) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      toast.success('Requisito criado', {
        description: `O requisito "${requirement.titulo}" foi criado com sucesso.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
}

// Hook para atualizar requisito
export function useUpdateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...requirementData }: Partial<Requirement> & { id: number }) => {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirementData),
      });

      if (!response.ok) {
        throw new Error('Failed to update requirement');
      }

      return response.json();
    },
    onMutate: async ({ id, ...requirementData }) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: requirementKeys.lists() });
      await queryClient.cancelQueries({ queryKey: requirementKeys.detail(id) });

      // Salvar estados anteriores
      const previousRequirements = queryClient.getQueryData(requirementKeys.lists());
      const previousRequirement = queryClient.getQueryData(requirementKeys.detail(id));

      // Atualização otimista na lista
      queryClient.setQueryData(
        requirementKeys.lists(),
        (old: Requirement[] | undefined) => {
          return old?.map((requirement) =>
            requirement.id === id
              ? { ...requirement, ...requirementData, updatedAt: new Date().toISOString() }
              : requirement
          );
        }
      );

      // Atualização otimista no detalhe
      queryClient.setQueryData(
        requirementKeys.detail(id),
        (old: Requirement | undefined) => {
          return old
            ? { ...old, ...requirementData, updatedAt: new Date().toISOString() }
            : undefined;
        }
      );

      return { previousRequirements, previousRequirement };
    },
    onError: (err, variables, context) => {
      // Reverter estados anteriores
      if (context?.previousRequirements) {
        queryClient.setQueryData(requirementKeys.lists(), context.previousRequirements);
      }
      if (context?.previousRequirement) {
        queryClient.setQueryData(requirementKeys.detail(variables.id), context.previousRequirement);
      }
      toast.error('Erro ao atualizar requisito', {
        description: 'Não foi possível atualizar o requisito. Tente novamente.',
      });
    },
    onSuccess: (requirement) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(requirement.id) });
      toast.success('Requisito atualizado', {
        description: `O requisito "${requirement.titulo}" foi atualizado com sucesso.`,
      });
    },
    onSettled: (requirement) => {
      if (requirement) {
        queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
        queryClient.invalidateQueries({ queryKey: requirementKeys.detail(requirement.id) });
      }
    },
  });
}

// Hook para deletar requisito
export function useDeleteRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete requirement');
      }

      return id;
    },
    onMutate: async (id) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: requirementKeys.lists() });

      // Salvar estado anterior
      const previousRequirements = queryClient.getQueryData(requirementKeys.lists());

      // Atualização otimista
      queryClient.setQueryData(
        requirementKeys.lists(),
        (old: Requirement[] | undefined) => {
          return old?.filter((requirement) => requirement.id !== id);
        }
      );

      return { previousRequirements };
    },
    onError: (err, id, context) => {
      // Reverter estado anterior
      if (context?.previousRequirements) {
        queryClient.setQueryData(requirementKeys.lists(), context.previousRequirements);
      }
      toast.error('Erro ao excluir requisito', {
        description: 'Não foi possível excluir o requisito. Tente novamente.',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      toast.success('Requisito excluído', {
        description: 'O requisito foi removido permanentemente.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
}

// Hook para atualizar prioridade do requisito
export function useUpdateRequirementPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, priority }: { id: number; priority: string }) => {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        throw new Error('Failed to update requirement priority');
      }

      return response.json();
    },
    onMutate: async ({ id, priority }) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: requirementKeys.lists() });
      await queryClient.cancelQueries({ queryKey: requirementKeys.detail(id) });

      // Salvar estados anteriores
      const previousRequirements = queryClient.getQueryData(requirementKeys.lists());
      const previousRequirement = queryClient.getQueryData(requirementKeys.detail(id));

      // Atualização otimista
      const updatePriority = (requirement: Requirement) => ({
        ...requirement,
        priority,
        updatedAt: new Date().toISOString(),
      });

      queryClient.setQueryData(
        requirementKeys.lists(),
        (old: Requirement[] | undefined) => {
          return old?.map((requirement) =>
            requirement.id === id ? updatePriority(requirement) : requirement
          );
        }
      );

      queryClient.setQueryData(
        requirementKeys.detail(id),
        (old: Requirement | undefined) => {
          return old ? updatePriority(old) : undefined;
        }
      );

      return { previousRequirements, previousRequirement };
    },
    onError: (err, variables, context) => {
      // Reverter estados
      if (context?.previousRequirements) {
        queryClient.setQueryData(requirementKeys.lists(), context.previousRequirements);
      }
      if (context?.previousRequirement) {
        queryClient.setQueryData(requirementKeys.detail(variables.id), context.previousRequirement);
      }
      toast.error('Erro ao atualizar prioridade', {
        description: 'Não foi possível atualizar a prioridade do requisito.',
      });
    },
    onSuccess: (requirement) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(requirement.id) });
      toast.success('Prioridade atualizada', {
        description: `Prioridade do requisito "${requirement.titulo}" foi atualizada para ${requirement.priority}.`,
      });
    },
    onSettled: (requirement) => {
      if (requirement) {
        queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
        queryClient.invalidateQueries({ queryKey: requirementKeys.detail(requirement.id) });
      }
    },
  });
}