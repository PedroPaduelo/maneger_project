'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  PlusCircle,
  Play,
  Square,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ExecutionStatus } from '@/types/executor';

interface ControlPanelProps {
  onSearchTasks: () => void;
  onAddQuickTask: () => void;
  onStartExecution: () => void;
  onStopExecution: () => void;
  isRunning: boolean;
  hasTasks: boolean;
  executionStatus: ExecutionStatus;
  taskCount: number;
}

export function ControlPanel({
  onSearchTasks,
  onAddQuickTask,
  onStartExecution,
  onStopExecution,
  isRunning,
  hasTasks,
  executionStatus,
  taskCount,
}: ControlPanelProps) {
  const getStatusBadge = () => {
    switch (executionStatus) {
      case 'idle':
        return (
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-gray-500" />
            Pronto
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            Preparando
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Executando
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Concluído
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3 text-destructive" />
            Erro
          </Badge>
        );
      case 'stopped':
        return (
          <Badge variant="outline" className="gap-1">
            <Square className="h-3 w-3 text-orange-600" />
            Parado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Painel de Controle</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* Search Tasks Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onSearchTasks}
            disabled={isRunning}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar Tasks
          </Button>

          {/* Add Quick Task Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onAddQuickTask}
            disabled={isRunning}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Task
          </Button>

          {/* Start Execution Button */}
          <Button
            variant="default"
            className="w-full"
            onClick={onStartExecution}
            disabled={isRunning || !hasTasks}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Executar ({taskCount})
              </>
            )}
          </Button>

          {/* Stop Execution Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={onStopExecution}
            disabled={!isRunning}
          >
            <Square className="mr-2 h-4 w-4" />
            Parar
          </Button>
        </div>

        {/* Status Text */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {executionStatus === 'idle' && hasTasks && (
            <p>✅ Pronto para executar {taskCount} task(s)</p>
          )}
          {executionStatus === 'idle' && !hasTasks && (
            <p>ℹ️ Nenhuma task pendente para executar</p>
          )}
          {executionStatus === 'running' && (
            <p>🔄 Execução em andamento...</p>
          )}
          {executionStatus === 'completed' && (
            <p>✅ Execução concluída com sucesso</p>
          )}
          {executionStatus === 'error' && (
            <p>❌ Execução finalizada com erros</p>
          )}
          {executionStatus === 'stopped' && (
            <p>⏹️ Execução parada pelo usuário</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
