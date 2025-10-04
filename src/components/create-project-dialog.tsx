"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DirectorySelector } from "@/components/directory-selector";
import { MarkdownEditor } from "@/components/markdown-editor";

interface CreateProjectDialogProps {
  onProjectCreated: () => void;
}

export function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stack: "",
    notes: "",
    status: "Ativo",
    priority: "Média",
    isFavorite: false,
    tags: [] as string[],
    executionPath: "",
  });
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do projeto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();
      
      toast({
        title: "Sucesso",
        description: `Projeto "${project.name}" criado com sucesso.`,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        stack: "",
        notes: "",
        status: "Ativo",
        priority: "Média",
        isFavorite: false,
        tags: [],
        executionPath: "",
      });
      setNewTag("");
      setOpen(false);
      
      // Refresh projects list
      onProjectCreated();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar um novo projeto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do projeto"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              label="Descrição"
              description="Descreva o projeto em detalhes usando markdown para melhor formatação."
              placeholder="Ex:
# Projeto: Sistema de E-commerce

## Objetivo
Desenvolver plataforma completa de e-commerce

## Funcionalidades Principais
- [ ] Sistema de autenticação
- [ ] Catálogo de produtos
- [ ] Carrinho de compras
- [ ] Integração com pagamentos

## Stack Tecnológico
- Frontend: React/Next.js
- Backend: Node.js/Express
- Database: PostgreSQL
- Autenticação: JWT
"
            />
          </div>

  
          <div className="space-y-2">
            <Label htmlFor="stack">Tecnologias (separadas por vírgula)</Label>
            <Input
              id="stack"
              value={formData.stack}
              onChange={(e) => setFormData(prev => ({ ...prev, stack: e.target.value }))}
              placeholder="React, Node.js, TypeScript, PostgreSQL"
            />
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.notes}
              onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
              label="Observações"
              description="Observações adicionais sobre o projeto usando markdown para melhor organização."
              placeholder="Ex:
## Notas Importantes

### Configuração de Ambiente
- Node.js 18+ requerido
- PostgreSQL 14+
- Redis para cache

### Informações de Deploy
- Hospedado na AWS
- CI/CD com GitHub Actions
- Variáveis de ambiente no .env

### Contatos
- Product Manager: João Silva
- Tech Lead: Maria Santos
"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executionPath">Diretório de Execução (Opcional)</Label>
            <DirectorySelector
              value={formData.executionPath}
              onChange={(path) => setFormData(prev => ({ ...prev, executionPath: path }))}
              placeholder="Selecione o diretório onde as tasks serão executadas..."
            />
            <p className="text-xs text-gray-500">
              Diretório local onde os comandos das tasks serão executados. Pode ser configurado depois.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Adicionar tag"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}