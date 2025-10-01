"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, X } from "lucide-react";

export interface TaskFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  hasTodosFilter: string;
  onHasTodosFilterChange: (filter: string) => void;
  createdByFilter: string;
  onCreatedByFilterChange: (filter: string) => void;
  resetFilters: () => void;
  availableCreators: string[];
}

const STATUS_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Em Progresso", label: "Em Progresso" },
  { value: "Concluída", label: "Concluída" },
  { value: "Bloqueado", label: "Bloqueado" },
];

const HAS_TODOS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "with-todos", label: "Com itens" },
  { value: "without-todos", label: "Sem itens" },
];

const CREATED_BY_OPTIONS = [
  { value: "all", label: "Todos" },
];

export function TaskFilters({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  hasTodosFilter,
  onHasTodosFilterChange,
  createdByFilter,
  onCreatedByFilterChange,
  resetFilters,
  availableCreators,
}: TaskFiltersProps) {

  // Atualizar opções de criadores dinamicamente
  const createdByOptions = [
    ...CREATED_BY_OPTIONS,
    ...availableCreators.map(creator => ({ value: creator, label: creator })),
  ];

  const hasActiveFilters = searchTerm ||
    statusFilter.length > 0 ||
    hasTodosFilter !== "all" ||
    createdByFilter !== "all";

  const handleStatusToggle = (status: string) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    onStatusFilterChange(newStatusFilter);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filtros</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Ativos
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Status
                {statusFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                    {statusFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={statusFilter.includes(option.value)}
                  onCheckedChange={() => handleStatusToggle(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Has Todos Filter */}
        <div>
          <Select value={hasTodosFilter} onValueChange={onHasTodosFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Itens" />
            </SelectTrigger>
            <SelectContent>
              {HAS_TODOS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Created By Filter */}
        <div>
          <Select value={createdByFilter} onValueChange={onCreatedByFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Criado por" />
            </SelectTrigger>
            <SelectContent>
              {createdByOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              Busca: "{searchTerm}"
              <button
                onClick={() => onSearchTermChange("")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter.map((status) => (
            <Badge key={status} variant="outline" className="flex items-center gap-1">
              {status}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {hasTodosFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              {HAS_TODOS_OPTIONS.find(opt => opt.value === hasTodosFilter)?.label}
              <button
                onClick={() => onHasTodosFilterChange("all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {createdByFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Criado por: {createdByFilter}
              <button
                onClick={() => onCreatedByFilterChange("all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}