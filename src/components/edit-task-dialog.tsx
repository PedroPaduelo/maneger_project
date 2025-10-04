"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/markdown-editor";

interface EditTaskDialogProps {
  task: Task;
  onTaskUpdated: () => void;
}

export function EditTaskDialog({ task, onTaskUpdated }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    guidancePrompt: task.guidancePrompt,
    additionalInformation: task.additionalInformation || "",
    status: task.status,
    result: task.result || "",
    taskTodos: task.taskTodos || []
  });

  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setFormData({
        ...formData,
        taskTodos: [
          ...formData.taskTodos,
          {
            id: Date.now(), // Temporary ID
            description: newTodo.trim(),
            isCompleted: false,
            sequence: formData.taskTodos.length
          }
        ]
      });
      setNewTodo("");
    }
  };

  const removeTodo = (index: number) => {
    setFormData({
      ...formData,
      taskTodos: formData.taskTodos.filter((_, i) => i !== index)
    });
  };

  const toggleTodo = (index: number) => {
    const updatedTodos = [...formData.taskTodos];
    updatedTodos[index].isCompleted = !updatedTodos[index].isCompleted;
    setFormData({
      ...formData,
      taskTodos: updatedTodos
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          taskTodos: formData.taskTodos.map(todo => ({
            description: todo.description,
            isCompleted: todo.isCompleted,
            sequence: todo.sequence
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });

      setOpen(false);
      onTaskUpdated();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Atualize as informações da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.guidancePrompt}
              onChange={(value) => setFormData({ ...formData, guidancePrompt: value })}
              label="Guidance Prompt"
              description="Instruções detalhadas em markdown para a IA executar a tarefa"
              placeholder="Estruture seu prompt com markdown para melhores resultados..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada da tarefa"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInformation">Informações Adicionais</Label>
            <Textarea
              id="additionalInformation"
              value={formData.additionalInformation}
              onChange={(e) => setFormData({ ...formData, additionalInformation: e.target.value })}
              placeholder="Informações complementares"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Resultado</Label>
            <Textarea
              id="result"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              placeholder="Resultados ou entregáveis da tarefa"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Checklist</Label>
            <div className="space-y-2">
              {formData.taskTodos.map((todo, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Checkbox
                    checked={todo.isCompleted}
                    onCheckedChange={() => toggleTodo(index)}
                  />
                  <span className={`flex-1 ${todo.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.description}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTodo(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Adicionar item ao checklist"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTodo())}
                />
                <Button type="button" onClick={addTodo} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}