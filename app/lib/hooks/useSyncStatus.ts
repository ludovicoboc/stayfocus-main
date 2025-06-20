import { useState, useEffect, useCallback } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { useOfflineQueue } from './useOfflineQueue'
import { syncManager, SyncConflict, ConflictResolutionStrategy } from '@/app/lib/utils/syncManager'

export interface SyncStatus {
  isOnline: boolean
  isConnecting: boolean
  isSyncing: boolean
  hasPendingOperations: boolean
  hasConflicts: boolean
  lastSyncTime: Date | null
  connectionQuality: 'good' | 'poor' | 'offline'
  pendingCount: number
  conflictCount: number
}

/**
 * Hook central para status de sincronização
 * 
 * Combina:
 * - Status de conexão (useOnlineStatus)
 * - Queue de operações offline (useOfflineQueue)
 * - Conflitos de sincronização (syncManager)
 */
export function useSyncStatus() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const onlineStatus = useOnlineStatus()
  const offlineQueue = useOfflineQueue()

  /**
   * Status consolidado de sincronização
   */
  const syncStatus: SyncStatus = {
    isOnline: onlineStatus.isOnline,
    isConnecting: onlineStatus.isConnecting,
    isSyncing: offlineQueue.isSyncing,
    hasPendingOperations: offlineQueue.hasPendingOperations,
    hasConflicts: conflicts.length > 0,
    lastSyncTime: lastSyncTime || offlineQueue.lastProcessed,
    connectionQuality: onlineStatus.connectionQuality,
    pendingCount: offlineQueue.stats.pending,
    conflictCount: conflicts.length,
  }

  /**
   * Força sincronização manual
   */
  const forceSync = useCallback(async (): Promise<void> => {
    if (!onlineStatus.isOnline || onlineStatus.isConnecting) {
      throw new Error('Cannot sync while offline or connecting')
    }

    try {
      await offlineQueue.processQueue()
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Force sync failed:', error)
      throw error
    }
  }, [onlineStatus.isOnline, onlineStatus.isConnecting, offlineQueue])

  /**
   * Resolve conflito específico
   */
  const resolveConflict = useCallback((
    conflictId: string, 
    strategy: ConflictResolutionStrategy,
    customResolution?: any
  ): boolean => {
    const conflict = conflicts.find(c => c.id === conflictId)
    if (!conflict) {
      return false
    }

    try {
      let resolution: any

      if (strategy === 'manual' && customResolution) {
        resolution = customResolution
      } else {
        const { resolved } = syncManager.resolveConflicts([conflict], strategy)
        resolution = resolved[0]
      }

      if (resolution) {
        // Aplicar resolução (aqui você implementaria a lógica para salvar)
        console.log('Conflict resolved:', { conflictId, strategy, resolution })
        
        // Remover conflito da lista
        syncManager.removeConflict(conflictId)
        return true
      }

      return false
    } catch (error) {
      console.error('Error resolving conflict:', error)
      return false
    }
  }, [conflicts])

  /**
   * Resolve todos os conflitos com estratégia específica
   */
  const resolveAllConflicts = useCallback((strategy: ConflictResolutionStrategy): number => {
    const { resolved } = syncManager.resolveConflicts(conflicts, strategy)
    
    // Aplicar resoluções
    resolved.forEach(resolution => {
      console.log('Bulk conflict resolved:', resolution)
    })

    // Limpar conflitos resolvidos
    syncManager.clearConflicts()
    
    return resolved.length
  }, [conflicts])

  /**
   * Adiciona operação à queue quando offline
   */
  const queueOperation = useCallback((
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'meal_plan' | 'meal_record' | 'hydration_record' | 'recipe',
    data: any
  ): string => {
    return offlineQueue.addToQueue(type, entity, data)
  }, [offlineQueue])

  /**
   * Limpa dados de sincronização
   */
  const clearSyncData = useCallback((): void => {
    offlineQueue.clearAll()
    syncManager.clearConflicts()
    setLastSyncTime(null)
  }, [offlineQueue])

  /**
   * Obtém informações detalhadas sobre operações pendentes
   */
  const getPendingOperations = useCallback(() => {
    return offlineQueue.getOperations()
  }, [offlineQueue])

  /**
   * Obtém informações detalhadas sobre conflitos
   */
  const getConflicts = useCallback(() => {
    return conflicts
  }, [conflicts])

  // Listener para conflitos
  useEffect(() => {
    const unsubscribe = syncManager.addConflictListener(setConflicts)
    return unsubscribe
  }, [])

  // Atualizar último sync quando queue é processada
  useEffect(() => {
    if (offlineQueue.lastProcessed) {
      setLastSyncTime(offlineQueue.lastProcessed)
    }
  }, [offlineQueue.lastProcessed])

  return {
    // Status consolidado
    ...syncStatus,
    
    // Ações
    forceSync,
    resolveConflict,
    resolveAllConflicts,
    queueOperation,
    clearSyncData,
    
    // Dados detalhados
    getPendingOperations,
    getConflicts,
    
    // Status específicos
    canSync: onlineStatus.isOnline && !onlineStatus.isConnecting && !offlineQueue.isSyncing,
    needsAttention: syncStatus.hasConflicts || (syncStatus.hasPendingOperations && onlineStatus.isOnline),
    isFullySynced: !syncStatus.hasPendingOperations && !syncStatus.hasConflicts && onlineStatus.isOnline,
    
    // Helpers para UI
    getSyncStatusText: (): string => {
      if (!onlineStatus.isOnline) return 'Offline'
      if (onlineStatus.isConnecting) return 'Conectando...'
      if (offlineQueue.isSyncing) return 'Sincronizando...'
      if (conflicts.length > 0) return `${conflicts.length} conflito(s)`
      if (offlineQueue.hasPendingOperations) return `${offlineQueue.stats.pending} pendente(s)`
      return 'Sincronizado'
    },
    
    getSyncStatusColor: (): 'green' | 'yellow' | 'red' | 'gray' => {
      if (!onlineStatus.isOnline) return 'gray'
      if (conflicts.length > 0) return 'red'
      if (offlineQueue.hasPendingOperations) return 'yellow'
      return 'green'
    }
  }
}
