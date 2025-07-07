/**
 * Inicialização do Sistema de Sincronização
 * Configura o SyncService e aplica wrappers às stores existentes
 */

import { syncService } from './syncService';
import { withSync } from './createSyncedStore';

// Importar todas as stores que serão sincronizadas
import { useFinancasStore } from '../stores/financasStore';
import { useAlimentacaoStore } from '../stores/alimentacaoStore';
import { useAutoconhecimentoStore } from '../stores/autoconhecimentoStore';
import { useHiperfocosStore } from '../stores/hiperfocosStore';
import { usePainelDiaStore } from '../stores/painelDiaStore';
import { usePerfilStore } from '../stores/perfilStore';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { usePrioridadesStore } from '../stores/prioridadesStore';
import { useRegistroEstudosStore } from '../stores/registroEstudosStore';
import { useSonoStore } from '../stores/sonoStore';
import { useAtividadesStore } from '../stores/atividadesStore';
import { useHistoricoSimuladosStore } from '../stores/historicoSimuladosStore';
import { useAppStore } from '../store';

/**
 * Configuração de sincronização para cada store
 */
const SYNC_CONFIG = {
  financas: {
    enabled: true,
    debounceMs: 500, // Reduzido de 3000 para 500ms
    excludeFields: [] as string[]
  },
  alimentacao: {
    enabled: true,
    debounceMs: 500, // Reduzido de 2000 para 500ms
    excludeFields: [] as string[]
  },
  autoconhecimento: {
    enabled: true,
    debounceMs: 800, // Reduzido de 5000 para 800ms
    excludeFields: [] as string[]
  },
  hiperfocos: {
    enabled: true,
    debounceMs: 300, // Reduzido de 1000 para 300ms
    excludeFields: [] as string[]
  },
  painelDia: {
    enabled: true,
    debounceMs: 500, // Reduzido de 2000 para 500ms
    excludeFields: [] as string[]
  },
  perfil: {
    enabled: true,
    debounceMs: 1000, // Reduzido de 5000 para 1000ms
    excludeFields: [] as string[]
  },
  pomodoro: {
    enabled: true,
    debounceMs: 300, // Reduzido de 1000 para 300ms
    excludeFields: ['isRunning', 'timeLeft'] // Não sincronizar estado de execução
  },
  prioridades: {
    enabled: true,
    debounceMs: 500, // Reduzido de 2000 para 500ms
    excludeFields: [] as string[]
  },
  registroEstudos: {
    enabled: true,
    debounceMs: 500, // Reduzido de 2000 para 500ms
    excludeFields: [] as string[]
  },
  sono: {
    enabled: true,
    debounceMs: 800, // Reduzido de 3000 para 800ms
    excludeFields: [] as string[]
  },
  atividades: {
    enabled: true,
    debounceMs: 500, // Reduzido de 2000 para 500ms
    excludeFields: [] as string[]
  },
  historicoSimulados: {
    enabled: true,
    debounceMs: 800, // Reduzido de 3000 para 800ms
    excludeFields: [] as string[]
  },
  appGlobal: {
    enabled: true,
    debounceMs: 500, // Reduzido de 2000 para 500ms
    excludeFields: [] as string[]
  }
};

/**
 * Flag para verificar se a sincronização já foi inicializada
 */
let syncInitialized = false;

/**
 * Inicializa o sistema de sincronização
 * Deve ser chamado uma vez na inicialização da aplicação
 */
