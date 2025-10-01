"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/lib/types";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle,
  User,
  MessageSquare
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { EditTaskDialog } from "@/components/edit-task-dialog";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleTaskUpdated = () => {
    // Refresh the page or update the local state
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-500";
      case "Em Progresso":
        return "bg-blue-500";
      case "Pendente":
        return "bg-yellow-500";
      case "Bloqueado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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

  const calculateProgress = () => {
    if (task.taskTodos.length === 0) return 0;
    const completed = task.taskTodos.filter(todo => todo.isCompleted).length;
    return Math.round((completed / task.taskTodos.length) * 100);
  };

  const handleViewDetails = () => {
    router.push(`/task/${task.id}`);
  };

  const progress = calculateProgress();

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {task.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 mt-1">
            {task.description || (task.guidancePrompt && (
              <span className="text-sm">
                {task.guidancePrompt
                  .replace(/^#+\s/gm, '') // Remove headers
                  .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting but keep text
                  .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting but keep text
                  .replace(/`(.*?)`/g, '$1') // Remove inline code formatting but keep text
                  .replace(/^- \[ \] /gm, '▢ ') // Convert checkboxes
                  .replace(/^- \[x\] /gm, '☑ ') // Convert checked boxes
                  .replace(/^[-*+]\s/gm, '• ') // Convert list items
                  .replace(/^\d+\.\s/gm, '• ') // Convert numbered lists
                  .split('\n')
                  .filter(line => line.trim())
                  .slice(0, 3)
                  .join(' • ')
                }
              </span>
            ))}
          </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <EditTaskDialog task={task} onTaskUpdated={handleTaskUpdated} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          {getStatusIcon(task.status)}
          <Badge variant="outline" className="text-xs">
            {task.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Progress */}
        {task.taskTodos.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {task.taskTodos.filter(t => t.isCompleted).length} de {task.taskTodos.length} itens
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Additional Information */}
        {task.additionalInformation && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MessageSquare className="h-4 w-4" />
              <span>Informações Adicionais</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {task.additionalInformation}
            </p>
          </div>
        )}

        {/* Requirements */}
        {task.requirementTasks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>Requisitos</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {task.requirementTasks.slice(0, 2).map((rt, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {rt.requirement.title}
                </Badge>
              ))}
              {task.requirementTasks.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.requirementTasks.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {task.result && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckCircle className="h-4 w-4" />
              <span>Resultado</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.result}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(task.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.createdBy}</span>
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