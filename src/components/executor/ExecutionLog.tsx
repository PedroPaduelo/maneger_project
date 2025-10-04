'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Download,
  Trash2,
  Search,
  Filter,
  Copy,
  Check,
} from 'lucide-react';
import { ExecutionLogEntry, LogLevel } from '@/types/executor';
import { LogLevelColors } from '@/types/execution-log';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExecutionLogProps {
  logs: ExecutionLogEntry[];
  isRunning: boolean;
  onClearLogs: () => void;
  onExportLogs: () => void;
  autoScroll?: boolean;
}

export function ExecutionLog({
  logs,
  isRunning,
  onClearLogs,
  onExportLogs,
  autoScroll = true,
}: ExecutionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<Set<LogLevel>>(
    new Set(['info', 'success', 'warning', 'error', 'debug'])
  );
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = levelFilter.has(log.level);
    const matchesSearch = searchTerm
      ? log.message.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesLevel && matchesSearch;
  });

  const handleCopyLogs = async () => {
    const logsText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(logsText);
      setCopied(true);
      toast.success('Logs copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy logs');
    }
  };

  const toggleLevel = (level: LogLevel) => {
    const newFilter = new Set(levelFilter);
    if (newFilter.has(level)) {
      newFilter.delete(level);
    } else {
      newFilter.add(level);
    }
    setLevelFilter(newFilter);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const getLevelBadge = (level: LogLevel) => {
    const colors: Record<LogLevel, string> = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      debug: 'bg-gray-500',
    };

    return (
      <div className={`h-2 w-2 rounded-full ${colors[level]}`} />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Log de Execução
            <Badge variant="outline">{filteredLogs.length} entradas</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter by level */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={levelFilter.has('info')}
                  onCheckedChange={() => toggleLevel('info')}
                >
                  Info
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={levelFilter.has('success')}
                  onCheckedChange={() => toggleLevel('success')}
                >
                  Success
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={levelFilter.has('warning')}
                  onCheckedChange={() => toggleLevel('warning')}
                >
                  Warning
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={levelFilter.has('error')}
                  onCheckedChange={() => toggleLevel('error')}
                >
                  Error
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={levelFilter.has('debug')}
                  onCheckedChange={() => toggleLevel('debug')}
                >
                  Debug
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Copy */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLogs}
              disabled={filteredLogs.length === 0}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              size="icon"
              onClick={onExportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Clear */}
            <Button
              variant="outline"
              size="icon"
              onClick={onClearLogs}
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border bg-black/95 p-4">
          <div ref={scrollRef} className="space-y-1 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {logs.length === 0
                  ? 'Nenhum log ainda...'
                  : 'Nenhum log corresponde aos filtros'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 hover:bg-white/5 px-2 py-1 rounded"
                >
                  {getLevelBadge(log.level)}
                  <span className="text-gray-400 shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`flex-1 ${LogLevelColors[log.level]}`}>
                    {log.message}
                  </span>
                  {log.taskId && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      Task #{log.taskId}
                    </Badge>
                  )}
                </div>
              ))
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Executando...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Log Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total: {logs.length}</span>
            <span>
              Errors: {logs.filter((l) => l.level === 'error').length}
            </span>
            <span>
              Warnings: {logs.filter((l) => l.level === 'warning').length}
            </span>
          </div>
          <div>
            {autoScroll && isRunning && (
              <span className="text-blue-500">Auto-scroll ativo</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
