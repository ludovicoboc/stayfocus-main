/**
 * Sistema de Cache Inteligente para Sincronização
 * Usa checksums SHA-256 para detectar mudanças reais nos dados
 */

export interface CacheEntry {
  hash: string;
  data: any;
  timestamp: number;
  lastSync: number;
  syncCount: number;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  lastCleanup: number;
  saves: number;
  hits: number;
  misses: number;
}

export class IntelligentCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hora
  
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    lastCleanup: Date.now(),
    saves: 0,
    hits: 0,
    misses: 0
  };

  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.startCleanupTimer();
  }

  /**
   * Verifica se os dados mudaram e precisam ser sincronizados
   */
  async shouldSync(module: string, data: any): Promise<{
    shouldSync: boolean;
    hash: string;
    changed: boolean;
    reason: string;
  }> {
    const hash = await this.calculateHash(data);
    const cached = this.cache.get(module);
    
    if (!cached) {
      // Primeira vez ou cache perdido
      this.stats.misses++;
      return {
        shouldSync: true,
        hash,
        changed: true,
        reason: 'Dados não encontrados no cache'
      };
    }

    if (cached.hash === hash) {
      // Dados não mudaram
      this.stats.hits++;
      this.updateHitRate();
      
      // Verificar se é muito tempo desde a última sincronização (backup periódico)
      const timeSinceSync = Date.now() - cached.lastSync;
      const shouldBackup = timeSinceSync > 6 * 60 * 60 * 1000; // 6 horas
      
      if (shouldBackup) {
        return {
          shouldSync: true,
          hash,
          changed: false,
          reason: 'Backup periódico (6h sem sync)'
        };
      }
      
      return {
        shouldSync: false,
        hash,
        changed: false,
        reason: 'Dados não modificados'
      };
    }

    // Dados mudaram
    this.stats.misses++;
    this.updateHitRate();
    
    return {
      shouldSync: true,
      hash,
      changed: true,
      reason: 'Dados modificados'
    };
  }

  /**
   * Atualiza o cache após sincronização bem-sucedida
   */
  updateCache(module: string, data: any, hash: string): void {
    const now = Date.now();
    const dataSize = this.calculateSize(data);
    
    const entry: CacheEntry = {
      hash,
      data: this.cloneData(data),
      timestamp: now,
      lastSync: now,
      syncCount: (this.cache.get(module)?.syncCount || 0) + 1,
      size: dataSize
    };

    this.cache.set(module, entry);
    this.stats.saves++;
    this.updateStats();
    
    // Limpar cache se muito grande
    if (this.stats.totalSize > this.MAX_CACHE_SIZE) {
      this.cleanup();
    }
    
    this.saveToStorage();
    
    console.log(`🗄️ Cache atualizado para ${module}: ${hash.substring(0, 8)}... (${dataSize} bytes)`);
  }

  /**
   * Calcula hash SHA-256 dos dados
   */
  private async calculateHash(data: any): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data, Object.keys(data).sort()); // Ordered keys
      const dataBuffer = encoder.encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('Erro ao calcular hash:', error);
      // Fallback para hash simples
      return this.simpleHash(JSON.stringify(data));
    }
  }

  /**
   * Hash simples como fallback
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Calcula tamanho dos dados em bytes
   */
  private calculateSize(data: any): number {
    return new TextEncoder().encode(JSON.stringify(data)).length;
  }

  /**
   * Clona dados para evitar referências
   */
  private cloneData(data: any): any {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao clonar dados:', error);
      return data;
    }
  }

  /**
   * Limpa entradas antigas do cache
   */
  cleanup(): void {
    const now = Date.now();
    const sizeBefore = this.cache.size;
    
    // Remover entradas expiradas
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    });
    
    // Se ainda muito grande, remover as mais antigas
    if (this.stats.totalSize > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      while (this.stats.totalSize > this.MAX_CACHE_SIZE * 0.8 && entries.length > 0) {
        const [key] = entries.shift()!;
        this.cache.delete(key);
        this.updateStats();
      }
    }
    
    this.stats.lastCleanup = now;
    this.updateStats();
    
    const sizeAfter = this.cache.size;
    if (sizeBefore !== sizeAfter) {
      console.log(`🧹 Cache limpo: ${sizeBefore} → ${sizeAfter} entradas`);
    }
  }

  /**
   * Inicia timer de limpeza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Atualiza estatísticas do cache
   */
  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
  }

  /**
   * Atualiza taxa de acerto
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Salva cache no localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats
      };
      
      localStorage.setItem('stayfocus_sync_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

  /**
   * Carrega cache do localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem('stayfocus_sync_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        
        // Restaurar entradas
        this.cache = new Map(cacheData.entries || []);
        
        // Restaurar stats
        this.stats = { ...this.stats, ...cacheData.stats };
        
        // Limpar entradas expiradas
        this.cleanup();
        
        console.log(`🗄️ Cache carregado: ${this.cache.size} entradas, ${this.stats.hitRate.toFixed(1)}% hit rate`);
      }
    } catch (error) {
      console.error('Erro ao carregar cache:', error);
      this.cache.clear();
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Obtém informações sobre uma entrada específica
   */
  getCacheInfo(module: string): CacheEntry | null {
    return this.cache.get(module) || null;
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      lastCleanup: Date.now(),
      saves: 0,
      hits: 0,
      misses: 0
    };
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stayfocus_sync_cache');
    }
    
    console.log('🗄️ Cache limpo completamente');
  }

  /**
   * Força expiração de uma entrada específica
   */
  invalidateCache(module: string): void {
    this.cache.delete(module);
    this.updateStats();
    this.saveToStorage();
    
    console.log(`🗄️ Cache invalidado para ${module}`);
  }

  /**
   * Destrói o cache e limpa recursos
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.clearCache();
  }
}

// Instância singleton
export const intelligentCache = new IntelligentCache(); 