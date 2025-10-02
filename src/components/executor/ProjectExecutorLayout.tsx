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
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Task Executor
              </h1>
              <p className="text-muted-foreground">
                Automated task execution for {project.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {executionStatus === 'running' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                  Running
                </div>
              )}
              {executionStatus === 'completed' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  Completed
                </div>
              )}
              {executionStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
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
        </div>

        {/* Main Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
