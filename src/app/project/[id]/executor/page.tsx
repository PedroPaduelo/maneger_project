'use client';

import React, { useState, useEffect, use } from 'react';
import { SidebarLayout } from '@/components/sidebar-layout';
import { ProjectExecutorLayout } from '@/components/executor/ProjectExecutorLayout';
import { ProjectHeader } from '@/components/executor/ProjectHeader';
import { ControlPanel } from '@/components/executor/ControlPanel';
import { TasksTable } from '@/components/executor/TasksTable';
import { ExecutionLog } from '@/components/executor/ExecutionLog';
import { ExecutionProgress } from '@/components/executor/ExecutionProgress';
import { QuickAddTaskDialog } from '@/components/executor/QuickAddTaskDialog';
import { useExecutor } from '@/hooks/useExecutor';
import { useTasks } from '@/hooks/useTasks';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { Project } from '@/lib/types';
import { ExecutorAPI } from '@/lib/executor-api';
import { toast } from 'sonner';

interface ExecutorPageProps {
  params: Promise<{ id: string }>;
}

export default function ExecutorPage({ params }: ExecutorPageProps) {
  const { id } = use(params);
  const projectId = parseInt(id);

  const [project, setProject] = useState<Project | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false);

  const {
    execution,
    isLoading: isExecuting,
    status: executionStatus,
    progress,
    stats,
    startExecution,
    stopExecution,
  } = useExecutor({ projectId, autoRefresh: true, refreshInterval: 2000 });

  const {
    tasks,
    selectedTaskIds,
    isLoading: isLoadingTasks,
    fetchTasks,
    addTask,
    toggleTaskSelection,
    selectAllTasks,
  } = useTasks({ projectId, autoRefresh: false });

  const {
    playCompletionSound,
    playErrorSound,
    isEnabled: soundEnabled,
    toggleEnabled: toggleSound,
  } = useNotificationSound({ enabled: true });

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to load project');
        const data = await response.json();
        setProject(data);
        setApiUrl(data.metadata?.executorApiUrl || '');
      } catch (error) {
        toast.error('Failed to load project');
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Play sound on completion
  useEffect(() => {
    if (executionStatus === 'completed') {
      playCompletionSound();
      toast.success('Execução concluída!', {
        description: `${stats?.successful} sucesso(s), ${stats?.failed} erro(s)`,
      });
    } else if (executionStatus === 'error') {
      playErrorSound();
      toast.error('Execução finalizada com erros');
    }
  }, [executionStatus, stats, playCompletionSound, playErrorSound]);

  const handleSaveApiUrl = async () => {
    try {
      await ExecutorAPI.updateApiUrl(projectId, apiUrl);
    } catch (error) {
      throw error;
    }
  };

  const handleStartExecution = async () => {
    if (tasks.length === 0) {
      toast.error('Nenhuma task para executar');
      return;
    }

    try {
      await startExecution({
        taskIds: selectedTaskIds.length > 0 ? selectedTaskIds : undefined,
        config: { apiUrl },
      });
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleStopExecution = async () => {
    try {
      await stopExecution('Parado pelo usuário');
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleSearchTasks = () => {
    fetchTasks();
    toast.info('Buscando tasks...');
  };

  const handleClearLogs = () => {
    if (execution) {
      execution.logs = [];
      toast.success('Logs limpos');
    }
  };

  const handleExportLogs = () => {
    if (!execution || execution.logs.length === 0) {
      toast.error('Nenhum log para exportar');
      return;
    }

    const logsText = execution.logs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution.id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Logs exportados');
  };

  if (isLoadingProject) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Projeto não encontrado</p>
          <p className="text-muted-foreground">O projeto #{projectId} não existe</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      title="Task Executor"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: project.name, href: `/project/${project.id}` },
        { label: "Executor" }
      ]}
    >
      <ProjectExecutorLayout
        project={project}
        executionStatus={executionStatus}
      >
        {/* Project Header */}
        <ProjectHeader
          project={project}
          apiUrl={apiUrl}
          onApiUrlChange={setApiUrl}
          onSaveApiUrl={handleSaveApiUrl}
        />

        {/* Control Panel */}
        <ControlPanel
          onSearchTasks={handleSearchTasks}
          onAddQuickTask={() => setQuickAddDialogOpen(true)}
          onStartExecution={handleStartExecution}
          onStopExecution={handleStopExecution}
          isRunning={executionStatus === 'running' || executionStatus === 'pending'}
          hasTasks={tasks.length > 0}
          executionStatus={executionStatus}
          taskCount={selectedTaskIds.length > 0 ? selectedTaskIds.length : tasks.length}
        />

        {/* Progress Bar */}
        {(execution || executionStatus !== 'idle') && (
          <ExecutionProgress progress={progress} stats={stats || undefined} />
        )}

        {/* Tasks Table */}
        <TasksTable
          tasks={tasks}
          selectedTasks={selectedTaskIds}
          onTaskSelect={toggleTaskSelection}
          onTaskSelectAll={selectAllTasks}
          currentTaskId={execution?.currentTask?.id}
        />

        {/* Execution Log */}
        <ExecutionLog
          logs={execution?.logs || []}
          isRunning={executionStatus === 'running'}
          onClearLogs={handleClearLogs}
          onExportLogs={handleExportLogs}
          autoScroll={true}
        />

        {/* Quick Add Task Dialog */}
        <QuickAddTaskDialog
          open={quickAddDialogOpen}
          onOpenChange={setQuickAddDialogOpen}
          projectId={projectId}
          onTaskAdded={(task) => {
            addTask(task);
            fetchTasks();
          }}
        />

        {/* Sound Toggle Button (floating) */}
        <button
          onClick={toggleSound}
          className="fixed bottom-6 right-6 rounded-full bg-primary p-4 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          title={soundEnabled ? 'Desativar som' : 'Ativar som'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </ProjectExecutorLayout>
    </SidebarLayout>
  );
}
