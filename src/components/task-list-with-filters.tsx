"use client";

import * as React from "react";
import { Task } from "@/lib/types";
import { TaskTable } from "@/components/task-table";
import { TaskCard } from "@/components/task-card";
import { TaskFilters } from "@/components/task-filters";

interface TaskListWithFiltersProps {
  tasks: Task[];
  availableCreators: string[];
  availableProjects: Array<{ id: number; name: string }>;
  viewMode: "cards" | "table";
}

export function TaskListWithFilters({
  tasks,
  availableCreators,
  availableProjects,
  viewMode
}: TaskListWithFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [hasTodosFilter, setHasTodosFilter] = React.useState("all");
  const [createdByFilter, setCreatedByFilter] = React.useState("all");
  const [projectFilter, setProjectFilter] = React.useState("all");

  // Apply filters to the data
  const filteredData = React.useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.additionalInformation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((task) => statusFilter.includes(task.status));
    }

    // Has todos filter
    if (hasTodosFilter === "with-todos") {
      filtered = filtered.filter((task) => task.taskTodos.length > 0);
    } else if (hasTodosFilter === "without-todos") {
      filtered = filtered.filter((task) => task.taskTodos.length === 0);
    }

    // Created by filter
    if (createdByFilter !== "all") {
      filtered = filtered.filter((task) => task.createdBy === createdByFilter);
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter((task) => task.projectId.toString() === projectFilter);
    }

    return filtered;
  }, [tasks, searchTerm, statusFilter, hasTodosFilter, createdByFilter, projectFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setHasTodosFilter("all");
    setCreatedByFilter("all");
    setProjectFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <TaskFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        hasTodosFilter={hasTodosFilter}
        onHasTodosFilterChange={setHasTodosFilter}
        createdByFilter={createdByFilter}
        onCreatedByFilterChange={setCreatedByFilter}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        resetFilters={resetFilters}
        availableCreators={availableCreators}
        availableProjects={availableProjects}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredData.length === 0 ? (
          <p>Nenhuma tarefa encontrada com os filtros selecionados.</p>
        ) : (
          <p>
            Mostrando {filteredData.length} tarefa{filteredData.length !== 1 ? 's' : ''}
            {filteredData.length !== tasks.length && (
              <span> de {tasks.length} totais</span>
            )}
          </p>
        )}
      </div>

      {/* Task display */}
      {viewMode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={tasks} // Pass original tasks to table so it can apply its own filters
          availableCreators={availableCreators}
          availableProjects={availableProjects}
        />
      )}
    </div>
  );
}