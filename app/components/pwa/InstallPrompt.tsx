'use client'

import { useState, useEffect } from 'react'
import { useInstallPrompt, usePWA } from '@/app/hooks/useServiceWorker'
import { useSafeLocalStorage } from '@/app/hooks/useIsClient'

interface InstallPromptProps {
  className?: string
  showOnlyWhenInstallable?: boolean
}

export function InstallPrompt({
  className = '',
  showOnlyWhenInstallable = true
}: InstallPromptProps) {
  const safeLocalStorage = useSafeLocalStorage()
  const { isInstallable, promptInstall } = useInstallPrompt()
  const isPWA = usePWA()
  const [isInstalling, setIsInstalling] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Mostrar prompt apenas se for instalável e não estiver em modo PWA
    if (isInstallable && !isPWA && !dismissed) {
      // Delay para não ser muito intrusivo
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isPWA, dismissed])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const accepted = await promptInstall()
      if (accepted) {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    
    // Salvar no localStorage para não mostrar novamente nesta sessão
    if (safeLocalStorage) {
      safeLocalStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
  }

  // Verificar se foi dismissado anteriormente
  useEffect(() => {
    if (!safeLocalStorage) return

    const dismissedTime = safeLocalStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime)
      // Mostrar novamente após 24 horas
      if (timeDiff < 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }
  }, [safeLocalStorage])

  // Se não deve mostrar quando não instalável, retornar null
  if (showOnlyWhenInstallable && !isInstallable) {
    return null
  }

  // Se está em modo PWA, não mostrar
  if (isPWA) {
    return null
  }

  // Se não deve mostrar o prompt, retornar null
  if (!showPrompt && showOnlyWhenInstallable) {
    return null
  }

  return (
    <div className={`${className}`}>
      {/* Banner de instalação */}
      {showPrompt && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                Instalar StayFocus
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Adicione o StayFocus à sua tela inicial para acesso rápido e experiência nativa.
              </p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isInstalling ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Instalando...</span>
                    </span>
                  ) : (
                    'Instalar App'
                  )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="text-blue-100 hover:text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Agora não
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-blue-100 hover:text-white p-1 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Botão compacto para instalação */}
      {!showPrompt && isInstallable && !showOnlyWhenInstallable && (
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
          <span>{isInstalling ? 'Instalando...' : 'Instalar App'}</span>
        </button>
      )}
    </div>
  )
}

// Componente para mostrar benefícios da instalação
export function InstallBenefits() {
  const isPWA = usePWA()

  if (isPWA) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-green-800 font-medium">
            App instalado com sucesso!
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-blue-900 font-medium mb-2">
        Benefícios de instalar o app:
      </h4>
      <ul className="text-blue-800 text-sm space-y-1">
        <li className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Acesso rápido pela tela inicial</span>
        </li>
        <li className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Funciona offline</span>
        </li>
        <li className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Experiência nativa</span>
        </li>
        <li className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>Notificações push</span>
        </li>
      </ul>
    </div>
  )
}