export async function initializeSync(): Promise<{
  success: boolean;
  message: string;
  syncEnabled: boolean;
}> {
  if (syncInitialized) {
    return {
      success: true,
      message: 'Sincronização já foi inicializada',
      syncEnabled: true
    };
  }

  try {
    console.log('🚀 Inicializando sistema de sincronização StayFocus...');

    // Aplicar wrappers de sincronização às stores
    console.log('📦 Aplicando wrappers de sincronização às stores...');
    
    withSync(useFinancasStore, 'financas', SYNC_CONFIG.financas);
    withSync(useAlimentacaoStore, 'alimentacao', SYNC_CONFIG.alimentacao);
    withSync(useAutoconhecimentoStore, 'autoconhecimento', SYNC_CONFIG.autoconhecimento);
    withSync(useHiperfocosStore, 'hiperfocos', SYNC_CONFIG.hiperfocos);
    withSync(usePainelDiaStore, 'painelDia', SYNC_CONFIG.painelDia);
    withSync(usePerfilStore, 'perfil', SYNC_CONFIG.perfil);
    withSync(usePomodoroStore, 'pomodoro', SYNC_CONFIG.pomodoro);
    withSync(usePrioridadesStore, 'prioridades', SYNC_CONFIG.prioridades);
    withSync(useRegistroEstudosStore, 'registroEstudos', SYNC_CONFIG.registroEstudos);
    withSync(useSonoStore, 'sono', SYNC_CONFIG.sono);
    withSync(useAtividadesStore, 'atividades', SYNC_CONFIG.atividades);
    withSync(useHistoricoSimuladosStore, 'historicoSimulados', SYNC_CONFIG.historicoSimulados);
    withSync(useAppStore, 'appGlobal', SYNC_CONFIG.appGlobal);

    console.log('✅ Wrappers aplicados com sucesso!');

    // Inicializar o serviço de sincronização
    console.log('🔄 Inicializando SyncService...');
    await syncService.initializeSync();

    syncInitialized = true;

    const status = syncService.getStatus();
    const message = status.isAuthenticated 
      ? '✅ Sincronização inicializada com Google Drive'
      : '⚠️ Sincronização inicializada (Google Drive não autenticado)';

    console.log(message);
    
    return {
      success: true,
      message,
      syncEnabled: status.isAuthenticated
    };
  } catch (error: any) {
    console.error('❌ Erro ao inicializar sincronização:', error);
    
    return {
      success: false,
      message: `Erro na inicialização: ${error.message}`,
      syncEnabled: false
    };
  }
}

/**
 * Verifica se a sincronização está inicializada
 */
export function isSyncInitialized(): boolean {
  return syncInitialized;
}

/**
 * Obtém o status atual da sincronização
 */
export function getSyncStatus() {
  return syncService.getStatus();
}

/**
 * Força uma sincronização manual
 */
export async function forceSyncNow() {
  if (!syncInitialized) {
    throw new Error('Sincronização não foi inicializada');
  }
  
  return await syncService.forcSync();
}

/**
 * Para a sincronização (útil para testes ou manutenção)
 */
export function stopSync() {
  if (syncInitialized) {
    syncService.stopSync();
    console.log('🛑 Sincronização parada');
  }
}

/**
 * Reinicia a sincronização
 */
export async function restartSync() {
  if (syncInitialized) {
    stopSync();
    syncInitialized = false;
  }
  
  return await initializeSync();
}

/**
 * Configuração de debug para desenvolvimento
 */
export const syncDebug = {
  getConfig: () => SYNC_CONFIG,
  getService: () => syncService,
  isInitialized: () => syncInitialized,
  
  // Métodos para debug
  logStatus: () => {
    const status = syncService.getStatus();
    console.table({
      'Online': status.isOnline,
      'Autenticado': status.isAuthenticated,
      'Sincronizando': status.isSyncing,
      'Mudanças Pendentes': status.hasPendingChanges,
      'Última Sync': status.lastSync || 'Nunca'
    });
  },
  
  // Forçar sincronização de uma store específica
  syncStore: async (storeName: string) => {
    console.log(`🔄 Forçando sincronização da store: ${storeName}`);
    syncService.markPendingChanges();
    return await syncService.forcSync();
  },

  // Informações do dispositivo
  getDeviceInfo: () => {
    if (typeof window !== 'undefined') {
      return {
        deviceId: localStorage.getItem('stayfocus_device_id'),
        lastSync: localStorage.getItem('stayfocus_last_sync'),
        userAgent: navigator.userAgent.substring(0, 100)
      };
    }
    return { deviceId: 'server', lastSync: null, userAgent: 'server' };
  }
};

// Exportar para uso global em desenvolvimento
if (typeof window !== 'undefined') {
  (window as any).syncDebug = syncDebug;
}