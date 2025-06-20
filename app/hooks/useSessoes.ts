import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessoesApi } from '@/app/services/sessoesApi'
import { useAuth } from '@/app/lib/auth'
import type {
  Sessao,
  CreateSessaoData,
  UpdateSessaoData,
  SessaoAtiva,
  UseSessoesReturn,
  EstadoTimer
} from '@/app/types/sessoes'

const SEGUNDOS_POR_MINUTO = 60
const MILISSEGUNDOS_POR_MINUTO = 60 * 1000

// Função auxiliar para calcular duração real de uma sessão
function calcularDuracaoReal(tempoInicio: string, tempoFim: string): number {
  const inicio = new Date(tempoInicio)
  const fim = new Date(tempoFim)
  return Math.round((fim.getTime() - inicio.getTime()) / MILISSEGUNDOS_POR_MINUTO)
}

// Função auxiliar para criar estado inicial do timer
function criarEstadoTimer(sessao: Sessao): EstadoTimer {
  return {
    tempoRestante: sessao.duracao_planejada * SEGUNDOS_POR_MINUTO,
    tempoTotal: sessao.duracao_planejada * SEGUNDOS_POR_MINUTO,
    status: 'rodando',
    tipo: sessao.tipo,
    cicloAtual: 1,
    ciclosCompletos: 0,
  }
}

export function useSessoes(): UseSessoesReturn {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtiva | null>(null)

  // Query para buscar sessões
  const {
    data: sessoes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sessoes', user?.id],
    queryFn: () => sessoesApi.getSessoes(user!.id),
    enabled: !!user?.id,
  })

  // Mutation para criar sessão
  const createMutation = useMutation({
    mutationFn: sessoesApi.createSessao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes', user?.id] })
    },
  })

  // Mutation para atualizar sessão
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessaoData }) =>
      sessoesApi.updateSessao(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes', user?.id] })
    },
  })

  // Mutation para deletar sessão
  const deleteMutation = useMutation({
    mutationFn: sessoesApi.deleteSessao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes', user?.id] })
    },
  })

  // Ações principais
  const criarSessao = useCallback(async (data: CreateSessaoData): Promise<Sessao> => {
    return createMutation.mutateAsync(data)
  }, [createMutation])

  const atualizarSessao = useCallback(async (id: string, data: UpdateSessaoData): Promise<Sessao> => {
    return updateMutation.mutateAsync({ id, data })
  }, [updateMutation])

  const finalizarSessao = useCallback(async (id: string): Promise<Sessao> => {
    const agora = new Date().toISOString()

    // Calcular duração real baseada no tempo de início
    const sessao = sessoes.find(s => s.id === id)
    let duracaoReal = sessao?.duracao_planejada || 0

    if (sessao?.tempo_inicio) {
      duracaoReal = calcularDuracaoReal(sessao.tempo_inicio, agora)
    }

    return updateMutation.mutateAsync({
      id,
      data: {
        concluida: true,
        tempo_fim: agora,
        duracao_real: duracaoReal,
      },
    })
  }, [updateMutation, sessoes])

  const cancelarSessao = useCallback(async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id)
  }, [deleteMutation])

  // Gerenciamento de sessão ativa
  const iniciarSessaoAtiva = useCallback((sessaoId: string) => {
    const sessao = sessoes.find(s => s.id === sessaoId)
    if (!sessao) return

    // Criar estado do timer para a sessão
    const timer = criarEstadoTimer(sessao)

    const sessaoComTimer: SessaoAtiva = {
      ...sessao,
      timer,
    }

    setSessaoAtiva(sessaoComTimer)
  }, [sessoes])

  const pausarSessaoAtiva = useCallback(() => {
    setSessaoAtiva(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        timer: {
          ...prev.timer,
          status: 'pausado',
        },
      }
    })
  }, [])

  const retomarSessaoAtiva = useCallback(() => {
    setSessaoAtiva(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        timer: {
          ...prev.timer,
          status: 'rodando',
        },
      }
    })
  }, [])

  const finalizarSessaoAtiva = useCallback(async (): Promise<void> => {
    if (!sessaoAtiva) return

    await finalizarSessao(sessaoAtiva.id)
    setSessaoAtiva(null)
  }, [sessaoAtiva, finalizarSessao])

  return {
    sessoes,
    sessaoAtiva,
    isLoading,
    error: error as Error | null,
    criarSessao,
    atualizarSessao,
    finalizarSessao,
    cancelarSessao,
    iniciarSessaoAtiva,
    pausarSessaoAtiva,
    retomarSessaoAtiva,
    finalizarSessaoAtiva,
  }
}
