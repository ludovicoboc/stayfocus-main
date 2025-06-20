import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { alimentacaoService } from '@/app/lib/services/alimentacao'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

// Chaves de query para cache
export const hydrationKeys = {
  all: ['hydration'] as const,
  progress: (date?: string) => [...hydrationKeys.all, 'progress', date] as const,
  records: (date?: string) => [...hydrationKeys.all, 'records', date] as const,
}

/**
 * Hook para obter progresso de hidratação
 */
export function useHydrationProgress(date?: string) {
  const fallbackStore = useAlimentacaoStore()
  
  return useQuery({
    queryKey: hydrationKeys.progress(date),
    queryFn: () => alimentacaoService.getHydrationProgress(date),
    // Fallback para localStorage quando offline
    placeholderData: () => ({
      current: fallbackStore.coposBebidos * 250, // Assumindo 250ml por copo
      goal: fallbackStore.metaDiaria * 250,
      progress: Math.min(1, fallbackStore.coposBebidos / fallbackStore.metaDiaria),
      remaining: Math.max(0, (fallbackStore.metaDiaria - fallbackStore.coposBebidos) * 250),
    }),
    staleTime: 1000 * 60 * 2, // 2 minutos - dados de hidratação mudam frequentemente
  })
}

/**
 * Hook para obter registros de hidratação
 */
export function useHydrationRecords(date?: string) {
  return useQuery({
    queryKey: hydrationKeys.records(date),
    queryFn: () => alimentacaoService.getHydrationRecords(date),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para adicionar registro de hidratação
 */
export function useAddHydrationRecord() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: ({ amount_ml, date, time }: { amount_ml: number; date?: string; time?: string }) =>
      alimentacaoService.createHydrationRecord(amount_ml, date, time),
    
    onMutate: async ({ amount_ml, date, time }) => {
      // Optimistic update
      const today = date || new Date().toISOString().split('T')[0]
      
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: hydrationKeys.progress(today) })
      await queryClient.cancelQueries({ queryKey: hydrationKeys.records(today) })

      // Snapshot dos dados atuais
      const previousProgress = queryClient.getQueryData(hydrationKeys.progress(today))
      const previousRecords = queryClient.getQueryData(hydrationKeys.records(today))

      // Update otimista do progresso
      queryClient.setQueryData(hydrationKeys.progress(today), (old: any) => {
        if (!old) return old
        return {
          ...old,
          current: old.current + amount_ml,
          progress: Math.min(1, (old.current + amount_ml) / old.goal),
          remaining: Math.max(0, old.goal - (old.current + amount_ml)),
        }
      })

      // Fallback para localStorage
      fallbackStore.adicionarCopo()

      return { previousProgress, previousRecords }
    },

    onError: (err, variables, context) => {
      // Reverter optimistic update em caso de erro
      const today = variables.date || new Date().toISOString().split('T')[0]
      
      if (context?.previousProgress) {
        queryClient.setQueryData(hydrationKeys.progress(today), context.previousProgress)
      }
      if (context?.previousRecords) {
        queryClient.setQueryData(hydrationKeys.records(today), context.previousRecords)
      }

      // Reverter fallback
      fallbackStore.removerCopo()
    },

    onSettled: (data, error, variables) => {
      // Invalidar queries para refetch
      const today = variables.date || new Date().toISOString().split('T')[0]
      queryClient.invalidateQueries({ queryKey: hydrationKeys.progress(today) })
      queryClient.invalidateQueries({ queryKey: hydrationKeys.records(today) })
    },
  })
}

/**
 * Hook para remover registro de hidratação
 */
export function useRemoveHydrationRecord() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: (id: string) => alimentacaoService.deleteHydrationRecord(id),
    
    onMutate: async () => {
      // Fallback para localStorage
      fallbackStore.removerCopo()
    },

    onError: () => {
      // Reverter fallback em caso de erro
      fallbackStore.adicionarCopo()
    },

    onSettled: () => {
      // Invalidar todas as queries de hidratação
      queryClient.invalidateQueries({ queryKey: hydrationKeys.all })
    },
  })
}

/**
 * Hook para adicionar um copo (250ml) - compatibilidade com store atual
 */
export function useAddGlass() {
  const addHydrationRecord = useAddHydrationRecord()
  
  return {
    mutate: () => addHydrationRecord.mutate({ amount_ml: 250 }),
    ...addHydrationRecord,
  }
}

/**
 * Hook para remover um copo - compatibilidade com store atual
 */
export function useRemoveGlass() {
  const fallbackStore = useAlimentacaoStore()
  
  // Para simplicidade, vamos usar apenas o fallback store para remoção
  // Em uma implementação completa, precisaríamos rastrear registros individuais
  return {
    mutate: () => fallbackStore.removerCopo(),
    isLoading: false,
    error: null,
  }
}
