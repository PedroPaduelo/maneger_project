'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { QuickTaskInput } from '@/types/executor';
import { toast } from 'sonner';

interface QuickAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onTaskAdded: (task: any) => void;
}

export function QuickAddTaskDialog({
  open,
  onOpenChange,
  projectId,
  onTaskAdded,
}: QuickAddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuickTaskInput>({
    title: '',
    guidancePrompt: '',
    description: '',
    additionalInformation: '',
  });

  const [errors, setErrors] = useState<{
    title?: string;
    guidancePrompt?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.guidancePrompt.trim()) {
      newErrors.guidancePrompt = 'Guidance Prompt é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/executor/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const newTask = await response.json();
      onTaskAdded(newTask);
      toast.success('Task criada com sucesso');

      // Reset form
      setFormData({
        title: '',
        guidancePrompt: '',
        description: '',
        additionalInformation: '',
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao criar task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof QuickTaskInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const characterCount = {
    title: formData.title.length,
    guidancePrompt: formData.guidancePrompt.length,
    description: formData.description?.length || 0,
    additionalInformation: formData.additionalInformation?.length || 0,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Task Rápida</DialogTitle>
            <DialogDescription>
              Crie uma nova task que será adicionada à fila de execução
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Implementar autenticação JWT"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              <div className="flex items-center justify-between">
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {characterCount.title} caracteres
                </span>
              </div>
            </div>

            {/* Guidance Prompt */}
            <div className="space-y-2">
              <Label htmlFor="guidancePrompt">
                Guidance Prompt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="guidancePrompt"
                placeholder="Descreva o que deve ser feito nesta task..."
                value={formData.guidancePrompt}
                onChange={(e) => updateField('guidancePrompt', e.target.value)}
                rows={4}
                className={errors.guidancePrompt ? 'border-red-500' : ''}
              />
              <div className="flex items-center justify-between">
                {errors.guidancePrompt && (
                  <p className="text-sm text-red-500">{errors.guidancePrompt}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {characterCount.guidancePrompt} caracteres
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição adicional da task..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
              <span className="text-xs text-muted-foreground">
                {characterCount.description} caracteres
              </span>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInformation">
                Informações Adicionais (opcional)
              </Label>
              <Textarea
                id="additionalInformation"
                placeholder="Informações extras, links, referências..."
                value={formData.additionalInformation}
                onChange={(e) =>
                  updateField('additionalInformation', e.target.value)
                }
                rows={3}
              />
              <span className="text-xs text-muted-foreground">
                {characterCount.additionalInformation} caracteres
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
