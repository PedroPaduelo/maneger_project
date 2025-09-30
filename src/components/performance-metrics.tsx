"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Project, Task, Requirement } from "@/lib/types";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart
} from "lucide-react";

interface PerformanceMetricsProps {
  projects: Project[];
  tasks: Task[];
  requirements: Requirement[];
}

export function PerformanceMetrics({ projects, tasks, requirements }: PerformanceMetricsProps) {
  // Calculate productivity metrics
  const calculateProductivityMetrics = () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentProjects = projects.filter(p => new Date(p.createdAt) >= lastWeek);
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= lastWeek);
    const recentRequirements = requirements.filter(r => new Date(r.createdAt) >= lastWeek);

    const monthlyProjects = projects.filter(p => new Date(p.createdAt) >= lastMonth);
    const monthlyTasks = tasks.filter(t => new Date(t.createdAt) >= lastMonth);
    const monthlyRequirements = requirements.filter(r => new Date(r.createdAt) >= lastMonth);

    const completedTasks = tasks.filter(t => t.status === "Concluído");
    const completedThisWeek = completedTasks.filter(t => new Date(t.updatedAt) >= lastWeek);
    const completedThisMonth = completedTasks.filter(t => new Date(t.updatedAt) >= lastMonth);

    return {
      weekly: {
        projectsCreated: recentProjects.length,
        tasksCreated: recentTasks.length,
        requirementsCreated: recentRequirements.length,
        tasksCompleted: completedThisWeek.length
      },
      monthly: {
        projectsCreated: monthlyProjects.length,
        tasksCreated: monthlyTasks.length,
        requirementsCreated: monthlyRequirements.length,
        tasksCompleted: completedThisMonth.length
      }
    };
  };

  // Calculate efficiency metrics
  const calculateEfficiencyMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Concluído").length;
    const inProgressTasks = tasks.filter(t => t.status === "Em Progresso").length;
    const blockedTasks = tasks.filter(t => t.status === "Bloqueado").length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const efficiencyRate = totalTasks > 0 ? ((completedTasks + inProgressTasks) / totalTasks) * 100 : 0;
    const blockageRate = totalTasks > 0 ? (blockedTasks / totalTasks) * 100 : 0;

    // Calculate average project progress
    const totalProgress = projects.reduce((sum, project) => sum + project.progress, 0);
    const avgProjectProgress = projects.length > 0 ? totalProgress / projects.length : 0;

    // Calculate task velocity (tasks completed per week)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const tasksCompletedThisWeek = tasks.filter(
      t => t.status === "Concluído" && new Date(t.updatedAt) >= oneWeekAgo
    ).length;

    return {
      completionRate: Math.round(completionRate),
      efficiencyRate: Math.round(efficiencyRate),
      blockageRate: Math.round(blockageRate),
      avgProjectProgress: Math.round(avgProjectProgress),
      weeklyVelocity: tasksCompletedThisWeek
    };
  };

  // Calculate project health metrics
  const calculateProjectHealth = () => {
    const activeProjects = projects.filter(p => p.status === "Ativo");
    const completedProjects = projects.filter(p => p.status === "Concluído");
    const atRiskProjects = projects.filter(p => p.status === "Pausado" || p.progress < 25);
    const stalledProjects = projects.filter(p => p.status === "Pausado");

    const healthScore = projects.length > 0 ? 
      Math.round(((completedProjects.length + activeProjects.filter(p => p.progress > 50).length) / projects.length) * 100) : 0;

    return {
      total: projects.length,
      active: activeProjects.length,
      completed: completedProjects.length,
      atRisk: atRiskProjects.length,
      stalled: stalledProjects.length,
      healthScore
    };
  };

  // Calculate quality metrics
  const calculateQualityMetrics = () => {
    const highPriorityRequirements = requirements.filter(r => r.priority === "Alta");
    const totalRequirements = requirements.length;

    const highPriorityCompletionRate = highPriorityRequirements.length > 0 ? 
      Math.round((highPriorityRequirements.length / totalRequirements) * 100) : 0;

    // Calculate on-time delivery (simplified - assuming tasks should be completed within 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oldTasks = tasks.filter(t => new Date(t.createdAt) <= thirtyDaysAgo);
    const onTimeTasks = oldTasks.filter(t => t.status === "Concluído");
    const onTimeDeliveryRate = oldTasks.length > 0 ? Math.round((onTimeTasks.length / oldTasks.length) * 100) : 0;

    return {
      highPriorityCompletionRate,
      onTimeDeliveryRate,
      totalRequirements,
      highPriorityRequirements: highPriorityRequirements.length
    };
  };

  const productivity = calculateProductivityMetrics();
  const efficiency = calculateEfficiencyMetrics();
  const projectHealth = calculateProjectHealth();
  const quality = calculateQualityMetrics();

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default">Excelente</Badge>;
    if (score >= 60) return <Badge variant="secondary">Bom</Badge>;
    if (score >= 40) return <Badge variant="outline">Regular</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Productivity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Produtividade
          </CardTitle>
          <CardDescription>Métricas de criação e conclusão de itens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projetos (Semana)</span>
                {getTrendIcon(productivity.weekly.projectsCreated, productivity.monthly.projectsCreated / 4)}
              </div>
              <div className="text-2xl font-bold">{productivity.weekly.projectsCreated}</div>
              <Progress value={Math.min((productivity.weekly.projectsCreated / Math.max(productivity.monthly.projectsCreated / 4, 1)) * 100, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tarefas (Semana)</span>
                {getTrendIcon(productivity.weekly.tasksCreated, productivity.monthly.tasksCreated / 4)}
              </div>
              <div className="text-2xl font-bold">{productivity.weekly.tasksCreated}</div>
              <Progress value={Math.min((productivity.weekly.tasksCreated / Math.max(productivity.monthly.tasksCreated / 4, 1)) * 100, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conclusões (Semana)</span>
                {getTrendIcon(productivity.weekly.tasksCompleted, productivity.monthly.tasksCompleted / 4)}
              </div>
              <div className="text-2xl font-bold">{productivity.weekly.tasksCompleted}</div>
              <Progress value={Math.min((productivity.weekly.tasksCompleted / Math.max(productivity.monthly.tasksCompleted / 4, 1)) * 100, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Velocidade Semanal</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{efficiency.weeklyVelocity}</div>
              <Progress value={Math.min((efficiency.weeklyVelocity / Math.max(productivity.weekly.tasksCreated, 1)) * 100, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Eficiência
            </CardTitle>
            <CardDescription>Taxas de eficiência e conclusão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Conclusão</span>
                <span className="text-sm font-medium">{efficiency.completionRate}%</span>
              </div>
              <Progress value={efficiency.completionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Eficiência</span>
                <span className="text-sm font-medium">{efficiency.efficiencyRate}%</span>
              </div>
              <Progress value={efficiency.efficiencyRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Bloqueio</span>
                <span className="text-sm font-medium">{efficiency.blockageRate}%</span>
              </div>
              <Progress value={efficiency.blockageRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Progresso Médio</span>
                <span className="text-sm font-medium">{efficiency.avgProjectProgress}%</span>
              </div>
              <Progress value={efficiency.avgProjectProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Saúde dos Projetos
            </CardTitle>
            <CardDescription>Visão geral da saúde dos projetos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pontuação de Saúde</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getHealthColor(projectHealth.healthScore)}`}>
                  {projectHealth.healthScore}%
                </span>
                {getHealthBadge(projectHealth.healthScore)}
              </div>
            </div>

            <Progress value={projectHealth.healthScore} className="h-3" />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ativos</span>
                  <Badge variant="outline">{projectHealth.active}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Concluídos</span>
                  <Badge variant="default">{projectHealth.completed}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Em Risco</span>
                  <Badge variant="outline">{projectHealth.atRisk}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Parados</span>
                  <Badge variant="secondary">{projectHealth.stalled}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Qualidade e Entrega
          </CardTitle>
          <CardDescription>Métricas de qualidade e pontualidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {quality.highPriorityCompletionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Requisitos de Alta Prioridade
                </div>
              </div>
              <Progress value={quality.highPriorityCompletionRate} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {quality.highPriorityRequirements} de {quality.totalRequirements} requisitos
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {quality.onTimeDeliveryRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Entrega no Prazo
                </div>
              </div>
              <Progress value={quality.onTimeDeliveryRate} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                Taxa de conclusão dentro do prazo esperado
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {efficiency.weeklyVelocity}
                </div>
                <div className="text-sm text-muted-foreground">
                  Velocidade Semanal
                </div>
              </div>
              <Progress value={Math.min(efficiency.weeklyVelocity * 10, 100)} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                Tarefas concluídas esta semana
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}