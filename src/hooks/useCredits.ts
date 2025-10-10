import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface CreditStats {
  [key: string]: number;
}

interface CreditsData {
  balance: number;
  transactions: CreditTransaction[];
  stats: CreditStats;
}

export function useCredits() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStats>({});

  // Carregar dados dos créditos
  const loadCredits = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/credits');
      if (response.ok) {
        const data: CreditsData = await response.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
        setStats(data.stats);
      } else {
        setError('Erro ao carregar créditos');
      }
    } catch (err) {
      setError('Erro ao carregar créditos');
      console.error('Erro ao carregar créditos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Adicionar créditos
  const addCredits = useCallback(async (amount: number, description: string) => {
    if (!session?.user?.id || amount <= 0) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          type: 'credit',
          description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        await loadCredits(); // Recarregar transações
        return data;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao adicionar créditos');
        return null;
      }
    } catch (err) {
      setError('Erro ao adicionar créditos');
      console.error('Erro ao adicionar créditos:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, loadCredits]);

  // Verificar se tem créditos suficientes
  const hasEnoughCredits = useCallback((required: number) => {
    return balance >= required;
  }, [balance]);

  // Formatar valor para exibição
  const formatBalance = useCallback((value?: number) => {
    const val = value ?? balance;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  }, [balance]);

  // Carregar dados na montagem do componente
  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  return {
    balance,
    transactions,
    stats,
    isLoading,
    error,
    loadCredits,
    addCredits,
    hasEnoughCredits,
    formatBalance,
    setError
  };
}