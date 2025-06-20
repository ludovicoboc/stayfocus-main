/**
 * FallbackProvider - Sistema de Fallback para localStorage
 * Detecta falhas de conexão e faz fallback automático para localStorage
 * Inclui queue de sincronização e indicadores visuais
 */

import type {
  DataProvider,
  AuthResponse,
  User,
  MealPlan,
  MealRecord,
  HydrationRecord,
  Recipe,
  Hiperfoco,
  Task,
  CreateMealPlanDto,
  UpdateMealPlanDto,
  CreateMealRecordDto,
  CreateRecipeDto,
  UpdateRecipeDto,
  GetMealRecordsParams,
  GetRecipesParams,
  GetHiperfocosParams,
  GetTasksParams,
} from '../dataProviders/types'

// ============================================================================
// TIPOS PARA O SISTEMA DE FALLBACK
// ============================================================================

export interface FallbackConfig {
  enableFallback: boolean
  maxRetries: number
  retryDelayMs: number
  syncIntervalMs: number
  enableLogging: boolean
}

export interface QueuedOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  data: any
  timestamp: number
  retries: number
  error?: string
}

export interface ConnectionStatus {
  isOnline: boolean
  isConnected: boolean
  lastCheck: number
  failureCount: number
}

// ============================================================================
// EVENTOS DO SISTEMA DE FALLBACK
// ============================================================================

export type FallbackEvent = 
  | { type: 'connection_lost' }
  | { type: 'connection_restored' }
  | { type: 'fallback_activated' }
  | { type: 'fallback_deactivated' }
  | { type: 'sync_started' }
  | { type: 'sync_completed'; operations: number }
  | { type: 'sync_failed'; error: string }
  | { type: 'operation_queued'; operation: QueuedOperation }

export type FallbackEventListener = (event: FallbackEvent) => void

// ============================================================================
// FALLBACK PROVIDER
// ============================================================================

export class FallbackProvider implements DataProvider {
  private primaryProvider: DataProvider
  private config: FallbackConfig
  private connectionStatus: ConnectionStatus
  private operationQueue: QueuedOperation[] = []
  private eventListeners: FallbackEventListener[] = []
  private syncInterval: NodeJS.Timeout | null = null
  private isInFallbackMode = false

  private readonly DEFAULT_CONFIG: FallbackConfig = {
    enableFallback: true,
    maxRetries: 3,
    retryDelayMs: 1000,
    syncIntervalMs: 30000, // 30 segundos
    enableLogging: true,
  }

  constructor(primaryProvider: DataProvider, config: Partial<FallbackConfig> = {}) {
    this.primaryProvider = primaryProvider
    this.config = { ...this.DEFAULT_CONFIG, ...config }
    this.connectionStatus = {
      isOnline: navigator.onLine,
      isConnected: true,
      lastCheck: Date.now(),
      failureCount: 0,
    }

    this.initializeEventListeners()
    this.startSyncInterval()
  }

  // ========================================
  // GERENCIAMENTO DE EVENTOS
  // ========================================

  addEventListener(listener: FallbackEventListener): void {
    this.eventListeners.push(listener)
  }

