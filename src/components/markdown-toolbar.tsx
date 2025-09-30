"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Code, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Image,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface MarkdownToolbarProps {
  onInsert: (text: string) => void;
  value: string;
  onChange: (value: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function MarkdownToolbar({ onInsert, value, onChange, textareaRef }: MarkdownToolbarProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    let textarea = textareaRef?.current;
    
    // If no ref provided, try multiple ways to find the textarea
    if (!textarea) {
      textarea = document.querySelector('textarea[name="markdown-content"]') as HTMLTextAreaElement;
    }
    
    if (!textarea) {
      const activeTab = document.querySelector('[data-state="active"] textarea') as HTMLTextAreaElement;
      textarea = activeTab;
    }
    
    if (!textarea) {
      const dialogTextarea = document.querySelector('dialog textarea, [role="dialog"] textarea') as HTMLTextAreaElement;
      textarea = dialogTextarea;
    }
    
    if (!textarea) {
      console.error('Textarea not found');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Move cursor to appropriate position
    setTimeout(() => {
      textarea.focus();
      let newPosition;
      if (selectedText) {
        // If text was selected, place cursor after the formatted text
        newPosition = start + newText.length;
      } else if (placeholder) {
        // If no text was selected and there's a placeholder, select the placeholder
        newPosition = start + before.length;
        textarea.setSelectionRange(newPosition, newPosition + placeholder.length);
      } else {
        // Otherwise, place cursor between the formatting
        newPosition = start + before.length;
      }
      if (!placeholder || selectedText) {
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const insertLink = () => {
    let textarea = textareaRef?.current;
    
    if (!textarea) {
      textarea = document.querySelector('textarea[name="markdown-content"]') as HTMLTextAreaElement;
    }
    
    if (!textarea) {
      const activeTab = document.querySelector('[data-state="active"] textarea') as HTMLTextAreaElement;
      textarea = activeTab;
    }
    
    if (!textarea) {
      const dialogTextarea = document.querySelector('dialog textarea, [role="dialog"] textarea') as HTMLTextAreaElement;
      textarea = dialogTextarea;
    }
    
    if (!textarea) {
      console.error('Textarea not found for link insertion');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const linkText = selectedText || "texto do link";
    const linkUrl = "https://exemplo.com";
    
    const newText = `[${linkText}](${linkUrl})`;
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // If text was selected, select the URL part
        const urlStart = start + linkText.length + 3;
        textarea.setSelectionRange(urlStart, urlStart + linkUrl.length);
      } else {
        // If no text was selected, select the link text
        textarea.setSelectionRange(start + 1, start + 1 + linkText.length);
      }
    }, 0);
  };

  const insertImage = () => {
    let textarea = textareaRef?.current;
    
    if (!textarea) {
      textarea = document.querySelector('textarea[name="markdown-content"]') as HTMLTextAreaElement;
    }
    
    if (!textarea) {
      const activeTab = document.querySelector('[data-state="active"] textarea') as HTMLTextAreaElement;
      textarea = activeTab;
    }
    
    if (!textarea) {
      const dialogTextarea = document.querySelector('dialog textarea, [role="dialog"] textarea') as HTMLTextAreaElement;
      textarea = dialogTextarea;
    }
    
    if (!textarea) {
      console.error('Textarea not found for image insertion');
      return;
    }

    const start = textarea.selectionStart;
    const altText = "descrição da imagem";
    const imageUrl = "https://exemplo.com/imagem.jpg";
    
    const newText = `![${altText}](${imageUrl})`;
    const newValue = value.substring(0, start) + newText + value.substring(start);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      // Select the alt text for easy editing
      const altStart = start + 2;
      const altEnd = altStart + altText.length;
      textarea.setSelectionRange(altStart, altEnd);
    }, 0);
  };

  const saveHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  };

  // Save history when value changes (using useEffect to avoid render loop)
  useEffect(() => {
    if (value !== history[historyIndex]) {
      saveHistory();
    }
  }, [value]);

  const toolbarButtons = [
    {
      icon: Undo,
      tooltip: "Desfazer",
      action: undo,
      disabled: historyIndex <= 0,
    },
    {
      icon: Redo,
      tooltip: "Refazer",
      action: redo,
      disabled: historyIndex >= history.length - 1,
    },
    { divider: true },
    {
      icon: Heading1,
      tooltip: "Título 1",
      action: () => insertText("# ", "", "Título 1"),
    },
    {
      icon: Heading2,
      tooltip: "Título 2",
      action: () => insertText("## ", "", "Título 2"),
    },
    {
      icon: Heading3,
      tooltip: "Título 3",
      action: () => insertText("### ", "", "Título 3"),
    },
    { divider: true },
    {
      icon: Bold,
      tooltip: "Negrito",
      action: () => insertText("**", "**", "texto negrito"),
    },
    {
      icon: Italic,
      tooltip: "Itálico",
      action: () => insertText("*", "*", "texto itálico"),
    },
    {
      icon: Code,
      tooltip: "Código inline",
      action: () => insertText("`", "`", "código"),
    },
    { divider: true },
    {
      icon: Link,
      tooltip: "Link",
      action: insertLink,
    },
    {
      icon: Image,
      tooltip: "Imagem",
      action: insertImage,
    },
    { divider: true },
    {
      icon: List,
      tooltip: "Lista não ordenada",
      action: () => insertText("- ", "", "item da lista"),
    },
    {
      icon: ListOrdered,
      tooltip: "Lista ordenada",
      action: () => insertText("1. ", "", "item da lista"),
    },
    {
      icon: Quote,
      tooltip: "Citação",
      action: () => insertText("> ", "", "citação"),
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 border-b rounded-t-lg bg-muted/50">
        {toolbarButtons.map((button, index) => {
          if (button.divider) {
            return (
              <div key={`divider-${index}`} className="w-px h-6 bg-border" />
            );
          }

          const Icon = button.icon;
          return (
            <Tooltip key={button.tooltip}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={button.action}
                  disabled={button.disabled}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{button.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}