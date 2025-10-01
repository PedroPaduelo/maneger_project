"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, Task, Requirement } from "@/lib/types";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  GitBranch, 
  CheckCircle,
  AlertCircle,
  Circle,
  Plus,
  Edit,
  Trash2,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { TaskCard } from "@/components/task-card";
import { RequirementCard } from "@/components/requirement-card";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { CreateRequirementDialog } from "@/components/create-requirement-dialog";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { HistorySummaryManager } from "@/components/history-summary-manager";
import { TaskTable } from "@/components/task-table";
import { RequirementTable } from "@/components/requirement-table";
import { ViewToggle } from "@/components/view-toggle";
import { useViewMode } from "@/hooks/use-view-mode";
import { useRequirementViewMode } from "@/hooks/use-requirement-view-mode";

export function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { viewMode, setViewMode, isLoaded } = useViewMode();
  const { viewMode: requirementViewMode, setViewMode: setRequirementViewMode } = useRequirementViewMode();

  const projectId = params.id as string;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }

      const projectData = await response.json();
      setProject(projectData);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Erro ao carregar o projeto. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500";
      case "Pausado":
        return "bg-yellow-500";
      case "Concluída":
        return "bg-blue-500";
      case "Cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "destructive";
      case "Média":
        return "default";
      case "Baixa":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Circle className="h-4 w-4 text-green-500" />;
      case "Pausado":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Concluída":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "Cancelado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const parseTags = (tags: string | null) => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return tags.split(',').map(tag => tag.trim());
    }
  };

  const handleProjectUpdated = () => {
    // Refresh the project data
    fetchProject();
  };

  const handleProjectDeleted = () => {
    // Redirect to dashboard
    router.push("/");
  };

  const handleCreateTask = () => {
    // This is now handled by the CreateTaskDialog component
  };

  const handleTaskCreated = () => {
    // Refresh the project data to show the new task
    fetchProject();
  };

  const handleCreateRequirement = () => {
    // This is now handled by the CreateRequirementDialog component
  };

  const handleRequirementCreated = () => {
    // Refresh the project data to show the new requirement
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">{error || "Projeto não encontrado"}</p>
          <Button onClick={() => router.push("/")}>
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tags = parseTags(project.tags);
  const completedTasks = project.tasks.filter(t => t.status === "Concluída").length;
  const totalTasks = project.tasks.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              Gerenciamento detalhado do projeto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditProjectDialog project={project} onProjectUpdated={handleProjectUpdated} />
          <DeleteProjectDialog project={project} onProjectDeleted={handleProjectDeleted} />
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Prioridade</h3>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Progresso</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completedTasks} de {totalTasks} tarefas concluídas
                    </span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>

              {project.stack && (
                <div>
                  <h3 className="font-semibold mb-2">Tecnologias</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.split(',').map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        style={{ 
                          backgroundColor: project.color ? `${project.color}20` : undefined,
                          borderColor: project.color || undefined
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado em:</span>
                <span>
                  {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Atualizado em:</span>
                <span>
                  {format(new Date(project.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>

              {project.isFavorite && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>Projeto favorito</span>
                </div>
              )}

              {project.notes && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Observações</h3>
                  <p className="text-sm text-muted-foreground">{project.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tarefas</span>
                <Badge variant="secondary">{totalTasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requisitos</span>
                <Badge variant="secondary">{project.requirements.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Concluídas</span>
                <Badge variant="default">{completedTasks}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="requirements">Requisitos</TabsTrigger>
          <TabsTrigger value="history-summaries">Sumários</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tarefas</h2>
            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <CreateTaskDialog projectId={project.id} onTaskCreated={handleTaskCreated} />
            </div>
          </div>

          {project.tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
                  <p className="text-muted-foreground">
                    Comece adicionando tarefas ao projeto.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === "cards" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {project.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <TaskTable tasks={project.tasks} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Requisitos</h2>
            <div className="flex items-center gap-2">
              <ViewToggle viewMode={requirementViewMode} onViewModeChange={setRequirementViewMode} />
              <CreateRequirementDialog projectId={project.id} onRequirementCreated={handleRequirementCreated} />
            </div>
          </div>

          {project.requirements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Nenhum requisito encontrado</h3>
                  <p className="text-muted-foreground">
                    Comece adicionando requisitos ao projeto.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {requirementViewMode === "cards" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {project.requirements.map((requirement) => (
                    <RequirementCard key={requirement.id} requirement={requirement} />
                  ))}
                </div>
              ) : (
                <RequirementTable requirements={project.requirements} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history-summaries" className="space-y-4">
          <HistorySummaryManager projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <h2 className="text-xl font-semibold">Linha do Tempo</h2>
          
          {project.tasks.length === 0 && project.requirements.length === 0 && project.historySummaries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Nenhuma atividade</h3>
                  <p className="text-muted-foreground">
                    Adicione tarefas, requisitos e sumários ao projeto para ver a linha do tempo.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Timeline Header */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Cronologia das atividades do projeto</span>
                <Badge variant="outline">
                  {project.tasks.length + project.requirements.length + project.historySummaries.length} atividades
                </Badge>
              </div>

              {/* Timeline Items */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                
                <div className="space-y-6">
                  {/* Project Creation */}
                  <div className="relative flex items-start">
                    <div className="absolute left-4 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2"></div>
                    <div className="ml-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Projeto Criado</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(project.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm">
                        Projeto <strong>"{project.name}"</strong> foi criado
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {project.requirements
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((requirement, index) => (
                      <div key={requirement.id} className="relative flex items-start">
                        <div className="absolute left-4 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
                        <div className="ml-8">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="border-blue-500 text-blue-700">
                              Requisito
                            </Badge>
                            <Badge variant={requirement.priority === "Alta" ? "destructive" : requirement.priority === "Média" ? "default" : "secondary"}>
                              {requirement.priority}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(requirement.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm">
                            <strong>{requirement.title}</strong>
                            {requirement.category && (
                              <span className="text-muted-foreground ml-2">
                                • {requirement.category}
                              </span>
                            )}
                          </p>
                          {requirement.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {requirement.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Tasks */}
                  {project.tasks
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((task, index) => (
                      <div key={task.id} className="relative flex items-start">
                        <div className={`absolute left-4 w-2 h-2 rounded-full transform -translate-x-1/2 ${
                          task.status === "Concluída" ? "bg-green-500" :
                          task.status === "Em Progresso" ? "bg-blue-500" :
                          task.status === "Bloqueado" ? "bg-red-500" : "bg-yellow-500"
                        }`}></div>
                        <div className="ml-8">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={
                              task.status === "Concluída" ? "border-green-500 text-green-700" :
                              task.status === "Em Progresso" ? "border-blue-500 text-blue-700" :
                              task.status === "Bloqueado" ? "border-red-500 text-red-700" : "border-yellow-500 text-yellow-700"
                            }>
                              Tarefa
                            </Badge>
                            <Badge variant={
                              task.status === "Concluída" ? "default" :
                              task.status === "Em Progresso" ? "secondary" :
                              task.status === "Bloqueado" ? "destructive" : "outline"
                            }>
                              {task.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(task.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm">
                            <strong>{task.title}</strong>
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Task Progress */}
                          {task.taskTodos.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Progresso</span>
                                <span>
                                  {task.taskTodos.filter(t => t.isCompleted).length} de {task.taskTodos.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    task.status === "Concluída" ? "bg-green-500" :
                                    task.status === "Em Progresso" ? "bg-blue-500" :
                                    task.status === "Bloqueado" ? "bg-red-500" : "bg-yellow-500"
                                  }`}
                                  style={{
                                    width: `${Math.round((task.taskTodos.filter(t => t.isCompleted).length / task.taskTodos.length) * 100)}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* History Summaries */}
                  {project.historySummaries
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((summary) => (
                      <div key={summary.id} className="relative flex items-start">
                        <div className="absolute left-4 w-2 h-2 bg-purple-500 rounded-full transform -translate-x-1/2"></div>
                        <div className="ml-8">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="border-purple-500 text-purple-700">
                              Sumário Histórico
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(summary.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm">
                            <strong>Sumário criado por {summary.createdBy}</strong>
                          </p>
                          {summary.summary && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                              {summary.summary.substring(0, 150)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Last Update */}
                  {project.updatedAt > project.createdAt && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 w-2 h-2 bg-purple-500 rounded-full transform -translate-x-1/2"></div>
                      <div className="ml-8">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-purple-500 text-purple-700">
                            Última Atualização
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(project.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Projeto atualizado recentemente
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}