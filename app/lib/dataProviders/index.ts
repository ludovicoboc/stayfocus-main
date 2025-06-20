/**
 * Factory de Data Providers - Arquitetura Dual-Track
 * Seleciona automaticamente o provider baseado no ambiente e configurações
 */

import { DataProvider } from './types'
import { SupabaseProvider } from './supabase'
import { FastAPIProvider } from './fastapi'

// ============================================================================
// TIPOS E CONFIGURAÇÕES
// ============================================================================

export type ProviderType = 'supabase' | 'fastapi' | 'auto'

export interface ProviderConfig {
  type?: ProviderType
  fastApiConfig?: {
    enableDelays?: boolean
    delayMs?: number
    simulateErrors?: boolean
    errorRate?: number
    enableLogging?: boolean
  }
}

// ============================================================================
// DETECÇÃO DE AMBIENTE
// ============================================================================

/**
 * Detecta qual provider deve ser usado baseado no ambiente e configurações
 */
function detectProvider(): ProviderType {
  // 1. Verificar variável de ambiente específica
  const envProvider = process.env.NEXT_PUBLIC_DATA_PROVIDER as ProviderType
  if (envProvider && ['supabase', 'fastapi'].includes(envProvider)) {
    return envProvider
  }

  // 2. Verificar se está em produção
  if (process.env.NODE_ENV === 'production') {
    return 'supabase'
  }

  // 3. Verificar se as variáveis do Supabase estão configuradas
  const hasSupabaseConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // 4. Verificar se deve forçar o uso do Supabase
  const forceSupabase = process.env.NEXT_PUBLIC_FORCE_SUPABASE === 'true'

  if (forceSupabase && hasSupabaseConfig) {
    return 'supabase'
  }

  // 5. Em desenvolvimento, preferir FastAPI para TDD
  if (process.env.NODE_ENV === 'development') {
    return 'fastapi'
  }

  // 6. Fallback para Supabase se configurado, senão FastAPI
  return hasSupabaseConfig ? 'supabase' : 'fastapi'
}

// ============================================================================
// FACTORY PRINCIPAL
// ============================================================================

let cachedProvider: DataProvider | null = null

/**
 * Cria e retorna uma instância do DataProvider apropriado
 * @param config Configurações opcionais para o provider
 * @returns Instância do DataProvider
 */
export function createDataProvider(config: ProviderConfig = {}): DataProvider {
  // Se já existe um provider em cache e não há configuração específica, reutilizar
  if (cachedProvider && config.type !== 'fastapi' && config.type !== 'supabase') {
    return cachedProvider
  }

  const providerType = config.type === 'auto' ? detectProvider() : (config.type || detectProvider())

  let provider: DataProvider

  switch (providerType) {
    case 'supabase':
      try {
        provider = new SupabaseProvider()
        console.log('🟢 [DataProvider] Usando SupabaseProvider (produção)')
      } catch (error) {
        console.warn('⚠️ [DataProvider] Erro ao criar SupabaseProvider, fallback para FastAPI:', error)
        provider = new FastAPIProvider(config.fastApiConfig)
        console.log('🟡 [DataProvider] Usando FastAPIProvider (fallback)')
      }
      break

    case 'fastapi':
      provider = new FastAPIProvider(config.fastApiConfig)
      console.log('🔵 [DataProvider] Usando FastAPIProvider (desenvolvimento/TDD)')
      break

    default:
      throw new Error(`Provider type não suportado: ${providerType}`)
  }

  // Cache apenas se não for uma configuração específica
  if (!config.type || config.type === 'auto') {
    cachedProvider = provider
  }

  return provider
}

/**
 * Obtém o provider padrão (singleton)
 * @returns Instância singleton do DataProvider
 */
export function getDataProvider(): DataProvider {
  return createDataProvider()
}

/**
 * Força a recriação do provider (útil para testes)
 */
export function resetDataProvider(): void {
  cachedProvider = null
}

