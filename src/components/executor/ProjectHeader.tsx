'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Project } from '@/lib/types';
import { toast } from 'sonner';

interface ProjectHeaderProps {
  project: Project;
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
  onSaveApiUrl: () => Promise<void>;
}

export function ProjectHeader({
  project,
  apiUrl,
  onApiUrlChange,
  onSaveApiUrl,
}: ProjectHeaderProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected' | 'checking'>('unknown');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveApiUrl();
      toast.success('API URL saved successfully');
      checkConnection();
    } catch (error) {
      toast.error('Failed to save API URL');
    } finally {
      setIsSaving(false);
    }
  };

  const checkConnection = async () => {
    if (!apiUrl) {
      setConnectionStatus('unknown');
      return;
    }

    setConnectionStatus('checking');
    try {
      const response = await fetch(apiUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  React.useEffect(() => {
    if (apiUrl) {
      checkConnection();
    }
  }, [apiUrl]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📁 {project.name}
          <Badge variant="outline">{project.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* API URL Configuration */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-url">API URL</Label>
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon()}
                <span className="text-muted-foreground">{getStatusText()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id="api-url"
                type="url"
                placeholder="https://api.example.com/execute"
                value={apiUrl}
                onChange={(e) => onApiUrlChange(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSave} disabled={isSaving || !apiUrl}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure the API endpoint for task execution
            </p>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <p className="font-medium">{project.priority}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="font-medium">{project.progress}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stack</p>
              <p className="font-medium">{project.stack || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
