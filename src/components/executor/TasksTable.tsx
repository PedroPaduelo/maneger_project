'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/lib/types';
import { CheckCircle, Clock, Loader2, XCircle, AlertCircle } from 'lucide-react';

interface TasksTableProps {
  tasks: Task[];
  selectedTasks: number[];
  onTaskSelect: (taskId: number) => void;
  onTaskSelectAll: () => void;
  currentTaskId?: number;
}

export function TasksTable({
  tasks,
  selectedTasks,
  onTaskSelect,
  onTaskSelectAll,
  currentTaskId,
}: TasksTableProps) {
  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const someSelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('conclu') || statusLower.includes('complete')) {
      return (
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Concluída
        </Badge>
      );
    }

    if (statusLower.includes('executando') || statusLower.includes('running') || statusLower.includes('andamento')) {
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          Executando
        </Badge>
      );
    }

    if (statusLower.includes('erro') || statusLower.includes('error') || statusLower.includes('falha')) {
      return (
        <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3 text-destructive" />
          Erro
        </Badge>
      );
    }

    if (statusLower.includes('pendente') || statusLower.includes('pending')) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3 text-yellow-600" />
          Pendente
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tasks ({tasks.length})</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedTasks.length} selecionada(s)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onTaskSelectAll}
                    aria-label="Select all tasks"
                    className={someSelected ? 'opacity-50' : ''}
                  />
                </TableHead>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="max-w-xs">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma task encontrada
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className={`${
                      currentTaskId === task.id
                        ? 'bg-blue-50 dark:bg-blue-950/20'
                        : ''
                    } ${
                      selectedTasks.includes(task.id)
                        ? 'bg-muted/50'
                        : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => onTaskSelect(task.id)}
                        aria-label={`Select task ${task.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {task.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {currentTaskId === task.id && (
                        <span className="mr-2">▶</span>
                      )}
                      {task.title}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {task.description || task.guidancePrompt.substring(0, 100)}
                      {(task.description || task.guidancePrompt).length > 100 && '...'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
