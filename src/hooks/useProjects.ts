"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Project } from '@/lib/types';
import { toast } from 'sonner';

// Tipos para as respostas da API
interface ProjectsResponse {
  projects: Project[];
}

// API returns project directly in update endpoint
// but wrapped in GET endpoint
interface ProjectResponse {
  project?: Project;
}

// Query keys para cache
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
};

// Hook para buscar todos os projetos
export function useProjects(filters?: { status?: string; priority?: string; search?: string; tags?: number[] }) {
  const filterString = filters ? JSON.stringify(filters) : 'all';

  return useQuery({
    queryKey: projectKeys.list(filterString),
    queryFn: async (): Promise<Project[]> => {
      const params = new URLSearchParams();

      if (filters?.search) params.set('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters?.priority && filters.priority !== 'all') params.set('priority', filters.priority);
      if (filters?.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));

      const url = params.toString() ? `/api/projects?${params.toString()}` : '/api/projects';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data: ProjectsResponse = await response.json();
      return data.projects;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

// Hook para buscar um projeto específico
export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async (): Promise<Project> => {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data: ProjectResponse = await response.json();
      return data.project;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para criar projeto
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data: ProjectResponse = await response.json();
      return data.project;
    },
    onMutate: async (newProject) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Salvar o estado anterior
      const previousProjects = queryClient.getQueryData(projectKeys.lists());

      // Atualização otimista
      const optimisticProject: Project = {
        ...newProject,
        id: Date.now(), // ID temporário
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        progress: 0,
      } as Project;

      queryClient.setQueryData(
        projectKeys.lists(),
        (old: Project[] | undefined) => {
          return old ? [...old, optimisticProject] : [optimisticProject];
        }
      );

      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      // Reverter para o estado anterior
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error('Erro ao criar projeto', {
        description: 'Não foi possível criar o projeto. Tente novamente.',
      });
    },
    onSuccess: (project) => {
      // Invalidar para buscar dados atualizados
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Projeto criado', {
        description: `O projeto "${project.name}" foi criado com sucesso.`,
      });
    },
    onSettled: () => {
      // Garantir que os dados estão sincronizados
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Hook para atualizar projeto
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...projectData }: Partial<Project> & { id: number }) => {
      console.log('Updating project:', { id, projectData });

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to update project: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success - raw data:', data);

      // Check if data is already the project object or wrapped
      const project = data.project || data;
      console.log('Extracted project:', project);

      return project;
    },
    onMutate: async ({ id, ...projectData }) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });

      // Salvar estado anterior
      const previousProjects = queryClient.getQueryData(projectKeys.lists());
      const previousProject = queryClient.getQueryData(projectKeys.detail(id));

      // Atualização otimista na lista
      queryClient.setQueryData(
        projectKeys.lists(),
        (old: Project[] | undefined) => {
          return old?.map((project) =>
            project.id === id
              ? { ...project, ...projectData, updatedAt: new Date().toISOString() }
              : project
          );
        }
      );

      // Atualização otimista no detalhe
      queryClient.setQueryData(
        projectKeys.detail(id),
        (old: Project | undefined) => {
          return old
            ? { ...old, ...projectData, updatedAt: new Date().toISOString() }
            : undefined;
        }
      );

      return { previousProjects, previousProject };
    },
    onError: (err, variables, context) => {
      console.error('Update project error:', err);
      // Reverter estados anteriores
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(variables.id), context.previousProject);
      }
      toast.error('Erro ao atualizar projeto', {
        description: err.message || 'Não foi possível atualizar o projeto. Tente novamente.',
      });
    },
    onSuccess: (project) => {
      console.log('Success callback - project:', project);

      if (!project) {
        console.error('Project is undefined in onSuccess callback');
        return;
      }

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      toast.success('Projeto atualizado', {
        description: `O projeto "${project.name}" foi atualizado com sucesso.`,
      });
    },
    onSettled: (project) => {
      if (project) {
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      }
    },
  });
}

// Hook para deletar projeto
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      return id;
    },
    onMutate: async (id) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Salvar estado anterior
      const previousProjects = queryClient.getQueryData(projectKeys.lists());

      // Atualização otimista - remover da lista
      queryClient.setQueryData(
        projectKeys.lists(),
        (old: Project[] | undefined) => {
          return old?.filter((project) => project.id !== id);
        }
      );

      return { previousProjects };
    },
    onError: (err, id, context) => {
      // Reverter estado anterior
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error('Erro ao excluir projeto', {
        description: 'Não foi possível excluir o projeto. Tente novamente.',
      });
    },
    onSuccess: (id) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Projeto excluído', {
        description: 'O projeto foi removido permanentemente.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Hook para toggle favorito
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      const data: ProjectResponse = await response.json();
      return data.project;
    },
    onMutate: async ({ id, isFavorite }) => {
      // Cancelar queries
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });

      // Salvar estados anteriores
      const previousProjects = queryClient.getQueryData(projectKeys.lists());
      const previousProject = queryClient.getQueryData(projectKeys.detail(id));

      // Atualização otimista
      const updateFavorite = (project: Project) => ({
        ...project,
        isFavorite: !isFavorite,
        updatedAt: new Date().toISOString(),
      });

      queryClient.setQueryData(
        projectKeys.lists(),
        (old: Project[] | undefined) => {
          return old?.map((project) =>
            project.id === id ? updateFavorite(project) : project
          );
        }
      );

      queryClient.setQueryData(
        projectKeys.detail(id),
        (old: Project | undefined) => {
          return old ? updateFavorite(old) : undefined;
        }
      );

      return { previousProjects, previousProject };
    },
    onError: (err, variables, context) => {
      // Reverter estados
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(variables.id), context.previousProject);
      }
      toast.error('Erro ao atualizar favoritos', {
        description: 'Não foi possível atualizar o status de favoritos.',
      });
    },
    onSuccess: (project, variables) => {
      const action = variables.isFavorite ? "removido dos" : "adicionado aos";
      toast.success(`Projeto ${action} favoritos`, {
        description: `"${project.name}" foi ${action} favoritos com sucesso.`,
      });
    },
    onSettled: (project) => {
      if (project) {
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      }
    },
  });
}