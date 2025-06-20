export class HierarchyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HierarchyError'
  }
}

export interface TarefaNode {
  id: string
  texto: string
  concluida: boolean
  cor?: string
  children: TarefaNode[]
}

export interface TaskUpdate {
  texto?: string
  cor?: string
}

export interface LevelStats {
  level0: number
  level1: number
  level2?: number
  level3?: number
  maxDepth: number
}

export class TarefasHierarchy {
  private tasks: Map<string, TarefaNode> = new Map()
  private rootTaskIds: string[] = []
  private parentMap: Map<string, string> = new Map() // childId -> parentId

  constructor() {
    this.tasks = new Map()
    this.rootTaskIds = []
    this.parentMap = new Map()
  }

  // Gerar ID único
  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Adicionar nova tarefa
  addTask(texto: string, parentId: string | null, cor?: string): string {
    const id = this.generateId()
    const newTask: TarefaNode = {
      id,
      texto,
      concluida: false,
      cor,
      children: []
    }

    this.tasks.set(id, newTask)

    if (parentId === null) {
      // Tarefa raiz
      this.rootTaskIds.push(id)
    } else {
      // Subtarefa
      const parent = this.tasks.get(parentId)
      if (!parent) {
        this.tasks.delete(id) // Limpar tarefa criada
        throw new HierarchyError('Tarefa pai não encontrada')
      }
      
      parent.children.push(newTask)
      this.parentMap.set(id, parentId)
    }

    return id
  }

  // Encontrar tarefa por ID
  findTask(id: string): TarefaNode | null {
    return this.tasks.get(id) || null
  }

  // Obter tarefas raiz
  getRootTasks(): TarefaNode[] {
    return this.rootTaskIds.map(id => this.tasks.get(id)!).filter(Boolean)
  }

  // Obter subtarefas diretas
  getSubtasks(parentId: string): TarefaNode[] {
    const parent = this.tasks.get(parentId)
    return parent ? parent.children : []
  }

  // Obter todas as subtarefas recursivamente
  getAllSubtasks(parentId: string): TarefaNode[] {
    const result: TarefaNode[] = []
    const parent = this.tasks.get(parentId)
    
    if (!parent) return result

    const collectSubtasks = (task: TarefaNode) => {
      for (const child of task.children) {
        result.push(child)
        collectSubtasks(child)
      }
    }

    collectSubtasks(parent)
    return result
  }

  // Obter caminho completo da tarefa
  getTaskPath(taskId: string): TarefaNode[] {
    const path: TarefaNode[] = []
    let currentId: string | undefined = taskId

    while (currentId) {
      const task = this.tasks.get(currentId)
      if (!task) break
      
      path.unshift(task)
      currentId = this.parentMap.get(currentId)
    }

    return path
  }

  // Atualizar tarefa
  updateTask(id: string, updates: TaskUpdate): void {
    const task = this.tasks.get(id)
    if (!task) {
      throw new HierarchyError('Tarefa não encontrada')
    }

    if (updates.texto !== undefined) {
      task.texto = updates.texto
    }
    if (updates.cor !== undefined) {
      task.cor = updates.cor
    }
  }

  // Alternar conclusão
  toggleTaskCompletion(id: string): void {
    const task = this.tasks.get(id)
    if (!task) {
      throw new HierarchyError('Tarefa não encontrada')
    }

    task.concluida = !task.concluida
  }

  // Remover tarefa e todas as subtarefas
  removeTask(id: string): void {
    const task = this.tasks.get(id)
    if (!task) {
      throw new HierarchyError('Tarefa não encontrada')
    }

    // Remover recursivamente todas as subtarefas
    const removeRecursively = (taskToRemove: TarefaNode) => {
      for (const child of taskToRemove.children) {
        removeRecursively(child)
        this.tasks.delete(child.id)
        this.parentMap.delete(child.id)
      }
    }

    removeRecursively(task)

    // Remover da estrutura pai
    const parentId = this.parentMap.get(id)
    if (parentId) {
      const parent = this.tasks.get(parentId)
      if (parent) {
        parent.children = parent.children.filter(child => child.id !== id)
      }
      this.parentMap.delete(id)
    } else {
      // É uma tarefa raiz
      this.rootTaskIds = this.rootTaskIds.filter(rootId => rootId !== id)
    }

    // Remover a tarefa principal
    this.tasks.delete(id)
  }

  // Estatísticas
  getTotalCount(): number {
    return this.tasks.size
  }

  getCompletedCount(): number {
    let count = 0
    for (const task of this.tasks.values()) {
      if (task.concluida) count++
    }
    return count
  }

  getProgressPercentage(): number {
    const total = this.getTotalCount()
    if (total === 0) return 0
    
    const completed = this.getCompletedCount()
    return Math.round((completed / total) * 100)
  }

  getLevelStats(): LevelStats {
    const stats: LevelStats = {
      level0: 0,
      level1: 0,
      maxDepth: 0
    }

    const calculateDepth = (task: TarefaNode, currentDepth: number) => {
      stats.maxDepth = Math.max(stats.maxDepth, currentDepth)
      
      if (currentDepth === 0) stats.level0++
      else if (currentDepth === 1) stats.level1++
      else if (currentDepth === 2) stats.level2 = (stats.level2 || 0) + 1
      else if (currentDepth === 3) stats.level3 = (stats.level3 || 0) + 1

      for (const child of task.children) {
        calculateDepth(child, currentDepth + 1)
      }
    }

    for (const rootTask of this.getRootTasks()) {
      calculateDepth(rootTask, 0)
    }

    return stats
  }

  // Serialização
  toJSON(): TarefaNode[] {
    return this.getRootTasks()
  }

  fromJSON(data: TarefaNode[]): void {
    // Limpar estado atual
    this.tasks.clear()
    this.rootTaskIds = []
    this.parentMap.clear()

    // Importar recursivamente
    const importTask = (taskData: TarefaNode, parentId: string | null) => {
      this.tasks.set(taskData.id, {
        id: taskData.id,
        texto: taskData.texto,
        concluida: taskData.concluida,
        cor: taskData.cor,
        children: []
      })

      if (parentId === null) {
        this.rootTaskIds.push(taskData.id)
      } else {
        this.parentMap.set(taskData.id, parentId)
        const parent = this.tasks.get(parentId)
        if (parent) {
          parent.children.push(this.tasks.get(taskData.id)!)
        }
      }

      // Importar filhos
      for (const child of taskData.children) {
        importTask(child, taskData.id)
      }
    }

    for (const rootTask of data) {
      importTask(rootTask, null)
    }
  }

  // Utilitários
  clear(): void {
    this.tasks.clear()
    this.rootTaskIds = []
    this.parentMap.clear()
  }

  isEmpty(): boolean {
    return this.tasks.size === 0
  }
}
