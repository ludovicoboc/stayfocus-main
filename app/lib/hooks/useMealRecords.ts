import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { alimentacaoService } from '@/app/lib/services/alimentacao'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

// Chaves de query para cache
export const mealRecordKeys = {
  all: ['mealRecords'] as const,
  lists: () => [...mealRecordKeys.all, 'list'] as const,
  list: (date?: string) => [...mealRecordKeys.lists(), { date }] as const,
  details: () => [...mealRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...mealRecordKeys.details(), id] as const,
}

/**
 * Hook para obter registros de refeições
 */
export function useMealRecords(date?: string) {
  const fallbackStore = useAlimentacaoStore()
  
  return useQuery({
    queryKey: mealRecordKeys.list(date),
    queryFn: () => alimentacaoService.getMealRecords(date),
    // Fallback para localStorage quando offline
    placeholderData: () => {
      const today = date || new Date().toISOString().split('T')[0]
      return fallbackStore.registrosRefeicao.filter(r => r.date === today)
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para criar registro de refeição
 */
export function useCreateMealRecord() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: ({ 
      date, 
      time, 
      description, 
      meal_type, 
      photo_url 
    }: { 
      date: string; 
      time: string; 
      description: string; 
      meal_type?: string; 
      photo_url?: string 
    }) =>
      alimentacaoService.createMealRecord(date, time, description, meal_type, photo_url),
    
    onMutate: async ({ date, time, description, meal_type, photo_url }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: mealRecordKeys.list(date) })

      // Snapshot dos dados atuais
      const previousMealRecords = queryClient.getQueryData(mealRecordKeys.list(date))

      // Update otimista
      const newRecord = {
        id: `temp-${Date.now()}`,
        user_id: 'temp-user',
        date,
        time,
        description,
        meal_type,
        photo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData(mealRecordKeys.list(date), (old: any) => {
        if (!old) return [newRecord]
        return [...old, newRecord]
      })

      // Fallback para localStorage
      fallbackStore.adicionarRegistroRefeicao({
        date,
        time,
        description,
        meal_type,
        photo_url,
      })

      return { previousMealRecords }
    },

    onError: (err, variables, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousMealRecords) {
        queryClient.setQueryData(mealRecordKeys.list(variables.date), context.previousMealRecords)
      }

      // Reverter fallback (remover último item adicionado)
      const records = fallbackStore.registrosRefeicao
      if (records.length > 0) {
        const lastRecord = records[records.length - 1]
        if (lastRecord.date === variables.date && 
            lastRecord.time === variables.time && 
            lastRecord.description === variables.description) {
          fallbackStore.removerRegistroRefeicao(records.length - 1)
        }
      }
    },

    onSettled: (data, error, variables) => {
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: mealRecordKeys.list(variables.date) })
      queryClient.invalidateQueries({ queryKey: mealRecordKeys.lists() })
    },
  })
}

/**
 * Hook para atualizar registro de refeição
 */
export function useUpdateMealRecord() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: ({ 
      id, 
      date, 
      time, 
      description, 
      meal_type, 
      photo_url 
    }: { 
      id: string; 
      date?: string; 
      time?: string; 
      description?: string; 
      meal_type?: string; 
      photo_url?: string 
    }) =>
      alimentacaoService.updateMealRecord(id, { date, time, description, meal_type, photo_url }),
    
    onMutate: async ({ id, date, time, description, meal_type, photo_url }) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries({ queryKey: mealRecordKeys.lists() })

      const previousMealRecords = queryClient.getQueryData(mealRecordKeys.lists())

      // Update otimista em todas as listas que podem conter este registro
      queryClient.setQueriesData({ queryKey: mealRecordKeys.lists() }, (old: any) => {
        if (!old) return old
        return old.map((record: any) => 
          record.id === id 
            ? { 
                ...record, 
                date: date ?? record.date,
                time: time ?? record.time, 
                description: description ?? record.description, 
                meal_type: meal_type ?? record.meal_type,
                photo_url: photo_url ?? record.photo_url,
                updated_at: new Date().toISOString()
              }
            : record
        )
      })

      // Fallback para localStorage
      const recordIndex = fallbackStore.registrosRefeicao.findIndex(r => r.id === id)
      if (recordIndex >= 0) {
        const currentRecord = fallbackStore.registrosRefeicao[recordIndex]
        fallbackStore.editarRegistroRefeicao(recordIndex, {
          date: date ?? currentRecord.date,
          time: time ?? currentRecord.time,
          description: description ?? currentRecord.description,
          meal_type: meal_type ?? currentRecord.meal_type,
          photo_url: photo_url ?? currentRecord.photo_url,
        })
      }

      return { previousMealRecords }
    },

    onError: (err, variables, context) => {
      if (context?.previousMealRecords) {
        queryClient.setQueryData(mealRecordKeys.lists(), context.previousMealRecords)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mealRecordKeys.all })
    },
  })
}

/**
 * Hook para deletar registro de refeição
 */
export function useDeleteMealRecord() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: (id: string) => alimentacaoService.deleteMealRecord(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: mealRecordKeys.lists() })

      const previousMealRecords = queryClient.getQueryData(mealRecordKeys.lists())

      // Update otimista
      queryClient.setQueriesData({ queryKey: mealRecordKeys.lists() }, (old: any) => {
        if (!old) return old
        return old.filter((record: any) => record.id !== id)
      })

      // Fallback para localStorage
      const recordIndex = fallbackStore.registrosRefeicao.findIndex(r => r.id === id)
      if (recordIndex >= 0) {
        fallbackStore.removerRegistroRefeicao(recordIndex)
      }

      return { previousMealRecords }
    },

    onError: (err, variables, context) => {
      if (context?.previousMealRecords) {
        queryClient.setQueryData(mealRecordKeys.lists(), context.previousMealRecords)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mealRecordKeys.all })
    },
  })
}

/**
 * Hook para obter estatísticas de refeições
 */
export function useMealStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['mealStats', startDate, endDate],
    queryFn: () => alimentacaoService.getMealStats(startDate, endDate),
    staleTime: 1000 * 60 * 15, // 15 minutos
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Hook para upload de foto de refeição
 */
export function useUploadMealPhoto() {
  return useMutation({
    mutationFn: (file: File) => alimentacaoService.uploadMealPhoto(file),
  })
}
