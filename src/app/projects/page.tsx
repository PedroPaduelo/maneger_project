"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useProjects, useCreateProject } from "@/hooks";
import { SidebarLayout } from "@/components/sidebar-layout";
import { SimpleDashboard } from "@/components/simple-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { ProjectActionsMenu } from "@/components/project-actions-menu";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { DuplicateProjectButton } from "@/components/duplicate-project-button";
import {
  Plus,
  FolderKanban,
  Search,
  Filter,
  Grid3X3,
  Table as TableIcon,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Calendar,
  Users,
  Target,
  TrendingUp,
  GitBranch,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_at");

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects
  } = useProjects({
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
  });

  const createProjectMutation = useCreateProject();

  // Filtragem local
  const filteredProjects = projects.filter((project: any) => {
    if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Ordenação local
  const sortedProjects = [...filteredProjects].sort((a: any, b: any) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created_at":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "updated_at":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    }
  });

  const handleProjectCreated = useCallback(() => {
    // A lista será atualizada automaticamente pelo hook useCreateProject
    // Mas também podemos forçar uma recarga se necessário
    refetchProjects();
  }, [refetchProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-900/50 text-green-300 border-green-700";
      case "Pausado":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
      case "Concluído":
        return "bg-blue-900/50 text-blue-300 border-blue-700";
      case "Cancelado":
        return "bg-red-900/50 text-red-300 border-red-700";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-900/50 text-red-300 border-red-700";
      case "medium":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
      case "low":
        return "bg-green-900/50 text-green-300 border-green-700";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortBy("updated_at");
  };

  if (status === "loading" || projectsLoading) {
    return (
      <SidebarLayout title="Projetos">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando projetos...</p>
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
          <Button onClick={() => window.location.href = "/auth/signin"}>
            Fazer Login
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  if (projectsError) {
    return (
      <SidebarLayout title="Erro">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground">
            {projectsError.message || "Erro ao carregar os projetos. Por favor, tente novamente."}
          </p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Projetos"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos" }
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Projetos</CardTitle>
              <div className="bg-primary/20 p-2 rounded-lg">
                <FolderKanban className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {projects.filter((p: any) => p.status === 'Ativo').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Progresso</CardTitle>
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Activity className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p: any) => p.status === 'Ativo' && p.progress < 100).length}
              </div>
              <p className="text-xs text-muted-foreground">
                projetos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Concluídos</CardTitle>
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p: any) => p.progress === 100).length}
              </div>
              <p className="text-xs text-muted-foreground">
                projetos finalizados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Favoritos</CardTitle>
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p: any) => p.isFavorite).length}
              </div>
              <p className="text-xs text-muted-foreground">
                projetos marcados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header com Filtros e Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Todos os Projetos</h2>
            <Badge variant="secondary">
              {sortedProjects.length} projetos
            </Badge>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at">Atualizado</SelectItem>
                  <SelectItem value="created_at">Criado</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="priority">Prioridade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <Filter className="h-4 w-4 mr-1" />
                Limpar
              </Button>

              <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            </div>

            {/* Toggle Visualização */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "card" ? "default" : "ghost"}
                onClick={() => setViewMode("card")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {sortedProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Nenhum projeto encontrado"
                  : "Nenhum projeto ainda"
                }
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Tente ajustar seus filtros ou termos de busca."
                  : "Comece criando seu primeiro projeto para gerenciar seu trabalho."
                }
              </p>
              <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cards View */}
            {viewMode === "card" && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <Card className="bg-card border-border">
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-border hover:bg-muted/30">
                        <TableHead className="text-muted-foreground font-semibold">ID</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Projeto</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Prioridade</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Progresso</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Tecnologias</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">Data de Criação</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedProjects.map((project: any) => (
                        <TableRow key={project.id} className="border-border hover:bg-accent/50 transition-colors">
                          <TableCell className="font-mono text-sm">
                            #{project.id}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 max-w-xs">
                              <div className="flex items-center gap-2">
                                {project.isFavorite && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                                <div className="font-medium line-clamp-1 hover:text-primary transition-colors">
                                  {project.name}
                                </div>
                              </div>
                              {project.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {project.description.substring(0, 100)}{project.description.length > 100 ? "..." : ""}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs border transition-colors ${getStatusColor(project.status)}`}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-xs border transition-colors hover:scale-105 ${getPriorityColor(project.priority)}`}
                            >
                              {project.priority === 'high' ? 'Alta' :
                               project.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{project.progress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.stack ? (
                              <div className="flex items-center gap-1 min-w-[150px]">
                                <div className="flex flex-wrap gap-1">
                                  {project.stack.split(',').slice(0, 2).map((tech: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className={`text-xs hover:scale-105 transition-colors ${
                                        tech.trim().toLowerCase() === 'react'
                                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30'
                                          : tech.trim().toLowerCase() === 'typescript'
                                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30'
                                          : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                                      }`}
                                    >
                                      {tech.trim()}
                                    </Badge>
                                  ))}
                                  {project.stack.split(',').length > 2 && (
                                    <Badge variant="secondary" className="text-xs hover:bg-accent transition-colors">
                                      +{project.stack.split(',').length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm">
                              {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `/project/${project.id}`}
                                className="h-8 w-8 p-0 hover:bg-accent"
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Lógica de favorito será movida para o menu
                                }}
                                className="h-8 w-8 p-0 hover:bg-accent"
                                title={project.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                              >
                                <Star className={`h-4 w-4 transition-colors ${
                                  project.isFavorite
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-muted-foreground hover:text-yellow-500 hover:fill-current'
                                }`} />
                              </Button>
                              <DuplicateProjectButton projectId={project.id} projectName={project.name} />
                              <ProjectActionsMenu
                                project={project}
                                variant="horizontal"
                                size="sm"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {sortedProjects.length} de {sortedProjects.length} projetos
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Itens por página</span>
                    <select className="h-8 w-16 rounded bg-muted border-border text-foreground text-sm px-2">
                      <option>10</option>
                      <option>20</option>
                      <option>50</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-muted border-border hover:bg-accent">
                        &lt;&lt;
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-muted border-border hover:bg-accent">
                        &lt;
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-muted border-border hover:bg-accent">
                        &gt;
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-muted border-border hover:bg-accent">
                        &gt;&gt;
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}