"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { HistorySummary } from "@/lib/types";
import { MarkdownPreview } from "@/components/markdown-preview";
import { MarkdownToolbar } from "@/components/markdown-toolbar";

interface CreateHistorySummaryDialogProps {
  projectId: number;
  historySummary?: HistorySummary | null;
  onHistorySummaryCreated: () => void;
  onHistorySummaryUpdated: () => void;
}

export function CreateHistorySummaryDialog({
  projectId,
  historySummary,
  onHistorySummaryCreated,
  onHistorySummaryUpdated,
}: CreateHistorySummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(historySummary?.summary || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!historySummary;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summary.trim()) {
      toast({
        title: "Erro",
        description: "O sumário é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/projects/${projectId}/history-summaries/${historySummary.id}`
        : `/api/projects/${projectId}/history-summaries`;
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summary }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar sumário");
      }

      toast({
        title: "Sucesso",
        description: isEditing
          ? "Sumário atualizado com sucesso"
          : "Sumário criado com sucesso",
      });

      setOpen(false);
      setSummary("");
      
      if (isEditing) {
        onHistorySummaryUpdated();
      } else {
        onHistorySummaryCreated();
      }
    } catch (error) {
      console.error("Error saving history summary:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar sumário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSummary(historySummary?.summary || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button onClick={() => setOpen(true)}>
        {isEditing ? "Editar Sumário" : "Adicionar Sumário"}
      </Button>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {isEditing ? "Editar Sumário" : "Adicionar Novo Sumário"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edite o sumário histórico do projeto usando Markdown para formatação avançada."
                : "Crie um novo sumário para registrar o progresso ou marcos importantes do projeto. Use Markdown para formatação rica!"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
            <div className="space-y-2 flex-1 overflow-hidden">
              <Label htmlFor="summary">Sumário (Markdown)</Label>
              <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                <MarkdownToolbar
                  value={summary}
                  onChange={setSummary}
                  onInsert={(text) => setSummary(prev => prev + text)}
                  textareaRef={textareaRef}
                />
                <div className="flex-1 overflow-hidden">
                  <MarkdownPreview
                    value={summary}
                    onChange={setSummary}
                    placeholder={`# Progresso do Projeto

## Marcos Alcançados
- **Tarefa concluída**: Descrição da tarefa
- *Novo recurso*: Implementação do sistema X

## Próximos Passos
1. Finalizar módulo Y
2. Testes de integração
3. Documentação

> **Importante**: Lembre-se de atualizar a documentação

\`\`\`javascript
// Exemplo de código
function exemplo() {
  console.log("Hello World");
}
\`\`\`

[Link para documentação](https://exemplo.com)`}
                    rows={12}
                    className="h-full"
                    textareaRef={textareaRef}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button type="submit" disabled={loading || !summary.trim()}>
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}