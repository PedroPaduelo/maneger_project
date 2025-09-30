"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Requirement } from "@/lib/types";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Tag,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { EditRequirementDialog } from "@/components/edit-requirement-dialog";

interface RequirementCardProps {
  requirement: Requirement;
}

export function RequirementCard({ requirement }: RequirementCardProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleRequirementUpdated = () => {
    // Refresh the page or update the local state
    window.location.reload();
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Funcional":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "Não Funcional":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "Técnico":
        return <Tag className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Alta":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Média":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "Baixa":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleViewDetails = () => {
    router.push(`/requirement/${requirement.id}`);
  };

  const linkedTasks = requirement.requirementTasks.length;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {requirement.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {requirement.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <EditRequirementDialog 
              requirement={requirement} 
              onRequirementUpdated={handleRequirementUpdated}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          {getTypeIcon(requirement.type)}
          <Badge variant="outline" className="text-xs">
            {requirement.type}
          </Badge>
          {getPriorityIcon(requirement.priority)}
          <Badge variant={getPriorityColor(requirement.priority)} className="text-xs">
            {requirement.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Category */}
        {requirement.category && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Tag className="h-4 w-4" />
              <span>Categoria</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {requirement.category}
            </Badge>
          </div>
        )}

        {/* Linked Tasks */}
        {linkedTasks > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span>Tarefas Vinculadas</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {requirement.requirementTasks.slice(0, 3).map((rt, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {rt.task.title}
                </Badge>
              ))}
              {linkedTasks > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{linkedTasks - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description Preview */}
        <div className="mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <FileText className="h-4 w-4" />
            <span>Descrição</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-4">
            {requirement.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(requirement.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{linkedTasks} tarefa{linkedTasks !== 1 ? 's' : ''}</span>
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