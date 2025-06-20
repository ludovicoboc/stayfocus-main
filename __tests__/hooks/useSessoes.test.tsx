import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CreateSessaoData, UpdateSessaoData } from '@/app/types/sessoes'
import { createWrapper } from '@/test-utils'

// Mock da API
vi.mock('@/app/services/sessoesApi', () => ({
  sessoesApi: {
    getSessoes: vi.fn(),
    getSessao: vi.fn(),
    createSessao: vi.fn(),
    updateSessao: vi.fn(),
    deleteSessao: vi.fn(),
  },
}))

// Mock do useAuth
vi.mock('@/app/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}))

import { useSessoes } from '@/app/hooks/useSessoes'
import { sessoesApi } from '@/app/services/sessoesApi'

const mockSessoesApi = sessoesApi as any

describe('useSessoes', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  describe('Estado inicial', () => {
    it('deve inicializar com estado vazio', () => {
      mockSessoesApi.getSessoes.mockResolvedValue([])

      const { result } = renderHook(() => useSessoes(), { wrapper })

      expect(result.current.sessoes).toEqual([])
      expect(result.current.sessaoAtiva).toBeNull()
      expect(result.current.isLoading).toBe(true) // Inicialmente carregando
      expect(result.current.error).toBeNull()
    })

    it('deve carregar sessões do usuário autenticado', async () => {
      const mockSessoes = [
        {
          id: 'sessao-1',
          user_id: 'user-123',
          titulo: 'Sessão de Foco',
          tipo: 'foco' as const,
          tempo_inicio: '2024-01-01T10:00:00Z',
          duracao_planejada: 25,
          concluida: false,
          pausas: 0,
          interrupcoes: 0,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
      ]

      mockSessoesApi.getSessoes.mockResolvedValue(mockSessoes)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.sessoes).toEqual(mockSessoes)
      expect(mockSessoesApi.getSessoes).toHaveBeenCalledWith('user-123')
    })

    it('deve lidar com erro ao carregar sessões', async () => {
      const mockError = new Error('Erro ao carregar sessões')
      mockSessoesApi.getSessoes.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toEqual(mockError)
      expect(result.current.sessoes).toEqual([])
    })
  })

  describe('Criação de sessões', () => {
    it('deve criar nova sessão', async () => {
      const novaSessaoData: CreateSessaoData = {
        user_id: 'user-123',
        titulo: 'Nova Sessão',
        tipo: 'foco',
        duracao_planejada: 25,
      }

      const sessaoCriada = {
        id: 'nova-sessao',
        ...novaSessaoData,
        tempo_inicio: '2024-01-01T10:00:00Z',
        concluida: false,
        pausas: 0,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      }

      mockSessoesApi.createSessao.mockResolvedValue(sessaoCriada)
      mockSessoesApi.getSessoes.mockResolvedValue([sessaoCriada])

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const sessao = await result.current.criarSessao(novaSessaoData)

      expect(sessao).toEqual(sessaoCriada)
      expect(mockSessoesApi.createSessao).toHaveBeenCalledWith(novaSessaoData)
    })

    it('deve lidar com erro na criação de sessão', async () => {
      const novaSessaoData: CreateSessaoData = {
        user_id: 'user-123',
        titulo: 'Nova Sessão',
        tipo: 'foco',
        duracao_planejada: 25,
      }

      const mockError = new Error('Erro ao criar sessão')
      mockSessoesApi.createSessao.mockRejectedValue(mockError)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await expect(result.current.criarSessao(novaSessaoData)).rejects.toThrow(
        'Erro ao criar sessão'
      )
    })
  })

  describe('Atualização de sessões', () => {
    it('deve atualizar sessão existente', async () => {
      const updateData: UpdateSessaoData = {
        titulo: 'Título Atualizado',
        pausas: 2,
      }

      const sessaoAtualizada = {
        id: 'sessao-1',
        user_id: 'user-123',
        titulo: 'Título Atualizado',
        tipo: 'foco' as const,
        tempo_inicio: '2024-01-01T10:00:00Z',
        duracao_planejada: 25,
        concluida: false,
        pausas: 2,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:05:00Z',
      }

      mockSessoesApi.updateSessao.mockResolvedValue(sessaoAtualizada)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      const sessao = await result.current.atualizarSessao('sessao-1', updateData)

      expect(sessao).toEqual(sessaoAtualizada)
      expect(mockSessoesApi.updateSessao).toHaveBeenCalledWith('sessao-1', updateData)
    })

    it('deve finalizar sessão', async () => {
      const sessaoFinalizada = {
        id: 'sessao-1',
        user_id: 'user-123',
        titulo: 'Sessão Finalizada',
        tipo: 'foco' as const,
        tempo_inicio: '2024-01-01T10:00:00Z',
        tempo_fim: '2024-01-01T10:25:00Z',
        duracao_planejada: 25,
        duracao_real: 25,
        concluida: true,
        pausas: 0,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:25:00Z',
      }

      mockSessoesApi.updateSessao.mockResolvedValue(sessaoFinalizada)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      const sessao = await result.current.finalizarSessao('sessao-1')

      expect(sessao.concluida).toBe(true)
      expect(sessao.tempo_fim).toBeDefined()
      expect(mockSessoesApi.updateSessao).toHaveBeenCalledWith('sessao-1', {
        concluida: true,
        tempo_fim: expect.any(String),
        duracao_real: expect.any(Number),
      })
    })
  })

  describe('Cancelamento de sessões', () => {
    it('deve cancelar sessão', async () => {
      mockSessoesApi.deleteSessao.mockResolvedValue(undefined)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await result.current.cancelarSessao('sessao-1')

      expect(mockSessoesApi.deleteSessao).toHaveBeenCalledWith('sessao-1')
    })
  })

  describe('Gerenciamento de sessão ativa', () => {
    it('deve iniciar sessão ativa', async () => {
      const sessao = {
        id: 'sessao-1',
        user_id: 'user-123',
        titulo: 'Sessão Ativa',
        tipo: 'foco' as const,
        tempo_inicio: '2024-01-01T10:00:00Z',
        duracao_planejada: 25,
        concluida: false,
        pausas: 0,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      }

      mockSessoesApi.getSessao.mockResolvedValue(sessao)
      mockSessoesApi.getSessoes.mockResolvedValue([sessao])

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.iniciarSessaoAtiva('sessao-1')

      await waitFor(() => {
        expect(result.current.sessaoAtiva).toBeDefined()
      })

      expect(result.current.sessaoAtiva?.id).toBe('sessao-1')
      expect(result.current.sessaoAtiva?.timer.status).toBe('rodando')
    })

    it('deve pausar sessão ativa', async () => {
      const sessao = {
        id: 'sessao-1',
        user_id: 'user-123',
        titulo: 'Sessão Ativa',
        tipo: 'foco' as const,
        tempo_inicio: '2024-01-01T10:00:00Z',
        duracao_planejada: 25,
        concluida: false,
        pausas: 0,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      }

      mockSessoesApi.getSessoes.mockResolvedValue([sessao])

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Primeiro iniciar uma sessão
      result.current.iniciarSessaoAtiva('sessao-1')

      await waitFor(() => {
        expect(result.current.sessaoAtiva?.timer.status).toBe('rodando')
      })

      result.current.pausarSessaoAtiva()

      await waitFor(() => {
        expect(result.current.sessaoAtiva?.timer.status).toBe('pausado')
      })
    })

    it('deve retomar sessão ativa', async () => {
      const sessao = {
        id: 'sessao-1',
        user_id: 'user-123',
        titulo: 'Sessão Ativa',
        tipo: 'foco' as const,
        tempo_inicio: '2024-01-01T10:00:00Z',
        duracao_planejada: 25,
        concluida: false,
        pausas: 0,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      }

      mockSessoesApi.getSessoes.mockResolvedValue([sessao])

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Primeiro iniciar e pausar uma sessão
      result.current.iniciarSessaoAtiva('sessao-1')
      result.current.pausarSessaoAtiva()

      await waitFor(() => {
        expect(result.current.sessaoAtiva?.timer.status).toBe('pausado')
      })

      result.current.retomarSessaoAtiva()

      await waitFor(() => {
        expect(result.current.sessaoAtiva?.timer.status).toBe('rodando')
      })
    })

    it('deve finalizar sessão ativa', async () => {
      const sessao = {
        id: 'sessao-1',
        user_id: 'user-123',
        titulo: 'Sessão Ativa',
        tipo: 'foco' as const,
        tempo_inicio: '2024-01-01T10:00:00Z',
        duracao_planejada: 25,
        concluida: false,
        pausas: 0,
        interrupcoes: 0,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
      }

      const sessaoFinalizada = {
        ...sessao,
        tempo_fim: '2024-01-01T10:25:00Z',
        duracao_real: 25,
        concluida: true,
        updated_at: '2024-01-01T10:25:00Z',
      }

      mockSessoesApi.getSessoes.mockResolvedValue([sessao])
      mockSessoesApi.updateSessao.mockResolvedValue(sessaoFinalizada)

      const { result } = renderHook(() => useSessoes(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Primeiro iniciar uma sessão
      result.current.iniciarSessaoAtiva('sessao-1')

      await waitFor(() => {
        expect(result.current.sessaoAtiva).toBeDefined()
      })

      await result.current.finalizarSessaoAtiva()

      await waitFor(() => {
        expect(result.current.sessaoAtiva).toBeNull()
      })

      expect(mockSessoesApi.updateSessao).toHaveBeenCalledWith('sessao-1', {
        concluida: true,
        tempo_fim: expect.any(String),
        duracao_real: expect.any(Number),
      })
    })
  })
})
