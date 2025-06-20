import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimer } from '@/app/hooks/useTimer'
import type { TipoSessao, ConfiguracaoTimer } from '@/app/types/sessoes'

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock do Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
}

Object.defineProperty(window, 'Audio', {
  value: vi.fn(() => mockAudio),
})

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Estado inicial', () => {
    it('deve inicializar com configuração padrão', () => {
      const { result } = renderHook(() => useTimer())

      expect(result.current.timer.status).toBe('parado')
      expect(result.current.timer.tipo).toBe('foco')
      expect(result.current.timer.tempoRestante).toBe(25 * 60) // 25 minutos em segundos
      expect(result.current.timer.tempoTotal).toBe(25 * 60)
      expect(result.current.timer.cicloAtual).toBe(1)
      expect(result.current.timer.ciclosCompletos).toBe(0)
    })

    it('deve carregar configuração do localStorage se existir', () => {
      const configSalva: ConfiguracaoTimer = {
        tempoFoco: 30,
        tempoPausa: 10,
        tempoPausaLonga: 20,
        ciclosAntesLongaPausa: 3,
        autoIniciarPausa: true,
        autoIniciarFoco: false,
        somNotificacao: false,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(configSalva))

      const { result } = renderHook(() => useTimer())

      expect(result.current.configuracao).toEqual(configSalva)
      expect(result.current.timer.tempoRestante).toBe(30 * 60) // 30 minutos
      expect(result.current.timer.tempoTotal).toBe(30 * 60)
    })
  })

  describe('Controles básicos', () => {
    it('deve iniciar o timer', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
      })

      expect(result.current.timer.status).toBe('rodando')
    })

    it('deve pausar o timer quando estiver rodando', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
      })

      expect(result.current.timer.status).toBe('rodando')

      act(() => {
        result.current.pausar()
      })

      expect(result.current.timer.status).toBe('pausado')
    })

    it('deve retomar o timer quando estiver pausado', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
        result.current.pausar()
      })

      expect(result.current.timer.status).toBe('pausado')

      act(() => {
        result.current.retomar()
      })

      expect(result.current.timer.status).toBe('rodando')
    })

    it('deve parar o timer', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
        result.current.parar()
      })

      expect(result.current.timer.status).toBe('parado')
      expect(result.current.timer.tempoRestante).toBe(25 * 60) // Deve resetar para tempo total
    })

    it('deve resetar o timer', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
        // Simular passagem de tempo
        vi.advanceTimersByTime(5000) // 5 segundos
        result.current.resetar()
      })

      expect(result.current.timer.status).toBe('parado')
      expect(result.current.timer.tempoRestante).toBe(25 * 60)
      expect(result.current.timer.cicloAtual).toBe(1)
      expect(result.current.timer.ciclosCompletos).toBe(0)
    })
  })

  describe('Contagem regressiva', () => {
    it('deve decrementar o tempo quando rodando', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
      })

      const tempoInicial = result.current.timer.tempoRestante

      act(() => {
        vi.advanceTimersByTime(1000) // 1 segundo
      })

      expect(result.current.timer.tempoRestante).toBe(tempoInicial - 1)
    })

    it('não deve decrementar quando pausado', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
        result.current.pausar()
      })

      const tempoAntesAvanco = result.current.timer.tempoRestante

      act(() => {
        vi.advanceTimersByTime(5000) // 5 segundos
      })

      expect(result.current.timer.tempoRestante).toBe(tempoAntesAvanco)
    })

    it('não deve decrementar quando parado', () => {
      const { result } = renderHook(() => useTimer())

      const tempoInicial = result.current.timer.tempoRestante

      act(() => {
        vi.advanceTimersByTime(5000) // 5 segundos
      })

      expect(result.current.timer.tempoRestante).toBe(tempoInicial)
    })
  })

  describe('Alternância de tipos', () => {
    it('deve alternar para pausa quando foco terminar', async () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
      })

      // Simular fim do timer
      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000) // 25 minutos
      })

      expect(result.current.timer.tipo).toBe('pausa')
      expect(result.current.timer.tempoRestante).toBe(5 * 60) // 5 minutos de pausa
      expect(result.current.timer.ciclosCompletos).toBe(1)
    })

    it('deve alternar para foco quando pausa terminar', () => {
      const { result } = renderHook(() => useTimer())

      // Primeiro completar um ciclo de foco
      act(() => {
        result.current.iniciar()
      })

      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000) // 25 minutos
      })

      expect(result.current.timer.tipo).toBe('pausa')

      // Iniciar a pausa e completá-la
      act(() => {
        result.current.iniciar()
      })

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000) // 5 minutos
      })

      expect(result.current.timer.tipo).toBe('foco')
      expect(result.current.timer.tempoRestante).toBe(25 * 60)
      expect(result.current.timer.cicloAtual).toBe(2)
    })

    it('deve alternar para pausa longa após número configurado de ciclos', () => {
      const { result } = renderHook(() => useTimer())

      // Completar 4 ciclos de foco (configuração padrão)
      for (let i = 0; i < 4; i++) {
        act(() => {
          result.current.iniciar()
        })

        act(() => {
          vi.advanceTimersByTime(25 * 60 * 1000) // foco
        })

        if (i < 3) { // não avançar pausa no último ciclo
          act(() => {
            result.current.iniciar() // iniciar pausa
          })

          act(() => {
            vi.advanceTimersByTime(5 * 60 * 1000) // pausa
          })
        }
      }

      expect(result.current.timer.tipo).toBe('pausa_longa')
      expect(result.current.timer.tempoRestante).toBe(15 * 60) // 15 minutos
    })

    it('deve permitir alternar tipo manualmente', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.alternarTipo('pausa')
      })

      expect(result.current.timer.tipo).toBe('pausa')
      expect(result.current.timer.tempoRestante).toBe(5 * 60)
      expect(result.current.timer.tempoTotal).toBe(5 * 60)
    })
  })

  describe('Utilitários', () => {
    it('deve formatar tempo corretamente', () => {
      const { result } = renderHook(() => useTimer())

      expect(result.current.formatarTempo(0)).toBe('00:00')
      expect(result.current.formatarTempo(59)).toBe('00:59')
      expect(result.current.formatarTempo(60)).toBe('01:00')
      expect(result.current.formatarTempo(3661)).toBe('61:01')
    })

    it('deve calcular progresso corretamente', () => {
      const { result } = renderHook(() => useTimer())

      // No início, progresso deve ser 0%
      expect(result.current.calcularProgresso()).toBe(0)

      act(() => {
        result.current.iniciar()
      })

      act(() => {
        vi.advanceTimersByTime(12.5 * 60 * 1000) // metade do tempo
      })

      // Na metade, progresso deve ser 50%
      expect(result.current.calcularProgresso()).toBe(50)
    })
  })

  describe('Configuração', () => {
    it('deve atualizar configuração e persistir no localStorage', () => {
      const { result } = renderHook(() => useTimer())

      const novaConfig: Partial<ConfiguracaoTimer> = {
        tempoFoco: 30,
        tempoPausa: 10,
      }

      act(() => {
        result.current.atualizarConfiguracao(novaConfig)
      })

      expect(result.current.configuracao.tempoFoco).toBe(30)
      expect(result.current.configuracao.tempoPausa).toBe(10)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'timer-config',
        expect.stringContaining('"tempoFoco":30')
      )
    })

    it('deve atualizar tempo do timer quando configuração mudar e timer estiver parado', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.atualizarConfiguracao({ tempoFoco: 30 })
      })

      expect(result.current.timer.tempoRestante).toBe(30 * 60)
      expect(result.current.timer.tempoTotal).toBe(30 * 60)
    })

    it('não deve atualizar tempo do timer quando estiver rodando', () => {
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.iniciar()
        result.current.atualizarConfiguracao({ tempoFoco: 30 })
      })

      expect(result.current.timer.tempoRestante).toBe(25 * 60) // Deve manter o tempo original
    })
  })
})
