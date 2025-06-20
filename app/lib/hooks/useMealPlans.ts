import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { alimentacaoService } from '@/app/lib/services/alimentacao'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

// Chaves de query para cache
export const mealPlanKeys = {
  all: ['mealPlans'] as const,
  lists: () => [...mealPlanKeys.all, 'list'] as const,
  list: (filters: string) => [...mealPlanKeys.lists(), { filters }] as const,
  details: () => [...mealPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...mealPlanKeys.details(), id] as const,
}

/**
 * Hook para obter planos de refeição
 */
export function useMealPlans() {
  const fallbackStore = useAlimentacaoStore()
  
  return useQuery({
    queryKey: mealPlanKeys.lists(),
    queryFn: () => alimentacaoService.getMealPlans(),
    // Fallback para localStorage quando offline
    placeholderData: () => fallbackStore.planosRefeicao,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

/**
 * Hook para criar plano de refeição
 */
export function useCreateMealPlan() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: ({ time, description }: { time: string; description: string }) =>
      alimentacaoService.createMealPlan(time, description),
    
    onMutate: async ({ time, description }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: mealPlanKeys.lists() })

      // Snapshot dos dados atuais
      const previousMealPlans = queryClient.getQueryData(mealPlanKeys.lists())

      // Update otimista
      const newPlan = {
        id: `temp-${Date.now()}`,
        time,
        description,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData(mealPlanKeys.lists(), (old: any) => {
        if (!old) return [newPlan]
        return [...old, newPlan]
      })

      // Fallback para localStorage
      fallbackStore.adicionarPlanoRefeicao(time, description)

      return { previousMealPlans }
    },

    onError: (err, variables, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousMealPlans) {
        queryClient.setQueryData(mealPlanKeys.lists(), context.previousMealPlans)
      }

      // Reverter fallback (remover último item adicionado)
      const plans = fallbackStore.planosRefeicao
      if (plans.length > 0) {
        const lastPlan = plans[plans.length - 1]
        if (lastPlan.time === variables.time && lastPlan.description === variables.description) {
          fallbackStore.removerPlanoRefeicao(plans.length - 1)
        }
      }
    },

    onSettled: () => {
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() })
    },
  })
}

/**
 * Hook para atualizar plano de refeição
 */
export function useUpdateMealPlan() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: ({ id, time, description, is_active }: { 
      id: string; 
      time?: string; 
      description?: string; 
      is_active?: boolean 
    }) =>
      alimentacaoService.updateMealPlan(id, { time, description, is_active }),
    
    onMutate: async ({ id, time, description, is_active }) => {
      await queryClient.cancelQueries({ queryKey: mealPlanKeys.lists() })

      const previousMealPlans = queryClient.getQueryData(mealPlanKeys.lists())

      // Update otimista
      queryClient.setQueryData(mealPlanKeys.lists(), (old: any) => {
        if (!old) return old
        return old.map((plan: any) => 
          plan.id === id 
            ? { ...plan, time: time ?? plan.time, description: description ?? plan.description, is_active: is_active ?? plan.is_active }
            : plan
        )
      })

      // Fallback para localStorage
      const planIndex = fallbackStore.planosRefeicao.findIndex(p => p.id === id)
      if (planIndex >= 0) {
        fallbackStore.editarPlanoRefeicao(planIndex, {
          time: time ?? fallbackStore.planosRefeicao[planIndex].time,
          description: description ?? fallbackStore.planosRefeicao[planIndex].description,
        })
      }

      return { previousMealPlans }
    },

    onError: (err, variables, context) => {
      if (context?.previousMealPlans) {
        queryClient.setQueryData(mealPlanKeys.lists(), context.previousMealPlans)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() })
    },
  })
}

/**
 * Hook para deletar plano de refeição
 */
export function useDeleteMealPlan() {
  const queryClient = useQueryClient()
  const fallbackStore = useAlimentacaoStore()

  return useMutation({
    mutationFn: (id: string) => alimentacaoService.deleteMealPlan(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: mealPlanKeys.lists() })

      const previousMealPlans = queryClient.getQueryData(mealPlanKeys.lists())

      // Update otimista
      queryClient.setQueryData(mealPlanKeys.lists(), (old: any) => {
        if (!old) return old
        return old.filter((plan: any) => plan.id !== id)
      })

      // Fallback para localStorage
      const planIndex = fallbackStore.planosRefeicao.findIndex(p => p.id === id)
      if (planIndex >= 0) {
        fallbackStore.removerPlanoRefeicao(planIndex)
      }

      return { previousMealPlans }
    },

    onError: (err, variables, context) => {
      if (context?.previousMealPlans) {
        queryClient.setQueryData(mealPlanKeys.lists(), context.previousMealPlans)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.lists() })
    },
  })
}

/**
 * Hook para alternar status ativo/inativo de um plano
 */
export function useToggleMealPlan() {
  const updateMealPlan = useUpdateMealPlan()
  
  return {
    mutate: (id: string, currentStatus: boolean) => 
      updateMealPlan.mutate({ id, is_active: !currentStatus }),
    ...updateMealPlan,
  }
}
