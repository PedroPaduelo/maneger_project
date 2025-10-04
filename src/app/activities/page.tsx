"use client";

import { useSession } from "next-auth/react";
import { RecentActivities } from "@/components/recent-activities";
import { useProjects, useTasksQuery, useRequirements } from "@/hooks";
import { Project, Task, Requirement, HistorySummary } from "@/lib/types";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Clock, Calendar, Activity } from "lucide-react";

export default function ActivitiesPage() {
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

  // Extrair history summaries dos projetos
  const historySummaries: HistorySummary[] = projects.flatMap((project: any) =>
    project.historySummaries || []
  );

  // Loading state combinado
  const isLoading = projectsLoading || tasksLoading || requirementsLoading;

  if (status === "loading" || isLoading) {
    return (
      <SidebarLayout title="Atividades Recentes">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando atividades...</p>
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
    <SidebarLayout title="Atividades Recentes">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Histórico de Atividades</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Acompanhe as atividades mais recentes em seus projetos, tarefas e requisitos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Hoje</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {historySummaries.filter(s => {
                const today = new Date();
                const summaryDate = new Date(s.createdAt);
                return summaryDate.toDateString() === today.toDateString();
              }).length}
            </p>
            <p className="text-xs text-muted-foreground">atividades</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Esta Semana</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {historySummaries.filter(s => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const summaryDate = new Date(s.createdAt);
                return summaryDate >= oneWeekAgo;
              }).length}
            </p>
            <p className="text-xs text-muted-foreground">atividades</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold mt-2">{historySummaries.length}</p>
            <p className="text-xs text-muted-foreground">atividades registradas</p>
          </div>
        </div>

        {/* Recent Activities Component */}
        <RecentActivities
          projects={projects}
          tasks={tasks}
          requirements={requirements}
          historySummaries={historySummaries}
        />
      </div>
    </SidebarLayout>
  );
}