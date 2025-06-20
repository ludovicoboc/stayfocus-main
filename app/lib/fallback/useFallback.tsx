/**
 * Hook para gerenciar o sistema de fallback
 * Fornece status de conexão, indicadores visuais e controles de sincronização
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { 
  FallbackProvider, 
  ConnectionStatus, 
  QueuedOperation, 
  FallbackEvent 
} from './FallbackProvider'

// ============================================================================
// TIPOS
// ============================================================================

export interface FallbackStatus {
  isOnline: boolean
  isConnected: boolean
  isInFallback: boolean
  queueCount: number
  lastSync: number | null
  isSyncing: boolean
}

export interface FallbackControls {
  forcSync: () => Promise<void>
  clearQueue: () => void
  retryConnection: () => Promise<boolean>
}

export interface UseFallbackReturn {
  status: FallbackStatus
  controls: FallbackControls
  operations: QueuedOperation[]
  events: FallbackEvent[]
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useFallback(fallbackProvider?: FallbackProvider): UseFallbackReturn {
  const [status, setStatus] = useState<FallbackStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: true,
    isInFallback: false,
    queueCount: 0,
    lastSync: null,
    isSyncing: false,
  })

  const [operations, setOperations] = useState<QueuedOperation[]>([])
  const [events, setEvents] = useState<FallbackEvent[]>([])

  // ========================================
  // ATUALIZAR STATUS
  // ========================================

  const updateStatus = useCallback(() => {
    if (!fallbackProvider) return

    const connectionStatus = fallbackProvider.getConnectionStatus()
    const queueStatus = fallbackProvider.getQueueStatus()

    setStatus(prev => ({
      ...prev,
      isOnline: connectionStatus.isOnline,
      isConnected: connectionStatus.isConnected,
      isInFallback: fallbackProvider.isInFallback(),
      queueCount: queueStatus.count,
    }))

    setOperations(queueStatus.operations)
  }, [fallbackProvider])

  // ========================================
  // CONTROLES
  // ========================================

  const forcSync = useCallback(async () => {
    if (!fallbackProvider) return

    setStatus(prev => ({ ...prev, isSyncing: true }))
    
    try {
      // Forçar sincronização
      await (fallbackProvider as any).syncQueuedOperations()
      setStatus(prev => ({ 
        ...prev, 
        lastSync: Date.now(),
        isSyncing: false 
      }))
    } catch (error) {
      console.error('Erro na sincronização forçada:', error)
      setStatus(prev => ({ ...prev, isSyncing: false }))
    }
  }, [fallbackProvider])

  const clearQueue = useCallback(() => {
    if (!fallbackProvider) return

    // Limpar queue (implementar método no FallbackProvider se necessário)
    localStorage.removeItem('fallback_queue')
    updateStatus()
  }, [fallbackProvider, updateStatus])

  const retryConnection = useCallback(async () => {
    if (!fallbackProvider) return false

    try {
      // Tentar reconectar (implementar método no FallbackProvider se necessário)
      const isConnected = await (fallbackProvider as any).checkConnection()
      updateStatus()
      return isConnected
    } catch (error) {
      console.error('Erro ao tentar reconectar:', error)
      return false
    }
  }, [fallbackProvider, updateStatus])

  // ========================================
  // EFEITOS
  // ========================================

  // Escutar eventos do fallback provider
  useEffect(() => {
    if (!fallbackProvider) return

    const handleEvent = (event: FallbackEvent) => {
      setEvents(prev => [...prev.slice(-9), event]) // Manter últimos 10 eventos

      // Atualizar status baseado no evento
      switch (event.type) {
        case 'connection_lost':
          setStatus(prev => ({ ...prev, isConnected: false }))
          break
        case 'connection_restored':
          setStatus(prev => ({ ...prev, isConnected: true }))
          break
        case 'fallback_activated':
          setStatus(prev => ({ ...prev, isInFallback: true }))
          break
        case 'fallback_deactivated':
          setStatus(prev => ({ ...prev, isInFallback: false }))
          break
        case 'sync_started':
          setStatus(prev => ({ ...prev, isSyncing: true }))
          break
        case 'sync_completed':
          setStatus(prev => ({ 
            ...prev, 
            isSyncing: false, 
            lastSync: Date.now() 
          }))
          break
        case 'sync_failed':
          setStatus(prev => ({ ...prev, isSyncing: false }))
          break
        case 'operation_queued':
          setStatus(prev => ({ ...prev, queueCount: prev.queueCount + 1 }))
          break
      }
    }

    fallbackProvider.addEventListener(handleEvent)
    
    // Atualizar status inicial
    updateStatus()

    return () => {
      fallbackProvider.removeEventListener(handleEvent)
    }
  }, [fallbackProvider, updateStatus])

  // Escutar mudanças na conectividade do navegador
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ========================================
  // RETURN
  // ========================================

  return {
    status,
    controls: {
      forcSync,
      clearQueue,
      retryConnection,
    },
    operations,
    events,
  }
}

// ============================================================================
// HOOKS AUXILIARES
// ============================================================================

/**
 * Hook simples para verificar se está online
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook para verificar se está em modo fallback
 */
