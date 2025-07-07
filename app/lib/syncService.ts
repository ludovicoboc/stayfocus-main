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
    // SINCRONIZAÇÃO MAIS AGRESSIVA: a cada 30 segundos
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.pendingSync && this.isAuthenticated && this.hasPendingChanges) {
        await this.syncToCloud();
      }
    }, 30 * 1000); // 30 segundos em vez de 5 minutos

    // Sincronização imediata se há mudanças pendentes
    if (this.hasPendingChanges) {
      setTimeout(() => this.syncToCloud(), 1000); // Reduzido para 1 segundo
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

      // CORREÇÃO: Enviar dados diretos (não envolver em objeto "data")
      const response = await fetch('/api/drive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)  // Enviar dados diretos
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
      console.log('🔍 Verificando dados na nuvem...');
      const cloudResult = await this.loadFromCloud();
      if (!cloudResult.success || !cloudResult.data) {
        console.log('ℹ️ Nenhum backup encontrado na nuvem ou erro ao carregar');
        return;
      }

      const cloudTimestamp = cloudResult.data.timestamp;
      const localTimestamp = this.lastSyncTime;
      
      console.log('📅 Comparando timestamps:', {
        nuvem: cloudTimestamp,
        ultimaSyncLocal: localTimestamp
      });

      // NOVA LÓGICA: Importação automática e inteligente
      let shouldImport = false;
      let reason = '';

      if (!localTimestamp) {
        // Primeiro acesso - sempre importar se há dados na nuvem
        shouldImport = true;
        reason = 'Primeiro acesso - importando dados da nuvem automaticamente';
      } else {
        // Verificar se dados da nuvem são significativamente mais recentes (>30 segundos)
        const cloudDate = new Date(cloudTimestamp);
        const localDate = new Date(localTimestamp);
        const diffMinutes = (cloudDate.getTime() - localDate.getTime()) / (1000 * 60);
        
        if (diffMinutes > 0.5) { // Mais de 30 segundos de diferença
          shouldImport = true;
          reason = `Dados da nuvem são ${Math.round(diffMinutes)} minuto(s) mais recentes - importando automaticamente`;
        }
      }

      if (shouldImport) {
        console.log(`🔄 ${reason}`);
        
        // Importar automaticamente sem perguntar ao usuário
        const importResult = importarDadosFromObject(cloudResult.data);
        
        if (importResult.sucesso) {
          this.lastSyncTime = cloudTimestamp;
          this.saveLastSyncTime();
          console.log('✅ Dados importados automaticamente da nuvem');
          
          // Notificar usuário de forma discreta
          this.showDiscreteNotification('Dados sincronizados da nuvem');
        } else {
          console.error('❌ Falha ao importar dados:', importResult.erro);
        }
      } else {
        console.log('✅ Dados locais estão atualizados');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar dados da nuvem na inicialização:', error);
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
      setTimeout(() => this.processQueue(), 500); // Reduzido de 2 segundos para 500ms
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
   * Mostra notificação discreta (não modal)
   */
  private showDiscreteNotification(message: string): void {
    if (typeof window === 'undefined') return;
    
    // Criar notificação toast discreta
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-lg z-50 text-sm';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
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