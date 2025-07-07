/**
 * Wrapper transparente para stores Zustand com sincronização automática
 * Intercepta setState para acionar sincronização sem modificar stores existentes
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { syncService } from './syncService';

type SyncedStore<T> = T & {
  _syncEnabled: boolean;
  _lastModified: string;
};

type SyncedStoreApi<T> = {
  setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
};

/**
 * Cria uma store Zustand com sincronização automática
 * Wrapper transparente que não modifica a lógica original da store
 */
export function createSyncedStore<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  storeCreator: StateCreator<T, [], Mps, Mcs>,
  storeName: string,
  options: {
    syncEnabled?: boolean;
    debounceMs?: number;
    excludeFields?: (keyof T)[];
  } = {}
) {
  const {
    syncEnabled = true,
    debounceMs = 2000,
    excludeFields = []
  } = options;

  let debounceTimer: NodeJS.Timeout | null = null;
  let isInternalUpdate = false;

  return (set: any, get: any, api: any) => {
    // Criar store original
    const originalStore = storeCreator(set, get, api);

    // Wrapper para setState que intercepta mudanças
    const wrappedSet = (partial: any, replace?: boolean) => {
      // Aplicar mudança na store original
      set(partial, replace);

      // Se não é uma atualização interna e sync está habilitado
      if (!isInternalUpdate && syncEnabled) {
        // Marcar timestamp da modificação
        const currentState = get();
        if (currentState && typeof currentState === 'object') {
          currentState._lastModified = new Date().toISOString();
        }

        // Agendar sincronização com debounce
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
          console.log(`📝 Store '${storeName}' modificada - agendando sincronização`);
          syncService.markPendingChanges();
          debounceTimer = null;
        }, debounceMs);
      }
    };

    // Substituir o set original pelo wrapped
    api.setState = wrappedSet;

    // Adicionar metadados de sincronização ao estado inicial
    const enhancedStore = {
      ...originalStore,
      _syncEnabled: syncEnabled,
      _lastModified: new Date().toISOString(),
      
      // Método para atualizar sem acionar sync (para importação)
      _updateWithoutSync: (newState: Partial<T>) => {
        isInternalUpdate = true;
        set(newState, false);
        isInternalUpdate = false;
      },
      
      // Método para obter dados limpos (sem metadados)
      _getCleanData: () => {
        const state = get();
        const cleanData = { ...state };
        
        // Remover metadados de sincronização
        delete (cleanData as any)._syncEnabled;
        delete (cleanData as any)._lastModified;
        delete (cleanData as any)._updateWithoutSync;
        delete (cleanData as any)._getCleanData;
        
        // Remover campos excluídos
        excludeFields.forEach(field => {
          delete cleanData[field];
        });
        
        return cleanData;
      }
    };

    return enhancedStore as unknown as SyncedStore<T>;
  };
}

/**
 * Hook para obter status de sincronização de uma store específica
 */
export function useSyncStatus(storeName: string) {
  const [status, setStatus] = React.useState(syncService.getStatus());
  
  React.useEffect(() => {
    const listener = (newStatus: any) => setStatus(newStatus);
    syncService.addStatusListener(listener);
    
    return () => syncService.removeStatusListener(listener);
  }, []);
  
  return {
    ...status,
    storeName,
    forcSync: () => syncService.forcSync(),
    lastSyncFormatted: status.lastSync 
      ? new Date(status.lastSync).toLocaleString('pt-BR')
      : 'Nunca'
  };
}

/**
 * Utilitário para migrar store existente para versão sincronizada
 * Permite migração gradual sem quebrar código existente
 */
export function migrateToSyncedStore<T>(
  useStore: any,
  storeName: string,
  options?: {
    syncEnabled?: boolean;
    debounceMs?: number;
    excludeFields?: (keyof T)[];
  }
) {
  console.log(`🔄 Migrando store '${storeName}' para versão sincronizada`);
  
  // Wrapper que mantém a API original mas adiciona sincronização
  return {
    ...useStore,
    
    // Método para forçar sincronização desta store específica
    syncNow: () => {
      console.log(`⚡ Sincronização forçada para store '${storeName}'`);
      syncService.markPendingChanges();
      return syncService.forcSync();
    },
    
    // Método para obter dados limpos desta store
    getCleanData: () => {
      const state = useStore.getState();
      const cleanData = { ...state };
      
      // Remover campos de sincronização se existirem
      delete (cleanData as any)._syncEnabled;
      delete (cleanData as any)._lastModified;
      
      // Remover campos excluídos se especificados
      if (options?.excludeFields) {
        options.excludeFields.forEach(field => {
          delete cleanData[field];
        });
      }
      
      return cleanData;
    },
    
    // Método para atualizar sem acionar sync
    updateWithoutSync: (newState: Partial<T>) => {
      const currentSet = useStore.setState;
      
      // Temporariamente desabilitar sync
      (useStore as any)._skipNextSync = true;
      currentSet(newState);
      delete (useStore as any)._skipNextSync;
    }
  };
}

/**
 * Decorator para adicionar sincronização a stores existentes
 * Uso: const syncedStore = withSync(useMyStore, 'myStore');
 */
export function withSync<T>(
  useStore: any,
  storeName: string,
  options: {
    enabled?: boolean;
    debounceMs?: number;
    excludeFields?: (keyof T)[];
  } = {}
) {
  const { enabled = true, debounceMs = 2000, excludeFields = [] } = options;
  
  if (!enabled) {
    console.log(`⏸️ Sincronização desabilitada para store '${storeName}'`);
    return useStore;
  }
  
  let debounceTimer: NodeJS.Timeout | null = null;
  
  // Interceptar setState original
  const originalSetState = useStore.setState;
  
  useStore.setState = (partial: any, replace?: boolean) => {
    // Aplicar mudança normalmente
    originalSetState(partial, replace);
    
    // Verificar se deve pular sincronização
    if ((useStore as any)._skipNextSync) {
      return;
    }
    
    // Agendar sincronização com debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      console.log(`📝 Store '${storeName}' modificada via withSync - agendando sincronização`);
      syncService.markPendingChanges();
      debounceTimer = null;
    }, debounceMs);
  };
  
  // Adicionar métodos de sincronização
  (useStore as any).syncNow = () => {
    console.log(`⚡ Sincronização forçada para store '${storeName}' via withSync`);
    syncService.markPendingChanges();
    return syncService.forcSync();
  };
  
  (useStore as any).getCleanData = () => {
    const state = useStore.getState();
    const cleanData = { ...state };
    
    // Remover campos excluídos
    excludeFields.forEach(field => {
      delete cleanData[field];
    });
    
    return cleanData;
  };
  
  console.log(`✅ Store '${storeName}' agora tem sincronização automática via withSync`);
  return useStore;
}

// Re-exportar React para o hook
import React from 'react';