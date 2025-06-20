/**
 * Sistema de Fallback - Exports
 * Centraliza todas as exportações relacionadas ao sistema de fallback
 */

// ============================================================================
// PROVIDER E TIPOS
// ============================================================================

export {
  FallbackProvider,
} from './FallbackProvider'

export type {
  FallbackConfig,
  QueuedOperation,
  ConnectionStatus,
  FallbackEvent,
  FallbackEventListener,
} from './FallbackProvider'

// ============================================================================
// HOOKS
// ============================================================================

export {
  useFallback,
  useIsOnline,
  useIsFallback,
  useQueueCount,
  formatTimestamp,
  getConnectionIcon,
  getStatusMessage,
} from './useFallback'

export type {
  FallbackStatus,
  FallbackControls,
  UseFallbackReturn,
} from './useFallback'

// ============================================================================
// COMPONENTES
// ============================================================================

export {
  ConnectionIndicator,
  ConnectionBadge,
} from './ConnectionIndicator'

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

import { FallbackProvider } from './FallbackProvider'
import { getDataProvider } from '../dataProviders'
import type { FallbackConfig } from './FallbackProvider'

/**
 * Cria um FallbackProvider com o provider principal atual
 */
export function createFallbackProvider(config?: Partial<FallbackConfig>): FallbackProvider {
  const primaryProvider = getDataProvider()
  return new FallbackProvider(primaryProvider, config)
}

// ============================================================================
// CONFIGURAÇÕES PRÉ-DEFINIDAS
// ============================================================================

export const FALLBACK_CONFIGS = {
  // Configuração padrão para produção
  production: {
    enableFallback: true,
    maxRetries: 3,
    retryDelayMs: 2000,
    syncIntervalMs: 60000, // 1 minuto
    enableLogging: false,
  },

  // Configuração para desenvolvimento
  development: {
    enableFallback: true,
    maxRetries: 2,
    retryDelayMs: 1000,
    syncIntervalMs: 30000, // 30 segundos
    enableLogging: true,
  },

  // Configuração para testes
  testing: {
    enableFallback: true,
    maxRetries: 1,
    retryDelayMs: 100,
    syncIntervalMs: 5000, // 5 segundos
    enableLogging: false,
  },

  // Configuração agressiva (sync rápido)
  aggressive: {
    enableFallback: true,
    maxRetries: 5,
    retryDelayMs: 500,
    syncIntervalMs: 10000, // 10 segundos
    enableLogging: true,
  },

  // Configuração conservadora (sync lento)
  conservative: {
    enableFallback: true,
    maxRetries: 2,
    retryDelayMs: 5000,
    syncIntervalMs: 300000, // 5 minutos
    enableLogging: false,
  },
} as const

/**
 * Cria um FallbackProvider com configuração pré-definida
 */
export function createFallbackProviderWithConfig(
  configName: keyof typeof FALLBACK_CONFIGS
): FallbackProvider {
  const config = FALLBACK_CONFIGS[configName]
  return createFallbackProvider(config)
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica se o navegador suporta as APIs necessárias para o fallback
 */
export function isFallbackSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof localStorage !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'onLine' in navigator
  )
}

/**
 * Obtém estatísticas do localStorage usado pelo fallback
 */
export function getFallbackStorageStats(): {
  queueSize: number
  queueSizeBytes: number
  hasQueue: boolean
} {
  try {
    const queueData = localStorage.getItem('fallback_queue')
    const queueSize = queueData ? JSON.parse(queueData).length : 0
    const queueSizeBytes = queueData ? new Blob([queueData]).size : 0

    return {
      queueSize,
      queueSizeBytes,
      hasQueue: !!queueData,
    }
  } catch (error) {
    return {
      queueSize: 0,
      queueSizeBytes: 0,
      hasQueue: false,
    }
  }
}

/**
 * Limpa todos os dados de fallback do localStorage
 */
export function clearFallbackStorage(): void {
  try {
    localStorage.removeItem('fallback_queue')
    localStorage.removeItem('meal_plans')
    localStorage.removeItem('meal_records')
    localStorage.removeItem('hydration_records')
    // Adicionar outros itens conforme necessário
  } catch (error) {
    console.error('Erro ao limpar storage de fallback:', error)
  }
}

/**
 * Exporta dados de fallback para backup
 */
export function exportFallbackData(): {
  timestamp: string
  queue: any[]
  localStorage: Record<string, any>
} {
  const fallbackKeys = [
    'fallback_queue',
    'meal_plans',
    'meal_records',
    'hydration_records',
  ]

  const localStorageData: Record<string, any> = {}
  
  fallbackKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        localStorageData[key] = JSON.parse(data)
      }
    } catch (error) {
      console.warn(`Erro ao exportar ${key}:`, error)
    }
  })

  return {
    timestamp: new Date().toISOString(),
    queue: localStorageData.fallback_queue || [],
    localStorage: localStorageData,
  }
}

/**
 * Importa dados de fallback de um backup
 */
export function importFallbackData(backupData: {
  queue: any[]
  localStorage: Record<string, any>
}): void {
  try {
    Object.entries(backupData.localStorage).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
  } catch (error) {
    console.error('Erro ao importar dados de fallback:', error)
    throw error
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  // Classes
  FallbackProvider,

  // Factory functions
  create: createFallbackProvider,
  createWithConfig: createFallbackProviderWithConfig,

  // Hooks
  useFallback,
  useIsOnline,
  useIsFallback,
  useQueueCount,

  // Componentes
  ConnectionIndicator,
  ConnectionBadge,

  // Utilitários
  isSupported: isFallbackSupported,
  getStorageStats: getFallbackStorageStats,
  clearStorage: clearFallbackStorage,
  exportData: exportFallbackData,
  importData: importFallbackData,

  // Configurações
  configs: FALLBACK_CONFIGS,

  // Utilitários de formatação
  formatTimestamp,
  getConnectionIcon,
  getStatusMessage,
}
