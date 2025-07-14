/**
 * Serviço de Sincronização Híbrida para StayFocus
 * Combina localStorage + Google Drive para sincronização automática
 * Aproveita a infraestrutura existente de exportação/importação
 */

import { obterDadosParaExportar, importarDadosFromObject } from './dataService';
import { dataCompressor } from './dataCompressor';
import { intelligentCache } from './intelligentCache';

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
  
  // Novas propriedades para sincronização inteligente
  private lastActivityTime: number = Date.now();
  private syncFailureCount: number = 0;
  private currentSyncInterval: number = 2 * 60 * 1000; // 2 minutos inicial
  private readonly MIN_SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutos
  private readonly MAX_SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutos
  private readonly ACTIVE_SYNC_INTERVAL = 1 * 60 * 1000; // 1 minuto quando ativo
  private readonly ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutos para considerar ativo
  constructor() {
    this.setupOnlineDetection();
    this.loadLastSyncTime();
    this.setupActivityDetection();
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
   * Inicia sincronização automática com intervalo inteligente
   */
  private async startAutoSync(): Promise<void> {
    // Sistema de sincronização inteligente baseado na atividade
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.pendingSync && this.isAuthenticated && this.hasPendingChanges) {
        console.log(`🔄 Sincronizando com intervalo: ${this.currentSyncInterval / 1000}s`);
        const result = await this.syncToCloud();
        
        if (result.success) {
          this.syncFailureCount = 0; // Reset failure count on success
        } else {
          this.syncFailureCount++; // Increment failure count
        }
        
        // Reajustar frequência após tentativa
        this.adjustSyncFrequency();
      }
    }, this.currentSyncInterval);

    // Sincronização imediata se há mudanças pendentes (apenas uma vez)
    if (this.hasPendingChanges) {
      setTimeout(() => this.syncToCloud(), 2000); // 2 segundos para permitir múltiplas mudanças
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

      // Verificar se realmente precisa sincronizar usando cache inteligente
      const cacheResult = await intelligentCache.shouldSync('all_data', localData);
      
      if (!cacheResult.shouldSync) {
        console.log(`⚡ Sincronização pulada: ${cacheResult.reason}`);
        this.hasPendingChanges = false;
        this.notifyStatusChange();
        return { success: true };
      }

      console.log(`🔄 Sincronização necessária: ${cacheResult.reason}`);

      // Analisar se vale a pena comprimir
      const compressionStats = dataCompressor.getCompressionStats(localData);
      console.log(`📊 Dados para sync: ${compressionStats.originalSize} bytes, compressão estimada: ${compressionStats.estimatedRatio.toFixed(2)}x`);

      let payload: any;
      let compressionMetadata: any = null;

      if (compressionStats.shouldCompress) {
        // Usar compressão
        const compressed = dataCompressor.compressForUpload(localData);
        payload = {
          data: compressed.payload,
          compression: compressed.metadata,
          compressed: true
        };
        compressionMetadata = compressed.metadata;
        console.log(`📦 Dados comprimidos: ${compressed.metadata.originalSize} → ${compressed.metadata.compressedSize} bytes (${compressed.metadata.compressionRatio.toFixed(2)}x)`);
      } else {
        // Não comprimir dados pequenos
        payload = {
          data: localData,
          compressed: false
        };
        console.log('📦 Dados pequenos, enviando sem compressão');
      }

      const response = await fetch('/api/drive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na sincronização');
      }

      const result = await response.json();
      
      this.lastSyncTime = new Date().toISOString();
      this.hasPendingChanges = false;
      this.saveLastSyncTime();
      
      // Atualizar cache após sincronização bem-sucedida
      intelligentCache.updateCache('all_data', localData, cacheResult.hash);
      
      const compressionInfo = compressionMetadata ? 
        ` (${compressionMetadata.compressionRatio.toFixed(2)}x compressão)` : '';
      console.log(`✅ Dados sincronizados com sucesso: ${result.fileName}${compressionInfo}`);
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
        let finalData = cloudData.data;
        
        // Verificar se os dados estão comprimidos
        if (cloudData.data && typeof cloudData.data === 'object' && cloudData.data.compressed) {
          console.log('📦 Dados comprimidos detectados, descomprimindo...');
          
          const decompressed = dataCompressor.decompressFromUpload(
            cloudData.data.data, 
            cloudData.data.compression
          );
          
          if (decompressed.success) {
            finalData = decompressed.data;
            console.log('✅ Dados descomprimidos com sucesso');
          } else {
            throw new Error(`Falha na descompressão: ${decompressed.error}`);
          }
        }
        
        return { success: true, data: finalData };
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

      // CORREÇÃO: Validação mais robusta dos dados da nuvem
      const cloudData = cloudResult.data;
      console.log('📊 Dados da nuvem carregados:', {
        versao: cloudData.versao,
        timestamp: cloudData.timestamp,
        temDados: !!cloudData.dados
      });

      const cloudTimestamp = cloudData.timestamp;
      const localTimestamp = this.lastSyncTime;
      
      console.log('📅 Comparando timestamps:', {
        nuvem: cloudTimestamp,
        ultimaSyncLocal: localTimestamp
      });

      // CORREÇÃO: Importação automática e inteligente
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
        
        // CORREÇÃO: Importar automaticamente com tratamento de erros mais robusto
        try {
          const importResult = importarDadosFromObject(cloudData);
          
          if (importResult.sucesso) {
            this.lastSyncTime = cloudTimestamp;
            this.saveLastSyncTime();
            console.log('✅ Dados importados automaticamente da nuvem');
            
            // Notificar usuário de forma discreta
            this.showDiscreteNotification('Dados sincronizados da nuvem');
          } else {
            console.error('❌ Falha ao importar dados:', importResult.erro);
            this.showDiscreteNotification('Erro ao sincronizar dados da nuvem', 'error');
          }
        } catch (importError) {
          console.error('❌ Erro crítico na importação:', importError);
          this.showDiscreteNotification('Erro crítico na sincronização', 'error');
        }
      } else {
        console.log('✅ Dados locais estão atualizados');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar dados da nuvem na inicialização:', error);
      this.showDiscreteNotification('Erro ao verificar dados na nuvem', 'error');
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
    this.lastActivityTime = Date.now(); // Atualizar atividade
    this.notifyStatusChange();
    
    // Ajustar frequência baseada na nova atividade
    this.adjustSyncFrequency();
    
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
   * Configura detecção de atividade do usuário
   */
  private setupActivityDetection(): void {
    if (typeof window !== 'undefined') {
      // Detectar atividade do usuário
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, this.updateActivity, { passive: true });
      });
    }
  }

  /**
   * Ajusta a frequência de sincronização baseada na atividade
   */
  private adjustSyncFrequency(): void {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivityTime;
    const isUserActive = timeSinceActivity < this.ACTIVITY_THRESHOLD;

    let newInterval: number;
    
    if (isUserActive && this.hasPendingChanges) {
      // Usuário ativo com mudanças pendentes - sincronizar mais frequentemente
      newInterval = this.ACTIVE_SYNC_INTERVAL;
    } else if (this.hasPendingChanges) {
      // Mudanças pendentes mas usuário inativo - intervalo médio
      newInterval = this.MIN_SYNC_INTERVAL;
    } else {
      // Sem mudanças pendentes - usar backoff exponencial
      newInterval = Math.min(
        this.MIN_SYNC_INTERVAL * Math.pow(2, this.syncFailureCount),
        this.MAX_SYNC_INTERVAL
      );
    }

    // Atualizar intervalo se mudou significativamente
    if (Math.abs(newInterval - this.currentSyncInterval) > 30000) { // 30 segundos de diferença
      this.currentSyncInterval = newInterval;
      this.restartSyncTimer();
    }
  }

  /**
   * Reinicia o timer de sincronização com novo intervalo
   */
  private restartSyncTimer(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.isAuthenticated) {
      this.startAutoSync();
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
  private showDiscreteNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (typeof window === 'undefined') return;
    
    // CORREÇÃO: Usar classes CSS compatíveis com diferentes tipos
    const typeClasses = {
      success: 'bg-green-100 border-green-400 text-green-700',
      error: 'bg-red-100 border-red-400 text-red-700',
      info: 'bg-blue-100 border-blue-400 text-blue-700'
    };
    
    const iconSvg = {
      success: '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>',
      error: '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>',
      info: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
    };
    
    // Criar notificação toast discreta
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 ${typeClasses[type]} px-4 py-2 rounded shadow-lg z-50 text-sm`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${iconSvg[type]}
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
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return intelligentCache.getStats();
  }

  /**
   * Limpa cache de sincronização
   */
  clearSyncCache(): void {
    intelligentCache.clearCache();
  }

  /**
   * Destruir instância do serviço
   */
  destroy(): void {
    this.stopSync();
    this.statusListeners.length = 0;
    this.syncQueue.length = 0;
    
    // Limpar cache inteligente
    intelligentCache.destroy();
    
    // Limpar event listeners de atividade
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.removeEventListener(event, this.updateActivity);
      });
    }
  }
  
  /**
   * Método para atualizar atividade (usado nos event listeners)
   */
  private updateActivity = (): void => {
    this.lastActivityTime = Date.now();
    this.adjustSyncFrequency();
  }
}

// Instância singleton do serviço
export const syncService = new SyncService();