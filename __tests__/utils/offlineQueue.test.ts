import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { offlineQueue, QueueOperation } from '@/app/lib/utils/offlineQueue'

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('OfflineQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Limpar queue
    offlineQueue.clear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Adicionar operações', () => {
    it('deve adicionar operação à queue', () => {
      const operationData = {
        type: 'CREATE' as const,
        entity: 'meal_plan' as const,
        data: { time: '08:00', description: 'Café da manhã' },
        maxRetries: 3
      }

      const id = offlineQueue.add(operationData)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')

      const operation = offlineQueue.get(id)
      expect(operation).toBeDefined()
      expect(operation?.type).toBe('CREATE')
      expect(operation?.entity).toBe('meal_plan')
      expect(operation?.status).toBe('pending')
      expect(operation?.retryCount).toBe(0)
    })

    it('deve gerar IDs únicos para operações', () => {
      const id1 = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      const id2 = offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: {},
        maxRetries: 3
      })

      expect(id1).not.toBe(id2)
    })

    it('deve salvar no localStorage ao adicionar', () => {
      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stayfocus-offline-queue',
        expect.any(String)
      )
    })
  })

  describe('Remover operações', () => {
    it('deve remover operação por ID', () => {
      const id = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      const removed = offlineQueue.remove(id)
      expect(removed).toBe(true)

      const operation = offlineQueue.get(id)
      expect(operation).toBeUndefined()
    })

    it('deve retornar false ao tentar remover ID inexistente', () => {
      const removed = offlineQueue.remove('non-existent-id')
      expect(removed).toBe(false)
    })
  })

  describe('Obter operações', () => {
    it('deve obter todas as operações', () => {
      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: {},
        maxRetries: 3
      })

      const all = offlineQueue.getAll()
      expect(all).toHaveLength(2)
    })

    it('deve obter apenas operações pendentes', () => {
      const id1 = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      const id2 = offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: {},
        maxRetries: 3
      })

      // Simular que uma operação foi completada
      const operation1 = offlineQueue.get(id1)!
      operation1.status = 'completed'

      const pending = offlineQueue.getPending()
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe(id2)
    })
  })

  describe('Estatísticas', () => {
    it('deve calcular estatísticas corretamente', () => {
      // Adicionar operações com diferentes status
      const id1 = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      const id2 = offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: {},
        maxRetries: 3
      })

      const id3 = offlineQueue.add({
        type: 'DELETE',
        entity: 'recipe',
        data: {},
        maxRetries: 3
      })

      // Simular diferentes status
      offlineQueue.get(id1)!.status = 'completed'
      offlineQueue.get(id2)!.status = 'failed'
      // id3 permanece 'pending'

      const stats = offlineQueue.getStats()
      expect(stats.total).toBe(3)
      expect(stats.pending).toBe(1)
      expect(stats.completed).toBe(1)
      expect(stats.failed).toBe(1)
      expect(stats.executing).toBe(0)
    })
  })

  describe('Processamento da queue', () => {
    it('deve processar operações pendentes', async () => {
      const executor = vi.fn().mockResolvedValue(undefined)

      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: { time: '08:00', description: 'Café' },
        maxRetries: 3
      })

      offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: { id: '123', description: 'Almoço' },
        maxRetries: 3
      })

      await offlineQueue.process(executor)

      expect(executor).toHaveBeenCalledTimes(2)
      
      // Verificar se operações foram marcadas como completadas
      const stats = offlineQueue.getStats()
      expect(stats.pending).toBe(0)
      expect(stats.completed).toBe(0) // Completadas são limpas automaticamente
    })

    it('deve fazer retry em caso de falha', async () => {
      let callCount = 0
      const executor = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          throw new Error('Network error')
        }
        return Promise.resolve()
      })

      const id = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      await offlineQueue.process(executor)

      const operation = offlineQueue.get(id)
      expect(operation?.retryCount).toBe(1)
      expect(operation?.lastError).toBe('Network error')
    })

    it('deve marcar como failed após esgotar tentativas', async () => {
      const executor = vi.fn().mockRejectedValue(new Error('Persistent error'))

      const id = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 2
      })

      // Processar múltiplas vezes para esgotar tentativas
      await offlineQueue.process(executor)
      await offlineQueue.process(executor)
      await offlineQueue.process(executor)

      const operation = offlineQueue.get(id)
      expect(operation?.status).toBe('failed')
      expect(operation?.retryCount).toBeGreaterThanOrEqual(2)
    })

    it('não deve processar se já estiver processando', async () => {
      const executor = vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 100))
      })

      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      // Iniciar processamento
      const promise1 = offlineQueue.process(executor)
      
      // Tentar processar novamente imediatamente
      const promise2 = offlineQueue.process(executor)

      await Promise.all([promise1, promise2])

      // Executor deve ter sido chamado apenas uma vez
      expect(executor).toHaveBeenCalledTimes(1)
    })
  })

  describe('Limpeza', () => {
    it('deve limpar operações completadas', () => {
      const id1 = offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      const id2 = offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: {},
        maxRetries: 3
      })

      // Marcar uma como completada
      offlineQueue.get(id1)!.status = 'completed'

      const clearedCount = offlineQueue.clearCompleted()
      expect(clearedCount).toBe(1)

      const remaining = offlineQueue.getAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(id2)
    })

    it('deve limpar toda a queue', () => {
      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      offlineQueue.add({
        type: 'UPDATE',
        entity: 'meal_record',
        data: {},
        maxRetries: 3
      })

      offlineQueue.clear()

      const all = offlineQueue.getAll()
      expect(all).toHaveLength(0)
    })
  })

  describe('Listeners', () => {
    it('deve notificar listeners sobre mudanças', () => {
      const listener = vi.fn()
      const unsubscribe = offlineQueue.addListener(listener)

      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 1,
          pending: 1
        })
      )

      unsubscribe()
    })

    it('deve remover listeners corretamente', () => {
      const listener = vi.fn()
      const unsubscribe = offlineQueue.addListener(listener)

      unsubscribe()

      offlineQueue.add({
        type: 'CREATE',
        entity: 'meal_plan',
        data: {},
        maxRetries: 3
      })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Persistência', () => {
    it('deve carregar queue do localStorage na inicialização', async () => {
      const savedQueue = [
        {
          id: 'test-id',
          type: 'CREATE',
          entity: 'meal_plan',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          status: 'pending'
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedQueue))

      // Usar import dinâmico em vez de require
      const { offlineQueue: newQueue } = await import('@/app/lib/utils/offlineQueue')

      const loaded = newQueue.getAll()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].id).toBe('test-id')
    })

    it('deve resetar status "executing" para "pending" ao carregar', async () => {
      const savedQueue = [
        {
          id: 'test-id',
          type: 'CREATE',
          entity: 'meal_plan',
          data: {},
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
          status: 'executing' // Status que deve ser resetado
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedQueue))

      // Usar import dinâmico em vez de require
      const { offlineQueue: newQueue } = await import('@/app/lib/utils/offlineQueue')

      const loaded = newQueue.getAll()
      expect(loaded[0].status).toBe('pending')
    })
  })
})
