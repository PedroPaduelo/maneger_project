"use client";

import { memo } from "react";
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
import { useToggleFavorite } from "@/hooks";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TagList } from "@/components/tag-component";
import { DuplicateProjectButton } from "@/components/duplicate-project-button";

interface ProjectCardProps {
  project: Project;
}

function ProjectCardComponent({ project }: ProjectCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const toggleFavorite = useToggleFavorite();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-500";
      case "Pausado":
        return "bg-yellow-500";
      case "Concluída":
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
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "Pausado":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Concluída":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "Cancelado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const handleViewDetails = () => {
    router.push(`/project/${project.id}`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate({
      id: project.id,
      isFavorite: project.isFavorite
    });
  };

  const handleProjectUpdated = () => {
    // Os dados serão atualizados automaticamente pelo TanStack Query
    toast({
      title: "Sucesso",
      description: "Projeto atualizado com sucesso.",
    });
  };

  const handleProjectDeleted = () => {
    // Os dados serão atualizados automaticamente pelo TanStack Query
    toast({
      title: "Sucesso",
      description: "Projeto excluído com sucesso.",
    });
  };

  const parseTags = (tags: string | null) => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return tags.split(',').map(tag => tag.trim());
    }
  };

  // Get tags from both the old tags field and the new projectTags relationship
  const legacyTags = parseTags(project.tags);
  const projectTags = project.projectTags?.map(pt => pt.tag) || [];
  const allTags = [...projectTags, ...legacyTags];

  return (
    <Card className="h-full flex flex-col bg-card border-border text-card-foreground hover:shadow-lg transition-all duration-300 hover:border-muted-foreground/20">
      <CardHeader className="pb-3 space-y-3">
        {/* Cabeçalho com nome, ID e botões de ação */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {project.name}
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-mono hover:bg-accent transition-colors">
                #{project.id}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {project.description || "Sem descrição"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="h-8 w-8 p-0 hover:bg-accent transition-colors"
              title={project.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star className={`h-4 w-4 transition-colors ${
                project.isFavorite
                  ? 'text-yellow-500 fill-current hover:text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-500 hover:fill-current'
              }`} />
            </Button>
            <DuplicateProjectButton projectId={project.id} projectName={project.name} />
            <EditProjectDialog project={project} onProjectUpdated={handleProjectUpdated} />
            <DeleteProjectDialog project={project} onProjectDeleted={handleProjectDeleted} />
          </div>
        </div>

        {/* Status e Prioridade */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            <span className="text-sm text-green-500">{project.status}</span>
          </div>
          <Badge
            variant="secondary"
            className={`text-xs border transition-colors hover:scale-105 ${
              project.priority === 'Alta'
                ? 'bg-destructive/20 text-destructive border-destructive/50 hover:bg-destructive/30'
                : project.priority === 'Média'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/30'
                : 'bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30'
            }`}
          >
            {project.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 hover:bg-primary/80"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Tecnologias */}
        {project.stack && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>Tecnologias</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.stack.split(',').slice(0, 3).map((tech, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs border transition-colors hover:scale-105 ${
                    tech.trim().toLowerCase() === 'react'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30'
                      : tech.trim().toLowerCase() === 'typescript'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30'
                      : tech.trim().toLowerCase() === 'next.js'
                      ? 'bg-muted text-muted-foreground border-border hover:bg-accent'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  {tech.trim()}
                </Badge>
              ))}
              {project.stack.split(',').length > 3 && (
                <Badge variant="secondary" className="text-xs hover:bg-accent transition-colors">
                  +{project.stack.split(',').length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <TagList
              tags={allTags}
              size="sm"
              maxTags={3}
            />
          </div>
        )}

        {/* Espaço flexível */}
        <div className="flex-1"></div>

        {/* Footer com data e equipe */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            size="sm"
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Exportar componente memoizado para evitar re-renders desnecessários
export const ProjectCard = memo(ProjectCardComponent);