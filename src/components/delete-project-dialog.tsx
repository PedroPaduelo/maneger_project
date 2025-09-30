"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Project } from "@/lib/types";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteProjectDialogProps {
  project: Project;
  onProjectDeleted: () => void;
}

export function DeleteProjectDialog({ project, onProjectDeleted }: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      toast({
        title: "Projeto excluído",
        description: "O projeto foi excluído com sucesso.",
      });

      setOpen(false);
      onProjectDeleted();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Excluir Projeto
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ao excluir o projeto <strong>"{project.name}"</strong>, todas as tarefas e requisitos associados também serão excluídos permanentemente.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Informações do Projeto:</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {project.name}</p>
              <p><strong>Status:</strong> {project.status}</p>
              <p><strong>Tarefas:</strong> {project.tasks?.length || 0}</p>
              <p><strong>Requisitos:</strong> {project.requirements?.length || 0}</p>
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
                Excluir Projeto
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}