import { useEffect, useState } from 'react'
import { useIsClient } from './useIsClient'

export interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isInstalling: boolean
  isWaiting: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

export interface ServiceWorkerActions {
  register: () => Promise<void>
  unregister: () => Promise<void>
  update: () => Promise<void>
  skipWaiting: () => Promise<void>
}

export function useServiceWorker(): ServiceWorkerState & ServiceWorkerActions {
  const isClient = useIsClient()
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isUpdateAvailable: false,
    registration: null,
    error: null
  })

  useEffect(() => {
    // Só executar no cliente
    if (!isClient) return

    // Verificar suporte ao Service Worker
    if ('serviceWorker' in navigator) {
      setState(prev => ({ ...prev, isSupported: true }))

      // Registrar automaticamente em produção
      if (process.env.NODE_ENV === 'production') {
        register()
      }
    }
  }, [isClient])

  const register = async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Service Worker não é suportado neste navegador' 
      }))
      return
    }

    try {
      setState(prev => ({ ...prev, isInstalling: true, error: null }))

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('[SW] Service Worker registrado:', registration)

      // Configurar listeners
      setupServiceWorkerListeners(registration)

      setState(prev => ({
        ...prev,
        isRegistered: true,
        isInstalling: false,
        registration
      }))

      // Verificar se há uma atualização esperando
      if (registration.waiting) {
        setState(prev => ({ ...prev, isWaiting: true, isUpdateAvailable: true }))
      }

    } catch (error) {
      console.error('[SW] Erro ao registrar Service Worker:', error)
      setState(prev => ({
        ...prev,
        isInstalling: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }

  const unregister = async (): Promise<void> => {
    if (!state.registration) {
      return
    }

    try {
      const result = await state.registration.unregister()
      if (result) {
        setState(prev => ({
          ...prev,
          isRegistered: false,
          registration: null,
          isWaiting: false,
          isUpdateAvailable: false
        }))
        console.log('[SW] Service Worker desregistrado')
      }
    } catch (error) {
      console.error('[SW] Erro ao desregistrar Service Worker:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao desregistrar'
      }))
    }
  }

  const update = async (): Promise<void> => {
    if (!state.registration) {
      return
    }

    try {
      await state.registration.update()
      console.log('[SW] Verificação de atualização solicitada')
    } catch (error) {
      console.error('[SW] Erro ao verificar atualizações:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao verificar atualizações'
      }))
    }
  }

  const skipWaiting = async (): Promise<void> => {
    if (!state.registration?.waiting) {
      return
    }

    try {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      console.log('[SW] Skip waiting solicitado')
    } catch (error) {
      console.error('[SW] Erro ao pular waiting:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao pular waiting'
      }))
    }
  }

  const setupServiceWorkerListeners = (registration: ServiceWorkerRegistration) => {
    // Listener para instalação
    if (registration.installing) {
      registration.installing.addEventListener('statechange', (event) => {
        const sw = event.target as ServiceWorker
        console.log('[SW] State changed:', sw.state)
        
        if (sw.state === 'installed') {
          setState(prev => ({ ...prev, isInstalling: false }))
        }
      })
    }

    // Listener para atualizações
    registration.addEventListener('updatefound', () => {
      console.log('[SW] Atualização encontrada')
      const newWorker = registration.installing

      if (newWorker) {
        setState(prev => ({ ...prev, isInstalling: true }))

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            setState(prev => ({ ...prev, isInstalling: false }))

            if (navigator.serviceWorker.controller) {
              // Há uma nova versão disponível
              setState(prev => ({ 
                ...prev, 
                isWaiting: true, 
                isUpdateAvailable: true 
              }))
            }
          }
        })
      }
    })

    // Listener para controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed - reloading page')
      window.location.reload()
    })

    // Listener para mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW] Message received:', event.data)
      
      if (event.data?.type === 'SW_UPDATED') {
        setState(prev => ({ ...prev, isUpdateAvailable: true }))
      }
    })
  }

  return {
    ...state,
    register,
    unregister,
    update,
    skipWaiting
  }
}

// Hook para detectar se o app está sendo executado como PWA
export function usePWA() {
  const isClient = useIsClient()
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Só executar no cliente
    if (!isClient || typeof window === 'undefined') return

    const checkPWA = () => {
      // Verificar se está em modo standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches

      // Verificar se foi adicionado à tela inicial (iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true

      // Verificar se foi instalado via Chrome
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: minimal-ui)').matches

      setIsPWA(isStandalone || isIOSStandalone || isInstalled)
    }

    checkPWA()

    // Listener para mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkPWA)

    return () => {
      mediaQuery.removeEventListener('change', checkPWA)
    }
  }, [isClient])

  return isPWA
}

// Hook para prompt de instalação PWA
export function useInstallPrompt() {
  const isClient = useIsClient()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Só executar no cliente
    if (!isClient || typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevenir o prompt automático
      event.preventDefault()

      // Salvar o evento para uso posterior
      setDeferredPrompt(event)
      setIsInstallable(true)

      console.log('[PWA] Install prompt available')
    }

    const handleAppInstalled = () => {
      console.log('[PWA] App installed')
      setDeferredPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isClient])

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      // Mostrar o prompt
      deferredPrompt.prompt()
      
      // Aguardar a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('[PWA] Install prompt outcome:', outcome)
      
      // Limpar o prompt
      setDeferredPrompt(null)
      setIsInstallable(false)
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error)
      return false
    }
  }

  return {
    isInstallable,
    promptInstall
  }
}
