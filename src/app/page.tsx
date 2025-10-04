"use client";

import { useSession } from "next-auth/react";
import { Dashboard } from "@/components/dashboard";
import { useProjects, useTasksQuery, useRequirements } from "@/hooks";
import { Project, Task, Requirement, HistorySummary } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();

  // Usar hooks de queries para buscar dados com cache e otimização
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError
  } = useProjects();

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError
  } = useTasksQuery();

  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    error: requirementsError
  } = useRequirements();

  // Extrair history summaries dos projetos
  const historySummaries: HistorySummary[] = projects.flatMap((project: any) =>
    project.historySummaries || []
  );

  // Loading state combinado
  const isLoading = projectsLoading || tasksLoading || requirementsLoading;

  // Error state combinado
  const error = projectsError || tasksError || requirementsError;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar autenticado para acessar esta página.</p>
          <Button onClick={() => window.location.href = "/auth/signin"}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">
            {error.message || "Erro ao carregar os dados. Por favor, tente novamente."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard
        projects={projects}
        tasks={tasks}
        requirements={requirements}
        historySummaries={historySummaries}
      />
    </div>
  );
}