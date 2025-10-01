"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Task, TaskTodo } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle,
  Plus,
  Trash2,
  GripVertical,
  MessageSquare,
  Target
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { EditTaskDialog } from "@/components/edit-task-dialog";

export function TaskManager() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const taskId = params.id as string;

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const taskData = await response.json();
      setTask(taskData);
    } catch (err) {
      console.error("Error fetching task:", err);
      setError("Erro ao carregar a tarefa. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = () => {
    // Refresh the task data
    fetchTask();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-500";
      case "Em Progresso":
        return "bg-blue-500";
      case "Pendente":
        return "bg-yellow-500";
      case "Bloqueado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Concluída":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Em Progresso":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "Pendente":
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case "Bloqueado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  
  const handleAddTodo = async () => {
    if (!task || !newTodo.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: newTodo.trim(),
          isCompleted: false
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      const newTodoItem = await response.json();
      setTask(prev => prev ? {
        ...prev,
        taskTodos: [...prev.taskTodos, newTodoItem]
      } : null);
      setNewTodo("");
      setIsAddingTodo(false);
      toast({
        title: "Sucesso",
        description: "Item adicionado à lista de tarefas.",
      });
    } catch (error) {
      console.error("Error creating todo:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar item à lista.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTodo = async (todo: TaskTodo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...todo,
          isCompleted: !todo.isCompleted
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();
      setTask(prev => prev ? {
        ...prev,
        taskTodos: prev.taskTodos.map(t => 
          t.id === updatedTodo.id ? updatedTodo : t
        )
      } : null);
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTask(prev => prev ? {
        ...prev,
        taskTodos: prev.taskTodos.filter(t => t.id !== todoId)
      } : null);
      toast({
        title: "Sucesso",
        description: "Item removido da lista.",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover item.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    if (!task || task.taskTodos.length === 0) return 0;
    const completed = task.taskTodos.filter(todo => todo.isCompleted).length;
    return Math.round((completed / task.taskTodos.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando tarefa...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">{error || "Tarefa não encontrada"}</p>
          <Button onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Tarefa</h1>
            <p className="text-muted-foreground">
              Detalhes e gerenciamento da tarefa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task && <EditTaskDialog task={task} onTaskUpdated={handleTaskUpdated} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações da Tarefa</CardTitle>
                  <CardDescription>
                    {task.project.name} • {format(new Date(task.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-muted-foreground">{task.description}</p>
                  )}
                </div>

                {task.guidancePrompt && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <h4 className="font-medium text-sm">Guidance Prompt</h4>
                      <span className="text-xs text-muted-foreground ml-auto">AI Instructions</span>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <MarkdownRenderer content={task.guidancePrompt} />
                    </div>
                  </div>
                )}

                {task.additionalInformation && (
                  <div>
                    <h4 className="font-medium mb-2">Informações Adicionais</h4>
                    <p className="text-sm text-muted-foreground">{task.additionalInformation}</p>
                  </div>
                )}

                {task.result && (
                  <div>
                    <h4 className="font-medium mb-2">Resultado</h4>
                    <p className="text-sm text-muted-foreground">{task.result}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Criado: {format(new Date(task.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Atualizado: {format(new Date(task.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Todo List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Tarefas</CardTitle>
                <Button onClick={() => setIsAddingTodo(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
              {task.taskTodos.length > 0 && (
                <CardDescription>
                  Progresso: {task.taskTodos.filter(t => t.isCompleted).length} de {task.taskTodos.length} itens ({progress}%)
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {task.taskTodos.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {task.taskTodos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum item na lista. Adicione itens para acompanhar o progresso.
                  </p>
                ) : (
                  task.taskTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Checkbox
                        checked={todo.isCompleted}
                        onCheckedChange={() => handleToggleTodo(todo)}
                      />
                      <span className={`flex-1 ${todo.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.description}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {isAddingTodo && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar novo item..."
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddTodo} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingTodo(false)} size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Requirements */}
          {task.requirementTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requisitos Vinculados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.requirementTasks.map((rt) => (
                    <div key={rt.requirement.id} className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{rt.requirement.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {rt.requirement.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">{task.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Criado por</span>
                <span className="text-sm">{task.createdBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Atualizado por</span>
                <span className="text-sm">{task.updatedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Itens na lista</span>
                <Badge variant="secondary">{task.taskTodos.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requisitos</span>
                <Badge variant="secondary">{task.requirementTasks.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}