"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AutoRefreshHeaderProps {
  onRefresh?: () => void;
}

export function AutoRefreshHeader({ onRefresh }: AutoRefreshHeaderProps) {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleManualRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastRefresh(new Date());
    }
  };

  return (
    <Button
      onClick={handleManualRefresh}
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative"
      title="Refresh manual"
    >
      <RefreshCw className="h-4 w-4" />
      {lastRefresh && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
      )}
    </Button>
  );
}