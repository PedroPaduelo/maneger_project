"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectCard } from "@/components/project-card";
import { ProjectTable } from "@/components/project-table";
import { ProjectFilters } from "@/components/project-filters";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useProjects } from "@/hooks";
import { Plus, Search, Filter, Star, CheckCircle, Grid3X3, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleDashboardProps {
  initialView?: "card" | "table";
}

export function SimpleDashboard({ initialView = "card" }: SimpleDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "table">(initialView);
  const { toast } = useToast();

  // Use server-side filtering with TanStack Query
  const {
    data: filteredProjects = [],
    isLoading: projectsLoading,
    error: projectsError
  } = useProjects({
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  const handleProjectCreated = useCallback(() => {
    toast.success("Projeto criado", {
      description: "O projeto foi criado e adicionado à lista.",
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Projetos</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Tabela
          </Button>
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
        </div>
      </div>

      {/* Visualização condicional */}
      {viewMode === "table" ? (
        <ProjectTable projects={filteredProjects} />
      ) : (
        <>
          {/* Enhanced Filters Component */}
          <ProjectFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            statusFilter={statusFilter !== "all" ? [statusFilter] : []}
            onStatusFilterChange={(statuses) => setStatusFilter(statuses.length > 0 ? statuses[0] : "all")}
            priorityFilter={priorityFilter !== "all" ? [priorityFilter] : []}
            onPriorityFilterChange={(priorities) => setPriorityFilter(priorities.length > 0 ? priorities[0] : "all")}
            isFavoriteFilter="all"
            onIsFavoriteFilterChange={() => {}}
            selectedTags={selectedTags}
            onSelectedTagsChange={setSelectedTags}
            resetFilters={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
              setSelectedTags([]);
            }}
          />

          {/* Projects List em Cards */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || selectedTags.length > 0
                        ? "Tente ajustar seus filtros ou termos de busca."
                        : "Comece criando seu primeiro projeto."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}