import { useState, useEffect, useCallback, useRef } from 'react'
import type { 
  ConfiguracaoTimer, 
  EstadoTimer, 
  TipoSessao, 
  UseTimerReturn,
  TimerEvent 
} from '@/app/types/sessoes'

const CONFIGURACAO_PADRAO: ConfiguracaoTimer = {
  tempoFoco: 25,
  tempoPausa: 5,
  tempoPausaLonga: 15,
  ciclosAntesLongaPausa: 4,
  autoIniciarPausa: false,
  autoIniciarFoco: false,
  somNotificacao: true,
}

const STORAGE_KEY = 'timer-config'
const SEGUNDOS_POR_MINUTO = 60
const INTERVALO_TIMER_MS = 1000

export function useTimer(): UseTimerReturn {
  // Carregar configuração do localStorage
  const [configuracao, setConfiguracao] = useState<ConfiguracaoTimer>(() => {
    if (typeof window === 'undefined') return CONFIGURACAO_PADRAO
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...CONFIGURACAO_PADRAO, ...JSON.parse(saved) } : CONFIGURACAO_PADRAO
    } catch {
      return CONFIGURACAO_PADRAO
    }
  })

  // Estado inicial do timer
  const [timer, setTimer] = useState<EstadoTimer>(() => ({
    tempoRestante: configuracao.tempoFoco * SEGUNDOS_POR_MINUTO,
    tempoTotal: configuracao.tempoFoco * SEGUNDOS_POR_MINUTO,
    status: 'parado',
    tipo: 'foco',
    cicloAtual: 1,
    ciclosCompletos: 0,
  }))

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Limpar interval ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Gerenciar contagem regressiva
  useEffect(() => {
    if (timer.status === 'rodando') {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.tempoRestante <= 1) {
            // Timer chegou ao fim - calcular próximo estado
            const proximoEstado = calcularProximoEstado(prev, configuracao)
            return {
              ...prev,
              ...proximoEstado,
            }
          }

          return {
            ...prev,
            tempoRestante: prev.tempoRestante - 1,
          }
        })
      }, INTERVALO_TIMER_MS)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timer.status, configuracao])

  // Ações do timer
  const iniciar = useCallback((tempo?: number) => {
    setTimer(prev => ({
      ...prev,
      status: 'rodando',
      tempoRestante: tempo ?? prev.tempoRestante,
      tempoTotal: tempo ?? prev.tempoTotal,
    }))
  }, [])

  const pausar = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      status: 'pausado',
    }))
  }, [])

  const retomar = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      status: 'rodando',
    }))
  }, [])

  const parar = useCallback(() => {
    setTimer(prev => {
      const tempoParaTipo = getTempoPorTipo(prev.tipo, configuracao)
      return {
        ...prev,
        status: 'parado',
        tempoRestante: tempoParaTipo,
        tempoTotal: tempoParaTipo,
      }
    })
  }, [configuracao])

  const resetar = useCallback(() => {
    setTimer({
      tempoRestante: configuracao.tempoFoco * SEGUNDOS_POR_MINUTO,
      tempoTotal: configuracao.tempoFoco * SEGUNDOS_POR_MINUTO,
      status: 'parado',
      tipo: 'foco',
      cicloAtual: 1,
      ciclosCompletos: 0,
    })
  }, [configuracao])

  const alternarTipo = useCallback((tipo: TipoSessao) => {
    const novoTempo = getTempoPorTipo(tipo, configuracao)
    setTimer(prev => ({
      ...prev,
      tipo,
      tempoRestante: novoTempo,
      tempoTotal: novoTempo,
      status: 'parado',
    }))
  }, [configuracao])

  // Atualizar configuração
  const atualizarConfiguracao = useCallback((novaConfig: Partial<ConfiguracaoTimer>) => {
    const configAtualizada = { ...configuracao, ...novaConfig }
    setConfiguracao(configAtualizada)
    
    // Persistir no localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configAtualizada))
    } catch (error) {
      console.warn('Erro ao salvar configuração do timer:', error)
    }

    // Atualizar tempo do timer se estiver parado
    setTimer(prev => {
      if (prev.status === 'parado') {
        const novoTempo = getTempoPorTipo(prev.tipo, configAtualizada)
        return {
          ...prev,
          tempoRestante: novoTempo,
          tempoTotal: novoTempo,
        }
      }
      return prev
    })
  }, [configuracao])

  // Utilitários
  const formatarTempo = useCallback((segundos: number): string => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }, [])

  const calcularProgresso = useCallback((): number => {
    if (timer.tempoTotal === 0) return 0
    const tempoDecorrido = timer.tempoTotal - timer.tempoRestante
    const progresso = (tempoDecorrido / timer.tempoTotal) * 100
    return Math.round(Math.max(0, Math.min(100, progresso)))
  }, [timer.tempoTotal, timer.tempoRestante])

  return {
    timer,
    configuracao,
    iniciar,
    pausar,
    retomar,
    parar,
    resetar,
    alternarTipo,
    atualizarConfiguracao,
    formatarTempo,
    calcularProgresso,
  }
}

// Função auxiliar para obter tempo por tipo
function getTempoPorTipo(tipo: TipoSessao, config: ConfiguracaoTimer): number {
  switch (tipo) {
    case 'foco':
      return config.tempoFoco * SEGUNDOS_POR_MINUTO
    case 'pausa':
      return config.tempoPausa * SEGUNDOS_POR_MINUTO
    case 'pausa_longa':
      return config.tempoPausaLonga * SEGUNDOS_POR_MINUTO
    default:
      return config.tempoFoco * SEGUNDOS_POR_MINUTO
  }
}

// Função auxiliar para calcular próximo estado do timer quando completa
function calcularProximoEstado(
  estadoAtual: EstadoTimer,
  configuracao: ConfiguracaoTimer
): Partial<EstadoTimer> {
  let novoTipo: TipoSessao
  let novoTempo: number
  let novosCiclosCompletos = estadoAtual.ciclosCompletos
  let novoCicloAtual = estadoAtual.cicloAtual

  if (estadoAtual.tipo === 'foco') {
    novosCiclosCompletos += 1

    // Verificar se deve ser pausa longa
    if (novosCiclosCompletos % configuracao.ciclosAntesLongaPausa === 0) {
      novoTipo = 'pausa_longa'
      novoTempo = configuracao.tempoPausaLonga * SEGUNDOS_POR_MINUTO
    } else {
      novoTipo = 'pausa'
      novoTempo = configuracao.tempoPausa * SEGUNDOS_POR_MINUTO
    }
  } else {
    // Pausa ou pausa longa terminaram
    novoTipo = 'foco'
    novoTempo = configuracao.tempoFoco * SEGUNDOS_POR_MINUTO
    novoCicloAtual += 1
  }

  const deveAutoIniciar = (novoTipo === 'pausa' && configuracao.autoIniciarPausa) ||
                         (novoTipo === 'foco' && configuracao.autoIniciarFoco) ||
                         (novoTipo === 'pausa_longa' && configuracao.autoIniciarPausa)

  return {
    tipo: novoTipo,
    tempoRestante: novoTempo,
    tempoTotal: novoTempo,
    status: deveAutoIniciar ? 'rodando' : 'parado',
    ciclosCompletos: novosCiclosCompletos,
    cicloAtual: novoCicloAtual,
  }
}
