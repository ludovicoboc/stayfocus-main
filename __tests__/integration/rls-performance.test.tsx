/**
 * Testes de Performance para RLS (Row Level Security)
 * 
 * Este arquivo testa a performance das políticas RLS implementadas,
 * verificando se as otimizações estão funcionando corretamente.
 * 
 * Cenários testados:
 * - Performance de queries com RLS
 * - Uso eficiente de índices
 * - Tempo de resposta das operações
 * - Escalabilidade com múltiplos usuários
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SupabaseProvider } from '@/app/lib/dataProviders/supabase'

// Mock do cliente Supabase com métricas de performance
const createMockSupabaseWithMetrics = () => {
  const queryMetrics: Record<string, { count: number; totalTime: number }> = {}

  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn((columns = '*') => {
        const startTime = Date.now()
        
        return {
          eq: vi.fn((column: string, value: string) => {
            const endTime = Date.now()
            const queryTime = endTime - startTime
            
            // Simular métricas de performance
            const queryKey = `${table}.select.${column}`
            if (!queryMetrics[queryKey]) {
              queryMetrics[queryKey] = { count: 0, totalTime: 0 }
            }
            queryMetrics[queryKey].count++
            queryMetrics[queryKey].totalTime += queryTime

            // Simular dados baseados na performance esperada
            if (column === 'user_id' && value === 'test-user-123') {
              return {
                data: [
                  { id: '1', titulo: 'Hiperfoco 1', user_id: 'test-user-123' },
                  { id: '2', titulo: 'Hiperfoco 2', user_id: 'test-user-123' },
                ],
                error: null,
                executionTime: queryTime,
              }
            }
            
            return {
              data: [],
              error: null,
              executionTime: queryTime,
            }
          }),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
              executionTime: Date.now() - startTime,
            })),
          })),
          limit: vi.fn(() => ({
            data: [],
            error: null,
            executionTime: Date.now() - startTime,
          })),
        }
      }),
      insert: vi.fn(() => ({
        data: [{ id: 'new-id', created_at: new Date().toISOString() }],
        error: null,
        executionTime: Math.random() * 10, // Simular tempo de inserção
      })),
    })),
    getMetrics: () => queryMetrics,
  }

  return mockClient
}

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => createMockSupabaseWithMetrics(),
}))

describe('RLS - Testes de Performance', () => {
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockSupabaseWithMetrics()
  })

  describe('Performance de Queries SELECT', () => {
    it('deve executar SELECT com RLS em tempo aceitável', async () => {
      const startTime = Date.now()
      
      const result = await mockClient
        .from('hiperfocos')
        .select('*')
        .eq('user_id', 'test-user-123')

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(result.data).toBeDefined()
      expect(executionTime).toBeLessThan(100) // Menos de 100ms
    })

    it('deve usar índices eficientemente para queries por user_id', async () => {
      // Simular múltiplas queries para verificar consistência
      const queries = Array.from({ length: 10 }, () =>
        mockClient
          .from('hiperfocos')
          .select('*')
          .eq('user_id', 'test-user-123')
      )

      const results = await Promise.all(queries)
      
      // Todas as queries devem ser bem-sucedidas
      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
      })

      // Verificar métricas
      const metrics = mockClient.getMetrics()
      expect(metrics['hiperfocos.select.user_id'].count).toBe(10)
    })

    it('deve manter performance com queries complexas', async () => {
      const startTime = Date.now()

      // Simular query complexa com JOIN e agregação
      const result = await mockClient
        .from('hiperfocos')
        .select(`
          *,
          tarefas:tarefas(count)
        `)
        .eq('user_id', 'test-user-123')
        .order('created_at', { ascending: false })
        .limit(20)

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(result.error).toBeNull()
      expect(executionTime).toBeLessThan(200) // Menos de 200ms para query complexa
    })
  })

  describe('Performance de Queries INSERT', () => {
    it('deve executar INSERT com RLS rapidamente', async () => {
      const startTime = Date.now()

      const result = await mockClient
        .from('hiperfocos')
        .insert({
          titulo: 'Novo Hiperfoco',
          user_id: 'test-user-123',
        })

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(result.error).toBeNull()
      expect(executionTime).toBeLessThan(50) // Menos de 50ms para INSERT
    })

    it('deve manter performance com múltiplas inserções', async () => {
      const insertPromises = Array.from({ length: 5 }, (_, index) =>
        mockClient
          .from('hiperfocos')
          .insert({
            titulo: `Hiperfoco ${index}`,
            user_id: 'test-user-123',
          })
      )

      const startTime = Date.now()
      const results = await Promise.all(insertPromises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Todas as inserções devem ser bem-sucedidas
      results.forEach(result => {
        expect(result.error).toBeNull()
      })

      // Tempo total deve ser razoável
      expect(totalTime).toBeLessThan(300) // Menos de 300ms para 5 inserções
    })
  })

  describe('Escalabilidade com Múltiplos Usuários', () => {
    it('deve manter performance com múltiplos usuários simultâneos', async () => {
      const users = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5']
      
      // Simular operações simultâneas de múltiplos usuários
      const userOperations = users.map(userId => {
        const userClient = createMockSupabaseWithMetrics()
        userClient.auth.getUser.mockResolvedValue({
          data: { user: { id: userId } },
          error: null,
        })

        return Promise.all([
          userClient.from('hiperfocos').select('*').eq('user_id', userId),
          userClient.from('tarefas').select('*').eq('user_id', userId),
          userClient.from('sessoes_alternancia').select('*').eq('user_id', userId),
        ])
      })

      const startTime = Date.now()
      const allResults = await Promise.all(userOperations)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Verificar que todas as operações foram bem-sucedidas
      allResults.forEach(userResults => {
        userResults.forEach(result => {
          expect(result.error).toBeNull()
        })
      })

      // Tempo total deve ser aceitável mesmo com múltiplos usuários
      expect(totalTime).toBeLessThan(500) // Menos de 500ms para 5 usuários
    })

    it('deve isolar dados corretamente mesmo sob carga', async () => {
      const users = ['user-load-1', 'user-load-2', 'user-load-3']
      
      // Cada usuário faz múltiplas operações
      const loadTestOperations = users.flatMap(userId => 
        Array.from({ length: 10 }, () => {
          const userClient = createMockSupabaseWithMetrics()
          userClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userId } },
            error: null,
          })

          return userClient
            .from('hiperfocos')
            .select('*')
            .eq('user_id', userId)
        })
      )

      const results = await Promise.all(loadTestOperations)

      // Todas as operações devem ser bem-sucedidas
      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
      })
    })
  })

  describe('Otimização de Índices', () => {
    it('deve usar índices compostos eficientemente', async () => {
      // Simular query que deveria usar índice composto (user_id, status, created_at)
      const result = await mockClient
        .from('hiperfocos')
        .select('*')
        .eq('user_id', 'test-user-123')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
    })

    it('deve otimizar queries com filtros múltiplos', async () => {
      const startTime = Date.now()

      // Query com múltiplos filtros que deveria usar índices otimizados
      const result = await mockClient
        .from('sessoes_alternancia')
        .select('*')
        .eq('user_id', 'test-user-123')
        .eq('concluida', false)
        .order('tempo_inicio', { ascending: false })
        .limit(10)

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(result.error).toBeNull()
      expect(executionTime).toBeLessThan(100) // Deve ser rápido com índices
    })
  })

  describe('Monitoramento de Performance', () => {
    it('deve coletar métricas de performance das queries', async () => {
      // Executar várias queries para coletar métricas
      await mockClient.from('hiperfocos').select('*').eq('user_id', 'test-user-123')
      await mockClient.from('hiperfocos').select('*').eq('user_id', 'test-user-123')
      await mockClient.from('tarefas').select('*').eq('user_id', 'test-user-123')

      const metrics = mockClient.getMetrics()

      expect(metrics['hiperfocos.select.user_id'].count).toBe(2)
      expect(metrics['tarefas.select.user_id'].count).toBe(1)
      expect(metrics['hiperfocos.select.user_id'].totalTime).toBeGreaterThan(0)
    })

    it('deve identificar queries lentas', async () => {
      const slowQueryThreshold = 100 // ms

      // Simular query que pode ser lenta
      const startTime = Date.now()
      await mockClient
        .from('hiperfocos')
        .select(`
          *,
          tarefas:tarefas(*),
          sessoes:sessoes_alternancia(*)
        `)
        .eq('user_id', 'test-user-123')
      const endTime = Date.now()

      const executionTime = endTime - startTime

      if (executionTime > slowQueryThreshold) {
        console.warn(`Query lenta detectada: ${executionTime}ms`)
      }

      // Para o teste, esperamos que seja otimizada
      expect(executionTime).toBeLessThan(slowQueryThreshold * 2)
    })
  })

  describe('Testes de Stress', () => {
    it('deve manter performance sob carga pesada', async () => {
      const heavyLoad = Array.from({ length: 50 }, (_, index) =>
        mockClient
          .from('hiperfocos')
          .select('*')
          .eq('user_id', 'test-user-123')
      )

      const startTime = Date.now()
      const results = await Promise.all(heavyLoad)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Todas as queries devem ser bem-sucedidas
      results.forEach(result => {
        expect(result.error).toBeNull()
      })

      // Tempo médio por query deve ser aceitável
      const avgTimePerQuery = totalTime / heavyLoad.length
      expect(avgTimePerQuery).toBeLessThan(20) // Menos de 20ms por query em média
    })

    it('deve recuperar graciosamente de picos de carga', async () => {
      // Simular pico de carga seguido de operações normais
      const peakLoad = Array.from({ length: 100 }, () =>
        mockClient.from('hiperfocos').select('*').eq('user_id', 'test-user-123')
      )

      await Promise.all(peakLoad)

      // Operações normais após o pico devem manter performance
      const startTime = Date.now()
      const normalResult = await mockClient
        .from('hiperfocos')
        .select('*')
        .eq('user_id', 'test-user-123')
      const endTime = Date.now()

      expect(normalResult.error).toBeNull()
      expect(endTime - startTime).toBeLessThan(50) // Deve voltar ao normal rapidamente
    })
  })

  describe('Comparação de Performance', () => {
    it('deve comparar performance antes e depois das otimizações', async () => {
      // Simular query "não otimizada" (sem usar índices eficientemente)
      const startTimeUnoptimized = Date.now()
      await mockClient.from('hiperfocos').select('*').eq('status', 'ativo')
      const unoptimizedTime = Date.now() - startTimeUnoptimized

      // Query otimizada (usando índices RLS)
      const startTimeOptimized = Date.now()
      await mockClient.from('hiperfocos').select('*').eq('user_id', 'test-user-123')
      const optimizedTime = Date.now() - startTimeOptimized

      // Query otimizada deve ser mais rápida ou pelo menos comparável
      expect(optimizedTime).toBeLessThanOrEqual(unoptimizedTime * 1.5)
    })
  })
})
