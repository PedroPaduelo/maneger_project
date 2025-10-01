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

export interface RequirementFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  typeFilter: string[];
  onTypeFilterChange: (types: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (priorities: string[]) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  resetFilters: () => void;
  availableCategories: string[];
}

const TYPE_OPTIONS = [
  { value: "Funcional", label: "Funcional" },
  { value: "Não Funcional", label: "Não Funcional" },
  { value: "Regra de Negócio", label: "Regra de Negócio" },
];

const PRIORITY_OPTIONS = [
  { value: "Alta", label: "Alta" },
  { value: "Média", label: "Média" },
  { value: "Baixa", label: "Baixa" },
];

export function RequirementFilters({
  searchTerm,
  onSearchTermChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  resetFilters,
  availableCategories,
}: RequirementFiltersProps) {

  // Atualizar opções de categoria dinamicamente
  const categoryOptions = [
    { value: "all", label: "Todas" },
    ...availableCategories.map(category => ({ value: category, label: category })),
  ];

  const hasActiveFilters = searchTerm ||
    typeFilter.length > 0 ||
    priorityFilter.length > 0 ||
    categoryFilter !== "all";

  const handleTypeToggle = (type: string) => {
    const newTypeFilter = typeFilter.includes(type)
      ? typeFilter.filter(t => t !== type)
      : [...typeFilter, type];
    onTypeFilterChange(newTypeFilter);
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriorityFilter = priorityFilter.includes(priority)
      ? priorityFilter.filter(p => p !== priority)
      : [...priorityFilter, priority];
    onPriorityFilterChange(newPriorityFilter);
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
            placeholder="Buscar requisitos..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Tipo
                {typeFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                    {typeFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              {TYPE_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={typeFilter.includes(option.value)}
                  onCheckedChange={() => handleTypeToggle(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority Filter */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Prioridade
                {priorityFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                    {priorityFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              {PRIORITY_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={priorityFilter.includes(option.value)}
                  onCheckedChange={() => handlePriorityToggle(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Filter */}
        <div>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
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
          {typeFilter.map((type) => (
            <Badge key={type} variant="outline" className="flex items-center gap-1">
              {type}
              <button
                onClick={() => handleTypeToggle(type)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {priorityFilter.map((priority) => (
            <Badge key={priority} variant="outline" className="flex items-center gap-1">
              Prioridade: {priority}
              <button
                onClick={() => handlePriorityToggle(priority)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {categoryFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Categoria: {categoryFilter}
              <button
                onClick={() => onCategoryFilterChange("all")}
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