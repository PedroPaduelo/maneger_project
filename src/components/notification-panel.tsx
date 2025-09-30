"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notification } from "@/lib/types";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  ExternalLink,
  Calendar,
  Clock,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface NotificationPanelProps {
  userId?: string;
}

export function NotificationPanel({ userId = "system" }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId,
        unreadOnly: showUnreadOnly.toString(),
        limit: "50"
      });

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      
      toast({
        title: "Sucesso",
        description: "Notificações marcadas como lidas.",
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Erro",
        description: "Falha ao marcar notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === "Alta") {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
    
    // Handle navigation based on notification type and metadata
    if (notification.metadata) {
      if (notification.metadata.projectId) {
        // Navigate to project details
        window.location.href = `/project/${notification.metadata.projectId}`;
      } else if (notification.metadata.taskId) {
        // Navigate to task details
        window.location.href = `/task/${notification.metadata.taskId}`;
      } else if (notification.metadata.requirementId) {
        // Navigate to requirement details
        window.location.href = `/requirement/${notification.metadata.requirementId}`;
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showUnreadOnly ? "Todas" : "Não lidas"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {showUnreadOnly 
            ? `${unreadCount} notificações não lidas`
            : `${notifications.length} notificações`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {showUnreadOnly ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
            </h3>
            <p className="text-muted-foreground">
              {showUnreadOnly 
                ? "Todas as notificações foram lidas."
                : "Você não tem notificações no momento."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type, notification.priority)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(notification.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(notification.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    {notification.project && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Projeto: {notification.project.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead([notification.id]);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}