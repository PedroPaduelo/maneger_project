"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoRefreshConfigProps {
  onRefresh?: () => void;
  enabled?: boolean;
  interval?: number;
}

const REFRESH_INTERVALS = [
  { label: "5 segundos", value: 5 },
  { label: "10 segundos", value: 10 },
  { label: "30 segundos", value: 30 },
  { label: "1 minuto", value: 60 },
  { label: "2 minutos", value: 120 },
  { label: "5 minutos", value: 300 },
  { label: "10 minutos", value: 600 },
  { label: "Manual", value: 0 }
];

export function AutoRefreshConfig({ onRefresh, enabled: initialEnabled = false, interval: initialInterval = 30 }: AutoRefreshConfigProps) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [interval, setInterval] = useState(initialInterval);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enabled && interval > 0) {
      // Initial refresh
      if (onRefresh) {
        onRefresh();
        setLastRefresh(new Date());
      }

      // Set up interval
      intervalRef.current = setInterval(() => {
        if (onRefresh) {
          onRefresh();
          setLastRefresh(new Date());
        }
      }, interval * 1000);

      // Update countdown
      const countdownInterval = setInterval(() => {
        setTimeUntilNextRefresh(prev => {
          if (prev <= 1) return interval;
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        clearInterval(countdownInterval);
      };
    } else {
      setTimeUntilNextRefresh(0);
    }
  }, [enabled, interval, onRefresh]);

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);

    if (newInterval === 0) {
      setEnabled(false);
      setTimeUntilNextRefresh(0);
    } else {
      setTimeUntilNextRefresh(newInterval);
    }
  };

  const handleManualRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastRefresh(new Date());
      setTimeUntilNextRefresh(interval);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "";

    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
      return "há poucos segundos";
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(diffSeconds / 3600);
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" />
          Auto Refresh
        </CardTitle>
        <CardDescription>
          Configure o refresh automático dos dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Auto Refresh</Label>
            <p className="text-xs text-muted-foreground">
              {enabled && interval > 0 ? "Ativo" : "Desativado"}
            </p>
          </div>
          <Switch
            checked={enabled && interval > 0}
            onCheckedChange={(checked) => setEnabled(checked)}
            disabled={interval === 0}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Intervalo</Label>
          <Select value={interval.toString()} onValueChange={(value) => handleIntervalChange(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_INTERVALS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Display */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {enabled && interval > 0 ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Próximo em: {formatTimeRemaining(timeUntilNextRefresh)}
              </span>
            ) : (
              "Auto refresh desativado"
            )}
          </span>
          {lastRefresh && (
            <Badge variant="outline" className="text-xs">
              Último: {formatLastRefresh(lastRefresh)}
            </Badge>
          )}
        </div>

        {/* Manual Refresh Button */}
        <Button
          onClick={handleManualRefresh}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Manual
        </Button>
      </CardContent>
    </Card>
  );
}