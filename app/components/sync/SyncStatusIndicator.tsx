'use client'

import { useState } from 'react'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  Settings
} from 'lucide-react'
import { useSyncStatus } from '@/app/lib/hooks/useSyncStatus'

interface SyncStatusIndicatorProps {
  showDetails?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

export function SyncStatusIndicator({ 
  showDetails = false, 
  position = 'top-right',
  className = '' 
}: SyncStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const syncStatus = useSyncStatus()

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-4 w-4" />
    }
    
    if (syncStatus.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    
    if (syncStatus.hasConflicts) {
      return <AlertTriangle className="h-4 w-4" />
    }
    
    if (syncStatus.hasPendingOperations) {
      return <Clock className="h-4 w-4" />
    }
    
    return <CheckCircle className="h-4 w-4" />
  }

  const getStatusColor = () => {
    const color = syncStatus.getSyncStatusColor()
    const colors = {
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      red: 'bg-red-500 text-white',
      gray: 'bg-gray-500 text-white'
    }
    return colors[color]
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const handleForceSync = async () => {
    if (syncStatus.canSync) {
      try {
        await syncStatus.forceSync()
      } catch (error) {
        console.error('Force sync failed:', error)
      }
    }
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Indicador principal */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer
          transition-all duration-200 hover:shadow-xl
          ${getStatusColor()}
          ${isExpanded ? 'rounded-b-none' : ''}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        title={syncStatus.getSyncStatusText()}
      >
        {getStatusIcon()}
        
        {showDetails && (
          <span className="text-sm font-medium">
            {syncStatus.getSyncStatusText()}
          </span>
        )}
        
        {/* Contador de pendências */}
        {(syncStatus.pendingCount > 0 || syncStatus.conflictCount > 0) && (
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-bold">
            {syncStatus.pendingCount + syncStatus.conflictCount}
          </span>
        )}
      </div>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg rounded-t-none shadow-lg min-w-80 max-w-96">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Status de Sincronização
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-4 space-y-4">
            {/* Status de conexão */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conexão:</span>
              <div className="flex items-center gap-2">
                {syncStatus.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
                {syncStatus.connectionQuality !== 'offline' && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    syncStatus.connectionQuality === 'good' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                  }`}>
                    {syncStatus.connectionQuality === 'good' ? 'Boa' : 'Lenta'}
                  </span>
                )}
              </div>
            </div>

            {/* Operações pendentes */}
            {syncStatus.pendingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pendentes:</span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  {syncStatus.pendingCount} operação(ões)
                </span>
              </div>
            )}

            {/* Conflitos */}
            {syncStatus.conflictCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Conflitos:</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {syncStatus.conflictCount} conflito(s)
                </span>
              </div>
            )}

            {/* Última sincronização */}
            {syncStatus.lastSyncTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Última sync:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {syncStatus.lastSyncTime.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* Sincronizar agora */}
              {syncStatus.canSync && (
                <button
                  onClick={handleForceSync}
                  disabled={syncStatus.isSyncing}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {syncStatus.isSyncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
              )}

              {/* Resolver conflitos */}
              {syncStatus.hasConflicts && (
                <button
                  onClick={() => {
                    // Aqui você pode abrir um modal de resolução de conflitos
                    console.log('Open conflict resolution modal')
                  }}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Resolver
                </button>
              )}

              {/* Configurações */}
              <button
                onClick={() => {
                  // Aqui você pode abrir configurações de sincronização
                  console.log('Open sync settings')
                }}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                title="Configurações de sincronização"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* Status detalhado */}
            {syncStatus.isFullySynced && (
              <div className="text-center py-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Tudo sincronizado!
                </p>
              </div>
            )}

            {!syncStatus.isOnline && (
              <div className="text-center py-2">
                <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trabalhando offline
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Suas alterações serão sincronizadas quando voltar online
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
