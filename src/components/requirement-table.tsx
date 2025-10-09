"use client";

import * as React from "react";
import { Requirement } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  CheckCircle,
  FileText,
  Tag,
  Target,
  ArrowUpDown,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { EditRequirementDialog } from "@/components/edit-requirement-dialog";
import { RequirementFilters } from "@/components/requirement-filters";
import { MarkdownRenderer } from "@/components/markdown-renderer";
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

interface RequirementTableProps {
  requirements: Requirement[];
  availableCategories: string[];
}

export function RequirementTable({ requirements, availableCategories }: RequirementTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = React.useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Função para extrair texto plano do markdown para a tabela
  const getPlainTextFromMarkdown = (markdown: string) => {
    return markdown
      .replace(/^#+\s/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting but keep text
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting but keep text
      .replace(/`(.*?)`/g, '$1') // Remove inline code formatting but keep text
      .replace(/^- \[ \] /gm, '▢ ') // Convert checkboxes
      .replace(/^- \[x\] /gm, '☑ ') // Convert checked boxes
      .replace(/^[-*+]\s/gm, '• ') // Convert list items
      .replace(/^\d+\.\s/gm, '• ') // Convert numbered lists
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links but keep text
      .replace(/```[\s\S]*?```/g, '[Código]') // Replace code blocks
      .split('\n')
      .filter(line => line.trim())
      .join(' ');
  };

  // Apply filters to the data
  const filteredData = React.useMemo(() => {
    let filtered = requirements;

    // Global search
    if (globalFilter) {
      filtered = filtered.filter((requirement) =>
        requirement.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
        requirement.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        requirement.category?.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter.length > 0) {
      filtered = filtered.filter((requirement) => typeFilter.includes(requirement.type));
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter((requirement) => priorityFilter.includes(requirement.priority));
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((requirement) => requirement.category === categoryFilter);
    }

    return filtered;
  }, [requirements, globalFilter, typeFilter, priorityFilter, categoryFilter]);

  // Update global filter when search term changes
  React.useEffect(() => {
    setGlobalFilter(searchTerm);
  }, [searchTerm]);

  // Apply type filter
  React.useEffect(() => {
    const typeColumnFilter = typeFilter.length > 0
      ? { id: "type", value: typeFilter }
      : null;

    setColumnFilters(prev => {
      const filtered = prev.filter(f => f.id !== "type");
      return typeColumnFilter ? [...filtered, typeColumnFilter] : filtered;
    });
  }, [typeFilter]);

  // Apply priority filter
  React.useEffect(() => {
    const priorityColumnFilter = priorityFilter.length > 0
      ? { id: "priority", value: priorityFilter }
      : null;

    setColumnFilters(prev => {
      const filtered = prev.filter(f => f.id !== "priority");
      return priorityColumnFilter ? [...filtered, priorityColumnFilter] : filtered;
    });
  }, [priorityFilter]);

  const handleRequirementUpdated = () => {
    window.location.reload();
  };

  const handleDeleteRequirement = async (requirementId: string) => {
    if (!confirm("Tem certeza que deseja deletar este requisito? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const response = await fetch(`/api/requirements/${requirementId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete requirement");
      }

      toast({
        title: "Sucesso",
        description: "Requisito deletado com sucesso.",
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error deleting requirement:", error);
      toast({
        title: "Erro",
        description: "Falha ao deletar o requisito.",
        variant: "destructive",
      });
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Funcional":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "Não Funcional":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "Regra de Negócio":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewDetails = (requirementId: string) => {
    router.push(`/requirement/${requirementId}`);
  };

  const columns: ColumnDef<Requirement>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Requisito
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <div className="max-w-xs">
            <div className="font-medium line-clamp-2">
              {requirement.title}
            </div>
            {requirement.description && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {truncateText(getPlainTextFromMarkdown(requirement.description), 120)}
              </div>
            )}
            {requirement.category && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Tag className="h-3 w-3" />
                <span className="line-clamp-1">{requirement.category}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(requirement.type)}
            <span className="text-sm">{requirement.type}</span>
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
        const requirement = row.original;
        return (
          <Badge variant={getPriorityColor(requirement.priority)} className="text-xs">
            {requirement.priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "tasks",
      header: "Tasks Vinculadas",
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <div className="text-sm">
            {requirement.requirementTasks.length} task{requirement.requirementTasks.length !== 1 ? 's' : ''}
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
        const requirement = row.original;
        return (
          <div className="flex items-center gap-1 text-sm min-w-[100px]">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>
              {format(new Date(requirement.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const requirement = row.original;
        return (
          <div className="flex items-center gap-2 min-w-[180px]">
            <EditRequirementDialog requirement={requirement} onRequirementUpdated={handleRequirementUpdated} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(requirement.id)}
            >
              Ver Detalhes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteRequirement(requirement.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
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
    setTypeFilter([]);
    setPriorityFilter([]);
    setCategoryFilter("all");
    setColumnFilters([]);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <RequirementFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        resetFilters={resetFilters}
        availableCategories={availableCategories}
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
                  Nenhum requisito encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {filteredData.length} requisitos
          {filteredData.length !== requirements.length && (
            <span> (de {requirements.length} totais)</span>
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