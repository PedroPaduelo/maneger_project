"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "./markdown-renderer";
import { Eye, Edit, FileText } from "lucide-react";

interface MarkdownPreviewProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function MarkdownPreview({
  value,
  onChange,
  placeholder = "Digite seu texto em Markdown aqui...",
  rows = 6,
  className,
  textareaRef,
}: MarkdownPreviewProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use the provided ref or fall back to internal ref
  const finalTextareaRef = textareaRef || internalTextareaRef;

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4 space-y-2">
          <Textarea
            ref={finalTextareaRef}
            name="markdown-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="resize-none font-mono text-sm leading-relaxed min-h-[300px] max-h-[400px] overflow-y-auto"
          />
          <div className="text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Suporte a Markdown: **negrito**, *itálico*, `código`, # títulos, [links](url), &gt; citações, etc.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Preview</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              {value.trim() ? (
                <div className="min-h-[300px]">
                  <MarkdownRenderer content={value} />
                </div>
              ) : (
                <div className="min-h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  Preview do conteúdo Markdown aparecerá aqui...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}