"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistorySummary } from "@/lib/types";
import { CreateHistorySummaryDialog } from "@/components/create-history-summary-dialog";
import { DeleteHistorySummaryDialog } from "@/components/delete-history-summary-dialog";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  User,
  Expand,
  Minimize
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistorySummaryManagerProps {
  projectId: number;
}

export function HistorySummaryManager({ projectId }: HistorySummaryManagerProps) {
  const [historySummaries, setHistorySummaries] = useState<HistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchHistorySummaries();
  }, [projectId]);

  const fetchHistorySummaries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/history-summaries`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch history summaries");
      }

      const data = await response.json();
      setHistorySummaries(data);
    } catch (err) {
      console.error("Error fetching history summaries:", err);
      setError("Erro ao carregar sumários históricos.");
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySummaryCreated = () => {
    fetchHistorySummaries();
  };

  const handleHistorySummaryUpdated = () => {
    fetchHistorySummaries();
  };

  const handleHistorySummaryDeleted = () => {
    fetchHistorySummaries();
  };

  const toggleExpanded = (summaryId: number) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(summaryId)) {
      newExpanded.delete(summaryId);
    } else {
      newExpanded.add(summaryId);
    }
    setExpandedSummaries(newExpanded);
  };

  const getSummaryPreview = (summary: string, maxLength: number = 200) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-red-600">Erro</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sumários Históricos</h3>
          <p className="text-sm text-muted-foreground">
            Registre o progresso e marcos importantes do projeto com suporte a Markdown
          </p>
        </div>
        <CreateHistorySummaryDialog
          projectId={projectId}
          onHistorySummaryCreated={handleHistorySummaryCreated}
          onHistorySummaryUpdated={handleHistorySummaryUpdated}
        />
      </div>

      {historySummaries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Nenhum sumário histórico</h3>
                <p className="text-muted-foreground">
                  Comece adicionando sumários para registrar o progresso do projeto com formatação rica em Markdown.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico do Projeto
              </CardTitle>
              <CardDescription>
                {historySummaries.length} sumário{historySummaries.length !== 1 ? 's' : ''} registrado{historySummaries.length !== 1 ? 's' : ''} com suporte a Markdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-4">
                  {historySummaries.map((historySummary) => {
                    const isExpanded = expandedSummaries.has(historySummary.id);
                    const needsExpansion = historySummary.summary.length > 300;
                    
                    return (
                      <div
                        key={historySummary.id}
                        className="border rounded-lg p-4 space-y-3 bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(historySummary.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>
                                {format(new Date(historySummary.createdAt), "HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>Criado por: {historySummary.createdBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreateHistorySummaryDialog
                              projectId={projectId}
                              historySummary={historySummary}
                              onHistorySummaryCreated={handleHistorySummaryCreated}
                              onHistorySummaryUpdated={handleHistorySummaryUpdated}
                            />
                            <DeleteHistorySummaryDialog
                              historySummary={historySummary}
                              projectId={projectId}
                              onHistorySummaryDeleted={handleHistorySummaryDeleted}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {isExpanded || !needsExpansion ? (
                              <MarkdownRenderer content={historySummary.summary} />
                            ) : (
                              <div>
                                <MarkdownRenderer content={getSummaryPreview(historySummary.summary)} />
                                {needsExpansion && (
                                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Conteúdo truncado...</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {needsExpansion && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(historySummary.id)}
                              className="flex items-center gap-1 h-8 px-2"
                            >
                              {isExpanded ? (
                                <>
                                  <Minimize className="h-3 w-3" />
                                  Recolher
                                </>
                              ) : (
                                <>
                                  <Expand className="h-3 w-3" />
                                  Expandir
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {historySummary.updatedAt > historySummary.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                            <Badge variant="outline" className="text-xs">
                              Editado
                            </Badge>
                            <span>
                              Última atualização: {format(new Date(historySummary.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}