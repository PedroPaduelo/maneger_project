"use client";

import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle,
  User,
  MessageSquare,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { EditTaskDialog } from "@/components/edit-task-dialog";

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  const router = useRouter();

  const handleTaskUpdated = () => {
    window.location.reload();
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

  const calculateProgress = (task: Task) => {
    if (task.taskTodos.length === 0) return 0;
    const completed = task.taskTodos.filter(todo => todo.isCompleted).length;
    return Math.round((completed / task.taskTodos.length) * 100);
  };

  const handleViewDetails = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDescription = (task: Task) => {
    if (task.description) {
      return truncateText(task.description, 100);
    }
    if (task.guidancePrompt) {
      return truncateText(
        task.guidancePrompt
          .replace(/^#+\s/gm, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          .replace(/^- \[ \] /gm, '▢ ')
          .replace(/^- \[x\] /gm, '☑ ')
          .replace(/^[-*+]\s/gm, '• ')
          .replace(/^\d+\.\s/gm, '• ')
          .split('\n')
          .filter(line => line.trim())
          .slice(0, 2)
          .join(' • '),
        100
      );
    }
    return "Sem descrição";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarefa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhuma tarefa encontrada.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const progress = calculateProgress(task);
              return (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="max-w-xs">
                    <div className="space-y-1">
                      <div className="font-medium line-clamp-2">
                        {task.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {formatDescription(task)}
                      </div>
                      {task.additionalInformation && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {truncateText(task.additionalInformation, 50)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {task.taskTodos.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {task.taskTodos.filter(t => t.isCompleted).length}/{task.taskTodos.length}
                          </span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem itens</span>
                    )}
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {format(new Date(task.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{task.createdBy}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <EditTaskDialog task={task} onTaskUpdated={handleTaskUpdated} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(task.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}