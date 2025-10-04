"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Requirement } from "@/lib/types";
import { 
  ArrowLeft, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  Tag,
  Link,
  Unlink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export function RequirementManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    priority: ""
  });
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const requirementId = params.id as string;

  useEffect(() => {
    if (requirementId) {
      fetchRequirement();
    }
  }, [requirementId]);

  const fetchRequirement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requirements/${requirementId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch requirement");
      }

      const requirementData = await response.json();
      setRequirement(requirementData);
      setEditForm({
        title: requirementData.title,
        description: requirementData.description,
        type: requirementData.type,
        category: requirementData.category || "",
        priority: requirementData.priority
      });

      // Fetch available tasks for linking
      if (requirementData.project) {
        const tasksResponse = await fetch(`/api/tasks?projectId=${requirementData.project.id}`);
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          // Filter out already linked tasks
          const linkedTaskIds = requirementData.requirementTasks.map((rt: any) => rt.task.id);
          const availableTasks = tasksData.filter((task: any) => !linkedTaskIds.includes(task.id));
          setAvailableTasks(availableTasks);
        }
      }
    } catch (err) {
      console.error("Error fetching requirement:", err);
      setError("Erro ao carregar o requisito. Por favor, tente novamente.");
    } finally {
      setLoading(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Funcional":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "Não Funcional":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "Técnico":
        return <Tag className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Alta":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Média":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "Baixa":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleSaveRequirement = async () => {
    if (!requirement) return;

    try {
      const response = await fetch(`/api/requirements/${requirement.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update requirement");
      }

      const updatedRequirement = await response.json();
      setRequirement(updatedRequirement);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Requisito atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating requirement:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o requisito.",
        variant: "destructive",
      });
    }
  };

  const handleLinkTask = async (taskId: number) => {
    if (!requirement) return;

    try {
      const response = await fetch(`/api/requirements/${requirement.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error("Failed to link task");
      }

      await fetchRequirement(); // Refresh the requirement data
      setShowLinkDialog(false);
      toast({
        title: "Sucesso",
        description: "Tarefa vinculada com sucesso.",
      });
    } catch (error) {
      console.error("Error linking task:", error);
      toast({
        title: "Erro",
        description: "Falha ao vincular tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleUnlinkTask = async (requirementTaskId: number) => {
    try {
      const response = await fetch(`/api/requirement-tasks/${requirementTaskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unlink task");
      }

      await fetchRequirement(); // Refresh the requirement data
      toast({
        title: "Sucesso",
        description: "Tarefa desvinculada com sucesso.",
      });
    } catch (error) {
      console.error("Error unlinking task:", error);
      toast({
        title: "Erro",
        description: "Falha ao desvincular tarefa.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando requisito...</p>
        </div>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">{error || "Requisito não encontrado"}</p>
          <Button onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Requisito</h1>
            <p className="text-muted-foreground">
              Detalhes e gerenciamento do requisito
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveRequirement}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Requirement Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações do Requisito</CardTitle>
                  <CardDescription>
                    {requirement.project.name} • {format(new Date(requirement.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeIcon(requirement.type)}
                  <Badge variant="outline">{requirement.type}</Badge>
                  {getPriorityIcon(requirement.priority)}
                  <Badge variant={getPriorityColor(requirement.priority)}>{requirement.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Funcional">Funcional</SelectItem>
                        <SelectItem value="Não Funcional">Não Funcional</SelectItem>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Input
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-1"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <MarkdownEditor
                      value={editForm.description}
                      onChange={(value) => setEditForm(prev => ({ ...prev, description: value }))}
                      label="Descrição"
                      description="Descreva o requisito em detalhes usando markdown para melhor formatação."
                      placeholder="Estruture seu requisito com markdown para melhor clareza..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{requirement.title}</h3>
                    {requirement.description ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <MarkdownRenderer content={requirement.description} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">Nenhuma descrição disponível</p>
                    )}
                  </div>

                  {requirement.category && (
                    <div>
                      <h4 className="font-medium mb-2">Categoria</h4>
                      <Badge variant="secondary">{requirement.category}</Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Criado: {format(new Date(requirement.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Atualizado: {format(new Date(requirement.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tarefas Vinculadas</CardTitle>
                <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Link className="h-4 w-4 mr-2" />
                      Vincular Tarefa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Vincular Tarefa</DialogTitle>
                      <DialogDescription>
                        Selecione uma tarefa para vincular a este requisito
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                      {availableTasks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          Nenhuma tarefa disponível para vincular
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {availableTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.status}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleLinkTask(task.id)}
                              >
                                Vincular
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {requirement.requirementTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma tarefa vinculada</h3>
                  <p className="text-muted-foreground mb-4">
                    Vincule tarefas a este requisito para acompanhar o progresso
                  </p>
                  <Button onClick={() => setShowLinkDialog(true)}>
                    <Link className="h-4 w-4 mr-2" />
                    Vincular Tarefa
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirement.requirementTasks.map((rt) => (
                    <div key={rt.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{rt.task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {rt.task.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {rt.task.createdBy}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/task/${rt.task.id}`)}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkTask(rt.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Requirement Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Requisito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <Badge variant="outline">{requirement.type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prioridade</span>
                <Badge variant={getPriorityColor(requirement.priority)}>{requirement.priority}</Badge>
              </div>
              {requirement.category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <Badge variant="secondary">{requirement.category}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tarefas vinculadas</span>
                <Badge variant="secondary">{requirement.requirementTasks.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projeto</span>
                <span className="text-sm">{requirement.project.name}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data de criação</span>
                <span className="text-sm">
                  {format(new Date(requirement.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última atualização</span>
                <span className="text-sm">
                  {format(new Date(requirement.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tarefas concluídas</span>
                <Badge variant="default">
                  {requirement.requirementTasks.filter((rt: any) => rt.task.status === "Concluída").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tarefas em progresso</span>
                <Badge variant="secondary">
                  {requirement.requirementTasks.filter((rt: any) => rt.task.status === "Em Progresso").length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}