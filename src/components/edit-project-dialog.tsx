"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/types";
import { Edit, Save, X, Plus, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProject } from "@/hooks";
import { DirectorySelector } from "@/components/directory-selector";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useTags, useCreateTag } from "@/hooks/useTags";
import { TagComponent } from "@/components/tag-component";

interface EditProjectDialogProps {
  project: Project;
  onProjectUpdated: () => void;
  trigger?: React.ReactNode;
}

export function EditProjectDialog({ project, onProjectUpdated, trigger }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateProject = useUpdateProject();

  // Hooks para tags
  const { data: existingTags = [], isLoading: tagsLoading } = useTags();
  const createTagMutation = useCreateTag();
  
  const parseTags = (tags: string | null) => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return tags.split(',').map(tag => tag.trim());
    }
  };

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    stack: project.stack || "",
    notes: project.notes || "",
    status: project.status,
    priority: project.priority,
    isFavorite: project.isFavorite,
    tags: parseTags(project.tags),
    executionPath: (project as any).executionPath || ""
  });

  const [newTag, setNewTag] = useState("");

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

      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProject.mutate({
      id: project.id,
      ...formData,
      tags: formData.tags
    }, {
      onSuccess: () => {
        setOpen(false);
        onProjectUpdated();
      }
    });
  };

  const addExistingTag = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagName]
      });
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
        {trigger || (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>
            Atualize as informações do projeto abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do projeto"
              required
            />
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              label="Descrição"
              description="Descreva o projeto em detalhes usando markdown para melhor formatação."
              placeholder="Descreva o projeto usando markdown..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stack">Tecnologias (separadas por vírgula)</Label>
            <Input
              id="stack"
              value={formData.stack}
              onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
              placeholder="React, Node.js, MongoDB, etc."
            />
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
              label="Observações"
              description="Observações adicionais sobre o projeto usando markdown para melhor organização."
              placeholder="Adicione observações usando markdown..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executionPath">Diretório de Execução</Label>
            <DirectorySelector
              value={formData.executionPath}
              onChange={(path) => setFormData({ ...formData, executionPath: path })}
              placeholder="Selecione o diretório onde as tasks serão executadas..."
            />
            <p className="text-xs text-gray-500">
              Diretório onde os comandos das tasks serão executados localmente
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
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
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
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
            <Label>Tags</Label>

            {/* Existing Tags Selector */}
            {!tagsLoading && getAvailableTags().length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Tags existentes:</Label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableTags().slice(0, 8).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="default"
                      className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color || undefined
                      }}
                      onClick={() => addExistingTag(tag.name)}
                    >
                      <Plus className="h-3 w-3" />
                      {tag.name}
                    </Badge>
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
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Criar nova tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
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
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isFavorite">Marcar como favorito</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={updateProject.isPending}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? (
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