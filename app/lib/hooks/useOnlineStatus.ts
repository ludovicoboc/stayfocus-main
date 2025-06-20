import { useState, useEffect, useCallback, useRef } from 'react'

export interface OnlineStatus {
  isOnline: boolean
  isConnecting: boolean
  lastOnline: Date | null
  lastOffline: Date | null
  connectionQuality: 'good' | 'poor' | 'offline'
}

interface UseOnlineStatusOptions {
  pingUrl?: string
  pingInterval?: number
  debounceMs?: number
  maxRetries?: number
}

/**
 * Hook para detectar status de conexão com internet
 * 
 * Funcionalidades:
 * - Detecta online/offline usando navigator.onLine
 * - Verifica conectividade real com ping ao servidor
 * - Debounce para evitar mudanças muito frequentes
 * - Retry automático para confirmar mudanças
 * - Qualidade da conexão baseada em latência
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const {
    pingUrl = '/api/ping',
    pingInterval = 30000, // 30 segundos
    debounceMs = 1000, // 1 segundo
    maxRetries = 3
  } = options

  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnecting: false,
    lastOnline: null,
    lastOffline: null,
    connectionQuality: 'good'
  })

  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const pingIntervalRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)

  /**
   * Testa conectividade real fazendo ping ao servidor
   */
  const testConnectivity = useCallback(async (): Promise<{
    isOnline: boolean
    quality: 'good' | 'poor' | 'offline'
    latency?: number
  }> => {
    try {
      const startTime = Date.now()
      
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      })
      
      const latency = Date.now() - startTime
      
      if (response.ok) {
        const quality = latency < 1000 ? 'good' : 'poor'
        return { isOnline: true, quality, latency }
      } else {
        return { isOnline: false, quality: 'offline' }
      }
    } catch (error) {
      // Se falhar, pode ser problema de rede ou servidor offline
      return { isOnline: false, quality: 'offline' }
    }
  }, [pingUrl])

  /**
   * Atualiza o status com debounce
   */
  const updateStatus = useCallback((newIsOnline: boolean, quality?: 'good' | 'poor' | 'offline') => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setStatus(prevStatus => {
        const now = new Date()
        
        return {
          ...prevStatus,
          isOnline: newIsOnline,
          isConnecting: false,
          lastOnline: newIsOnline ? now : prevStatus.lastOnline,
          lastOffline: !newIsOnline ? now : prevStatus.lastOffline,
          connectionQuality: quality || (newIsOnline ? 'good' : 'offline')
        }
      })
      
      retryCountRef.current = 0
    }, debounceMs)
  }, [debounceMs])

  /**
   * Verifica conectividade com retry
   */
  const checkConnectivity = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setStatus(prev => ({ ...prev, isConnecting: true }))
    }

    try {
      const result = await testConnectivity()
      updateStatus(result.isOnline, result.quality)
      
      // Log para debug
      console.log('🌐 Connectivity check:', {
        isOnline: result.isOnline,
        quality: result.quality,
        latency: result.latency,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Connectivity check failed:', error)
      
      // Retry se não excedeu o limite
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(() => checkConnectivity(true), 2000 * retryCountRef.current) // Backoff exponencial
      } else {
        updateStatus(false, 'offline')
      }
    }
  }, [testConnectivity, updateStatus, maxRetries])

  /**
   * Handler para eventos do browser
   */
  const handleOnline = useCallback(() => {
    console.log('🟢 Browser online event')
    checkConnectivity()
  }, [checkConnectivity])

  const handleOffline = useCallback(() => {
    console.log('🔴 Browser offline event')
    updateStatus(false, 'offline')
  }, [updateStatus])

  /**
   * Ping periódico para monitorar qualidade da conexão
   */
  const startPeriodicPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    pingIntervalRef.current = setInterval(() => {
      if (status.isOnline) {
        checkConnectivity()
      }
    }, pingInterval)
  }, [checkConnectivity, pingInterval, status.isOnline])

  // Efeito para configurar listeners e ping inicial
  useEffect(() => {
    // Verificação inicial
    checkConnectivity()

    // Listeners para eventos do browser
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Ping periódico
    startPeriodicPing()

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [handleOnline, handleOffline, checkConnectivity, startPeriodicPing])

  // Atualizar ping periódico quando status muda
  useEffect(() => {
    startPeriodicPing()
  }, [startPeriodicPing])

  return {
    ...status,
    checkConnectivity: () => checkConnectivity(),
    // Helpers úteis
    isOffline: !status.isOnline,
    hasGoodConnection: status.isOnline && status.connectionQuality === 'good',
    hasPoorConnection: status.isOnline && status.connectionQuality === 'poor',
    // Tempo desde última mudança
    timeSinceLastOnline: status.lastOnline ? Date.now() - status.lastOnline.getTime() : null,
    timeSinceLastOffline: status.lastOffline ? Date.now() - status.lastOffline.getTime() : null,
  }
}
