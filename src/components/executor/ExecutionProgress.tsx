'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExecutionProgress as ExecutionProgressType } from '@/types/executor';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ExecutionProgressProps {
  progress: ExecutionProgressType | null;
  stats?: {
    successful: number;
    failed: number;
    skipped: number;
    duration?: number;
  };
}

export function ExecutionProgress({ progress, stats }: ExecutionProgressProps) {
  if (!progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma execução em andamento
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = progress.totalTasks > 0
    ? Math.round((progress.currentTaskIndex / progress.totalTasks) * 100)
    : 0;

  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progresso da Execução</CardTitle>
          {progress.status === 'running' && (
            <Badge variant="outline" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Em Execução
            </Badge>
          )}
          {progress.status === 'completed' && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Concluído
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {progress.currentTaskIndex} de {progress.totalTasks} tasks
            </span>
            <span className="font-bold">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        {/* Current Task */}
        {progress.currentTask && (
          <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Task Atual
            </div>
            <div className="space-y-1">
              <p className="font-medium">{progress.currentTask.title}</p>
              <p className="text-sm text-muted-foreground">
                ID: {progress.currentTask.id} | Status: {progress.currentTask.status}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Sucesso
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.successful}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <XCircle className="h-3 w-3" />
                Falhas
              </div>
              <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Puladas
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.skipped}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Duração
              </div>
              <p className="text-2xl font-bold">{formatDuration(stats.duration)}</p>
            </div>
          </div>
        )}

        {/* ETA */}
        {progress.status === 'running' && stats?.duration && (
          <div className="text-sm text-muted-foreground">
            <p>
              Tempo estimado restante:{' '}
              {formatDuration(
                (stats.duration / progress.currentTaskIndex) *
                  (progress.totalTasks - progress.currentTaskIndex)
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
