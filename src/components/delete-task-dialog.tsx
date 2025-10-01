"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Task } from "@/lib/types";
import { Trash2, AlertTriangle, X, CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteTaskDialogProps {
  task: Task;
  onTaskDeleted: () => void;
}

export function DeleteTaskDialog({ task, onTaskDeleted }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });

      setOpen(false);
      onTaskDeleted();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Excluir Tarefa
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ao excluir a tarefa <strong>"{task.title}"</strong>, todos os itens de todo e dados associados serão excluídos permanentemente.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Informações da Tarefa:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span><strong>Status:</strong> {task.status}</span>
              </div>
              <p><strong>Criada por:</strong> {task.createdBy}</p>
              {task.taskTodos.length > 0 && (
                <p><strong>Itens de todo:</strong> {task.taskTodos.length}</p>
              )}
              {task.requirementTasks.length > 0 && (
                <p><strong>Requisitos vinculados:</strong> {task.requirementTasks.length}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Tarefa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}