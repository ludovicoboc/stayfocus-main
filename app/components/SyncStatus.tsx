/**
 * Componente de Status de Sincronização
 * Mostra o estado atual da sincronização de forma discreta e informativa
 */

'use client';

import React, { useState, useEffect } from 'react';
import { syncService, SyncStatus as SyncStatusType } from '../lib/syncService';
import { forceLoadFromCloud } from '../lib/initSync';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export function SyncStatus({ 
  className = '', 
  showDetails = false,
  position = 'top-right'
}: SyncStatusProps) {
  const [status, setStatus] = useState<SyncStatusType>(syncService.getStatus());
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncFormatted, setLastSyncFormatted] = useState<string>('Nunca');

  useEffect(() => {
    const updateStatus = (newStatus: SyncStatusType) => {
      setStatus(newStatus);
      
      // Formatar última sincronização
      if (newStatus.lastSync) {
        const date = new Date(newStatus.lastSync);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) {
          setLastSyncFormatted('Agora mesmo');
        } else if (diffMins < 60) {
          setLastSyncFormatted(`${diffMins} min atrás`);
        } else {
          setLastSyncFormatted(date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
      } else {
        setLastSyncFormatted('Nunca');
      }
    };

    // Atualizar status inicial
    updateStatus(syncService.getStatus());
    
    // Escutar mudanças
    syncService.addStatusListener(updateStatus);
    
    // Atualizar formatação a cada minuto
    const interval = setInterval(() => {
      updateStatus(syncService.getStatus());
    }, 60000);

    return () => {
      syncService.removeStatusListener(updateStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return (
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      );
    }
    
    if (!status.isAuthenticated) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (!status.isOnline) {
      return (
        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414L5.414 8l.879-.879zM17.707 5.293a1 1 0 00-1.414 0l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414L16.828 8l.879-.879a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (status.hasPendingChanges) {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (status.isSyncing) return 'Sincronizando...';
    if (!status.isAuthenticated) return 'Não autenticado';
    if (!status.isOnline) return 'Offline';
    if (status.hasPendingChanges) return 'Aguardando sync';
    return 'Sincronizado';
  };

  const getStatusColor = () => {
    if (status.isSyncing) return 'text-blue-600';
    if (!status.isAuthenticated) return 'text-gray-500';
    if (!status.isOnline) return 'text-orange-600';
    if (status.hasPendingChanges) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleForceSync = async () => {
    if (status.isAuthenticated && status.isOnline && !status.isSyncing) {
      await syncService.forcSync();
    }
  };

  const handleForceLoad = async () => {
    if (status.isAuthenticated && status.isOnline && !status.isSyncing) {
      try {
        const result = await forceLoadFromCloud();
        if (result.success && result.imported) {
          // A página será recarregada automaticamente após importação
          window.location.reload();
        }
      } catch (error) {
        console.error('Erro ao forçar carregamento:', error);
      }
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer transition-all duration-200 hover:shadow-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Status compacto */}
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {showDetails && (
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Detalhes expandidos */}
        {isExpanded && showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Última sync:</span>
                <span className="font-medium">{lastSyncFormatted}</span>
              </div>
              
              <div className="flex justify-between mt-1">
                <span>Status:</span>
                <div className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${
                    status.isOnline ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span>{status.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-1">
                <span>Google Drive:</span>
                <span className={status.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {status.isAuthenticated ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="space-y-2 mt-3">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleForceSync();
                  }}
                  disabled={!status.isAuthenticated || !status.isOnline || status.isSyncing}
                  className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {status.isSyncing ? 'Sincronizando...' : 'Enviar Dados'}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleForceLoad();
                  }}
                  disabled={!status.isAuthenticated || !status.isOnline || status.isSyncing}
                  className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Buscar Dados
                </button>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/auth/google';
                }}
                className="w-full px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                {status.isAuthenticated ? 'Reautenticar' : 'Conectar Google Drive'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Componente compacto para barra de status
 */
export function SyncStatusBar({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<SyncStatusType>(syncService.getStatus());

  useEffect(() => {
    const updateStatus = (newStatus: SyncStatusType) => setStatus(newStatus);
    syncService.addStatusListener(updateStatus);
    return () => syncService.removeStatusListener(updateStatus);
  }, []);

  const getStatusDot = () => {
    if (status.isSyncing) return 'bg-blue-500 animate-pulse';
    if (!status.isAuthenticated || !status.isOnline) return 'bg-red-500';
    if (status.hasPendingChanges) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {status.isSyncing ? 'Sincronizando' : 
         !status.isAuthenticated ? 'Desconectado' :
         !status.isOnline ? 'Offline' :
         status.hasPendingChanges ? 'Pendente' : 'Sincronizado'}
      </span>
    </div>
  );
}

/**
 * Hook para usar status de sincronização em outros componentes
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatusType>(syncService.getStatus());

  useEffect(() => {
    const updateStatus = (newStatus: SyncStatusType) => setStatus(newStatus);
    syncService.addStatusListener(updateStatus);
    return () => syncService.removeStatusListener(updateStatus);
  }, []);

  return {
    ...status,
    forcSync: () => syncService.forcSync(),
    lastSyncFormatted: status.lastSync 
      ? new Date(status.lastSync).toLocaleString('pt-BR')
      : 'Nunca'
  };
}

/**
 * Componente compacto para integração no header
 */
export function SyncStatusCompact() {
  const [status, setStatus] = useState<SyncStatusType>(syncService.getStatus());
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const updateStatus = (newStatus: SyncStatusType) => setStatus(newStatus);
    syncService.addStatusListener(updateStatus);
    return () => syncService.removeStatusListener(updateStatus);
  }, []);

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return (
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      );
    }
    
    if (!status.isAuthenticated) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (!status.isOnline) {
      return (
        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 10-1.414-1.414l-2 2a1 1 0 000 1.414l2 2a1 1 0 001.414-1.414L5.414 8l.879-.879z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (status.hasPendingChanges) {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStatusColor = () => {
    if (status.isSyncing) return 'text-blue-500';
    if (!status.isAuthenticated) return 'text-gray-400';
    if (!status.isOnline) return 'text-orange-500';
    if (status.hasPendingChanges) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTooltipText = () => {
    if (status.isSyncing) return 'Sincronizando dados...';
    if (!status.isAuthenticated) return 'Google Drive não conectado';
    if (!status.isOnline) return 'Modo offline';
    if (status.hasPendingChanges) return 'Aguardando sincronização';
    return 'Dados sincronizados';
  };

  const handleClick = async () => {
    if (!status.isAuthenticated) {
      window.location.href = '/auth/google';
    } else if (status.isAuthenticated && status.isOnline && !status.isSyncing) {
      try {
        const result = await forceLoadFromCloud();
        if (result.success && result.imported) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Erro ao forçar carregamento:', error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${getStatusColor()}`}
        aria-label="Status de Sincronização"
      >
        {getStatusIcon()}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-50">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}