'use client'

import { useState, useEffect, useCallback } from 'react'

interface PWAState {
  isInstalled: boolean
  isOnline: boolean
  canInstall: boolean
  isUpdateAvailable: boolean
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isOnline: true,
    canInstall: false,
    isUpdateAvailable: false
  })
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Verificar se está instalado
  const checkIfInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isInstalled = isStandalone || isInWebAppiOS
    
    setState(prev => ({ ...prev, isInstalled }))
    return isInstalled
  }, [])

  // Verificar status online
  const updateOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine
    setState(prev => ({ ...prev, isOnline }))
    return isOnline
  }, [])

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('PWA install prompt não está disponível')
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA instalada com sucesso')
        setState(prev => ({ ...prev, canInstall: false, isInstalled: true }))
        setDeferredPrompt(null)
        return true
      } else {
        console.log('Instalação da PWA foi rejeitada')
        return false
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }, [deferredPrompt])

  // Atualizar service worker
  const updateServiceWorker = useCallback(async () => {
    if (!registration) {
      console.warn('Service Worker registration não encontrado')
      return false
    }

    try {
      await registration.update()
      console.log('Service Worker atualizado')
      setState(prev => ({ ...prev, isUpdateAvailable: false }))
      return true
    } catch (error) {
      console.error('Erro ao atualizar Service Worker:', error)
      return false
    }
  }, [registration])

  // Recarregar para aplicar atualizações
  const reloadForUpdate = useCallback(() => {
    if ('serviceWorker' in navigator && registration) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  // Verificar se há dados pendentes para sincronizar
  const hasPendingSync = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    // Verificar se há dados modificados localmente que precisam ser sincronizados
    const stores = [
      'painel-dia-storage',
      'pomodoro-storage', 
      'registro-estudos-storage',
      'alimentacao-storage',
      'financas-storage',
      'receitas-storage'
    ]
    
    return stores.some(storeName => {
      const data = localStorage.getItem(storeName)
      if (!data) return false
      
      try {
        const parsed = JSON.parse(data)
        // Verificar se há timestamp de modificação recente
        return parsed.state && parsed.lastModified && 
               (Date.now() - parsed.lastModified) < 24 * 60 * 60 * 1000 // 24 horas
      } catch {
        return false
      }
    })
  }, [])

  // Registrar background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync não é suportado')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      // Type assertion para Background Sync API
      const syncManager = (registration as any).sync
      if (syncManager) {
        await syncManager.register(tag)
        console.log(`Background sync registrado: ${tag}`)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao registrar background sync:', error)
      return false
    }
  }, [])

  useEffect(() => {
    // Verificar estado inicial
    checkIfInstalled()
    updateOnlineStatus()

    // Event listeners
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setState(prev => ({ ...prev, canInstall: true }))
    }

    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, canInstall: false }))
      setDeferredPrompt(null)
      console.log('PWA instalada!')
    }

    const handleOnline = () => {
      updateOnlineStatus()
      // Tentar sincronizar dados quando voltar online
      if (hasPendingSync()) {
        registerBackgroundSync('background-sync')
      }
    }

    const handleOffline = () => {
      updateOnlineStatus()
    }

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Verificar atualizações
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }))
              }
            })
          }
        })
      })

      // Listener para mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setState(prev => ({ ...prev, isUpdateAvailable: true }))
        }
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkIfInstalled, updateOnlineStatus, hasPendingSync, registerBackgroundSync])

  return {
    ...state,
    installPWA,
    updateServiceWorker,
    reloadForUpdate,
    hasPendingSync: hasPendingSync(),
    registerBackgroundSync
  }
}