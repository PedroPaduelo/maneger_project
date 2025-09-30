"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/lib/types";
import { 
  Calendar, 
  Clock, 
  Star, 
  MoreVertical, 
  Users, 
  GitBranch, 
  CheckCircle,
  AlertCircle,
  Circle,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500";
      case "Pausado":
        return "bg-yellow-500";
      case "Concluído":
        return "bg-blue-500";
      case "Cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "destructive";
      case "Média":
        return "default";
      case "Baixa":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Circle className="h-4 w-4 text-green-500" />;
      case "Pausado":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Concluído":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "Cancelado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleViewDetails = () => {
    router.push(`/project/${project.id}`);
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...project,
          isFavorite: !project.isFavorite
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      toast({
        title: "Sucesso",
        description: `Projeto ${!project.isFavorite ? "adicionado aos" : "removido dos"} favoritos.`,
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar favorito. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleProjectUpdated = () => {
    window.location.reload();
  };

  const handleProjectDeleted = () => {
    window.location.reload();
  };

  const parseTags = (tags: string | null) => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return tags.split(',').map(tag => tag.trim());
    }
  };

  const tags = parseTags(project.tags);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {project.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {project.isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="h-8 w-8 p-0"
            >
              <Star className="h-4 w-4" />
            </Button>
            <EditProjectDialog project={project} onProjectUpdated={handleProjectUpdated} />
            <DeleteProjectDialog project={project} onProjectDeleted={handleProjectDeleted} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          {getStatusIcon(project.status)}
          <Badge variant="outline" className="text-xs">
            {project.status}
          </Badge>
          <Badge variant={getPriorityColor(project.priority)} className="text-xs">
            {project.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Stack/Tech */}
        {project.stack && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <GitBranch className="h-4 w-4" />
              <span>Tecnologias</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.stack.split(',').slice(0, 3).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech.trim()}
                </Badge>
              ))}
              {project.stack.split(',').length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.stack.split(',').length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: project.color ? `${project.color}20` : undefined,
                    borderColor: project.color || undefined
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Equipe</span>
            </div>
          </div>
          
          <Button 
            onClick={handleViewDetails}
            className="w-full"
            size="sm"
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}