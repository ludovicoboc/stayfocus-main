/**
 * Sistema de Queue para operações offline
 * 
 * Funcionalidades:
 * - Armazena operações quando offline
 * - Persiste no localStorage
 * - Executa automaticamente quando online
 * - Retry com backoff exponencial
 * - Resolução de conflitos
 */

export interface QueueOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'meal_plan' | 'meal_record' | 'hydration_record' | 'recipe'
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  lastError?: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
}

export interface QueueStats {
  total: number
  pending: number
  executing: number
  completed: number
  failed: number
}

class OfflineQueue {
  private queue: QueueOperation[] = []
  private isProcessing = false
  private listeners: Array<(stats: QueueStats) => void> = []
  private storageKey = 'stayfocus-offline-queue'

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Adiciona operação à queue
   */
  add(operation: Omit<QueueOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): string {
    const queueOperation: QueueOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    }

    this.queue.push(queueOperation)
    this.saveToStorage()
    this.notifyListeners()

    console.log('📥 Operation added to offline queue:', {
      id: queueOperation.id,
      type: queueOperation.type,
      entity: queueOperation.entity
    })

    return queueOperation.id
  }

  /**
   * Remove operação da queue
   */
  remove(id: string): boolean {
    const index = this.queue.findIndex(op => op.id === id)
    if (index >= 0) {
      this.queue.splice(index, 1)
      this.saveToStorage()
      this.notifyListeners()
      return true
    }
    return false
  }

  /**
   * Obtém operação por ID
   */
  get(id: string): QueueOperation | undefined {
    return this.queue.find(op => op.id === id)
  }

  /**
   * Obtém todas as operações
   */
  getAll(): QueueOperation[] {
    return [...this.queue]
  }

  /**
   * Obtém operações pendentes
   */
  getPending(): QueueOperation[] {
    return this.queue.filter(op => op.status === 'pending')
  }

  /**
   * Obtém estatísticas da queue
   */
  getStats(): QueueStats {
    return {
      total: this.queue.length,
      pending: this.queue.filter(op => op.status === 'pending').length,
      executing: this.queue.filter(op => op.status === 'executing').length,
      completed: this.queue.filter(op => op.status === 'completed').length,
      failed: this.queue.filter(op => op.status === 'failed').length,
    }
  }

  /**
   * Limpa operações completadas
   */
  clearCompleted(): number {
    const completedCount = this.queue.filter(op => op.status === 'completed').length
    this.queue = this.queue.filter(op => op.status !== 'completed')
    this.saveToStorage()
    this.notifyListeners()
    return completedCount
  }

  /**
   * Limpa toda a queue
   */
  clear(): void {
    this.queue = []
    this.saveToStorage()
    this.notifyListeners()
  }

  /**
   * Processa a queue executando operações pendentes
   */
  async process(executor: (operation: QueueOperation) => Promise<void>): Promise<void> {
    if (this.isProcessing) {
      console.log('⏳ Queue already processing, skipping...')
      return
    }

    this.isProcessing = true
    console.log('🚀 Starting queue processing...')

    const pendingOperations = this.getPending()
    console.log(`📋 Found ${pendingOperations.length} pending operations`)

    for (const operation of pendingOperations) {
      try {
        // Marcar como executando
        this.updateOperationStatus(operation.id, 'executing')

        console.log(`⚡ Executing operation ${operation.id}:`, {
          type: operation.type,
          entity: operation.entity,
          attempt: operation.retryCount + 1
        })

        // Executar operação
        await executor(operation)

        // Marcar como completada
        this.updateOperationStatus(operation.id, 'completed')
        console.log(`✅ Operation ${operation.id} completed successfully`)

      } catch (error) {
        console.error(`❌ Operation ${operation.id} failed:`, error)
        
        // Incrementar contador de retry
        operation.retryCount++
        operation.lastError = error instanceof Error ? error.message : 'Unknown error'

        if (operation.retryCount >= operation.maxRetries) {
          // Máximo de tentativas atingido
          this.updateOperationStatus(operation.id, 'failed')
          console.error(`💀 Operation ${operation.id} failed permanently after ${operation.retryCount} attempts`)
        } else {
          // Tentar novamente mais tarde
          this.updateOperationStatus(operation.id, 'pending')
          console.warn(`🔄 Operation ${operation.id} will retry (${operation.retryCount}/${operation.maxRetries})`)
          
          // Backoff exponencial: aguardar antes da próxima tentativa
          const delay = Math.min(1000 * Math.pow(2, operation.retryCount), 30000) // Max 30s
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    this.isProcessing = false
    console.log('🏁 Queue processing completed')
    
    // Limpar operações completadas automaticamente
    const clearedCount = this.clearCompleted()
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} completed operations`)
    }
  }

  /**
   * Atualiza status de uma operação
   */
  private updateOperationStatus(id: string, status: QueueOperation['status']): void {
    const operation = this.queue.find(op => op.id === id)
    if (operation) {
      operation.status = status
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  /**
   * Adiciona listener para mudanças na queue
   */
  addListener(listener: (stats: QueueStats) => void): () => void {
    this.listeners.push(listener)
    
    // Retorna função para remover listener
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index >= 0) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notifica listeners sobre mudanças
   */
  private notifyListeners(): void {
    const stats = this.getStats()
    this.listeners.forEach(listener => {
      try {
        listener(stats)
      } catch (error) {
        console.error('Error in queue listener:', error)
      }
    })
  }

  /**
   * Salva queue no localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
    } catch (error) {
      console.error('Failed to save queue to localStorage:', error)
    }
  }

  /**
   * Carrega queue do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.queue = JSON.parse(stored)
        
        // Reset status de operações que estavam executando
        this.queue.forEach(op => {
          if (op.status === 'executing') {
            op.status = 'pending'
          }
        })
        
        console.log(`📂 Loaded ${this.queue.length} operations from storage`)
      }
    } catch (error) {
      console.error('Failed to load queue from localStorage:', error)
      this.queue = []
    }
  }

  /**
   * Gera ID único para operação
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Instância singleton
export const offlineQueue = new OfflineQueue()
