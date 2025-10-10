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
import { Plus, X, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useTags, useCreateTag } from "@/hooks/useTags";
import { useCreateProject } from "@/hooks/useProjects";
import { TagComponent, TagList } from "@/components/tag-component";

interface CreateProjectDialogProps {
  onProjectCreated: () => void;
}

export function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stack: "",
    notes: "",
    status: "Ativo",
    priority: "Média",
    isFavorite: false,
    tags: [] as string[],
    gitRepositoryUrl: "",
  });
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  // Hooks para tags e criação de projeto
  const { data: existingTags = [], isLoading: tagsLoading } = useTags();
  const createTagMutation = useCreateTag();
  const createProjectMutation = useCreateProject();

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

    try {
      await createProjectMutation.mutateAsync({
        ...formData,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
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
        gitRepositoryUrl: "",
      });
      setNewTag("");
      setOpen(false);

      // Refresh projects list
      onProjectCreated();
    } catch (error) {
      console.error("Error creating project:", error);
      // O erro já é tratado pelo hook useCreateProject
    }
  };

  const addTag = async () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim();

      // Check if tag exists in database
      const tagExists = existingTags.some(tag =>
        tag.name.toLowerCase() === trimmedTag.toLowerCase()
      );

      // If tag doesn't exist, create it
      if (!tagExists) {
        try {
          await createTagMutation.mutateAsync({ name: trimmedTag });
        } catch (error) {
          console.error("Error creating tag:", error);
          // Even if creation fails, we can still add it to the form
          // It will be created when the project is saved
        }
      }

      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
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

  const addExistingTag = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
  };

  const getAvailableTags = () => {
    return existingTags.filter(tag =>
      !formData.tags.some(selectedTag =>
        selectedTag.toLowerCase() === tag.name.toLowerCase()
      )
    );
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
            <Label htmlFor="gitRepositoryUrl">Repositório Git (Opcional)</Label>
            <Input
              id="gitRepositoryUrl"
              value={formData.gitRepositoryUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, gitRepositoryUrl: e.target.value }))}
              placeholder="https://github.com/usuario/repositorio.git"
              type="url"
            />
            <p className="text-xs text-gray-500">
              URL do repositório Git para clonar. Ex: https://github.com/usuario/repositorio.git
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>

            {/* Existing Tags Selector */}
            {!tagsLoading && getAvailableTags().length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Tags existentes:</Label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableTags().slice(0, 8).map((tag) => (
                    <div
                      key={tag.id}
                      className="cursor-pointer"
                      onClick={() => addExistingTag(tag.name)}
                    >
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                          borderColor: tag.color || undefined
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                    </div>
                  ))}
                  {getAvailableTags().length > 8 && (
                    <Badge variant="outline" className="text-gray-500">
                      +{getAvailableTags().length - 8} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Criar nova tag..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                disabled={createTagMutation.isPending}
              >
                {createTagMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Tags selecionadas:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => {
                    // Find the tag object to get its color
                    const tagObject = existingTags.find(t => t.name === tag);
                    const tagWithColor = tagObject || { name: tag, color: undefined };
                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1 text-xs"
                        style={{
                          backgroundColor: tagWithColor.color ? `${tagWithColor.color}20` : undefined,
                          borderColor: tagWithColor.color || undefined
                        }}
                      >
                        <Check className="h-3 w-3" />
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent hover:text-red-500"
                          onClick={() => removeTag(tag)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}