/**
 * Gerenciador central de sincronização
 * 
 * Funcionalidades:
 * - Coordena sincronização entre local e servidor
 * - Detecta e resolve conflitos
 * - Gerencia estratégias de merge
 * - Monitora status de sincronização
 */

export interface SyncConflict {
  id: string
  entity: string
  localData: any
  serverData: any
  localTimestamp: number
  serverTimestamp: number
  conflictType: 'update_conflict' | 'delete_conflict' | 'create_conflict'
}

export interface SyncResult {
  success: boolean
  conflicts: SyncConflict[]
  synced: number
  failed: number
  errors: string[]
}

export type ConflictResolutionStrategy = 
  | 'local_wins'      // Dados locais têm prioridade
  | 'server_wins'     // Dados do servidor têm prioridade
  | 'last_write_wins' // Último timestamp vence
  | 'manual'          // Resolução manual pelo usuário

class SyncManager {
  private conflicts: SyncConflict[] = []
  private listeners: Array<(conflicts: SyncConflict[]) => void> = []

  /**
   * Detecta conflitos comparando dados locais com servidor
   */
  detectConflicts(localData: any[], serverData: any[], entity: string): SyncConflict[] {
    const conflicts: SyncConflict[] = []

    // Criar mapa dos dados do servidor para busca rápida
    const serverMap = new Map(serverData.map(item => [item.id, item]))

    for (const localItem of localData) {
      const serverItem = serverMap.get(localItem.id)

      if (!serverItem) {
        // Item existe localmente mas não no servidor
        // Pode ter sido deletado no servidor ou criado localmente
        continue
      }

      // Comparar timestamps para detectar conflitos
      const localTimestamp = new Date(localItem.updated_at || localItem.created_at).getTime()
      const serverTimestamp = new Date(serverItem.updated_at || serverItem.created_at).getTime()

      // Se ambos foram modificados após a última sincronização
      if (this.hasDataChanged(localItem, serverItem)) {
        conflicts.push({
          id: localItem.id,
          entity,
          localData: localItem,
          serverData: serverItem,
          localTimestamp,
          serverTimestamp,
          conflictType: 'update_conflict'
        })
      }
    }

    return conflicts
  }

  /**
   * Resolve conflitos usando estratégia especificada
   */
  resolveConflicts(
    conflicts: SyncConflict[], 
    strategy: ConflictResolutionStrategy
  ): { resolved: any[], unresolved: SyncConflict[] } {
    const resolved: any[] = []
    const unresolved: SyncConflict[] = []

    for (const conflict of conflicts) {
      try {
        const resolution = this.resolveConflict(conflict, strategy)
        if (resolution) {
          resolved.push(resolution)
        } else {
          unresolved.push(conflict)
        }
      } catch (error) {
        console.error('Error resolving conflict:', error)
        unresolved.push(conflict)
      }
    }

    return { resolved, unresolved }
  }

  /**
   * Resolve um conflito individual
   */
  private resolveConflict(conflict: SyncConflict, strategy: ConflictResolutionStrategy): any | null {
    switch (strategy) {
      case 'local_wins':
        return conflict.localData

      case 'server_wins':
        return conflict.serverData

      case 'last_write_wins':
        return conflict.localTimestamp > conflict.serverTimestamp 
          ? conflict.localData 
          : conflict.serverData

      case 'manual':
        // Para resolução manual, adicionar à lista de conflitos pendentes
        this.addConflict(conflict)
        return null

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`)
    }
  }

  /**
   * Merge inteligente de dados (para casos específicos)
   */
  mergeData(localData: any, serverData: any, entity: string): any {
    switch (entity) {
      case 'meal_plan':
        return this.mergeMealPlan(localData, serverData)
      
      case 'meal_record':
        return this.mergeMealRecord(localData, serverData)
      
      case 'recipe':
        return this.mergeRecipe(localData, serverData)
      
      default:
        // Fallback para last-write-wins
        const localTime = new Date(localData.updated_at || localData.created_at).getTime()
        const serverTime = new Date(serverData.updated_at || serverData.created_at).getTime()
        return localTime > serverTime ? localData : serverData
    }
  }

  /**
   * Merge específico para meal plans
   */
  private mergeMealPlan(local: any, server: any): any {
    return {
      ...server, // Base do servidor
      // Preservar campos que fazem sentido manter do local
      is_active: local.is_active !== undefined ? local.is_active : server.is_active,
      // Usar timestamp mais recente
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Merge específico para meal records
   */
  private mergeMealRecord(local: any, server: any): any {
    return {
      ...server,
      // Preservar foto local se foi adicionada recentemente
      photo_url: local.photo_url || server.photo_url,
      // Preservar descrição mais detalhada
      description: local.description.length > server.description.length 
        ? local.description 
        : server.description,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Merge específico para receitas
   */
  private mergeRecipe(local: any, server: any): any {
    return {
      ...server,
      // Merge de arrays (ingredientes, instruções, tags)
      ingredients: this.mergeArrays(local.ingredients, server.ingredients, 'name'),
      instructions: local.instructions.length > server.instructions.length 
        ? local.instructions 
        : server.instructions,
      tags: this.mergeArrays(local.tags, server.tags, 'tag'),
      // Preservar favorito local
      is_favorite: local.is_favorite || server.is_favorite,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Merge de arrays baseado em chave única
   */
  private mergeArrays(localArray: any[], serverArray: any[], keyField: string): any[] {
    const merged = [...serverArray]
    const serverKeys = new Set(serverArray.map(item => item[keyField]))

    // Adicionar itens locais que não existem no servidor
    for (const localItem of localArray) {
      if (!serverKeys.has(localItem[keyField])) {
        merged.push(localItem)
      }
    }

    return merged
  }

  /**
   * Verifica se dados mudaram (comparação simples)
   */
  private hasDataChanged(local: any, server: any): boolean {
    // Campos a ignorar na comparação
    const ignoreFields = ['updated_at', 'created_at', 'id']
    
    const localCopy = { ...local }
    const serverCopy = { ...server }
    
    ignoreFields.forEach(field => {
      delete localCopy[field]
      delete serverCopy[field]
    })

    return JSON.stringify(localCopy) !== JSON.stringify(serverCopy)
  }

  /**
   * Adiciona conflito à lista de pendentes
   */
  addConflict(conflict: SyncConflict): void {
    this.conflicts.push(conflict)
    this.notifyListeners()
  }

  /**
   * Remove conflito da lista
   */
  removeConflict(conflictId: string): boolean {
    const index = this.conflicts.findIndex(c => c.id === conflictId)
    if (index >= 0) {
      this.conflicts.splice(index, 1)
      this.notifyListeners()
      return true
    }
    return false
  }

  /**
   * Obtém conflitos pendentes
   */
  getPendingConflicts(): SyncConflict[] {
    return [...this.conflicts]
  }

  /**
   * Limpa todos os conflitos
   */
  clearConflicts(): void {
    this.conflicts = []
    this.notifyListeners()
  }

  /**
   * Adiciona listener para conflitos
   */
  addConflictListener(listener: (conflicts: SyncConflict[]) => void): () => void {
    this.listeners.push(listener)
    
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
    this.listeners.forEach(listener => {
      try {
        listener([...this.conflicts])
      } catch (error) {
        console.error('Error in conflict listener:', error)
      }
    })
  }
}

// Instância singleton
export const syncManager = new SyncManager()
