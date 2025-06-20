import { useState, useCallback, useMemo } from 'react'
import { TarefasHierarchy, TarefaNode, TaskUpdate, LevelStats } from '../services/tarefasHierarchy'
import { validateTarefa } from '../services/hiperfocosValidation'

export interface UseHiperfocosHierarchyReturn {
  // Estado
  rootTasks: TarefaNode[]
  totalCount: number
  completedCount: number
  progressPercentage: number
  
  // Operações CRUD
  addTask: (texto: string, parentId: string | null, cor?: string) => string
  updateTask: (id: string, updates: TaskUpdate) => void
  removeTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  
  // Busca e navegação
  findTask: (id: string) => TarefaNode | null
  getTaskPath: (id: string) => TarefaNode[]
  getSubtasks: (parentId: string) => TarefaNode[]
  getAllSubtasks: (parentId: string) => TarefaNode[]
  
  // Estatísticas
  getLevelStats: () => LevelStats
  
  // Serialização
  toJSON: () => TarefaNode[]
  fromJSON: (data: TarefaNode[]) => void
  
  // Utilitários
  clear: () => void
  isEmpty: () => boolean
}

export function useHiperfocosHierarchy(initialData?: TarefaNode[]): UseHiperfocosHierarchyReturn {
  // Estado interno da hierarquia
  const [hierarchy] = useState(() => {
    const h = new TarefasHierarchy()
    if (initialData) {
      h.fromJSON(initialData)
    }
    return h
  })
  
  // Estado para forçar re-render quando a hierarquia muda
  const [version, setVersion] = useState(0)
  
  // Função para atualizar o estado e forçar re-render
  const updateState = useCallback(() => {
    setVersion(v => v + 1)
  }, [])
  
  // Operações CRUD com validação
  const addTask = useCallback((texto: string, parentId: string | null, cor?: string) => {
    // Validar entrada
    validateTarefa({ texto, cor })
    
    const id = hierarchy.addTask(texto, parentId, cor)
    updateState()
    return id
  }, [hierarchy, updateState])
  
  const updateTask = useCallback((id: string, updates: TaskUpdate) => {
    // Validar atualizações se necessário
    if (updates.texto !== undefined) {
      validateTarefa({ texto: updates.texto, cor: updates.cor })
    }
    
    hierarchy.updateTask(id, updates)
    updateState()
  }, [hierarchy, updateState])
  
  const removeTask = useCallback((id: string) => {
    hierarchy.removeTask(id)
    updateState()
  }, [hierarchy, updateState])
  
  const toggleTaskCompletion = useCallback((id: string) => {
    hierarchy.toggleTaskCompletion(id)
    updateState()
  }, [hierarchy, updateState])
  
  // Busca e navegação (não precisam de updateState pois são read-only)
  const findTask = useCallback((id: string) => {
    return hierarchy.findTask(id)
  }, [hierarchy, version]) // version como dependência para re-calcular quando muda
  
  const getTaskPath = useCallback((id: string) => {
    return hierarchy.getTaskPath(id)
  }, [hierarchy, version])
  
  const getSubtasks = useCallback((parentId: string) => {
    return hierarchy.getSubtasks(parentId)
  }, [hierarchy, version])
  
  const getAllSubtasks = useCallback((parentId: string) => {
    return hierarchy.getAllSubtasks(parentId)
  }, [hierarchy, version])
  
  // Serialização
  const toJSON = useCallback(() => {
    return hierarchy.toJSON()
  }, [hierarchy, version])
  
  const fromJSON = useCallback((data: TarefaNode[]) => {
    hierarchy.fromJSON(data)
    updateState()
  }, [hierarchy, updateState])
  
  // Utilitários
  const clear = useCallback(() => {
    hierarchy.clear()
    updateState()
  }, [hierarchy, updateState])
  
  const isEmpty = useCallback(() => {
    return hierarchy.isEmpty()
  }, [hierarchy, version])
  
  // Estados computados (memoizados para performance)
  const rootTasks = useMemo(() => {
    return hierarchy.getRootTasks()
  }, [hierarchy, version])
  
  const totalCount = useMemo(() => {
    return hierarchy.getTotalCount()
  }, [hierarchy, version])
  
  const completedCount = useMemo(() => {
    return hierarchy.getCompletedCount()
  }, [hierarchy, version])
  
  const progressPercentage = useMemo(() => {
    return hierarchy.getProgressPercentage()
  }, [hierarchy, version])
  
  const getLevelStats = useCallback(() => {
    return hierarchy.getLevelStats()
  }, [hierarchy, version])
  
  return {
    // Estado
    rootTasks,
    totalCount,
    completedCount,
    progressPercentage,
    
    // Operações CRUD
    addTask,
    updateTask,
    removeTask,
    toggleTaskCompletion,
    
    // Busca e navegação
    findTask,
    getTaskPath,
    getSubtasks,
    getAllSubtasks,
    
    // Estatísticas
    getLevelStats,
    
    // Serialização
    toJSON,
    fromJSON,
    
    // Utilitários
    clear,
    isEmpty
  }
}

// Hook auxiliar para usar com um hiperfoco específico
export function useHiperfocoTasks(hiperfocoId: string, initialTasks?: TarefaNode[]) {
  const hierarchy = useHiperfocosHierarchy(initialTasks)
  
  // Adicionar métodos específicos para hiperfoco se necessário
  const addTaskToHiperfoco = useCallback((texto: string, parentId: string | null, cor?: string) => {
    return hierarchy.addTask(texto, parentId, cor)
  }, [hierarchy])
  
  return {
    ...hierarchy,
    hiperfocoId,
    addTaskToHiperfoco
  }
}
