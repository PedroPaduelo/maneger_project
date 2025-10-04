"use client";

import { useSession } from "next-auth/react";
import { useRequirements } from "@/hooks";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function RequirementsPage() {
  const { data: session, status } = useSession();
  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    error: requirementsError
  } = useRequirements();

  if (status === "loading" || requirementsLoading) {
    return (
      <SidebarLayout title="Requisitos" breadcrumbs={[{ label: "Requisitos" }]}>
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

  if (requirementsError) {
    return (
      <SidebarLayout title="Erro" breadcrumbs={[{ label: "Erro" }]}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground">
            {requirementsError.message || "Erro ao carregar os requisitos. Por favor, tente novamente."}
          </p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      title="Requisitos"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Requisitos" }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Requisitos</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Requisito
          </Button>
        </div>

        {requirements.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">Nenhum requisito encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece criando seu primeiro requisito.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Requisito
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requirements.map((requirement: any) => (
              <div key={requirement.id} className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">{requirement.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">{requirement.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    requirement.priority === 'high' ? 'bg-red-100 text-red-800' :
                    requirement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {requirement.priority === 'high' ? 'Alta' :
                     requirement.priority === 'medium' ? 'Média' :
                     'Baixa'}
                  </span>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
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