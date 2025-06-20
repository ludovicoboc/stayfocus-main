import { useState, useCallback, useEffect } from 'react'
import type { NotificacaoTimer, UseNotificacoesReturn } from '@/app/types/sessoes'

interface ConfigNotificacoes {
  som: boolean
  vibrar: boolean
  desktop: boolean
}

const CONFIG_PADRAO: ConfigNotificacoes = {
  som: true,
  vibrar: true,
  desktop: true,
}

const STORAGE_KEY = 'notificacoes-config'
const INTERVALO_VERIFICACAO_PERMISSAO_MS = 1000

// Mapeamento de sons por tipo
const SONS_NOTIFICACAO = {
  inicio: '/sounds/timer-start.mp3',
  fim: '/sounds/timer-end.mp3',
  pausa: '/sounds/timer-pause.mp3',
  foco: '/sounds/timer-focus.mp3',
}

// Mapeamento de ícones por tipo
const ICONES_NOTIFICACAO = {
  inicio: '/icons/timer-start.png',
  fim: '/icons/timer-end.png',
  pausa: '/icons/timer-pause.png',
  foco: '/icons/timer-focus.png',
}

// Padrões de vibração por tipo
const PADROES_VIBRACAO = {
  inicio: [200],
  fim: [200, 100, 200, 100, 200],
  pausa: [100, 50, 100],
  foco: [200, 100, 200],
}

// Função auxiliar para verificar suporte a notificações
function temSuporteNotificacoes(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

// Função auxiliar para verificar suporte a vibração
function temSuporteVibracao(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

// Função auxiliar para carregar configuração do localStorage
function carregarConfiguracao(): ConfigNotificacoes {
  if (typeof window === 'undefined') return CONFIG_PADRAO

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...CONFIG_PADRAO, ...JSON.parse(saved) } : CONFIG_PADRAO
  } catch {
    return CONFIG_PADRAO
  }
}

export function useNotificacoes(): UseNotificacoesReturn {
  // Estado da permissão
  const [permissao, setPermissao] = useState<NotificationPermission>(() => {
    if (!temSuporteNotificacoes()) {
      return 'denied'
    }
    return Notification.permission
  })

  // Configuração das notificações
  const [config, setConfig] = useState<ConfigNotificacoes>(carregarConfiguracao)

  // Verificar mudanças na permissão
  useEffect(() => {
    if (!temSuporteNotificacoes()) return

    const checkPermission = () => {
      setPermissao(Notification.permission)
    }

    // Verificar periodicamente (algumas vezes o estado pode mudar)
    const interval = setInterval(checkPermission, INTERVALO_VERIFICACAO_PERMISSAO_MS)

    return () => clearInterval(interval)
  }, [])

  // Solicitar permissão
  const solicitarPermissao = useCallback(async (): Promise<NotificationPermission> => {
    if (!temSuporteNotificacoes()) {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissao(permission)
      return permission
    } catch (error) {
      console.warn('Erro ao solicitar permissão para notificações:', error)
      return 'denied'
    }
  }, [])

  // Tocar som
  const tocarSom = useCallback((tipo: NotificacaoTimer['tipo']) => {
    if (!config.som) return

    try {
      const audio = new Audio(SONS_NOTIFICACAO[tipo])
      audio.play().catch(error => {
        console.warn('Erro ao tocar som de notificação:', error)
      })
    } catch (error) {
      console.warn('Erro ao criar áudio:', error)
    }
  }, [config.som])

  // Vibrar dispositivo
  const vibrar = useCallback((tipo: NotificacaoTimer['tipo']) => {
    if (!config.vibrar || !temSuporteVibracao()) return

    try {
      navigator.vibrate(PADROES_VIBRACAO[tipo])
    } catch (error) {
      console.warn('Erro ao vibrar dispositivo:', error)
    }
  }, [config.vibrar])

  // Enviar notificação desktop
  const enviarNotificacaoDesktop = useCallback((notificacao: NotificacaoTimer) => {
    if (!config.desktop || permissao !== 'granted' || !temSuporteNotificacoes()) return

    try {
      new Notification(notificacao.titulo, {
        body: notificacao.corpo,
        icon: ICONES_NOTIFICACAO[notificacao.tipo],
        tag: `timer-${notificacao.tipo}`,
        requireInteraction: notificacao.tipo === 'fim', // Manter visível para fim de timer
      })
    } catch (error) {
      console.warn('Erro ao criar notificação desktop:', error)
    }
  }, [config.desktop, permissao])

  // Enviar notificação completa
  const enviarNotificacao = useCallback((notificacao: NotificacaoTimer) => {
    // Som
    if (notificacao.som !== false) {
      tocarSom(notificacao.tipo)
    }

    // Vibração
    if (notificacao.vibrar !== false) {
      vibrar(notificacao.tipo)
    }

    // Notificação desktop
    enviarNotificacaoDesktop(notificacao)
  }, [tocarSom, vibrar, enviarNotificacaoDesktop])

  // Configurar notificações
  const configurarNotificacoes = useCallback((novaConfig: ConfigNotificacoes) => {
    setConfig(novaConfig)
    
    // Persistir no localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novaConfig))
    } catch (error) {
      console.warn('Erro ao salvar configuração de notificações:', error)
    }
  }, [])

  return {
    permissao,
    solicitarPermissao,
    enviarNotificacao,
    configurarNotificacoes,
  }
}