  removeEventListener(listener: FallbackEventListener): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private emitEvent(event: FallbackEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Erro no listener de evento:', error)
      }
    })
  }

  private initializeEventListeners(): void {
    // Escutar mudanças na conectividade
    window.addEventListener('online', () => {
      this.connectionStatus.isOnline = true
      this.log('Conexão com internet restaurada')
      this.checkConnection()
    })

    window.addEventListener('offline', () => {
      this.connectionStatus.isOnline = false
      this.log('Conexão com internet perdida')
      this.activateFallback()
    })
  }

  // ========================================
  // GERENCIAMENTO DE CONEXÃO
  // ========================================

  private async checkConnection(): Promise<boolean> {
    try {
      // Tentar uma operação simples para verificar conectividade
      await this.primaryProvider.getCurrentUser()
      
      if (!this.connectionStatus.isConnected) {
        this.connectionStatus.isConnected = true
        this.connectionStatus.failureCount = 0
        this.emitEvent({ type: 'connection_restored' })
        this.deactivateFallback()
      }
      
      return true
    } catch (error) {
      this.connectionStatus.failureCount++
      
      if (this.connectionStatus.isConnected) {
        this.connectionStatus.isConnected = false
        this.emitEvent({ type: 'connection_lost' })
        this.activateFallback()
      }
      
      return false
    } finally {
      this.connectionStatus.lastCheck = Date.now()
    }
  }

  private activateFallback(): void {
    if (!this.isInFallbackMode && this.config.enableFallback) {
      this.isInFallbackMode = true
      this.emitEvent({ type: 'fallback_activated' })
      this.log('Modo fallback ativado - usando localStorage')
    }
  }

  private deactivateFallback(): void {
    if (this.isInFallbackMode) {
      this.isInFallbackMode = false
      this.emitEvent({ type: 'fallback_deactivated' })
      this.log('Modo fallback desativado - usando provider principal')
      this.syncQueuedOperations()
    }
  }

  // ========================================
  // GERENCIAMENTO DE QUEUE
  // ========================================

  private queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): void {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    }

    this.operationQueue.push(queuedOp)
    this.saveQueueToStorage()
    this.emitEvent({ type: 'operation_queued', operation: queuedOp })
    this.log('Operação adicionada à queue:', queuedOp.type, queuedOp.entity)
  }

  private async syncQueuedOperations(): Promise<void> {
    if (this.operationQueue.length === 0) return

    this.emitEvent({ type: 'sync_started' })
    this.log('Iniciando sincronização de', this.operationQueue.length, 'operações')

    const operations = [...this.operationQueue]
    let syncedCount = 0
    let failedOperations: QueuedOperation[] = []

    for (const operation of operations) {
      try {
        await this.executeQueuedOperation(operation)
        syncedCount++
        
        // Remover da queue
        const index = this.operationQueue.findIndex(op => op.id === operation.id)
        if (index > -1) {
          this.operationQueue.splice(index, 1)
        }
      } catch (error) {
        operation.retries++
        operation.error = error instanceof Error ? error.message : 'Erro desconhecido'
        
        if (operation.retries >= this.config.maxRetries) {
          this.log('Operação falhou após', this.config.maxRetries, 'tentativas:', operation.id)
          // Remover da queue após esgotar tentativas
          const index = this.operationQueue.findIndex(op => op.id === operation.id)
          if (index > -1) {
            this.operationQueue.splice(index, 1)
          }
        } else {
          failedOperations.push(operation)
        }
      }
    }

    this.saveQueueToStorage()

    if (failedOperations.length === 0) {
      this.emitEvent({ type: 'sync_completed', operations: syncedCount })
      this.log('Sincronização concluída:', syncedCount, 'operações')
    } else {
      this.emitEvent({ type: 'sync_failed', error: `${failedOperations.length} operações falharam` })
      this.log('Sincronização parcial:', syncedCount, 'sucesso,', failedOperations.length, 'falharam')
    }
  }

  private async executeQueuedOperation(operation: QueuedOperation): Promise<void> {
    // Implementar execução das operações em queue
    // Por enquanto, apenas simular
    await new Promise(resolve => setTimeout(resolve, 100))
    this.log('Executando operação da queue:', operation.type, operation.entity)
  }

  // ========================================
  // PERSISTÊNCIA LOCAL
  // ========================================

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('fallback_queue', JSON.stringify(this.operationQueue))
    } catch (error) {
      console.error('Erro ao salvar queue no localStorage:', error)
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const saved = localStorage.getItem('fallback_queue')
      if (saved) {
        this.operationQueue = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Erro ao carregar queue do localStorage:', error)
      this.operationQueue = []
    }
  }

  // ========================================
  // SYNC INTERVAL
  // ========================================

  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      if (!this.isInFallbackMode && this.operationQueue.length > 0) {
        this.syncQueuedOperations()
      }
    }, this.config.syncIntervalMs)
  }

  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[FallbackProvider]', ...args)
    }
  }

  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation?: () => T | Promise<T>
  ): Promise<T> {
    if (this.isInFallbackMode && fallbackOperation) {
      return await fallbackOperation()
    }

    try {
      const result = await operation()
      return result
    } catch (error) {
      this.log('Operação falhou:', error)
      
      // Verificar se deve ativar fallback
      if (!this.isInFallbackMode) {
        await this.checkConnection()
      }

      if (this.isInFallbackMode && fallbackOperation) {
        return await fallbackOperation()
      }

      throw error
    }
  }

  // ========================================
  // IMPLEMENTAÇÃO DA INTERFACE DATAPROVIDER
  // ========================================

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.executeWithFallback(
      () => this.primaryProvider.login(email, password),
      () => {
        // Fallback: simular login offline
        return {
          user: null,
          session: null,
          error: 'Login offline não disponível',
        }
      }
    )
  }

  async logout(): Promise<void> {
    return this.executeWithFallback(
      () => this.primaryProvider.logout()
    )
  }

  async getCurrentUser(): Promise<User | null> {
    return this.executeWithFallback(
      () => this.primaryProvider.getCurrentUser(),
      () => {
        // Fallback: tentar obter usuário do localStorage
        try {
          const saved = localStorage.getItem('current_user')
          return saved ? JSON.parse(saved) : null
        } catch {
          return null
        }
      }
    )
  }

  async refreshSession(): Promise<AuthResponse> {
    return this.executeWithFallback(
      () => this.primaryProvider.refreshSession()
    )
  }

  // ========================================
  // MEAL PLANS
  // ========================================

  async getMealPlans(): Promise<MealPlan[]> {
    return this.executeWithFallback(
      () => this.primaryProvider.getMealPlans(),
      () => {
        // Fallback: obter do localStorage
        try {
          const saved = localStorage.getItem('meal_plans')
          return saved ? JSON.parse(saved) : []
        } catch {
          return []
        }
      }
    )
  }

  async createMealPlan(data: CreateMealPlanDto): Promise<MealPlan> {
    return this.executeWithFallback(
      () => this.primaryProvider.createMealPlan(data),
      () => {
        // Fallback: salvar no localStorage e adicionar à queue
        const mealPlan: MealPlan = {
          id: `local_${Date.now()}`,
          user_id: 'local_user',
          name: data.name,
          description: data.description,
          meals: data.meals.map((meal, index) => ({
            id: `local_meal_${Date.now()}_${index}`,
            meal_plan_id: `local_${Date.now()}`,
            ...meal,
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Salvar no localStorage
        const saved = localStorage.getItem('meal_plans')
        const mealPlans = saved ? JSON.parse(saved) : []
        mealPlans.push(mealPlan)
        localStorage.setItem('meal_plans', JSON.stringify(mealPlans))

        // Adicionar à queue
        this.queueOperation({
          type: 'create',
          entity: 'meal_plan',
          data,
        })

        return mealPlan
      }
    )
  }

  async updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan> {
    return this.executeWithFallback(
      () => this.primaryProvider.updateMealPlan(id, data)
    )
  }

  async deleteMealPlan(id: string): Promise<void> {
    return this.executeWithFallback(
      () => this.primaryProvider.deleteMealPlan(id)
    )
  }

  // ========================================
  // OUTROS MÉTODOS (PLACEHOLDER)
  // ========================================

  async getMealRecords(params?: GetMealRecordsParams): Promise<MealRecord[]> {
    return this.primaryProvider.getMealRecords(params)
  }

  async createMealRecord(data: CreateMealRecordDto): Promise<MealRecord> {
    return this.primaryProvider.createMealRecord(data)
  }

  async deleteMealRecord(id: string): Promise<void> {
    return this.primaryProvider.deleteMealRecord(id)
  }

  async getHydrationRecords(date?: string): Promise<HydrationRecord[]> {
    return this.primaryProvider.getHydrationRecords(date)
  }

  async createHydrationRecord(amount_ml: number, date: string, time: string): Promise<HydrationRecord> {
    return this.primaryProvider.createHydrationRecord(amount_ml, date, time)
  }

  async deleteHydrationRecord(id: string): Promise<void> {
    return this.primaryProvider.deleteHydrationRecord(id)
  }

  async getRecipes(params?: GetRecipesParams): Promise<Recipe[]> {
    return this.primaryProvider.getRecipes(params)
  }

  async getRecipe(id: string): Promise<Recipe> {
    return this.primaryProvider.getRecipe(id)
  }

  async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
    return this.primaryProvider.createRecipe(data)
  }

  async updateRecipe(id: string, data: UpdateRecipeDto): Promise<Recipe> {
    return this.primaryProvider.updateRecipe(id, data)
  }

  async deleteRecipe(id: string): Promise<void> {
    return this.primaryProvider.deleteRecipe(id)
  }

  async toggleRecipeFavorite(id: string): Promise<Recipe> {
    return this.primaryProvider.toggleRecipeFavorite(id)
  }

  async getHiperfocos(params?: GetHiperfocosParams): Promise<Hiperfoco[]> {
    return this.primaryProvider.getHiperfocos(params)
  }

  async getHiperfoco(id: string): Promise<Hiperfoco> {
    return this.primaryProvider.getHiperfoco(id)
  }

  async createHiperfoco(data: Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Hiperfoco> {
    return this.primaryProvider.createHiperfoco(data)
  }

  async updateHiperfoco(id: string, data: Partial<Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Hiperfoco> {
    return this.primaryProvider.updateHiperfoco(id, data)
  }

  async deleteHiperfoco(id: string): Promise<void> {
    return this.primaryProvider.deleteHiperfoco(id)
  }

  async getTasks(params?: GetTasksParams): Promise<Task[]> {
    return this.primaryProvider.getTasks(params)
  }

  async createTask(data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return this.primaryProvider.createTask(data)
  }

  async updateTask(id: string, data: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    return this.primaryProvider.updateTask(id, data)
  }

  async toggleTask(id: string): Promise<Task> {
    return this.primaryProvider.toggleTask(id)
  }

  async deleteTask(id: string): Promise<void> {
    return this.primaryProvider.deleteTask(id)
  }

  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    return this.primaryProvider.uploadFile(file, bucket, path)
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    return this.primaryProvider.deleteFile(bucket, path)
  }

  // ========================================
  // CLEANUP
  // ========================================

  destroy(): void {
    this.stopSyncInterval()
    this.eventListeners = []
  }

  // ========================================
  // GETTERS PARA STATUS
  // ========================================

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  getQueueStatus(): { count: number; operations: QueuedOperation[] } {
    return {
      count: this.operationQueue.length,
      operations: [...this.operationQueue],
    }
  }

  isInFallback(): boolean {
    return this.isInFallbackMode
  }
}
