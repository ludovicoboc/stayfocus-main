/**
 * Componente de Indicador de Conexão
 * Mostra status de conectividade e permite controles de sincronização
 */

'use client'

import React, { useState } from 'react'
import { useFallback, getConnectionIcon, getStatusMessage, formatTimestamp } from './useFallback'
import type { FallbackProvider } from './FallbackProvider'

// ============================================================================
// TIPOS
// ============================================================================

interface ConnectionIndicatorProps {
  fallbackProvider?: FallbackProvider
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showDetails?: boolean
  className?: string
}

interface ConnectionBadgeProps {
  fallbackProvider?: FallbackProvider
  onClick?: () => void
  className?: string
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ConnectionIndicator({
  fallbackProvider,
  position = 'bottom-right',
  showDetails = false,
  className = '',
}: ConnectionIndicatorProps) {
  const { status, controls, operations, events } = useFallback(fallbackProvider)
  const [isExpanded, setIsExpanded] = useState(showDetails)

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleForceSync = async () => {
    await controls.forcSync()
  }

  const handleRetryConnection = async () => {
    await controls.retryConnection()
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Badge principal */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg cursor-pointer
          transition-all duration-200 hover:shadow-xl
          ${status.isConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
          }
          ${status.isInFallback ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
        `}
        onClick={handleToggleExpanded}
      >
        <span className="text-lg">{getConnectionIcon(status)}</span>
        <span className="text-sm font-medium">
          {getStatusMessage(status)}
        </span>
        {status.queueCount > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {status.queueCount}
          </span>
        )}
        <span className="text-xs opacity-70">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80 max-w-96">
          {/* Status detalhado */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Status da Conexão</h3>
              <button
                onClick={handleToggleExpanded}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={status.isOnline ? 'text-green-500' : 'text-red-500'}>
                  {status.isOnline ? '🌐' : '📡'}
                </span>
                <span>Internet: {status.isOnline ? 'Online' : 'Offline'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={status.isConnected ? 'text-green-500' : 'text-red-500'}>
                  {status.isConnected ? '🔗' : '⚠️'}
                </span>
                <span>Servidor: {status.isConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={status.isInFallback ? 'text-yellow-500' : 'text-green-500'}>
                  {status.isInFallback ? '💾' : '☁️'}
                </span>
                <span>Modo: {status.isInFallback ? 'Offline' : 'Online'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={status.isSyncing ? 'text-blue-500' : 'text-gray-500'}>
                  {status.isSyncing ? '🔄' : '⏸️'}
                </span>
                <span>Sync: {status.isSyncing ? 'Ativo' : 'Parado'}</span>
              </div>
            </div>

            {/* Última sincronização */}
            {status.lastSync && (
              <div className="text-xs text-gray-500">
                Última sync: {formatTimestamp(status.lastSync)}
              </div>
            )}

            {/* Controles */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleForceSync}
                disabled={status.isSyncing || status.queueCount === 0}
                className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {status.isSyncing ? 'Sincronizando...' : 'Forçar Sync'}
              </button>

              <button
                onClick={handleRetryConnection}
                disabled={status.isConnected}
                className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reconectar
              </button>
            </div>

            {/* Queue de operações */}
            {operations.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Operações Pendentes ({operations.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {operations.slice(0, 5).map((op) => (
                    <div
                      key={op.id}
                      className="text-xs bg-gray-50 rounded p-2 flex justify-between items-center"
                    >
                      <span>
                        {op.type} {op.entity}
                      </span>
                      <span className="text-gray-500">
                        {formatTimestamp(op.timestamp)}
                      </span>
                    </div>
                  ))}
                  {operations.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{operations.length - 5} mais...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Eventos recentes */}
            {events.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Eventos Recentes
                </h4>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {events.slice(-3).map((event, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>{getEventMessage(event)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE BADGE SIMPLES
// ============================================================================

export function ConnectionBadge({
  fallbackProvider,
  onClick,
  className = '',
}: ConnectionBadgeProps) {
  const { status } = useFallback(fallbackProvider)

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-2 py-1 rounded text-sm
        transition-colors duration-200
        ${status.isConnected 
          ? 'text-green-600 hover:bg-green-50' 
          : 'text-red-600 hover:bg-red-50'
        }
        ${status.isInFallback ? 'text-yellow-600 hover:bg-yellow-50' : ''}
        ${className}
      `}
    >
      <span>{getConnectionIcon(status)}</span>
      {status.queueCount > 0 && (
        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {status.queueCount}
        </span>
      )}
    </button>
  )
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function getEventMessage(event: any): string {
  switch (event.type) {
    case 'connection_lost':
      return 'Conexão perdida'
    case 'connection_restored':
      return 'Conexão restaurada'
    case 'fallback_activated':
      return 'Modo offline ativado'
    case 'fallback_deactivated':
      return 'Modo online restaurado'
    case 'sync_started':
      return 'Sincronização iniciada'
    case 'sync_completed':
      return `Sync concluída (${event.operations} ops)`
    case 'sync_failed':
      return `Sync falhou: ${event.error}`
    case 'operation_queued':
      return `Operação adicionada: ${event.operation.type}`
    default:
      return 'Evento desconhecido'
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ConnectionIndicator
