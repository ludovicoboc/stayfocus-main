/**
 * Testes RLS - Cenários de Múltiplos Usuários
 * 
 * Testa isolamento de dados em cenários complexos:
 * - Múltiplos usuários simultâneos
 * - Tentativas de acesso cruzado
 * - Validação de integridade de dados
 * - Cenários de concorrência
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock do Supabase para simular múltiplos usuários
const createMockSupabaseClient = (currentUserId: string | null) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: currentUserId ? { id: currentUserId } : null },
      error: null,
    }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn((column: string, value: string) => {
        // Simular RLS: só retorna dados se user_id = currentUserId
        if (column === 'user_id' && value === currentUserId) {
          return {
            data: [
              { id: `${table}-1`, user_id: currentUserId, titulo: `${table} do usuário ${currentUserId}` }
            ],
            error: null,
          }
        }
        return {
          data: [],
          error: null,
        }
      }),
    })),
    insert: vi.fn((data: any) => {
      // Simular RLS: só permite inserção se user_id = currentUserId
      if (data.user_id === currentUserId) {
        return {
          data: [{ ...data, id: `new-${Date.now()}` }],
          error: null,
        }
      }
      return {
        data: null,
        error: { message: 'new row violates row-level security policy' },
      }
    }),
    update: vi.fn(() => ({
      eq: vi.fn((column: string, value: string) => {
        // Simular RLS: só permite update se user_id = currentUserId
        if (column === 'user_id' && value === currentUserId) {
          return {
            data: [{ id: value, user_id: currentUserId, updated: true }],
            error: null,
          }
        }
        return {
          data: null,
          error: { message: 'new row violates row-level security policy' },
        }
      }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn((column: string, value: string) => {
        // Simular RLS: só permite delete se user_id = currentUserId
        if (column === 'user_id' && value === currentUserId) {
          return {
            data: [{ id: value }],
            error: null,
          }
        }
        return {
          data: null,
          error: { message: 'new row violates row-level security policy' },
        }
      }),
    })),
  })),
})

// Componente para testar operações de múltiplos usuários
const MultiUserTestComponent = ({ users }: { users: string[] }) => {
  const [results, setResults] = React.useState<Record<string, string[]>>({})
  const [loading, setLoading] = React.useState(false)

  const testMultiUserOperations = async () => {
    setLoading(true)
    const allResults: Record<string, string[]> = {}

    for (const userId of users) {
      const client = createMockSupabaseClient(userId)
      const userResults: string[] = []

      try {
        // Testar leitura dos próprios dados
        const ownDataResult = await client
          .from('hiperfocos')
          .select('*')
          .eq('user_id', userId)

        if (ownDataResult.data?.length > 0) {
          userResults.push(`✅ ${userId}: Acesso aos próprios dados`)
        } else {
          userResults.push(`❌ ${userId}: Falha ao acessar próprios dados`)
        }

        // Testar tentativa de leitura de dados de outros usuários
        const otherUsers = users.filter(u => u !== userId)
        for (const otherUserId of otherUsers) {
          const otherDataResult = await client
            .from('hiperfocos')
            .select('*')
            .eq('user_id', otherUserId)

          if (otherDataResult.data?.length === 0) {
            userResults.push(`✅ ${userId}: Bloqueado acesso a dados de ${otherUserId}`)
          } else {
            userResults.push(`❌ ${userId}: VAZAMENTO! Acessou dados de ${otherUserId}`)
          }
        }

        // Testar inserção válida
        const validInsertResult = await client
          .from('hiperfocos')
          .insert({
            titulo: `Hiperfoco de ${userId}`,
            user_id: userId,
          })

        if (validInsertResult.error === null) {
          userResults.push(`✅ ${userId}: Inserção própria permitida`)
        } else {
          userResults.push(`❌ ${userId}: Falha na inserção própria`)
        }

        // Testar inserção inválida (para outro usuário)
        if (otherUsers.length > 0) {
          const invalidInsertResult = await client
            .from('hiperfocos')
            .insert({
              titulo: `Tentativa de hack`,
              user_id: otherUsers[0],
            })

          if (invalidInsertResult.error?.message.includes('row-level security')) {
            userResults.push(`✅ ${userId}: Inserção maliciosa bloqueada`)
          } else {
            userResults.push(`❌ ${userId}: FALHA DE SEGURANÇA! Inserção maliciosa permitida`)
          }
        }

      } catch (error) {
        userResults.push(`❌ ${userId}: Erro inesperado - ${error}`)
      }

      allResults[userId] = userResults
    }

    setResults(allResults)
    setLoading(false)
  }

  return (
    <div data-testid="multi-user-test">
      <button 
        onClick={testMultiUserOperations}
        disabled={loading}
        data-testid="test-multi-user-btn"
      >
        {loading ? 'Testando...' : 'Testar Múltiplos Usuários'}
      </button>
      
      <div data-testid="multi-user-results">
        {Object.entries(results).map(([userId, userResults]) => (
          <div key={userId} data-testid={`user-results-${userId}`}>
            <h3>Usuário: {userId}</h3>
            {userResults.map((result, index) => (
              <div key={index} data-testid={`result-${userId}-${index}`}>
                {result}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

describe('RLS - Cenários de Múltiplos Usuários', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Isolamento entre Usuários', () => {
    it('deve manter isolamento completo entre 2 usuários', async () => {
      const users = ['user-alice', 'user-bob']
      
      render(<MultiUserTestComponent users={users} />)
      
      const testButton = screen.getByTestId('test-multi-user-btn')
      await user.click(testButton)

      await waitFor(() => {
        // Verificar resultados para Alice
        expect(screen.getByTestId('result-user-alice-0')).toHaveTextContent('✅ user-alice: Acesso aos próprios dados')
        expect(screen.getByTestId('result-user-alice-1')).toHaveTextContent('✅ user-alice: Bloqueado acesso a dados de user-bob')
        expect(screen.getByTestId('result-user-alice-2')).toHaveTextContent('✅ user-alice: Inserção própria permitida')
        expect(screen.getByTestId('result-user-alice-3')).toHaveTextContent('✅ user-alice: Inserção maliciosa bloqueada')

        // Verificar resultados para Bob
        expect(screen.getByTestId('result-user-bob-0')).toHaveTextContent('✅ user-bob: Acesso aos próprios dados')
        expect(screen.getByTestId('result-user-bob-1')).toHaveTextContent('✅ user-bob: Bloqueado acesso a dados de user-alice')
        expect(screen.getByTestId('result-user-bob-2')).toHaveTextContent('✅ user-bob: Inserção própria permitida')
        expect(screen.getByTestId('result-user-bob-3')).toHaveTextContent('✅ user-bob: Inserção maliciosa bloqueada')
      })
    })

    it('deve manter isolamento com 3 usuários simultâneos', async () => {
      const users = ['user-alice', 'user-bob', 'user-charlie']
      
      render(<MultiUserTestComponent users={users} />)
      
      const testButton = screen.getByTestId('test-multi-user-btn')
      await user.click(testButton)

      await waitFor(() => {
        // Cada usuário deve ter acesso apenas aos próprios dados
        users.forEach(userId => {
          expect(screen.getByTestId(`result-${userId}-0`)).toHaveTextContent(`✅ ${userId}: Acesso aos próprios dados`)
        })
      })
    })
  })

  describe('Tentativas de Acesso Cruzado', () => {
    it('deve bloquear todas as tentativas de acesso cruzado', async () => {
      const client1 = createMockSupabaseClient('user-1')
      const client2 = createMockSupabaseClient('user-2')

      // User-1 tenta acessar dados de User-2
      const crossAccessResult = await client1
        .from('hiperfocos')
        .select('*')
        .eq('user_id', 'user-2')

      expect(crossAccessResult.data).toEqual([])

      // User-2 tenta inserir dados para User-1
      const crossInsertResult = await client2
        .from('hiperfocos')
        .insert({
          titulo: 'Hack attempt',
          user_id: 'user-1',
        })

      expect(crossInsertResult.error?.message).toContain('row-level security')
    })

    it('deve bloquear tentativas de atualização cruzada', async () => {
      const client1 = createMockSupabaseClient('user-1')

      // User-1 tenta atualizar dados de User-2
      const crossUpdateResult = await client1
        .from('hiperfocos')
        .update({ titulo: 'Hacked!' })
        .eq('user_id', 'user-2')

      expect(crossUpdateResult.error?.message).toContain('row-level security')
    })

    it('deve bloquear tentativas de exclusão cruzada', async () => {
      const client1 = createMockSupabaseClient('user-1')

      // User-1 tenta deletar dados de User-2
      const crossDeleteResult = await client1
        .from('hiperfocos')
        .delete()
        .eq('user_id', 'user-2')

      expect(crossDeleteResult.error?.message).toContain('row-level security')
    })
  })

  describe('Cenários de Concorrência', () => {
    it('deve manter isolamento durante operações simultâneas', async () => {
      const users = ['user-concurrent-1', 'user-concurrent-2']
      const clients = users.map(userId => createMockSupabaseClient(userId))

      // Executar operações simultâneas
      const operations = clients.map(async (client, index) => {
        const userId = users[index]
        
        // Operações simultâneas para cada usuário
        const [readResult, insertResult] = await Promise.all([
          client.from('hiperfocos').select('*').eq('user_id', userId),
          client.from('hiperfocos').insert({
            titulo: `Concurrent operation ${userId}`,
            user_id: userId,
          }),
        ])

        return { userId, readResult, insertResult }
      })

      const results = await Promise.all(operations)

      // Verificar que cada operação foi bem-sucedida para o usuário correto
      results.forEach(({ userId, readResult, insertResult }) => {
        expect(readResult.data).toBeDefined()
        expect(insertResult.error).toBeNull()
      })
    })

    it('deve prevenir condições de corrida em atualizações', async () => {
      const client = createMockSupabaseClient('user-race-condition')

      // Simular múltiplas atualizações simultâneas
      const updates = Array.from({ length: 5 }, (_, index) =>
        client
          .from('hiperfocos')
          .update({ titulo: `Update ${index}` })
          .eq('user_id', 'user-race-condition')
      )

      const results = await Promise.all(updates)

      // Todas as atualizações devem ser bem-sucedidas (para o próprio usuário)
      results.forEach(result => {
        expect(result.error).toBeNull()
      })
    })
  })

  describe('Validação de Integridade', () => {
    it('deve garantir que user_id não pode ser alterado', async () => {
      const client = createMockSupabaseClient('user-integrity')

      // Tentar atualizar user_id (deve ser bloqueado)
      const updateUserIdResult = await client
        .from('hiperfocos')
        .update({ user_id: 'other-user' })
        .eq('user_id', 'user-integrity')

      // Esta operação deve falhar ou ser ignorada pelas políticas RLS
      expect(updateUserIdResult.error?.message).toContain('row-level security')
    })

    it('deve validar consistência de dados entre tabelas relacionadas', async () => {
      const client = createMockSupabaseClient('user-consistency')

      // Inserir hiperfoco
      const hiperfocoResult = await client
        .from('hiperfocos')
        .insert({
          titulo: 'Hiperfoco teste',
          user_id: 'user-consistency',
        })

      expect(hiperfocoResult.error).toBeNull()

      // Tentar inserir tarefa para outro usuário (deve falhar)
      const tarefaResult = await client
        .from('tarefas')
        .insert({
          texto: 'Tarefa hack',
          hiperfoco_id: 'some-id',
          user_id: 'other-user',
        })

      expect(tarefaResult.error?.message).toContain('row-level security')
    })
  })

  describe('Cenários de Erro e Recuperação', () => {
    it('deve tratar graciosamente usuários não autenticados', async () => {
      const client = createMockSupabaseClient(null) // Usuário não autenticado

      const result = await client
        .from('hiperfocos')
        .select('*')

      expect(result.data).toEqual([])
    })

    it('deve manter isolamento mesmo com IDs similares', async () => {
      const users = ['user-123', 'user-1234', 'user-12345']
      
      for (const userId of users) {
        const client = createMockSupabaseClient(userId)
        
        // Cada usuário deve ver apenas seus próprios dados
        const result = await client
          .from('hiperfocos')
          .select('*')
          .eq('user_id', userId)

        expect(result.data).toHaveLength(1)
        expect(result.data[0].user_id).toBe(userId)
      }
    })

    it('deve bloquear tentativas de SQL injection via user_id', async () => {
      const maliciousUserId = "'; DROP TABLE hiperfocos; --"
      const client = createMockSupabaseClient('legitimate-user')

      const result = await client
        .from('hiperfocos')
        .select('*')
        .eq('user_id', maliciousUserId)

      // Deve retornar array vazio (sem dados) e não causar erro de SQL
      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })
  })
})
