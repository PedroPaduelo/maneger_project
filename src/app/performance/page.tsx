"use client";

import { useSession } from "next-auth/react";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { useProjects, useTasksQuery, useRequirements } from "@/hooks";
import { Project, Task, Requirement } from "@/lib/types";
import { SidebarLayout } from "@/components/sidebar-layout";
import { BarChart3, TrendingUp, Zap, Target } from "lucide-react";

export default function PerformancePage() {
  const { data: session, status } = useSession();

  // Usar hooks de queries para buscar dados com cache e otimização
  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useProjects();

  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useTasksQuery();

  const {
    data: requirements = [],
    isLoading: requirementsLoading,
  } = useRequirements();

  // Loading state combinado
  const isLoading = projectsLoading || tasksLoading || requirementsLoading;

  if (status === "loading" || isLoading) {
    return (
      <SidebarLayout title="Performance e Métricas">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando métricas...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!session) {
    return (
      <SidebarLayout title="Acesso Restrito">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar autenticado para acessar esta página.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout title="Performance e Métricas">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Análise de Performance</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Visualize métricas detalhadas sobre o desempenho dos seus projetos e atividades
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-500">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {tasks.length > 0
                    ? Math.round((tasks.filter((t: any) => t.status === 'completed').length / tasks.length) * 100)
                    : 0}%
                </p>
              </div>
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-2">
              {tasks.filter((t: any) => t.status === 'completed').length} de {tasks.length} tarefas
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-500">Projetos Ativos</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {projects.filter((p: any) => p.status === 'Ativo').length}
                </p>
              </div>
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-xs text-blue-500 mt-2">
              {projects.length} projetos totais
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Requisitos Prioritários</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {requirements.filter((r: any) => r.priority === 'high').length}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              alta prioridade
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Progresso Médio</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {projects.length > 0
                    ? Math.round(projects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projects.length)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              todos os projetos
            </p>
          </div>
        </div>

        {/* Performance Metrics Component */}
        <PerformanceMetrics
          projects={projects}
          tasks={tasks}
          requirements={requirements}
        />
      </div>
    </SidebarLayout>
  );
}