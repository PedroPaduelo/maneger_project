'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Task } from '@/lib/types';
import { ExecutionStatus } from '@/types/executor';

interface ProjectExecutorLayoutProps {
  project: Project;
  children: React.ReactNode;
  executionStatus: ExecutionStatus;
}

export function ProjectExecutorLayout({
  project,
  children,
  executionStatus,
}: ProjectExecutorLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Task Executor - {project.name}
          </h2>
          <p className="text-muted-foreground">
            Automated task execution
          </p>
        </div>
        <div className="flex items-center gap-2">
          {executionStatus === 'running' && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              Running
            </div>
          )}
          {executionStatus === 'completed' && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <div className="h-2 w-2 rounded-full bg-green-600" />
              Completed
            </div>
          )}
          {executionStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <div className="h-2 w-2 rounded-full bg-red-600" />
              Error
            </div>
          )}
          {executionStatus === 'idle' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-2 rounded-full bg-gray-600" />
              Idle
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
