"use client";

import { useSession } from "next-auth/react";
import { useProjects } from "@/hooks";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError
  } = useProjects();

  if (status === "loading" || projectsLoading) {
    return (
      <SidebarLayout title="Projetos" breadcrumbs={[{ label: "Projetos" }]}>
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
          <Button asChild>
            <Link href="/auth/signin">Fazer Login</Link>
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  if (projectsError) {
    return (
      <SidebarLayout title="Erro" breadcrumbs={[{ label: "Erro" }]}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-muted-foreground">
            {projectsError.message || "Erro ao carregar os projetos. Por favor, tente novamente."}
          </p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Projetos"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos" }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projetos</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Nenhum projeto encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece criando seu primeiro projeto.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <div key={project.id} className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {project._count?.tasks || 0} tarefas
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/project/${project.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}