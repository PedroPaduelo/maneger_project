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
import { TagFilters } from "@/components/tag-filters";

export interface ProjectFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (status: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (priority: string[]) => void;
  isFavoriteFilter: string;
  onIsFavoriteFilterChange: (filter: string) => void;
  selectedTags: number[];
  onSelectedTagsChange: (tags: number[]) => void;
  resetFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: "Ativo", label: "Ativo" },
  { value: "Pausado", label: "Pausado" },
  { value: "Concluída", label: "Concluída" },
  { value: "Cancelado", label: "Cancelado" },
];

const PRIORITY_OPTIONS = [
  { value: "Alta", label: "Alta" },
  { value: "Média", label: "Média" },
  { value: "Baixa", label: "Baixa" },
];

const IS_FAVORITE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "favorites", label: "Favoritos" },
  { value: "non-favorites", label: "Não favoritos" },
];

export function ProjectFilters({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  isFavoriteFilter,
  onIsFavoriteFilterChange,
  selectedTags,
  onSelectedTagsChange,
  resetFilters,
}: ProjectFiltersProps) {

  const hasActiveFilters = searchTerm ||
    statusFilter.length > 0 ||
    priorityFilter.length > 0 ||
    isFavoriteFilter !== "all" ||
    selectedTags.length > 0;

  const handleStatusToggle = (status: string) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    onStatusFilterChange(newStatusFilter);
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
            placeholder="Buscar projetos..."
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

        {/* Is Favorite Filter */}
        <div>
          <Select value={isFavoriteFilter} onValueChange={onIsFavoriteFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Favoritos" />
            </SelectTrigger>
            <SelectContent>
              {IS_FAVORITE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tag Filters */}
      <div className="pt-2 border-t">
        <TagFilters
          selectedTags={selectedTags}
          onTagsChange={onSelectedTagsChange}
        />
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
          {priorityFilter.map((priority) => (
            <Badge key={priority} variant="outline" className="flex items-center gap-1">
              {priority}
              <button
                onClick={() => handlePriorityToggle(priority)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {isFavoriteFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              {IS_FAVORITE_OPTIONS.find(opt => opt.value === isFavoriteFilter)?.label}
              <button
                onClick={() => onIsFavoriteFilterChange("all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTags.map((tagId) => (
            <Badge key={tagId} variant="outline" className="flex items-center gap-1">
              Tag #{tagId}
              <button
                onClick={() => onSelectedTagsChange(selectedTags.filter(id => id !== tagId))}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
