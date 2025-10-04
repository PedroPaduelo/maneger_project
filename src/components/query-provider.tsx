"use client";

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo de stale em 5 minutos
            staleTime: 1000 * 60 * 5,
            // Tempo de cache em 10 minutos
            gcTime: 1000 * 60 * 10,
            // Retry com exponential backoff
            retry: (failureCount, error: any) => {
              // Não retry para erros 4xx
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry até 3 vezes para outros erros
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus (mas não em desenvolvimento)
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Não refetchar em reconnect por padrão
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations apenas para erros de rede
            retry: (failureCount, error: any) => {
              if (error?.name === 'TypeError' || error?.message?.includes('fetch')) {
                return failureCount < 2;
              }
              return false;
            },
            // Adicionar delay pequeno para loading states
            useErrorBoundary: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}