"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HistorySummary } from "@/lib/types";

interface DeleteHistorySummaryDialogProps {
  historySummary: HistorySummary;
  projectId: number;
  onHistorySummaryDeleted: () => void;
}

export function DeleteHistorySummaryDialog({
  historySummary,
  projectId,
  onHistorySummaryDeleted,
}: DeleteHistorySummaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/history-summaries/${historySummary.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir sumário");
      }

      toast({
        title: "Sucesso",
        description: "Sumário excluído com sucesso",
      });

      setOpen(false);
      onHistorySummaryDeleted();
    } catch (error) {
      console.error("Error deleting history summary:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir sumário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Excluir
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este sumário histórico? Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Sumário a ser excluído:</p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {historySummary.summary}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}