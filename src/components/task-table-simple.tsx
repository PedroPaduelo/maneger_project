"use client";

import * as React from "react";
import { Task } from "@/lib/types";
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
  User,
  MessageSquare,
  Edit,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface TaskTableSimpleProps {
  tasks: Task[];
}

export function TaskTableSimple({ tasks }: TaskTableSimpleProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleTaskUpdated = () => {
    window.location.reload();
  };

  const handleTaskDeleted = () => {
    window.location.reload();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Concluída":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Em Progresso":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "Pendente":
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case "Bloqueado":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateProgress = (task: Task) => {
    if (task.taskTodos.length === 0) return 0;
    const completed = task.taskTodos.filter(todo => todo.isCompleted).length;
    return Math.round((completed / task.taskTodos.length) * 100);
  };

  const handleViewDetails = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDescription = (task: Task) => {
    if (task.description) {
      return truncateText(task.description, 100);
    }
    if (task.guidancePrompt) {
      return truncateText(
        task.guidancePrompt
          .replace(/^#+\s/gm, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          .replace(/^- \[ \] /gm, '▢ ')
          .replace(/^- \[x\] /gm, '☑ ')
          .replace(/^[-*+]\s/gm, '• ')
          .replace(/^\d+\.\s/gm, '• ')
          .split('\n')
          .filter(line => line.trim())
          .slice(0, 2)
          .join(' • '),
        100
      );
    }
    return "Sem descrição";
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Tarefa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="max-w-xs">
            <div className="font-medium line-clamp-2">
              {task.title}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {formatDescription(task)}
            </div>
            {task.additionalInformation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MessageSquare className="h-3 w-3" />
                <span className="line-clamp-1">
                  {truncateText(task.additionalInformation, 50)}
                </span>
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
        const task = row.original;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <Badge variant="outline" className="text-xs">
              {task.status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "progress",
      header: "Progresso",
      cell: ({ row }) => {
        const task = row.original;
        const progress = calculateProgress(task);

        if (task.taskTodos.length === 0) {
          return <span className="text-xs text-muted-foreground">Sem itens</span>;
        }

        return (
          <div className="min-w-[120px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {task.taskTodos.filter(t => t.isCompleted).length}/{task.taskTodos.length}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
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
        const task = row.original;
        return (
          <div className="flex items-center gap-1 text-sm min-w-[100px]">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>
              {format(new Date(task.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdBy",
      header: "Criado por",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex items-center gap-1 text-sm min-w-[100px]">
            <User className="h-3 w-3 text-muted-foreground" />
            <span>{task.createdBy}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex items-center gap-2 min-w-[160px]">
            <EditTaskDialog task={task} onTaskUpdated={handleTaskUpdated} />
            <DeleteTaskDialog task={task} onTaskDeleted={handleTaskDeleted} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(task.id)}
            >
              Ver Detalhes
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
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
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {tasks.length} tarefas
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