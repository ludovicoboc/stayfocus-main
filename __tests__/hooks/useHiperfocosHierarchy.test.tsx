import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHiperfocosHierarchy } from '@/app/lib/hooks/useHiperfocosHierarchy'

describe('useHiperfocosHierarchy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Inicialização', () => {
    it('deve inicializar com hierarquia vazia', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      expect(result.current.rootTasks).toEqual([])
      expect(result.current.totalCount).toBe(0)
      expect(result.current.completedCount).toBe(0)
      expect(result.current.progressPercentage).toBe(0)
    })

    it('deve inicializar com dados fornecidos', () => {
      const initialData = [
        {
          id: 'task-1',
          texto: 'Tarefa inicial',
          concluida: false,
          children: []
        }
      ]

      const { result } = renderHook(() => useHiperfocosHierarchy(initialData))
      
      expect(result.current.rootTasks).toHaveLength(1)
      expect(result.current.rootTasks[0].texto).toBe('Tarefa inicial')
      expect(result.current.totalCount).toBe(1)
    })
  })

  describe('Operações de tarefas', () => {
    it('deve adicionar uma nova tarefa raiz', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        result.current.addTask('Nova tarefa', null)
      })
      
      expect(result.current.rootTasks).toHaveLength(1)
      expect(result.current.rootTasks[0].texto).toBe('Nova tarefa')
      expect(result.current.totalCount).toBe(1)
    })

    it('deve adicionar uma subtarefa', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      let parentId: string
      
      act(() => {
        parentId = result.current.addTask('Tarefa pai', null)
      })
      
      act(() => {
        result.current.addTask('Subtarefa', parentId)
      })
      
      expect(result.current.rootTasks).toHaveLength(1)
      expect(result.current.rootTasks[0].children).toHaveLength(1)
      expect(result.current.rootTasks[0].children[0].texto).toBe('Subtarefa')
      expect(result.current.totalCount).toBe(2)
    })

    it('deve atualizar uma tarefa', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      let taskId: string
      
      act(() => {
        taskId = result.current.addTask('Texto original', null)
      })
      
      act(() => {
        result.current.updateTask(taskId, { texto: 'Texto atualizado' })
      })
      
      expect(result.current.rootTasks[0].texto).toBe('Texto atualizado')
    })

    it('deve alternar conclusão de tarefa', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      let taskId: string
      
      act(() => {
        taskId = result.current.addTask('Tarefa para toggle', null)
      })
      
      expect(result.current.rootTasks[0].concluida).toBe(false)
      expect(result.current.completedCount).toBe(0)
      
      act(() => {
        result.current.toggleTaskCompletion(taskId)
      })
      
      expect(result.current.rootTasks[0].concluida).toBe(true)
      expect(result.current.completedCount).toBe(1)
      expect(result.current.progressPercentage).toBe(100)
    })

    it('deve remover uma tarefa', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      let taskId: string
      
      act(() => {
        taskId = result.current.addTask('Tarefa para remover', null)
      })
      
      expect(result.current.totalCount).toBe(1)
      
      act(() => {
        result.current.removeTask(taskId)
      })
      
      expect(result.current.totalCount).toBe(0)
      expect(result.current.rootTasks).toHaveLength(0)
    })
  })

  describe('Busca e navegação', () => {
    let parentId: string
    let childId: string

    beforeEach(() => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        parentId = result.current.addTask('Pai', null)
        childId = result.current.addTask('Filho', parentId)
      })
    })

    it('deve encontrar uma tarefa por ID', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        parentId = result.current.addTask('Pai', null)
        childId = result.current.addTask('Filho', parentId)
      })
      
      const task = result.current.findTask(childId)
      expect(task?.texto).toBe('Filho')
    })

    it('deve obter caminho da tarefa', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        parentId = result.current.addTask('Pai', null)
        childId = result.current.addTask('Filho', parentId)
      })
      
      const path = result.current.getTaskPath(childId)
      expect(path).toHaveLength(2)
      expect(path[0].texto).toBe('Pai')
      expect(path[1].texto).toBe('Filho')
    })

    it('deve obter subtarefas', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        parentId = result.current.addTask('Pai', null)
        childId = result.current.addTask('Filho', parentId)
      })
      
      const subtasks = result.current.getSubtasks(parentId)
      expect(subtasks).toHaveLength(1)
      expect(subtasks[0].texto).toBe('Filho')
    })
  })

  describe('Estatísticas', () => {
    it('deve calcular estatísticas corretamente', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      let task1Id: string, task2Id: string
      
      act(() => {
        task1Id = result.current.addTask('Tarefa 1', null)
        task2Id = result.current.addTask('Tarefa 2', null)
        result.current.addTask('Subtarefa', task1Id)
      })
      
      expect(result.current.totalCount).toBe(3)
      expect(result.current.completedCount).toBe(0)
      expect(result.current.progressPercentage).toBe(0)
      
      act(() => {
        result.current.toggleTaskCompletion(task1Id)
      })
      
      expect(result.current.completedCount).toBe(1)
      expect(result.current.progressPercentage).toBe(33) // 1/3 = 33%
    })

    it('deve obter estatísticas por nível', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        const parent1 = result.current.addTask('Pai 1', null)
        const parent2 = result.current.addTask('Pai 2', null)
        result.current.addTask('Filho 1', parent1)
        result.current.addTask('Filho 2', parent1)
        result.current.addTask('Filho 3', parent2)
      })
      
      const stats = result.current.getLevelStats()
      expect(stats.level0).toBe(2) // 2 tarefas raiz
      expect(stats.level1).toBe(3) // 3 subtarefas
      expect(stats.maxDepth).toBe(1)
    })
  })

  describe('Serialização', () => {
    it('deve exportar dados para JSON', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      act(() => {
        const parentId = result.current.addTask('Pai', null)
        result.current.addTask('Filho', parentId)
      })
      
      const exported = result.current.toJSON()
      expect(exported).toHaveLength(1)
      expect(exported[0].texto).toBe('Pai')
      expect(exported[0].children).toHaveLength(1)
      expect(exported[0].children[0].texto).toBe('Filho')
    })

    it('deve importar dados de JSON', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      const data = [
        {
          id: 'imported-1',
          texto: 'Tarefa importada',
          concluida: true,
          children: [
            {
              id: 'imported-2',
              texto: 'Subtarefa importada',
              concluida: false,
              children: []
            }
          ]
        }
      ]
      
      act(() => {
        result.current.fromJSON(data)
      })
      
      expect(result.current.totalCount).toBe(2)
      expect(result.current.rootTasks[0].texto).toBe('Tarefa importada')
      expect(result.current.rootTasks[0].concluida).toBe(true)
      expect(result.current.completedCount).toBe(1)
    })
  })

  describe('Tratamento de erros', () => {
    it('deve lidar com erros de validação', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      expect(() => {
        act(() => {
          result.current.addTask('', null) // Texto vazio
        })
      }).toThrow()
    })

    it('deve lidar com IDs inexistentes', () => {
      const { result } = renderHook(() => useHiperfocosHierarchy())
      
      expect(() => {
        act(() => {
          result.current.addTask('Subtarefa', 'id-inexistente')
        })
      }).toThrow()
    })
  })
})
