"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project, Task, Requirement, HistorySummary } from "@/lib/types";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  Plus, 
  Edit,
  FileText,
  Target,
  Star,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentActivitiesProps {
  projects: Project[];
  tasks: Task[];
  requirements: Requirement[];
  historySummaries: HistorySummary[];
}

interface ActivityItem {
  id: string;
  type: 'project' | 'task' | 'requirement' | 'summary';
  action: 'created' | 'updated' | 'completed';
  title: string;
  description?: string;
  author: string;
  timestamp: Date;
  priority?: string;
  status?: string;
  progress?: number;
}

export function RecentActivities({ 
  projects, 
  tasks, 
  requirements, 
  historySummaries 
}: RecentActivitiesProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateActivities();
  }, [projects, tasks, requirements, historySummaries]);

  const generateActivities = () => {
    const newActivities: ActivityItem[] = [];

    // Project activities
    projects.forEach(project => {
      newActivities.push({
        id: `project-${project.id}-created`,
        type: 'project',
        action: 'created',
        title: `Projeto "${project.name}" criado`,
        description: project.description,
        author: project.createdBy || "Sistema",
        timestamp: new Date(project.createdAt),
        status: project.status,
        progress: project.progress
      });

      if (project.updatedAt > project.createdAt) {
        newActivities.push({
          id: `project-${project.id}-updated`,
          type: 'project',
          action: 'updated',
          title: `Projeto "${project.name}" atualizado`,
          description: `Progresso: ${project.progress}%`,
          author: project.updatedBy || "Sistema",
          timestamp: new Date(project.updatedAt),
          status: project.status,
          progress: project.progress
        });
      }

      if (project.progress === 100) {
        newActivities.push({
          id: `project-${project.id}-completed`,
          type: 'project',
          action: 'completed',
          title: `Projeto "${project.name}" concluído`,
          description: "100% do progresso alcançado",
          author: project.updatedBy || "Sistema",
          timestamp: new Date(project.updatedAt),
          status: project.status,
          progress: 100
        });
      }
    });

    // Task activities
    tasks.forEach(task => {
      newActivities.push({
        id: `task-${task.id}-created`,
        type: 'task',
        action: 'created',
        title: `Tarefa "${task.title}" criada`,
        description: task.description,
        author: task.createdBy,
        timestamp: new Date(task.createdAt),
        status: task.status
      });

      if (task.updatedAt > task.createdAt) {
        newActivities.push({
          id: `task-${task.id}-updated`,
          type: 'task',
          action: 'updated',
          title: `Tarefa "${task.title}" atualizada`,
          description: `Status: ${task.status}`,
          author: task.updatedBy,
          timestamp: new Date(task.updatedAt),
          status: task.status
        });
      }

      if (task.status === "Concluído") {
        newActivities.push({
          id: `task-${task.id}-completed`,
          type: 'task',
          action: 'completed',
          title: `Tarefa "${task.title}" concluída`,
          description: "Tarefa marcada como concluída",
          author: task.updatedBy,
          timestamp: new Date(task.updatedAt),
          status: task.status
        });
      }
    });

    // Requirement activities
    requirements.forEach(requirement => {
      newActivities.push({
        id: `requirement-${requirement.id}-created`,
        type: 'requirement',
        action: 'created',
        title: `Requisito "${requirement.title}" criado`,
        description: requirement.description,
        author: "Sistema",
        timestamp: new Date(requirement.createdAt),
        priority: requirement.priority
      });

      if (requirement.updatedAt > requirement.createdAt) {
        newActivities.push({
          id: `requirement-${requirement.id}-updated`,
          type: 'requirement',
          action: 'updated',
          title: `Requisito "${requirement.title}" atualizado`,
          description: `Prioridade: ${requirement.priority}`,
          author: "Sistema",
          timestamp: new Date(requirement.updatedAt),
          priority: requirement.priority
        });
      }
    });

    // History summary activities
    historySummaries.forEach(summary => {
      newActivities.push({
        id: `summary-${summary.id}-created`,
        type: 'summary',
        action: 'created',
        title: "Sumário histórico criado",
        description: summary.summary.substring(0, 100) + "...",
        author: summary.createdBy,
        timestamp: new Date(summary.createdAt)
      });

      if (summary.updatedAt > summary.createdAt) {
        newActivities.push({
          id: `summary-${summary.id}-updated`,
          type: 'summary',
          action: 'updated',
          title: "Sumário histórico atualizado",
          description: "Sumário foi editado",
          author: summary.createdBy,
          timestamp: new Date(summary.updatedAt)
        });
      }
    });

    // Sort by timestamp (most recent first) and take last 20
    const sortedActivities = newActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    setActivities(sortedActivities);
    setLoading(false);
  };

  const getActivityIcon = (type: string, action: string) => {
    if (type === 'project') {
      return <Star className="h-4 w-4" />;
    } else if (type === 'task') {
      return <Target className="h-4 w-4" />;
    } else if (type === 'requirement') {
      return <FileText className="h-4 w-4" />;
    } else if (type === 'summary') {
      return <Edit className="h-4 w-4" />;
    }
    return <MoreHorizontal className="h-4 w-4" />;
  };

  const getActivityColor = (type: string, action: string) => {
    if (action === 'completed') {
      return "text-green-600 bg-green-50 border-green-200";
    } else if (action === 'created') {
      return "text-blue-600 bg-blue-50 border-blue-200";
    } else if (action === 'updated') {
      return "text-orange-600 bg-orange-50 border-orange-200";
    }
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getStatusBadge = (status?: string, priority?: string) => {
    if (!status && !priority) return null;

    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let label = "";

    if (status) {
      switch (status) {
        case "Concluído":
          variant = "default";
          label = status;
          break;
        case "Em Progresso":
          variant = "secondary";
          label = status;
          break;
        case "Bloqueado":
          variant = "destructive";
          label = status;
          break;
        default:
          variant = "outline";
          label = status;
      }
    } else if (priority) {
      switch (priority) {
        case "Alta":
          variant = "destructive";
          label = priority;
          break;
        case "Média":
          variant = "default";
          label = priority;
          break;
        case "Baixa":
          variant = "secondary";
          label = priority;
          break;
        default:
          variant = "outline";
          label = priority;
      }
    }

    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "agora mesmo";
    } else if (diffInMinutes < 60) {
      return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
        <CardDescription>
          Últimas atualizações e atividades nos seus projetos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma atividade recente encontrada
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(
                    activity.type,
                    activity.action
                  )}`}
                >
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getActivityIcon(activity.type, activity.action)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(activity.status, activity.priority)}
                        {activity.progress !== undefined && (
                          <Badge variant="outline">{activity.progress}%</Badge>
                        )}
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {activity.author}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}