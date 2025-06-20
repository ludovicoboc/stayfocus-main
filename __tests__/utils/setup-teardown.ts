import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '../mocks/server'
import { resetCounters } from '../factories'

// Configurações globais para testes
export const setupTestEnvironment = () => {
  // Configurar timezone para testes consistentes
  process.env.TZ = 'UTC'
  
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  
  // Configurar console para testes (reduzir ruído)
  const originalConsole = { ...console }
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
  
  return originalConsole
}

// Limpeza após cada teste
export const teardownTest = () => {
  // Limpar DOM
  cleanup()
  
  // Limpar todos os mocks
  vi.clearAllMocks()
  vi.clearAllTimers()
  
  // Resetar handlers do MSW
  server.resetHandlers()
  
  // Resetar contadores das factories
  resetCounters()
  
  // Limpar localStorage e sessionStorage
  localStorage.clear()
  sessionStorage.clear()
  
  // Resetar navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  })
  
  // Limpar event listeners
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
  window.removeEventListener('resize', () => {})
}

// Setup para testes de componentes
export const setupComponentTest = () => {
  // Mock de IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
  
  // Mock de ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
  
  // Mock de matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
  
  // Mock de scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  })
  
  // Mock de requestAnimationFrame
  global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0))
  global.cancelAnimationFrame = vi.fn()
}

// Setup para testes de hooks
export const setupHookTest = () => {
  // Configurações específicas para testes de hooks
  vi.useFakeTimers()
  
  return () => {
    vi.useRealTimers()
  }
}

// Setup para testes de integração
export const setupIntegrationTest = () => {
  // Configurar MSW para interceptar todas as requests
  server.listen({
    onUnhandledRequest: 'error',
  })
  
  return () => {
    server.close()
  }
}

// Setup para testes de performance
export const setupPerformanceTest = () => {
  // Mock de performance API
  global.performance = {
    ...global.performance,
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    now: vi.fn(() => Date.now()),
  }
  
  // Mock de PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Utilities para simular condições específicas
export const simulateSlowNetwork = (delay = 2000) => {
  server.use(
    ...server.listHandlers().map(handler => {
      return handler.clone({
        resolver: async (info) => {
          await new Promise(resolve => setTimeout(resolve, delay))
          return handler.resolver(info)
        }
      })
    })
  )
}

export const simulateNetworkError = () => {
  server.use(
    ...server.listHandlers().map(handler => {
      return handler.clone({
        resolver: () => {
          throw new Error('Network Error')
        }
      })
    })
  )
}

export const simulateOfflineMode = () => {
  // Simular navigator.onLine = false
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  })
  
  // Simular falha em todas as requests
  server.use(
    ...server.listHandlers().map(handler => {
      return handler.clone({
        resolver: () => {
          return new Response(null, {
            status: 0,
            statusText: 'Network request failed'
          })
        }
      })
    })
  )
  
  // Disparar evento offline
  window.dispatchEvent(new Event('offline'))
}

export const simulateOnlineMode = () => {
  // Resetar navigator.onLine = true
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  })
  
  // Resetar handlers do MSW
  server.resetHandlers()
  
  // Disparar evento online
  window.dispatchEvent(new Event('online'))
}

// Utilities para aguardar condições específicas
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
) => {
  const startTime = Date.now()
  
  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`)
  }
}

export const waitForNoLoadingElements = async (timeout = 5000) => {
  await waitForCondition(
    () => {
      const loadingElements = document.querySelectorAll(
        '[data-testid*="loading"], [data-testid*="skeleton"], .animate-pulse, .animate-spin'
      )
      return loadingElements.length === 0
    },
    timeout
  )
}

export const waitForErrorElements = async (timeout = 3000) => {
  await waitForCondition(
    () => {
      const errorElements = document.querySelectorAll(
        '[data-testid*="error"], [role="alert"], .text-red-500'
      )
      return errorElements.length > 0
    },
    timeout
  )
}

// Helper para criar dados de teste isolados
export const createIsolatedTestData = () => {
  const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    testId,
    userId: `user-${testId}`,
    hiperfocoId: `hiperfoco-${testId}`,
    tarefaId: `tarefa-${testId}`,
    sessaoId: `sessao-${testId}`,
  }
}

// Helper para debug de testes
export const debugTest = (message: string, data?: any) => {
  if (process.env.DEBUG_TESTS === 'true') {
    console.log(`[TEST DEBUG] ${message}`, data)
  }
}

// Helper para capturar erros de console em testes
export const captureConsoleErrors = () => {
  const errors: string[] = []
  const originalError = console.error
  
  console.error = vi.fn((...args) => {
    errors.push(args.join(' '))
    originalError(...args)
  })
  
  return {
    getErrors: () => [...errors],
    restore: () => {
      console.error = originalError
    },
  }
}
