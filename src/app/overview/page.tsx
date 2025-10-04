"use client";

import { useSession } from "next-auth/react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { useProjects, useTasksQuery, useRequirements } from "@/hooks";
import { Project, Task, Requirement, HistorySummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarLayout } from "@/components/sidebar-layout";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Activity,
  Code,
  Zap
} from "lucide-react";

export default function OverviewPage() {
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

  // Calcular métricas
  const activeProjects = projects.filter((p: any) => p.status === 'Ativo').length;
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t: any) => t.status === 'Pendente').length;
  const highPriorityReqs = requirements.filter((r: any) => r.priority === 'high').length;

  // Actions para o header
  const actions = (
    <div className="flex items-center gap-2">
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Novo Projeto
      </Button>
    </div>
  );

  if (status === "loading") {
    return (
      <SidebarLayout title="Visão Geral" actions={actions}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!session) {
    return (
      <SidebarLayout title="Acesso Restrito" actions={actions}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar autenticado para acessar esta página.</p>
          <Button onClick={() => window.location.href = "/auth/signin"}>Fazer Login</Button>
        </div>
      </SidebarLayout>
    );
  }

  if (isLoading) {
    return (
      <SidebarLayout title="Visão Geral" actions={actions}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout title="Erro" actions={actions}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">
            {error.message || "Erro ao carregar os dados. Por favor, tente novamente."}
          </p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Visão Geral"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Code className="h-6 w-6 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {projects.length} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Concluídas</CardTitle>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTasks} pendentes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Requisitos Críticos</CardTitle>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityReqs}</div>
              <p className="text-xs text-muted-foreground">
                {requirements.length} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Atividade</CardTitle>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Análise e Métricas</h2>
          <DashboardCharts
            projects={projects}
            tasks={tasks}
            requirements={requirements}
          />
        </div>
      </div>
    </SidebarLayout>
  );
}