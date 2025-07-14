/**
 * Componente Unificado de Sincronização
 * Foca na sincronização automática sem botões manuais redundantes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { syncService, SyncStatus } from '../lib/syncService';
import { Cloud, CloudOff, CheckCircle, AlertCircle, Info, Settings, Activity, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import Link from 'next/link';

export function SyncStatusUnified() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const updateStatus = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    const updateCacheStats = () => {
      setCacheStats(syncService.getCacheStats());
    };

    // Atualizar status inicial
    updateStatus(syncService.getStatus());
    updateCacheStats();
    
    // Escutar mudanças
    syncService.addStatusListener(updateStatus);
    
    // Atualizar cache stats periodicamente
    const statsInterval = setInterval(updateCacheStats, 10000); // 10 segundos

    return () => {
      syncService.removeStatusListener(updateStatus);
      clearInterval(statsInterval);
    };
  }, []);

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Nunca';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />;
    }
    
    if (!status.isAuthenticated) {
      return <CloudOff className="w-5 h-5 text-gray-400" />;
    }
    
    if (!status.isOnline) {
      return <WifiOff className="w-5 h-5 text-orange-500" />;
    }
    
    if (status.hasPendingChanges) {
      return <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />;
    }
    
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (status.isSyncing) return 'Sincronizando automaticamente...';
    if (!status.isAuthenticated) return 'Google Drive desconectado';
    if (!status.isOnline) return 'Modo offline - dados salvos localmente';
    if (status.hasPendingChanges) return 'Aguardando sincronização automática';
    return 'Sincronizado automaticamente';
  };

  const getStatusColor = () => {
    if (status.isSyncing) return 'text-blue-600';
    if (!status.isAuthenticated) return 'text-gray-600';
    if (!status.isOnline) return 'text-orange-600';
    if (status.hasPendingChanges) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    window.location.href = '/api/auth/google/connect';
  };

  const handleForceSync = async () => {
    if (status.isAuthenticated && status.isOnline && !status.isSyncing) {
      await syncService.forcSync();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Cloud className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Sincronização Automática</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Detalhes</span>
          </Button>
        </div>

        {/* Status Principal */}
        <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 mb-6">
          {getStatusIcon()}
          <div className="flex-1">
            <div className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Última sincronização: {formatLastSync(status.lastSync)}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {!status.isAuthenticated ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center space-x-2"
            >
              <Cloud className="w-4 h-4" />
              <span>Conectar Google Drive</span>
            </Button>
          ) : (
            <Button
              onClick={handleForceSync}
              disabled={status.isSyncing || !status.isOnline}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Sincronizar agora</span>
            </Button>
          )}
          
          <Link href="/perfil">
            <Button variant="outline" className="w-full flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </Button>
          </Link>
        </div>

        {/* Detalhes expandidos */}
        {showDetails && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium mb-3">Informações da Sincronização</h3>
            
            {/* Status da Conexão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Wifi className={`w-5 h-5 ${status.isOnline ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <div className="font-medium">Conexão</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {status.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Cloud className={`w-5 h-5 ${status.isAuthenticated ? 'text-blue-500' : 'text-gray-400'}`} />
                <div>
                  <div className="font-medium">Google Drive</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {status.isAuthenticated ? 'Conectado' : 'Desconectado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas do Cache */}
            {cacheStats && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Cache Inteligente</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Entradas</div>
                    <div className="font-medium">{cacheStats.totalEntries}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Tamanho</div>
                    <div className="font-medium">{formatBytes(cacheStats.totalSize)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Hit Rate</div>
                    <div className="font-medium">{cacheStats.hitRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Sincronizações</div>
                    <div className="font-medium">{cacheStats.saves}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Sincronização Automática Ativa
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 space-y-1">
                    <p>• Seus dados são sincronizados automaticamente</p>
                    <p>• Funciona offline com sincronização quando voltar online</p>
                    <p>• Cache inteligente evita uploads desnecessários</p>
                    <p>• Compressão automática para economia de dados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 