"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grid, List, ChevronDown } from "lucide-react";

type ViewMode = "cards" | "table";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {viewMode === "cards" ? (
            <Grid className="h-4 w-4 mr-2" />
          ) : (
            <List className="h-4 w-4 mr-2" />
          )}
          {viewMode === "cards" ? "Cards" : "Tabela"}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onViewModeChange("cards")}
          className={viewMode === "cards" ? "bg-accent" : ""}
        >
          <Grid className="h-4 w-4 mr-2" />
          Visualização em Cards
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onViewModeChange("table")}
          className={viewMode === "table" ? "bg-accent" : ""}
        >
          <List className="h-4 w-4 mr-2" />
          Visualização em Tabela
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}