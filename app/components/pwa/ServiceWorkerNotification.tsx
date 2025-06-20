'use client'

import { useEffect, useState } from 'react'
import { useServiceWorker } from '@/app/hooks/useServiceWorker'

interface ServiceWorkerNotificationProps {
  className?: string
}

export function ServiceWorkerNotification({ className = '' }: ServiceWorkerNotificationProps) {
  const { isUpdateAvailable, isWaiting, skipWaiting, error } = useServiceWorker()
  const [showNotification, setShowNotification] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isUpdateAvailable || error) {
      setShowNotification(true)
    }
  }, [isUpdateAvailable, error])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await skipWaiting()
      // O Service Worker irá recarregar a página automaticamente
    } catch (err) {
      console.error('Erro ao atualizar:', err)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setShowNotification(false)
  }

  if (!showNotification) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Notificação de atualização */}
      {isUpdateAvailable && (
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">
                Nova versão disponível
              </h3>
              <p className="text-sm text-blue-100 mt-1">
                Uma atualização do StayFocus está pronta para ser instalada.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Atualizando...' : 'Atualizar'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-blue-100 hover:text-white px-3 py-1 rounded text-sm"
                >
                  Depois
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-blue-100 hover:text-white"
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

      {/* Notificação de erro */}
      {error && !isUpdateAvailable && (
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">
                Erro no Service Worker
              </h3>
              <p className="text-sm text-red-100 mt-1">
                {error}
              </p>
              <div className="mt-3">
                <button
                  onClick={handleDismiss}
                  className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-50"
                >
                  Fechar
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-red-100 hover:text-white"
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
    </div>
  )
}

// Componente para status do Service Worker (para debug)
export function ServiceWorkerStatus() {
  const sw = useServiceWorker()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Service Worker Status</h4>
      <div className="space-y-1">
        <div>Suportado: {sw.isSupported ? '✅' : '❌'}</div>
        <div>Registrado: {sw.isRegistered ? '✅' : '❌'}</div>
        <div>Instalando: {sw.isInstalling ? '⏳' : '✅'}</div>
        <div>Aguardando: {sw.isWaiting ? '⏳' : '✅'}</div>
        <div>Atualização: {sw.isUpdateAvailable ? '🔄' : '✅'}</div>
        {sw.error && <div className="text-red-300">Erro: {sw.error}</div>}
      </div>
    </div>
  )
}
