"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MarkdownEditor } from "@/components/markdown-editor";

interface CreateRequirementDialogProps {
  projectId: number;
  onRequirementCreated: () => void;
}

export function CreateRequirementDialog({ projectId, onRequirementCreated }: CreateRequirementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Funcional",
    category: "",
    priority: "Média",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título do requisito é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create requirement");
      }

      const requirement = await response.json();
      
      toast({
        title: "Sucesso",
        description: `Requisito "${requirement.title}" criado com sucesso.`,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "Funcional",
        category: "",
        priority: "Média",
      });
      setOpen(false);
      
      // Refresh requirements list
      onRequirementCreated();
    } catch (error) {
      console.error("Error creating requirement:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar requisito. Tente novamente.",
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
          Novo Requisito
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Requisito</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar um novo requisito.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Requisito *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do requisito"
              required
            />
          </div>

          <div className="space-y-2">
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              label="Descrição"
              description="Descreva o requisito em detalhes usando markdown para melhor formatação."
              placeholder="Ex:
# Requisito de Autenticação

## Objetivo
Implementar sistema seguro de autenticação de usuários

## Funcionalidades
- [ ] Login com email e senha
- [ ] Recuperação de senha
- [ ] Autenticação de dois fatores

## Critérios de Aceite
- Usuário deve conseguir fazer login
- Senha deve ser criptografada
- Sistema deve validar formato do email

## Requisitos Técnicos
- JWT para autenticação
- bcrypt para hash de senhas
- Validação de email no frontend e backend
"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcional">Funcional</SelectItem>
                  <SelectItem value="Não Funcional">Não Funcional</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                  <SelectItem value="De Negócio">De Negócio</SelectItem>
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
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Ex: Usuário, Sistema, Segurança, Performance..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Requisito"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}