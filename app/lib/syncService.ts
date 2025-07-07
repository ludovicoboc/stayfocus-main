/**
 * Serviço de Sincronização Híbrida para StayFocus
 * Combina localStorage + Google Drive para sincronização automática
 * Aproveita a infraestrutura existente de exportação/importação
 */

import { obterDadosParaExportar, importarDadosFromObject } from './dataService';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  hasPendingChanges: boolean;
  isAuthenticated: boolean;
  isSyncing: boolean;
}

export class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;
  private pendingSync = false;
  private lastSyncTime: string | null = null;
  private hasPendingChanges = false;
  private isAuthenticated = false;
  private statusListeners: ((status: SyncStatus) => void)[] = [];
  private syncQueue: (() => Promise<void>)[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.setupOnlineDetection();
    this.loadLastSyncTime();
  }

  /**
   * Inicializa o serviço de sincronização
   */
  async initializeSync(): Promise<void> {
    try {
      // Verifica autenticação Google
      this.isAuthenticated = await this.checkGoogleAuth();
      
      if (this.isAuthenticated) {
        console.log('✅ Google Drive autenticado - iniciando sincronização automática');
        await this.startAutoSync();
        await this.loadFromCloudOnStartup();
      } else {
        console.log('⚠️ Google Drive não autenticado - funcionando apenas localmente');
      }
      
      this.notifyStatusChange();
    } catch (error) {
      console.error('Erro ao inicializar sincronização:', error);
    }
  }

  /**
   * Inicia sincronização automática em intervalos
   */
  private async startAutoSync(): Promise<void> {
    // Sincronização a cada 5 minutos
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.pendingSync && this.isAuthenticated && this.hasPendingChanges) {
        await this.syncToCloud();
      }
    }, 5 * 60 * 1000);

    // Sincronização imediata se há mudanças pendentes
    if (this.hasPendingChanges) {
      setTimeout(() => this.syncToCloud(), 2000); // Delay de 2s para evitar múltiplas chamadas
    }
  }

  /**
   * Sincroniza dados locais para a nuvem
   */
  async syncToCloud(): Promise<{ success: boolean; error?: string }> {
    if (this.pendingSync || !this.isAuthenticated || !this.isOnline) {
      return { success: false, error: 'Sincronização não disponível no momento' };
    }

    try {
      this.pendingSync = true;
      this.notifyStatusChange();

      const localData = obterDadosParaExportar();
      if (!localData) {
        throw new Error('Falha ao coletar dados locais');
      }

      // Adicionar metadados de sincronização
      const syncData = {
        ...localData,
        syncMetadata: {
          deviceId: this.getDeviceId(),
          syncTimestamp: new Date().toISOString(),
          version: '1.2' // Versão com sync
        }
      };

      // Usar API existente do Google Drive
      const response = await fetch('/api/drive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: syncData,
          filename: 'stayfocus_sync.json'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na sincronização');
      }

      const result = await response.json();
      
      this.lastSyncTime = new Date().toISOString();
      this.hasPendingChanges = false;
      this.saveLastSyncTime();
      
      console.log('✅ Dados sincronizados com sucesso:', result.fileName);
      this.notifyStatusChange();
      
      return { success: true };
    } catch (error: any) {
      console.error('⏳ Sincronização falhou, tentará novamente:', error.message);
      return { success: false, error: error.message };
    } finally {
      this.pendingSync = false;
      this.notifyStatusChange();
    }
  }

  /**
   * Carrega dados da nuvem
   */
  async loadFromCloud(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isAuthenticated || !this.isOnline) {
      return { success: false, error: 'Não autenticado ou offline' };
    }

    try {
      // Primeiro, listar arquivos para encontrar o mais recente
      const listResponse = await fetch('/api/drive/list');
      if (!listResponse.ok) {
        throw new Error('Falha ao listar arquivos');
      }

      const fileList = await listResponse.json();
      const syncFiles = fileList.files?.filter((file: any) => 
        file.name.includes('stayfocus_sync') || file.name.includes('app_backup')
      );

      if (!syncFiles || syncFiles.length === 0) {
        return { success: false, error: 'Nenhum backup encontrado na nuvem' };
      }

      // Pegar o arquivo mais recente
      const latestFile = syncFiles.sort((a: any, b: any) => 
        new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
      )[0];

      // Carregar o arquivo
      const loadResponse = await fetch(`/api/drive/load?fileId=${latestFile.id}`);
      if (!loadResponse.ok) {
        throw new Error('Falha ao carregar arquivo da nuvem');
      }

      const cloudData = await loadResponse.json();
      
      if (cloudData.success) {
        return { success: true, data: cloudData.data };
      } else {
        throw new Error('Dados da nuvem inválidos');
      }
    } catch (error: any) {
      console.error('Carregamento da nuvem falhou:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Carrega dados da nuvem na inicialização (se mais recentes que locais)
   */
  private async loadFromCloudOnStartup(): Promise<void> {
    try {
      const cloudResult = await this.loadFromCloud();
      if (!cloudResult.success || !cloudResult.data) {
        return;
      }

      const cloudTimestamp = cloudResult.data.timestamp;
      const localTimestamp = this.lastSyncTime;

      // Se dados da nuvem são mais recentes, perguntar ao usuário
      if (!localTimestamp || new Date(cloudTimestamp) > new Date(localTimestamp)) {
        const shouldImport = await this.showCloudDataPrompt(cloudTimestamp);
        if (shouldImport) {
          const importResult = importarDadosFromObject(cloudResult.data);
          if (importResult.sucesso) {
            this.lastSyncTime = cloudTimestamp;
            this.saveLastSyncTime();
            console.log('✅ Dados importados da nuvem na inicialização');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar dados da nuvem na inicialização:', error);
    }
  }

  /**
   * Verifica autenticação do Google Drive
   */
  private async checkGoogleAuth(): Promise<boolean> {
    try {
      const response = await fetch('/api/drive/checkAuth');
      const result = await response.json();
      return result.isAuthenticated || false;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Marca que há mudanças pendentes para sincronização
   */
  markPendingChanges(): void {
    this.hasPendingChanges = true;
    this.notifyStatusChange();
    
    // Agenda sincronização com debounce
    this.scheduleSync();
  }

  /**
   * Agenda sincronização com debounce
   */
  private scheduleSync(): void {
    this.syncQueue.push(async () => {
      if (this.isAuthenticated && this.isOnline && this.hasPendingChanges) {
        await this.syncToCloud();
      }
    });

    if (!this.isProcessingQueue) {
      setTimeout(() => this.processQueue(), 2000); // Debounce de 2 segundos
    }
  }

  /**
   * Processa fila de sincronização
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    // Processar apenas a última sincronização (descartar intermediárias)
    const lastSync = this.syncQueue.pop();
    this.syncQueue.length = 0; // Limpar fila
    
    if (lastSync) {
      await lastSync();
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Configurar detecção de online/offline
   */
  private setupOnlineDetection(): void {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyStatusChange();
        // Tentar sincronizar quando voltar online
        if (this.hasPendingChanges && this.isAuthenticated) {
          setTimeout(() => this.syncToCloud(), 1000);
        }
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyStatusChange();
      });
    }
  }

  /**
   * Obter ID único do dispositivo
   */
  private getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let deviceId = localStorage.getItem('stayfocus_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('stayfocus_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Salvar timestamp da última sincronização
   */
  private saveLastSyncTime(): void {
    if (typeof window !== 'undefined' && this.lastSyncTime) {
      localStorage.setItem('stayfocus_last_sync', this.lastSyncTime);
    }
  }

  /**
   * Carregar timestamp da última sincronização
   */
  private loadLastSyncTime(): void {
    if (typeof window !== 'undefined') {
      this.lastSyncTime = localStorage.getItem('stayfocus_last_sync');
    }
  }

  /**
   * Mostrar prompt para dados da nuvem
   */
  private async showCloudDataPrompt(cloudTimestamp: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    const cloudDate = new Date(cloudTimestamp).toLocaleString('pt-BR');
    return confirm(
      `Encontramos dados mais recentes na nuvem (${cloudDate}).\n\n` +
      'Deseja importar esses dados? Isso substituirá os dados locais atuais.'
    );
  }

  /**
   * Obter status atual da sincronização
   */
  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      hasPendingChanges: this.hasPendingChanges,
      isAuthenticated: this.isAuthenticated,
      isSyncing: this.pendingSync
    };
  }

  /**
   * Adicionar listener para mudanças de status
   */
  addStatusListener(listener: (status: SyncStatus) => void): void {
    this.statusListeners.push(listener);
  }

  /**
   * Remover listener de status
   */
  removeStatusListener(listener: (status: SyncStatus) => void): void {
    const index = this.statusListeners.indexOf(listener);
    if (index > -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  /**
   * Notificar mudanças de status
   */
  private notifyStatusChange(): void {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Erro ao notificar listener de status:', error);
      }
    });
  }

  /**
   * Forçar sincronização manual
   */
  async forcSync(): Promise<{ success: boolean; error?: string }> {
    this.hasPendingChanges = true;
    return await this.syncToCloud();
  }

  /**
   * Parar sincronização automática
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Destruir instância do serviço
   */
  destroy(): void {
    this.stopSync();
    this.statusListeners.length = 0;
    this.syncQueue.length = 0;
  }
}

// Instância singleton do serviço
export const syncService = new SyncService();