"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, Task, Requirement, HistorySummary } from "@/lib/types";
import { ProjectCard } from "@/components/project-card";
import { ProjectTable } from "@/components/project-table";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { AuthNav } from "@/components/auth-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardCharts } from "@/components/dashboard-charts";
import { RecentActivities } from "@/components/recent-activities";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { AutoRefreshHeader } from "@/components/auto-refresh-header";
import { Plus, Search, Filter, Star, Clock, CheckCircle, AlertTriangle, LayoutDashboard, BarChart3, TrendingUp, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  requirements: Requirement[];
  historySummaries: HistorySummary[];
}

export function Dashboard({ projects, tasks, requirements, historySummaries }: DashboardProps) {
  const { data: session, status } = useSession();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const { toast } = useToast();

  const handleProjectCreated = () => {
    // This will be handled by the parent component re-fetching data
    window.location.reload();
  };

  const handleAutoRefresh = () => {
    // Refresh the page to get latest data
    window.location.reload();
  };

  
  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "Ativo").length;
  const completedProjects = projects.filter(p => p.progress === 100).length;
  const favoriteProjects = projects.filter(p => p.isFavorite).length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Concluída").length;
  const pendingTasks = tasks.filter(t => t.status === "Pendente").length;
  
  const totalRequirements = requirements.length;
  const highPriorityRequirements = requirements.filter(r => r.priority === "Alta").length;

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const handleCreateProject = () => {
    // This is now handled by the CreateProjectDialog component
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos de desenvolvimento de forma eficiente
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <AutoRefreshHeader
            onRefresh={handleAutoRefresh}
          />
          <ThemeToggle />
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          <AuthNav />
        </div>
      </div>

      {/* Main Dashboard with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Projetos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {activeProjects} ativos, {completedProjects} concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {completedTasks} concluídas, {pendingTasks} pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requisitos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRequirements}</div>
                <p className="text-xs text-muted-foreground">
                  {highPriorityRequirements} alta prioridade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{favoriteProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Projetos marcados como favoritos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Activities */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCharts
                projects={projects}
                tasks={tasks}
                requirements={requirements}
              />
            </div>
            <div>
              <RecentActivities
                projects={projects}
                tasks={tasks}
                requirements={requirements}
                historySummaries={historySummaries}
              />
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <DashboardCharts 
            projects={projects}
            tasks={tasks}
            requirements={requirements}
          />
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics 
            projects={projects}
            tasks={tasks}
            requirements={requirements}
          />
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Header com Toggle de Visualização */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Projetos</h2>
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("card")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Tabela
              </Button>
            </div>
          </div>

          {/* Visualização condicional */}
          {viewMode === "table" ? (
            <ProjectTable projects={filteredProjects} />
          ) : (
            <>
              {/* Filters and Search para Card View */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtros e Busca</CardTitle>
                  <CardDescription>
                    Encontre projetos rapidamente usando os filtros abaixo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar projetos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Pausado">Pausado</SelectItem>
                        <SelectItem value="Concluída">Concluída</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Prioridades</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Projects List em Cards */}
              <div className="space-y-4">
                {filteredProjects.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                            ? "Tente ajustar seus filtros ou termos de busca."
                            : "Comece criando seu primeiro projeto."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}