"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
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