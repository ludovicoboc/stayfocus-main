import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useOnlineStatus } from '@/app/lib/hooks/useOnlineStatus'

// Mock do fetch para testes de conectividade
global.fetch = vi.fn()

// Mock do navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
})

// Mock dos eventos de window
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener })
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener })

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigator.onLine = true
    
    // Mock fetch success por padrão
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Detecção inicial de status', () => {
    it('deve detectar status online inicial', () => {
      navigator.onLine = true
      
      const { result } = renderHook(() => useOnlineStatus())
      
      expect(result.current.isOnline).toBe(true)
      expect(result.current.isOffline).toBe(false)
    })

    it('deve detectar status offline inicial', () => {
      navigator.onLine = false
      
      const { result } = renderHook(() => useOnlineStatus())
      
      expect(result.current.isOnline).toBe(false)
      expect(result.current.isOffline).toBe(true)
    })

    it('deve configurar listeners de eventos', () => {
      renderHook(() => useOnlineStatus())
      
      expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })
  })

  describe('Teste de conectividade', () => {
    it('deve detectar boa conexão com baixa latência', async () => {
      const startTime = Date.now()
      ;(global.fetch as any).mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
        })
      })

      const { result } = renderHook(() => useOnlineStatus())

      await act(async () => {
        await result.current.checkConnectivity()
      })

      await waitFor(() => {
        expect(result.current.connectionQuality).toBe('good')
      })
    })

    it('deve detectar conexão lenta com alta latência', async () => {
      ;(global.fetch as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
            })
          }, 1500) // Simular latência alta
        })
      })

      const { result } = renderHook(() => useOnlineStatus())

      await act(async () => {
        await result.current.checkConnectivity()
      })

      await waitFor(() => {
        expect(result.current.connectionQuality).toBe('poor')
      }, { timeout: 3000 })
    })

    it('deve detectar offline quando fetch falha', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useOnlineStatus())

      await act(async () => {
        await result.current.checkConnectivity()
      })

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false)
        expect(result.current.connectionQuality).toBe('offline')
      })
    })
  })

  describe('Eventos de rede', () => {
    it('deve reagir ao evento online', async () => {
      const { result } = renderHook(() => useOnlineStatus())
      
      // Simular evento online
      const onlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'online'
      )?.[1]

      expect(onlineHandler).toBeDefined()

      await act(async () => {
        onlineHandler?.()
      })

      // Deve iniciar verificação de conectividade
      expect(result.current.isConnecting).toBe(true)
    })

    it('deve reagir ao evento offline', async () => {
      const { result } = renderHook(() => useOnlineStatus())
      
      // Simular evento offline
      const offlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1]

      expect(offlineHandler).toBeDefined()

      await act(async () => {
        offlineHandler?.()
      })

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false)
        expect(result.current.connectionQuality).toBe('offline')
      })
    })
  })

  describe('Debounce e retry', () => {
    it('deve fazer debounce de mudanças rápidas', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useOnlineStatus({ debounceMs: 1000 }))

      // Simular múltiplas mudanças rápidas
      const offlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1]

      act(() => {
        offlineHandler?.()
        offlineHandler?.()
        offlineHandler?.()
      })

      // Não deve ter mudado ainda
      expect(result.current.isOnline).toBe(true)

      // Avançar tempo para trigger do debounce
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await vi.runAllTimersAsync()
      })

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false)
      }, { timeout: 2000 })

      vi.useRealTimers()
    })

    it('deve fazer retry em caso de falha', async () => {
      let callCount = 0
      ;(global.fetch as any).mockImplementation(() => {
        callCount++
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({ ok: true, status: 200 })
      })

      const { result } = renderHook(() => useOnlineStatus({ maxRetries: 3 }))

      await act(async () => {
        await result.current.checkConnectivity()
      })

      // Deve ter tentado múltiplas vezes
      expect(callCount).toBeGreaterThan(1)
    })
  })

  describe('Helpers e propriedades calculadas', () => {
    it('deve calcular propriedades helper corretamente', async () => {
      const { result } = renderHook(() => useOnlineStatus())

      await waitFor(() => {
        expect(result.current.hasGoodConnection).toBe(
          result.current.isOnline && result.current.connectionQuality === 'good'
        )
        expect(result.current.hasPoorConnection).toBe(
          result.current.isOnline && result.current.connectionQuality === 'poor'
        )
      })
    })

    it('deve rastrear timestamps de mudanças', async () => {
      const { result } = renderHook(() => useOnlineStatus())
      
      const offlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1]

      const beforeOffline = Date.now()

      await act(async () => {
        offlineHandler?.()
      })

      await waitFor(() => {
        expect(result.current.lastOffline).toBeDefined()
        expect(result.current.lastOffline!.getTime()).toBeGreaterThanOrEqual(beforeOffline)
      })
    })
  })

  describe('Cleanup', () => {
    it('deve limpar listeners ao desmontar', () => {
      const { unmount } = renderHook(() => useOnlineStatus())
      
      unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })
  })
})
