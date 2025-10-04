"use client";

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Tag } from '@/lib/types';
import { toast } from 'sonner';

// Tipos para as respostas da API
interface TagsResponse {
  tags: Tag[];
}

interface TagResponse {
  tag: Tag;
}

interface TagWithCount extends Tag {
  _count: {
    projectTags: number;
  };
}

interface TagsWithCountResponse {
  tags: TagWithCount[];
}

// Query keys para cache
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters?: string) => [...tagKeys.lists(), { filters }] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: number) => [...tagKeys.details(), id] as const,
  withCount: () => [...tagKeys.all, 'withCount'] as const,
};

// Hook para buscar todas as tags com contagem de projetos
export function useTagsWithCount() {
  return useQuery({
    queryKey: tagKeys.withCount(),
    queryFn: async (): Promise<TagWithCount[]> => {
      const response = await fetch('/api/tags?withCount=true');
      if (!response.ok) {
        throw new Error('Failed to fetch tags with count');
      }
      const data: TagsWithCountResponse = await response.json();
      return data.tags;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
  });
}

// Hook para buscar todas as tags
export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data: TagsResponse = await response.json();
      return data.tags;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
  });
}

// Hook para buscar uma tag específica
export function useTag(id: number) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: async (): Promise<Tag> => {
      const response = await fetch(`/api/tags/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tag');
      }
      const data: TagResponse = await response.json();
      return data.tag;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// Hook para criar tag
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: Partial<Tag>) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const data: TagResponse = await response.json();
      return data.tag;
    },
    onSuccess: (tag) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.withCount() });
      toast.success('Tag criada', {
        description: `A tag "${tag.name}" foi criada com sucesso.`,
      });
    },
    onError: (err) => {
      toast.error('Erro ao criar tag', {
        description: 'Não foi possível criar a tag. Tente novamente.',
      });
    },
  });
}

// Hook para atualizar tag
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tagData }: { id: number; tagData: Partial<Tag> }) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tag');
      }

      const data: TagResponse = await response.json();
      return data.tag;
    },
    onSuccess: (tag) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.withCount() });
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(tag.id) });
      toast.success('Tag atualizada', {
        description: `A tag "${tag.name}" foi atualizada com sucesso.`,
      });
    },
    onError: (err) => {
      toast.error('Erro ao atualizar tag', {
        description: err.message || 'Não foi possível atualizar a tag. Tente novamente.',
      });
    },
  });
}

// Hook para deletar tag
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tag');
      }

      return response.json();
    },
    onSuccess: (_, tagId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.withCount() });
      queryClient.removeQueries({ queryKey: tagKeys.detail(tagId) });
      toast.success('Tag excluída', {
        description: 'A tag foi excluída com sucesso.',
      });
    },
    onError: (err) => {
      toast.error('Erro ao excluir tag', {
        description: err.message || 'Não foi possível excluir a tag. Tente novamente.',
      });
    },
  });
}