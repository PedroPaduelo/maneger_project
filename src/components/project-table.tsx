"use client";

import * as React from "react";
import { Project } from "@/lib/types";
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
  Star,
  GitBranch,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { ProjectFilters } from "@/components/project-filters";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface ProjectTableProps {
  projects: Project[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = React.useState<string[]>([]);
  const [isFavoriteFilter, setIsFavoriteFilter] = React.useState("all");

  // Apply filters to the data
  const filteredData = React.useMemo(() => {
    let filtered = projects;

    // Global search
    if (globalFilter) {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        project.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        project.stack?.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((project) => statusFilter.includes(project.status));
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter((project) => priorityFilter.includes(project.priority));
    }

    // Is favorite filter
    if (isFavoriteFilter === "favorites") {
      filtered = filtered.filter((project) => project.isFavorite);
    } else if (isFavoriteFilter === "non-favorites") {
      filtered = filtered.filter((project) => !project.isFavorite);
    }

    return filtered;
  }, [projects, globalFilter, statusFilter, priorityFilter, isFavoriteFilter]);

  // Update global filter when search term changes
  React.useEffect(() => {
    setGlobalFilter(searchTerm);
  }, [searchTerm]);

  // Apply status filter
  React.useEffect(() => {
    const statusColumnFilter = statusFilter.length > 0
      ? { id: "status", value: statusFilter }
      : null;

    setColumnFilters(prev => {
      const filtered = prev.filter(f => f.id !== "status");
      return statusColumnFilter ? [...filtered, statusColumnFilter] : filtered;
    });
  }, [statusFilter]);

  const handleProjectUpdated = () => {
    window.location.reload();
  };

  const handleProjectDeleted = () => {
    window.location.reload();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Circle className="h-4 w-4 text-green-500" />;
      case "Pausado":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Concluída":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "Cancelado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
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

  const handleViewDetails = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleToggleFavorite = async (project: Project) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...project,
          isFavorite: !project.isFavorite
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const parseTags = (tags: string | null) => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return tags.split(',').map(tag => tag.trim());
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Projeto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              {project.isFavorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              <div className="font-medium line-clamp-2">
                {project.name}
              </div>
            </div>
            {project.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {truncateText(project.description, 100)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            <Badge variant="outline" className="text-xs">
              {project.status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Prioridade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <Badge variant={getPriorityColor(project.priority)} className="text-xs">
            {project.priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "progress",
      header: "Progresso",
      cell: ({ row }) => {
        const project = row.original;

        return (
          <div className="min-w-[120px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "stack",
      header: "Tecnologias",
      cell: ({ row }) => {
        const project = row.original;
        if (!project.stack) return <span className="text-xs text-muted-foreground">-</span>;

        const techs = project.stack.split(',');
        return (
          <div className="flex items-center gap-1 min-w-[150px]">
            <GitBranch className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {techs.slice(0, 2).map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech.trim()}
                </Badge>
              ))}
              {techs.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{techs.length - 2}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Data de Criação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-1 text-sm min-w-[100px]">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>
              {format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleFavorite(project)}
              className="h-8 w-8 p-0"
            >
              <Star className={`h-4 w-4 ${project.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
            </Button>
            <EditProjectDialog project={project} onProjectUpdated={handleProjectUpdated} />
            <DeleteProjectDialog project={project} onProjectDeleted={handleProjectDeleted} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(project.id)}
            >
              Ver Detalhes
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setPriorityFilter([]);
    setIsFavoriteFilter("all");
    setColumnFilters([]);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <ProjectFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        isFavoriteFilter={isFavoriteFilter}
        onIsFavoriteFilterChange={setIsFavoriteFilter}
        resetFilters={resetFilters}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {filteredData.length} projetos
          {filteredData.length !== projects.length && (
            <span> (de {projects.length} totais)</span>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Itens por página</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para a primeira página</span>
              &lt;&lt;
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir para a página anterior</span>
              &lt;
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para a próxima página</span>
              &gt;
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir para a última página</span>
              &gt;&gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
