import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { offlineQueue, QueueOperation, QueueStats } from '@/app/lib/utils/offlineQueue'
import { alimentacaoService } from '@/app/lib/services/alimentacao'
import { useOnlineStatus } from './useOnlineStatus'

/**
 * Hook para gerenciar queue de operações offline
 * 
 * Funcionalidades:
 * - Monitora estatísticas da queue
 * - Executa queue automaticamente quando online
 * - Integra com React Query para invalidação
 * - Fornece métodos para manipular queue
 */
export function useOfflineQueue() {
  const [stats, setStats] = useState<QueueStats>(offlineQueue.getStats())
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null)
  
  const queryClient = useQueryClient()
  const { isOnline, isConnecting } = useOnlineStatus()

  /**
   * Executa uma operação da queue
   */
  const executeOperation = useCallback(async (operation: QueueOperation): Promise<void> => {
    const { type, entity, data } = operation

    switch (entity) {
      case 'meal_plan':
        switch (type) {
          case 'CREATE':
            await alimentacaoService.createMealPlan(data.time, data.description)
            break
          case 'UPDATE':
            await alimentacaoService.updateMealPlan(data.id, data)
            break
          case 'DELETE':
            await alimentacaoService.deleteMealPlan(data.id)
            break
        }
        break

      case 'meal_record':
        switch (type) {
          case 'CREATE':
            await alimentacaoService.createMealRecord(
              data.date, 
              data.time, 
              data.description, 
              data.meal_type, 
              data.photo_url
            )
            break
          case 'UPDATE':
            await alimentacaoService.updateMealRecord(data.id, data)
            break
          case 'DELETE':
            await alimentacaoService.deleteMealRecord(data.id)
            break
        }
        break

      case 'hydration_record':
        switch (type) {
          case 'CREATE':
            await alimentacaoService.createHydrationRecord(
              data.amount_ml, 
              data.date, 
              data.time
            )
            break
          case 'DELETE':
            await alimentacaoService.deleteHydrationRecord(data.id)
            break
        }
        break

      case 'recipe':
        switch (type) {
          case 'CREATE':
            await alimentacaoService.createRecipe(data)
            break
          case 'UPDATE':
            await alimentacaoService.updateRecipe(data.id, data)
            break
          case 'DELETE':
            await alimentacaoService.deleteRecipe(data.id)
            break
        }
        break

      default:
        throw new Error(`Unknown entity: ${entity}`)
    }
  }, [])

  /**
   * Processa toda a queue
   */
  const processQueue = useCallback(async (): Promise<void> => {
    if (isProcessing || !isOnline || isConnecting) {
      return
    }

    setIsProcessing(true)
    
    try {
      await offlineQueue.process(executeOperation)
      setLastProcessed(new Date())
      
      // Invalidar todas as queries para refetch dados atualizados
      await queryClient.invalidateQueries()
      
      console.log('🔄 Cache invalidated after queue processing')
      
    } catch (error) {
      console.error('❌ Error processing offline queue:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, isOnline, isConnecting, executeOperation, queryClient])

  /**
   * Adiciona operação à queue
   */
  const addToQueue = useCallback((
    type: QueueOperation['type'],
    entity: QueueOperation['entity'],
    data: any,
    maxRetries = 3
  ): string => {
    return offlineQueue.add({
      type,
      entity,
      data,
      maxRetries
    })
  }, [])

  /**
   * Remove operação da queue
   */
  const removeFromQueue = useCallback((id: string): boolean => {
    return offlineQueue.remove(id)
  }, [])

  /**
   * Limpa operações completadas
   */
  const clearCompleted = useCallback((): number => {
    return offlineQueue.clearCompleted()
  }, [])

  /**
   * Limpa toda a queue
   */
  const clearAll = useCallback((): void => {
    offlineQueue.clear()
  }, [])

  /**
   * Obtém todas as operações
   */
  const getOperations = useCallback((): QueueOperation[] => {
    return offlineQueue.getAll()
  }, [])

  // Listener para mudanças na queue
  useEffect(() => {
    const unsubscribe = offlineQueue.addListener(setStats)
    return unsubscribe
  }, [])

  // Processar queue automaticamente quando voltar online
  useEffect(() => {
    if (isOnline && !isConnecting && stats.pending > 0) {
      console.log('🌐 Back online! Processing pending operations...')
      processQueue()
    }
  }, [isOnline, isConnecting, stats.pending, processQueue])

  return {
    // Estado
    stats,
    isProcessing,
    lastProcessed,
    
    // Ações
    processQueue,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    clearAll,
    getOperations,
    
    // Helpers
    hasPendingOperations: stats.pending > 0,
    hasFailedOperations: stats.failed > 0,
    isEmpty: stats.total === 0,
    
    // Status de sincronização
    isSyncing: isProcessing,
    canSync: isOnline && !isConnecting && stats.pending > 0,
    needsSync: stats.pending > 0 || stats.failed > 0,
  }
}
