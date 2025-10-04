"use client";

import { useSession } from "next-auth/react";
import { useTasksQuery } from "@/hooks";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";

export default function TasksPage() {
  const { data: session, status } = useSession();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError
  } = useTasksQuery();

  if (status === "loading" || tasksLoading) {
    return (
      <SidebarLayout title="Tarefas" breadcrumbs={[{ label: "Tarefas" }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (!session) {
    return (
      <SidebarLayout title="Acesso Restrito" breadcrumbs={[{ label: "Erro" }]}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar autenticado para acessar esta página.</p>
        </div>
      </SidebarLayout>
    );
  }

  if (tasksError) {
    return (
      <SidebarLayout title="Erro" breadcrumbs={[{ label: "Erro" }]}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground">
            {tasksError.message || "Erro ao carregar as tarefas. Por favor, tente novamente."}
          </p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Tarefas"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Tarefas" }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Nenhuma tarefa encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece criando sua primeira tarefa.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lista de Tarefas</h3>
              <div className="space-y-4">
                {tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? 'Concluída' :
                         task.status === 'in_progress' ? 'Em Progresso' :
                         'Pendente'}
                      </span>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}