"use client";

import { useSession } from "next-auth/react";
import { useTasksQuery, useProjects } from "@/hooks";
import { SidebarLayout } from "@/components/sidebar-layout";
import { TaskTable } from "@/components/task-table";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";

export default function TasksPage() {
  const { data: session, status } = useSession();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError
  } = useTasksQuery();

  const {
    data: projects = [],
    isLoading: projectsLoading
  } = useProjects();

  // Extrair criadores únicos das tarefas
  const availableCreators = Array.from(new Set(tasks.map(task => task.createdBy)));

  // Preparar lista de projetos para o filtro
  const availableProjects = projects.map(project => ({
    id: project.id,
    name: project.name
  }));

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
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar autenticado para acessar esta página.</p>
        </div>
      </SidebarLayout>
    );
  }

  if (tasksError) {
    return (
      <SidebarLayout title="Erro" breadcrumbs={[{ label: "Erro" }]}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
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
          <TaskTable
            tasks={tasks}
            availableCreators={availableCreators}
            availableProjects={availableProjects}
          />
        )}
      </div>
    </SidebarLayout>
  );
}