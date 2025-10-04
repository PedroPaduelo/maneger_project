"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Star,
  Edit,
  Trash2,
  MoreVertical,
  MoreHorizontal,
} from "lucide-react";
import { Project } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useToggleFavorite } from "@/hooks";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";

interface ProjectActionsMenuProps {
  project: Project;
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md";
}

export function ProjectActionsMenu({
  project,
  variant = "horizontal",
  size = "sm"
}: ProjectActionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const toggleFavorite = useToggleFavorite();
  const [isOpen, setIsOpen] = useState(false);

  const handleViewDetails = () => {
    router.push(`/project/${project.id}`);
    setIsOpen(false);
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate({
      id: project.id,
      isFavorite: project.isFavorite
    });
    setIsOpen(false);
  };

  const handleProjectUpdated = () => {
    toast({
      title: "Sucesso",
      description: "Projeto atualizado com sucesso.",
    });
    setIsOpen(false);
  };

  const handleProjectDeleted = () => {
    toast({
      title: "Sucesso",
      description: "Projeto excluído com sucesso.",
    });
    setIsOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // O dialog será aberto pelo componente EditProjectDialog
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // O dialog será aberto pelo componente DeleteProjectDialog
  };

  const IconComponent = variant === "vertical" ? MoreVertical : MoreHorizontal;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className={`${
            size === "sm" ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
          } hover:bg-accent transition-colors`}
          title="Mais opções"
        >
          <IconComponent className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-popover border-border text-popover-foreground"
        sideOffset={5}
      >
        <div className="px-2 py-1.5 text-sm text-muted-foreground font-medium">
          Ações do projeto
        </div>
        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={handleViewDetails}
          className="hover:bg-accent focus:bg-accent cursor-pointer transition-colors"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleToggleFavorite}
          className="hover:bg-accent focus:bg-accent cursor-pointer transition-colors"
        >
          <Star className={`mr-2 h-4 w-4 ${project.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
          {project.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <EditProjectDialog
          project={project}
          onProjectUpdated={handleProjectUpdated}
        >
          <DropdownMenuItem
            onClick={handleEditClick}
            className="hover:bg-accent focus:bg-accent cursor-pointer transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar projeto
          </DropdownMenuItem>
        </EditProjectDialog>

        <DeleteProjectDialog
          project={project}
          onProjectDeleted={handleProjectDeleted}
        >
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer text-destructive transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir projeto
          </DropdownMenuItem>
        </DeleteProjectDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}