/**
 * Cria um provider específico para testes
 * @param type Tipo do provider
 * @param config Configurações específicas
 * @returns Nova instância do provider
 */
export function createTestProvider(
  type: 'supabase' | 'fastapi',
  config?: ProviderConfig['fastApiConfig']
): DataProvider {
  switch (type) {
    case 'supabase':
      return new SupabaseProvider()
    case 'fastapi':
      return new FastAPIProvider(config)
    default:
      throw new Error(`Provider type não suportado para testes: ${type}`)
  }
}

// ============================================================================
// UTILITÁRIOS DE DIAGNÓSTICO
// ============================================================================

/**
 * Retorna informações sobre o provider atual
 */
export function getProviderInfo(): {
  type: string
  environment: string
  hasSupabaseConfig: boolean
  configuredProvider: ProviderType
} {
  const hasSupabaseConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return {
    type: cachedProvider?.constructor.name || 'Nenhum provider criado',
    environment: process.env.NODE_ENV || 'unknown',
    hasSupabaseConfig,
    configuredProvider: detectProvider(),
  }
}

/**
 * Testa a conectividade do provider atual
 */
export async function testProviderConnection(): Promise<{
  success: boolean
  provider: string
  error?: string
}> {
  try {
    const provider = getDataProvider()
    const providerName = provider.constructor.name

    // Teste básico: tentar obter usuário atual
    await provider.getCurrentUser()

    return {
      success: true,
      provider: providerName,
    }
  } catch (error) {
    return {
      success: false,
      provider: cachedProvider?.constructor.name || 'unknown',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// ============================================================================
// CONFIGURAÇÕES ESPECÍFICAS PARA DESENVOLVIMENTO
// ============================================================================

/**
 * Configurações pré-definidas para diferentes cenários de desenvolvimento
 */
export const DEV_CONFIGS = {
  // TDD com respostas rápidas
  tdd: {
    type: 'fastapi' as const,
    fastApiConfig: {
      enableDelays: false,
      simulateErrors: false,
      enableLogging: false,
    },
  },

  // Desenvolvimento com simulação realista
  realistic: {
    type: 'fastapi' as const,
    fastApiConfig: {
      enableDelays: true,
      delayMs: 800,
      simulateErrors: false,
      enableLogging: true,
    },
  },

  // Teste de edge cases
  edgeCases: {
    type: 'fastapi' as const,
    fastApiConfig: {
      enableDelays: true,
      delayMs: 1500,
      simulateErrors: true,
      errorRate: 0.3,
      enableLogging: true,
    },
  },

  // Produção local (usando Supabase)
  production: {
    type: 'supabase' as const,
  },
} as const

/**
 * Cria um provider com configuração pré-definida
 */
export function createDevProvider(configName: keyof typeof DEV_CONFIGS): DataProvider {
  const config = DEV_CONFIGS[configName]
  return createDataProvider(config)
}

// ============================================================================
// EXPORTS
// ============================================================================

// Re-exportar tipos e providers para conveniência
export type { DataProvider, ProviderConfig }
export { SupabaseProvider, FastAPIProvider }

// Export padrão é a factory principal
export default {
  create: createDataProvider,
  get: getDataProvider,
  reset: resetDataProvider,
  test: testProviderConnection,
  info: getProviderInfo,
  createTest: createTestProvider,
  createDev: createDevProvider,
  configs: DEV_CONFIGS,
}

// ============================================================================
// INICIALIZAÇÃO AUTOMÁTICA EM DESENVOLVIMENTO
// ============================================================================

// Função para mostrar informações do provider (chamada manualmente quando necessário)
export function logProviderInfo(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const info = getProviderInfo()
    console.group('🔧 [DataProvider] Informações do Sistema')
    console.log('Provider detectado:', info.configuredProvider)
    console.log('Ambiente:', info.environment)
    console.log('Supabase configurado:', info.hasSupabaseConfig ? '✅' : '❌')
    console.log('Provider ativo:', info.type)
    console.groupEnd()
  }
}
