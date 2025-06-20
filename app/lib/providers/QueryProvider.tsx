'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configurações otimizadas para offline
            staleTime: 1000 * 60 * 10, // 10 minutos - dados ficam "frescos" por mais tempo
            gcTime: 1000 * 60 * 60 * 24, // 24 horas - manter cache por mais tempo

            // Estratégia de retry inteligente
            retry: (failureCount, error) => {
              // Não tentar novamente para erros de autenticação
              if (error instanceof Error && error.message.includes('401')) {
                return false
              }

              // Verificar se está offline apenas no cliente
              if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
                return false
              }

              // Tentar até 3 vezes para outros erros
              return failureCount < 3
            },

            // Configurações de refetch otimizadas para offline
            refetchOnWindowFocus: false, // Evitar refetch desnecessário
            refetchOnMount: 'always', // Sempre tentar refetch ao montar
            refetchOnReconnect: 'always', // Sempre refetch quando reconectar

            // Modo de rede: tentar offline primeiro
            networkMode: 'offlineFirst',

            // Retry delay com backoff exponencial
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Configurações de mutation para offline
            retry: (failureCount, error) => {
              // Verificar se está offline apenas no cliente
              if (typeof window !== 'undefined' && 'navigator' in window && !navigator.onLine) {
                return false
              }

              // Não tentar novamente para erros de autenticação
              if (error instanceof Error && error.message.includes('401')) {
                return false
              }

              // Tentar até 2 vezes para outros erros
              return failureCount < 2
            },

            // Modo de rede: tentar offline primeiro
            networkMode: 'offlineFirst',

            // Retry delay
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
