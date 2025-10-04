"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tag as TagIcon,
  Filter,
  X,
  Check,
  Search,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTagsWithCount } from "@/hooks";
import { TagWithCount } from "@/hooks/useTags";

interface TagFiltersProps {
  selectedTags: number[];
  onTagsChange: (tags: number[]) => void;
  className?: string;
}

export function TagFilters({
  selectedTags,
  onTagsChange,
  className
}: TagFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: tags = [], isLoading, error } = useTagsWithCount();

  const filteredTags = React.useMemo(() => {
    if (!searchTerm) return tags;

    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  };

  const clearAllTags = () => {
    onTagsChange([]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const getTagColor = (color?: string) => {
    if (!color) return "bg-gray-100 text-gray-800 hover:bg-gray-200";

    const colorMap: Record<string, string> = {
      red: "bg-red-100 text-red-800 hover:bg-red-200",
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      green: "bg-green-100 text-green-800 hover:bg-green-200",
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      teal: "bg-teal-100 text-teal-800 hover:bg-teal-200",
    };

    return colorMap[color] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const selectedTagsData = tags.filter(tag => selectedTags.includes(tag.id));

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <TagIcon className="h-4 w-4" />
        Erro ao carregar tags
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrar por Tags</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length} selecionada{selectedTags.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllTags}
            className="h-auto p-1 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagsData.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className={cn(
                "flex items-center gap-1 pr-1",
                getTagColor(tag.color)
              )}
            >
              {tag.name}
              <button
                onClick={() => handleTagToggle(tag.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Selector Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-4 w-4 rounded" />
              ) : (
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                {isLoading
                  ? "Carregando tags..."
                  : selectedTags.length === 0
                  ? "Selecione as tags..."
                  : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selecionada${selectedTags.length > 1 ? 's' : ''}`
                }
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar tags..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
            <ScrollArea className="h-72">
              <CommandList>
                {isLoading ? (
                  <div className="flex flex-col gap-2 p-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-2 p-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-6 w-16 rounded" />
                        <Skeleton className="h-4 w-24 rounded flex-1" />
                        <Skeleton className="h-5 w-8 rounded" />
                      </div>
                    ))}
                  </div>
                ) : filteredTags.length === 0 ? (
                  <CommandEmpty>
                    {searchTerm ? "Nenhuma tag encontrada." : "Nenhuma tag disponível."}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => handleTagToggle(tag.id)}
                          className="flex cursor-pointer items-center gap-2 px-3 py-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4"
                            />
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                getTagColor(tag.color)
                              )}
                            >
                              {tag.name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {tag.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {tag._count.projectTags} projeto{tag._count.projectTags !== 1 ? 's' : ''}
                            </Badge>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const allTagIds = tags.map(tag => tag.id);
            onTagsChange(allTagIds);
          }}
          className="h-auto p-1 text-xs"
          disabled={isLoading || tags.length === 0}
        >
          {isLoading ? <Skeleton className="h-3 w-16" /> : "Selecionar todas"}
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTagsChange([])}
          className="h-auto p-1 text-xs"
          disabled={isLoading || selectedTags.length === 0}
        >
          {isLoading ? <Skeleton className="h-3 w-14" /> : "Limpar seleção"}
        </Button>
      </div>
    </div>
  );
}

// Export the TagWithCount type for external use
export type { TagWithCount };