export function useIsFallback(fallbackProvider?: FallbackProvider): boolean {
  const [isInFallback, setIsInFallback] = useState(false)

  useEffect(() => {
    if (!fallbackProvider) return

    const handleEvent = (event: FallbackEvent) => {
      if (event.type === 'fallback_activated') {
        setIsInFallback(true)
      } else if (event.type === 'fallback_deactivated') {
        setIsInFallback(false)
      }
    }

    fallbackProvider.addEventListener(handleEvent)
    setIsInFallback(fallbackProvider.isInFallback())

    return () => {
      fallbackProvider.removeEventListener(handleEvent)
    }
  }, [fallbackProvider])

  return isInFallback
}

/**
 * Hook para obter contagem de operações na queue
 */
export function useQueueCount(fallbackProvider?: FallbackProvider): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!fallbackProvider) return

    const handleEvent = (event: FallbackEvent) => {
      if (event.type === 'operation_queued') {
        setCount(prev => prev + 1)
      } else if (event.type === 'sync_completed') {
        setCount(0)
      }
    }

    fallbackProvider.addEventListener(handleEvent)
    setCount(fallbackProvider.getQueueStatus().count)

    return () => {
      fallbackProvider.removeEventListener(handleEvent)
    }
  }, [fallbackProvider])

  return count
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Formata timestamp para exibição
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  if (diff < 60000) { // Menos de 1 minuto
    return 'agora'
  } else if (diff < 3600000) { // Menos de 1 hora
    const minutes = Math.floor(diff / 60000)
    return `${minutes}min atrás`
  } else if (diff < 86400000) { // Menos de 1 dia
    const hours = Math.floor(diff / 3600000)
    return `${hours}h atrás`
  } else {
    return date.toLocaleDateString('pt-BR')
  }
}

/**
 * Obtém ícone baseado no status de conexão
 */
export function getConnectionIcon(status: FallbackStatus): string {
  if (!status.isOnline) return '📡' // Sem internet
  if (!status.isConnected) return '⚠️' // Sem conexão com servidor
  if (status.isInFallback) return '💾' // Modo offline
  if (status.queueCount > 0) return '🔄' // Sincronizando
  return '✅' // Conectado
}

/**
 * Obtém mensagem de status
 */
export function getStatusMessage(status: FallbackStatus): string {
  if (!status.isOnline) {
    return 'Sem conexão com a internet'
  }
  
  if (!status.isConnected) {
    return 'Sem conexão com o servidor'
  }
  
  if (status.isInFallback) {
    return 'Modo offline ativo'
  }
  
  if (status.isSyncing) {
    return 'Sincronizando dados...'
  }
  
  if (status.queueCount > 0) {
    return `${status.queueCount} operação(ões) pendente(s)`
  }
  
  return 'Conectado'
}
