"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Copy, Layers, CheckCircle } from "lucide-react";
import { useDuplicateProject } from "@/hooks";
import { useToast } from "@/hooks/use-toast";

interface DuplicateProjectButtonProps {
  projectId: number;
  projectName: string;
}

export function DuplicateProjectButton({ projectId, projectName }: DuplicateProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const duplicateProject = useDuplicateProject();
  const { toast } = useToast();

  const handleDuplicate = (includeTasks: boolean) => {
    duplicateProject.mutate({
      sourceProjectId: projectId,
      includeTasks,
    });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent transition-colors"
          title="Duplicar projeto"
        >
          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleDuplicate(true)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Layers className="h-4 w-4" />
          <div className="flex-1">
            <div className="font-medium">Duplicar completo</div>
            <div className="text-xs text-muted-foreground">
              Copia projeto, tarefas e requisitos
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDuplicate(false)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Copy className="h-4 w-4" />
          <div className="flex-1">
            <div className="font-medium">Duplicar projeto</div>
            <div className="text-xs text-muted-foreground">
              Apenas dados básicos do projeto
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}