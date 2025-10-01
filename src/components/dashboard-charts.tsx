"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Project, Task, Requirement } from "@/lib/types";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface DashboardChartsProps {
  projects: Project[];
  tasks: Task[];
  requirements: Requirement[];
}

export function DashboardCharts({ projects, tasks, requirements }: DashboardChartsProps) {
  // Calculate project status distribution
  const projectStatusDistribution = {
    Ativo: projects.filter(p => p.status === "Ativo").length,
    Pausado: projects.filter(p => p.status === "Pausado").length,
    Concluído: projects.filter(p => p.status === "Concluído").length,
    Cancelado: projects.filter(p => p.status === "Cancelado").length,
  };

  // Calculate task status distribution
  const taskStatusDistribution = {
    "Concluída": tasks.filter(t => t.status === "Concluída").length,
    "Em Progresso": tasks.filter(t => t.status === "Em Progresso").length,
    Pendente: tasks.filter(t => t.status === "Pendente").length,
    Bloqueado: tasks.filter(t => t.status === "Bloqueado").length,
  };

  // Calculate requirement priority distribution
  const requirementPriorityDistribution = {
    Alta: requirements.filter(r => r.priority === "Alta").length,
    Média: requirements.filter(r => r.priority === "Média").length,
    Baixa: requirements.filter(r => r.priority === "Baixa").length,
  };

  // Calculate overall progress
  const totalProjectsProgress = projects.reduce((sum, project) => sum + project.progress, 0);
  const averageProgress = projects.length > 0 ? Math.round(totalProjectsProgress / projects.length) : 0;

  // Calculate completion rates
  const taskCompletionRate = tasks.length > 0 ? Math.round((taskStatusDistribution["Concluída"] / tasks.length) * 100) : 0;
  const projectCompletionRate = projects.length > 0 ? Math.round((projectStatusDistribution.Concluído / projects.length) * 100) : 0;

  // Get recent activities (last 7 days)
  const getRecentActivities = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProjects = projects.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo).length;
    const recentRequirements = requirements.filter(r => new Date(r.createdAt) >= sevenDaysAgo).length;

    return { recentProjects, recentTasks, recentRequirements };
  };

  const recentActivities = getRecentActivities();

  // Get high priority items
  const highPriorityTasks = tasks.filter(t => {
    // This is a simplified logic - in real app, tasks might have priority field
    // or we could derive it from associated requirements
    return t.status === "Bloqueado" || t.status === "Pendente";
  });

  const overdueTasks = tasks.filter(t => {
    // Simplified logic - in real app, we'd check due dates
    return t.status === "Pendente" || t.status === "Bloqueado";
  });

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <Progress value={averageProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Média de progresso dos projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCompletionRate}%</div>
            <Progress value={taskCompletionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Tarefas concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentActivities.recentProjects + recentActivities.recentTasks + recentActivities.recentRequirements}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status dos Projetos
            </CardTitle>
            <CardDescription>Distribuição de status dos projetos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(projectStatusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === "Ativo" ? "bg-green-500" :
                    status === "Pausado" ? "bg-yellow-500" :
                    status === "Concluído" ? "bg-blue-500" : "bg-red-500"
                  }`} />
                  <span className="text-sm font-medium">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === "Ativo" ? "bg-green-500" :
                        status === "Pausado" ? "bg-yellow-500" :
                        status === "Concluído" ? "bg-blue-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${projects.length > 0 ? (count / projects.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status das Tarefas
            </CardTitle>
            <CardDescription>Distribuição de status das tarefas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(taskStatusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === "Concluída" ? "bg-green-500" :
                    status === "Em Progresso" ? "bg-blue-500" :
                    status === "Pendente" ? "bg-yellow-500" : "bg-red-500"
                  }`} />
                  <span className="text-sm font-medium">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === "Concluída" ? "bg-green-500" :
                        status === "Em Progresso" ? "bg-blue-500" :
                        status === "Pendente" ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${tasks.length > 0 ? (count / tasks.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Requirement Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Prioridade dos Requisitos
            </CardTitle>
            <CardDescription>Distribuição de prioridades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(requirementPriorityDistribution).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    priority === "Alta" ? "destructive" :
                    priority === "Média" ? "default" : "secondary"
                  }>
                    {priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        priority === "Alta" ? "bg-red-500" :
                        priority === "Média" ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{
                        width: `${requirements.length > 0 ? (count / requirements.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Attention Required */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Requer Atenção
            </CardTitle>
            <CardDescription>Itens que precisam de atenção imediata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Tarefas Pendentes</span>
              </div>
              <Badge variant="outline">{taskStatusDistribution.Pendente}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Tarefas Bloqueadas</span>
              </div>
              <Badge variant="destructive">{taskStatusDistribution.Bloqueado}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Requisitos de Alta Prioridade</span>
              </div>
              <Badge variant="destructive">{requirementPriorityDistribution.Alta}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Conquistas Recentes
            </CardTitle>
            <CardDescription>Progresso e conclusões recentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Projetos Concluídos</span>
              </div>
              <Badge variant="outline">{projectStatusDistribution.Concluído}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Tarefas Concluídas</span>
              </div>
              <Badge variant="outline">{taskStatusDistribution["Concluída"]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Progresso Médio</span>
              </div>
              <Badge variant="outline">{averageProgress}%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}