import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  cost?: number;
  createdAt: string;
}

interface ChatSession {
  id: number;
  title: string;
  status: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatResponse {
  sessionId: number;
  response: string;
  cost: number;
  remainingCredits: number;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export function useChat() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Helper para deduplicar por id
  const dedupeById = useCallback(<T extends { id: number }>(items: T[]): T[] => {
    const map = new Map<number, T>();
    for (const item of items) map.set(item.id, item);
    return Array.from(map.values());
  }, []);

  // Carregar sessões do usuário
  const loadSessions = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setSessions((prev) => dedupeById([...(Array.isArray(data) ? data : []), ...prev]));
      }
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
    }
  }, [session?.user?.id, dedupeById]);

  // Carregar mensagens de uma sessão
  const loadSession = useCallback(async (sessionId: number) => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      if (response.ok) {
        const data: ChatSession = await response.json();
        setCurrentSession(data);
        setMessages(data.messages || []);
      } else {
        setError('Erro ao carregar sessão');
      }
    } catch (err) {
      setError('Erro ao carregar sessão');
      console.error('Erro ao carregar sessão:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Enviar mensagem
  const sendMessage = useCallback(async (message: string, systemPrompt?: string) => {
    if (!session?.user?.id || !message.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Adicionar mensagem do usuário ao estado local imediatamente
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content: message,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: currentSession?.id,
          systemPrompt
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        if (data.code === 'INSUFFICIENT_CREDITS') {
          throw new Error('Coins insuficientes. Recarregue seus coins para continuar.');
        }
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      // Adicionar resposta do assistente ao estado
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        cost: data.cost,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Atualizar sessão atual se for uma nova sessão
      if (!currentSession || currentSession.id !== data.sessionId) {
        // Carrega sessão recém-criada/atualizada do backend para evitar duplicidades
        await loadSession(data.sessionId);
        // Atualiza lista de sessões em paralelo (sem bloquear)
        loadSessions();
      } else {
        // Se for a mesma sessão, apenas atualiza as mensagens
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, userMessage, assistantMessage],
          updatedAt: new Date().toISOString()
        } : null);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);

      // Remover mensagem do usuário em caso de erro
      setMessages(prev => prev.slice(0, -1));

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, currentSession, loadSession, loadSessions]);

  // Criar nova sessão
  const createNewSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
    setError(null);
  }, []);

  // Excluir sessão
  const deleteSession = useCallback(async (sessionId: number) => {
    if (!session?.user?.id) return;

    try {
      await fetch(`/api/chat/${sessionId}`, {
        method: 'DELETE'
      });

      setSessions(prev => prev.filter(s => s.id !== sessionId));

      if (currentSession?.id === sessionId) {
        createNewSession();
      }
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
    }
  }, [session?.user?.id, currentSession, createNewSession]);

  // Arquivar/Desarquivar sessão
  const setSessionStatus = useCallback(async (sessionId: number, status: 'active' | 'archived' | 'completed') => {
    if (!session?.user?.id) return null;

    try {
      const res = await fetch(`/api/chat/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) return null;
      const data = await res.json();
      const updated = data.session;
      setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status: updated.status } : s)));
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => (prev ? { ...prev, status: updated.status } : prev));
      }
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar status da sessão:', err);
      return null;
    }
  }, [session?.user?.id, currentSession]);

  // Carregar sessões na montagem do componente
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    isLoading,
    error,
    currentSession,
    sessions,
    messages,
    sendMessage,
    loadSession,
    createNewSession,
    deleteSession,
    setSessionStatus,
    setError
  };
}
