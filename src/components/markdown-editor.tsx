"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Eye, Code, Info } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  label,
  description,
  className
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewKey, setPreviewKey] = useState(0);

  // Force preview re-render when value changes
  useEffect(() => {
    if (activeTab === "preview") {
      setPreviewKey(prev => prev + 1);
    }
  }, [value, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const quickInsertions = [
    { label: "Título H1", text: "# " },
    { label: "Título H2", text: "## " },
    { label: "Negrito", text: "**texto**" },
    { label: "Itálico", text: "*texto*" },
    { label: "Código inline", text: "`código`" },
    { label: "Lista", text: "- Item\n- Item" },
    { label: "Tarefa", text: "- [ ] Tarefa" },
    { label: "Bloco de código", text: "```\n// código aqui\n```" },
    { label: "Link", text: "[texto](url)" },
    { label: "Tabela", text: "| Col1 | Col2 |\n|------|------|\n| Val1 | Val2 |" }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          <div className="h-px bg-primary w-2"></div>
          <span className="text-xs text-muted-foreground">Markdown</span>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Ajuda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-3">
          <Textarea
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder || "Digite seu markdown aqui..."}
            className="min-h-[200px] font-mono text-sm"
          />

          {/* Quick Insertions */}
          <div className="flex flex-wrap gap-2">
            {quickInsertions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newValue =
                      value.substring(0, start) +
                      item.text +
                      value.substring(end);
                    onChange(newValue);

                    // Set cursor position after insertion
                    setTimeout(() => {
                      const newCursorPos = start + item.text.length;
                      textarea.focus();
                      textarea.setSelectionRange(newCursorPos, newCursorPos);
                    }, 0);
                  }
                }}
                className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="border rounded-lg p-4 min-h-[200px] bg-background">
            {value ? (
              <MarkdownRenderer key={previewKey} content={value} />
            ) : (
              <div className="text-muted-foreground text-center py-8">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Seu preview aparecerá aqui...</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="help" className="mt-0">
          <div className="border rounded-lg p-4 bg-muted/50 space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Markdown para IA</h4>
              <p className="text-muted-foreground text-xs mb-3">
                Use markdown para estruturar prompts de forma clara para a IA entender e executar.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Títulos e Estrutura:</div>
              <code className="block text-xs bg-background p-2 rounded">
                # Tarefa Principal<br/>
                ## Sub-tarefa 1<br/>
                ## Sub-tarefa 2
              </code>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Listas de Tarefas:</div>
              <code className="block text-xs bg-background p-2 rounded">
                - [ ] Implementar função X<br/>
                - [x] Revisar código<br/>
                - [ ] Testar unitariamente
              </code>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Prompt Estruturado:</div>
              <code className="block text-xs bg-background p-2 rounded">
                **Objetivo:** Criar sistema de autenticação<br/><br/>
                **Requisitos:**<br/>
                - JWT tokens<br/>
                - Refresh tokens<br/><br/>
                ```python<br/>
                # Exemplo de implementação<br/>
                ```
              </code>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Código e Exemplos:</div>
              <code className="block text-xs bg-background p-2 rounded">
                Use ```language:nome do arquivo``` para blocos de código
              </code>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}