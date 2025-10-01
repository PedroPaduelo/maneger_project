"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/markdown-editor";

interface CreateTaskDialogProps {
  projectId: number;
  onTaskCreated: () => void;
}

export function CreateTaskDialog({ projectId, onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    guidancePrompt: "",
    additionalInformation: "",
    status: "Pendente",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          projectId,
          createdBy: "system",
          updatedBy: "system",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const task = await response.json();
      
      toast({
        title: "Sucesso",
        description: `Tarefa "${task.title}" criada com sucesso.`,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        guidancePrompt: "",
        additionalInformation: "",
        status: "Pendente",
      });
      setOpen(false);
      
      // Refresh tasks list
      onTaskCreated();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar uma nova tarefa.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a tarefa..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.guidancePrompt}
              onChange={(value) => setFormData(prev => ({ ...prev, guidancePrompt: value }))}
              label="Guidance Prompt"
              description="Instruções detalhadas em markdown para a IA executar a tarefa. Use títulos, listas, código, etc."
              placeholder="Ex:
# Tarefa: Implementar Autenticação

## Objetivo
Criar sistema de login JWT

## Requisitos
- [ ] Criar endpoint /auth/login
- [ ] Implementar middleware de autenticação
- [ ] Testar tokens JWT

## Código de Referência
```typescript
// Exemplo de implementação
```
"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInformation">Informações Adicionais</Label>
            <Textarea
              id="additionalInformation"
              value={formData.additionalInformation}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInformation: e.target.value }))}
              placeholder="Informações complementares sobre a tarefa..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Inicial</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}