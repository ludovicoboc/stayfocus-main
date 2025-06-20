import { describe, it, expect, beforeEach } from 'vitest'
import { 
  TarefasHierarchy,
  TarefaNode,
  HierarchyError 
} from '@/app/lib/services/tarefasHierarchy'

describe('TarefasHierarchy', () => {
  let hierarchy: TarefasHierarchy

  beforeEach(() => {
    hierarchy = new TarefasHierarchy()
  })

  describe('Operações básicas', () => {
    it('deve criar uma nova hierarquia vazia', () => {
      expect(hierarchy.getRootTasks()).toEqual([])
      expect(hierarchy.getTotalCount()).toBe(0)
    })

    it('deve adicionar uma tarefa raiz', () => {
      const taskId = hierarchy.addTask('Tarefa principal', null)
      
      expect(taskId).toBeDefined()
      expect(typeof taskId).toBe('string')
      
      const rootTasks = hierarchy.getRootTasks()
      expect(rootTasks).toHaveLength(1)
      expect(rootTasks[0].texto).toBe('Tarefa principal')
      expect(rootTasks[0].concluida).toBe(false)
      expect(rootTasks[0].children).toEqual([])
    })

    it('deve adicionar uma subtarefa', () => {
      const parentId = hierarchy.addTask('Tarefa pai', null)
      const childId = hierarchy.addTask('Subtarefa', parentId)
      
      expect(childId).toBeDefined()
      expect(childId).not.toBe(parentId)
      
      const rootTasks = hierarchy.getRootTasks()
      expect(rootTasks).toHaveLength(1)
      expect(rootTasks[0].children).toHaveLength(1)
      expect(rootTasks[0].children[0].texto).toBe('Subtarefa')
    })

    it('deve rejeitar adição de subtarefa a tarefa inexistente', () => {
      expect(() => {
        hierarchy.addTask('Subtarefa', 'id-inexistente')
      }).toThrow(HierarchyError)
      expect(() => {
        hierarchy.addTask('Subtarefa', 'id-inexistente')
      }).toThrow('Tarefa pai não encontrada')
    })
  })

  describe('Busca e navegação', () => {
    let parentId: string
    let childId: string
    let grandChildId: string

    beforeEach(() => {
      parentId = hierarchy.addTask('Pai', null)
      childId = hierarchy.addTask('Filho', parentId)
      grandChildId = hierarchy.addTask('Neto', childId)
    })

    it('deve encontrar uma tarefa por ID', () => {
      const task = hierarchy.findTask(childId)
      
      expect(task).toBeDefined()
      expect(task?.texto).toBe('Filho')
      expect(task?.id).toBe(childId)
    })

    it('deve retornar null para ID inexistente', () => {
      const task = hierarchy.findTask('id-inexistente')
      expect(task).toBeNull()
    })

    it('deve obter o caminho completo de uma tarefa', () => {
      const path = hierarchy.getTaskPath(grandChildId)
      
      expect(path).toHaveLength(3)
      expect(path[0].texto).toBe('Pai')
      expect(path[1].texto).toBe('Filho')
      expect(path[2].texto).toBe('Neto')
    })

    it('deve obter todas as subtarefas de uma tarefa', () => {
      const subtasks = hierarchy.getSubtasks(parentId)
      
      expect(subtasks).toHaveLength(1)
      expect(subtasks[0].texto).toBe('Filho')
    })

    it('deve obter subtarefas recursivamente', () => {
      const allSubtasks = hierarchy.getAllSubtasks(parentId)
      
      expect(allSubtasks).toHaveLength(2) // Filho + Neto
      expect(allSubtasks.map(t => t.texto)).toContain('Filho')
      expect(allSubtasks.map(t => t.texto)).toContain('Neto')
    })
  })

  describe('Atualização de tarefas', () => {
    let taskId: string

    beforeEach(() => {
      taskId = hierarchy.addTask('Tarefa original', null)
    })

    it('deve atualizar o texto de uma tarefa', () => {
      hierarchy.updateTask(taskId, { texto: 'Texto atualizado' })
      
      const task = hierarchy.findTask(taskId)
      expect(task?.texto).toBe('Texto atualizado')
    })

    it('deve alternar o status de conclusão', () => {
      expect(hierarchy.findTask(taskId)?.concluida).toBe(false)
      
      hierarchy.toggleTaskCompletion(taskId)
      expect(hierarchy.findTask(taskId)?.concluida).toBe(true)
      
      hierarchy.toggleTaskCompletion(taskId)
      expect(hierarchy.findTask(taskId)?.concluida).toBe(false)
    })

    it('deve atualizar a cor de uma tarefa', () => {
      hierarchy.updateTask(taskId, { cor: '#FF5252' })
      
      const task = hierarchy.findTask(taskId)
      expect(task?.cor).toBe('#FF5252')
    })

    it('deve rejeitar atualização de tarefa inexistente', () => {
      expect(() => {
        hierarchy.updateTask('id-inexistente', { texto: 'Novo texto' })
      }).toThrow(HierarchyError)
    })
  })

  describe('Remoção de tarefas', () => {
    let parentId: string
    let childId: string

    beforeEach(() => {
      parentId = hierarchy.addTask('Pai', null)
      childId = hierarchy.addTask('Filho', parentId)
    })

    it('deve remover uma tarefa sem filhos', () => {
      hierarchy.removeTask(childId)
      
      const parent = hierarchy.findTask(parentId)
      expect(parent?.children).toHaveLength(0)
      expect(hierarchy.findTask(childId)).toBeNull()
    })

    it('deve remover uma tarefa com todos os seus filhos', () => {
      const grandChildId = hierarchy.addTask('Neto', childId)
      
      hierarchy.removeTask(childId)
      
      expect(hierarchy.findTask(childId)).toBeNull()
      expect(hierarchy.findTask(grandChildId)).toBeNull()
      
      const parent = hierarchy.findTask(parentId)
      expect(parent?.children).toHaveLength(0)
    })

    it('deve remover uma tarefa raiz', () => {
      hierarchy.removeTask(parentId)
      
      expect(hierarchy.getRootTasks()).toHaveLength(0)
      expect(hierarchy.findTask(parentId)).toBeNull()
      expect(hierarchy.findTask(childId)).toBeNull()
    })

    it('deve rejeitar remoção de tarefa inexistente', () => {
      expect(() => {
        hierarchy.removeTask('id-inexistente')
      }).toThrow(HierarchyError)
    })
  })

  describe('Estatísticas e métricas', () => {
    let parent1Id: string
    let parent2Id: string
    let child1Id: string
    let child2Id: string
    let child3Id: string

    beforeEach(() => {
      parent1Id = hierarchy.addTask('Pai 1', null)
      parent2Id = hierarchy.addTask('Pai 2', null)

      child1Id = hierarchy.addTask('Filho 1.1', parent1Id)
      child2Id = hierarchy.addTask('Filho 1.2', parent1Id)
      child3Id = hierarchy.addTask('Filho 2.1', parent2Id)

      // Marcar algumas como concluídas
      hierarchy.toggleTaskCompletion(parent1Id)
      hierarchy.toggleTaskCompletion(child1Id)
    })

    it('deve contar o total de tarefas', () => {
      expect(hierarchy.getTotalCount()).toBe(5)
    })

    it('deve contar tarefas concluídas', () => {
      expect(hierarchy.getCompletedCount()).toBe(2)
    })

    it('deve calcular progresso percentual', () => {
      expect(hierarchy.getProgressPercentage()).toBe(40) // 2/5 = 40%
    })

    it('deve obter estatísticas por nível', () => {
      const stats = hierarchy.getLevelStats()
      
      expect(stats.level0).toBe(2) // 2 tarefas raiz
      expect(stats.level1).toBe(3) // 3 subtarefas
      expect(stats.maxDepth).toBe(1) // Profundidade máxima
    })
  })

  describe('Serialização e importação', () => {
    it('deve exportar a hierarquia para JSON', () => {
      const parent = hierarchy.addTask('Pai', null)
      hierarchy.addTask('Filho', parent)
      
      const exported = hierarchy.toJSON()
      
      expect(exported).toHaveLength(1)
      expect(exported[0].texto).toBe('Pai')
      expect(exported[0].children).toHaveLength(1)
      expect(exported[0].children[0].texto).toBe('Filho')
    })

    it('deve importar hierarquia de JSON', () => {
      const data: TarefaNode[] = [
        {
          id: 'task-1',
          texto: 'Tarefa importada',
          concluida: true,
          children: [
            {
              id: 'task-2',
              texto: 'Subtarefa importada',
              concluida: false,
              children: []
            }
          ]
        }
      ]
      
      hierarchy.fromJSON(data)
      
      expect(hierarchy.getTotalCount()).toBe(2)
      expect(hierarchy.findTask('task-1')?.texto).toBe('Tarefa importada')
      expect(hierarchy.findTask('task-1')?.concluida).toBe(true)
      expect(hierarchy.findTask('task-2')?.texto).toBe('Subtarefa importada')
    })
  })
})
