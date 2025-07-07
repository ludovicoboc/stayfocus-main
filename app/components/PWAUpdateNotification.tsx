'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X, Download } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export function PWAUpdateNotification() {
  const { isUpdateAvailable, reloadForUpdate } = usePWA()
  const [showNotification, setShowNotification] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true)
    }
  }, [isUpdateAvailable])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      reloadForUpdate()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setShowNotification(false)
  }

  if (!showNotification || !isUpdateAvailable) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Atualização Disponível
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Uma nova versão do StayFocus está disponível com melhorias e correções.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Atualizando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Atualizar Agora</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar status de sincronização
export function SyncStatusIndicator() {
  const { isOnline, hasPendingSync } = usePWA()
  const [showSyncStatus, setShowSyncStatus] = useState(false)

  useEffect(() => {
    // Mostrar indicador se há dados pendentes e está offline
    setShowSyncStatus(!isOnline && hasPendingSync)
  }, [isOnline, hasPendingSync])

  if (!showSyncStatus) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-md p-3">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Modo Offline:</strong> Suas alterações serão sincronizadas quando a conexão for restaurada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}