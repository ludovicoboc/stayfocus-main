import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNotificacoes } from '@/app/hooks/useNotificacoes'
import type { NotificacaoTimer } from '@/app/types/sessoes'

// Mock do Notification API
const mockNotification = {
  requestPermission: vi.fn(),
  permission: 'default' as NotificationPermission,
}

const mockNotificationConstructor = vi.fn()

Object.defineProperty(window, 'Notification', {
  value: mockNotificationConstructor,
  configurable: true,
})

Object.defineProperty(window.Notification, 'requestPermission', {
  value: mockNotification.requestPermission,
})

Object.defineProperty(window.Notification, 'permission', {
  get: () => mockNotification.permission,
  configurable: true,
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

// Mock do navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  configurable: true,
})

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

describe('useNotificacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotification.permission = 'default'
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('deve inicializar com permissão padrão', () => {
      const { result } = renderHook(() => useNotificacoes())

      expect(result.current.permissao).toBe('default')
    })

    it('deve carregar configuração do localStorage', () => {
      const configSalva = {
        som: false,
        vibrar: true,
        desktop: false,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(configSalva))

      const { result } = renderHook(() => useNotificacoes())

      // A configuração deve ser carregada internamente
      expect(localStorageMock.getItem).toHaveBeenCalledWith('notificacoes-config')
    })
  })

  describe('Solicitação de permissão', () => {
    it('deve solicitar permissão para notificações', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted')

      const { result } = renderHook(() => useNotificacoes())

      let permissao: NotificationPermission | undefined

      await act(async () => {
        permissao = await result.current.solicitarPermissao()
      })

      expect(mockNotification.requestPermission).toHaveBeenCalled()
      expect(permissao).toBe('granted')
    })

    it('deve lidar com permissão negada', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const { result } = renderHook(() => useNotificacoes())

      let permissao: NotificationPermission | undefined

      await act(async () => {
        permissao = await result.current.solicitarPermissao()
      })

      expect(permissao).toBe('denied')
    })

    it('deve atualizar estado da permissão', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted')

      const { result } = renderHook(() => useNotificacoes())

      await act(async () => {
        await result.current.solicitarPermissao()
      })

      // Simular mudança na permissão
      mockNotification.permission = 'granted'

      // Re-renderizar para capturar mudança
      const { result: newResult } = renderHook(() => useNotificacoes())
      expect(newResult.current.permissao).toBe('granted')
    })
  })

  describe('Envio de notificações', () => {
    beforeEach(() => {
      mockNotification.permission = 'granted'
    })

    it('deve enviar notificação desktop quando permitido', () => {
      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Timer Finalizado',
        corpo: 'Sua sessão de foco terminou!',
        tipo: 'fim',
        som: true,
        vibrar: true,
      }

      act(() => {
        result.current.enviarNotificacao(notificacao)
      })

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        'Timer Finalizado',
        {
          body: 'Sua sessão de foco terminou!',
          icon: '/icons/timer-end.png',
          tag: 'timer-fim',
          requireInteraction: true,
        }
      )
    })

    it('deve tocar som quando configurado', () => {
      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Timer Iniciado',
        corpo: 'Sessão de foco iniciada',
        tipo: 'inicio',
        som: true,
      }

      act(() => {
        result.current.enviarNotificacao(notificacao)
      })

      expect(mockAudio.play).toHaveBeenCalled()
    })

    it('não deve tocar som quando desabilitado', () => {
      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Timer Iniciado',
        corpo: 'Sessão de foco iniciada',
        tipo: 'inicio',
        som: false,
      }

      act(() => {
        result.current.enviarNotificacao(notificacao)
      })

      expect(mockAudio.play).not.toHaveBeenCalled()
    })

    it('deve vibrar quando configurado e suportado', () => {
      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Timer Pausado',
        corpo: 'Sessão pausada',
        tipo: 'pausa',
        vibrar: true,
      }

      act(() => {
        result.current.enviarNotificacao(notificacao)
      })

      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100])
    })

    it('não deve enviar notificação desktop quando permissão negada', () => {
      mockNotification.permission = 'denied'

      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Timer Finalizado',
        corpo: 'Sua sessão terminou',
        tipo: 'fim',
      }

      act(() => {
        result.current.enviarNotificacao(notificacao)
      })

      expect(mockNotificationConstructor).not.toHaveBeenCalled()
    })

    it('deve usar ícone correto baseado no tipo', () => {
      const { result } = renderHook(() => useNotificacoes())

      const tiposEIcones = [
        { tipo: 'inicio' as const, icone: '/icons/timer-start.png' },
        { tipo: 'fim' as const, icone: '/icons/timer-end.png' },
        { tipo: 'pausa' as const, icone: '/icons/timer-pause.png' },
        { tipo: 'foco' as const, icone: '/icons/timer-focus.png' },
      ]

      tiposEIcones.forEach(({ tipo, icone }) => {
        const notificacao: NotificacaoTimer = {
          titulo: `Timer ${tipo}`,
          corpo: `Notificação de ${tipo}`,
          tipo,
        }

        act(() => {
          result.current.enviarNotificacao(notificacao)
        })

        expect(mockNotificationConstructor).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            icon: icone,
            tag: `timer-${tipo}`,
          })
        )
      })
    })
  })

  describe('Configuração de notificações', () => {
    it('deve configurar notificações e persistir no localStorage', () => {
      const { result } = renderHook(() => useNotificacoes())

      const novaConfig = {
        som: false,
        vibrar: true,
        desktop: false,
      }

      act(() => {
        result.current.configurarNotificacoes(novaConfig)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notificacoes-config',
        JSON.stringify(novaConfig)
      )
    })

    it('deve aplicar configuração ao enviar notificações', () => {
      const { result } = renderHook(() => useNotificacoes())

      // Configurar para desabilitar desktop
      act(() => {
        result.current.configurarNotificacoes({
          som: true,
          vibrar: false,
          desktop: false,
        })
      })

      const notificacao: NotificacaoTimer = {
        titulo: 'Teste',
        corpo: 'Teste de configuração',
        tipo: 'fim',
      }

      act(() => {
        result.current.enviarNotificacao(notificacao)
      })

      // Não deve criar notificação desktop
      expect(mockNotificationConstructor).not.toHaveBeenCalled()
      // Mas deve tocar som
      expect(mockAudio.play).toHaveBeenCalled()
      // E não deve vibrar
      expect(navigator.vibrate).not.toHaveBeenCalled()
    })
  })

  describe('Tratamento de erros', () => {
    it('deve lidar com erro ao tocar som', () => {
      mockAudio.play.mockRejectedValue(new Error('Audio blocked'))

      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Teste',
        corpo: 'Teste de erro',
        tipo: 'fim',
        som: true,
      }

      // Não deve lançar erro
      expect(() => {
        act(() => {
          result.current.enviarNotificacao(notificacao)
        })
      }).not.toThrow()
    })

    it('deve lidar com navegador sem suporte a vibração', () => {
      // Remover suporte a vibração
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        configurable: true,
      })

      const { result } = renderHook(() => useNotificacoes())

      const notificacao: NotificacaoTimer = {
        titulo: 'Teste',
        corpo: 'Teste sem vibração',
        tipo: 'fim',
        vibrar: true,
      }

      // Não deve lançar erro
      expect(() => {
        act(() => {
          result.current.enviarNotificacao(notificacao)
        })
      }).not.toThrow()
    })
  })
})
