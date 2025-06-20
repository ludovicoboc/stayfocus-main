import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VisualizadorTarefasRefatorado } from '@/app/components/hiperfocos/VisualizadorTarefasRefatorado'

// Mock do hook
const mockAddTask = vi.fn()
const mockUpdateTask = vi.fn()
const mockRemoveTask = vi.fn()
const mockToggleTaskCompletion = vi.fn()

vi.mock('@/app/lib/hooks/useHiperfocosHierarchy', () => ({
  useHiperfocosHierarchy: () => ({
    rootTasks: [
      {
        id: 'task-1',
        texto: 'Tarefa principal',
        concluida: false,
        children: [
          {
            id: 'task-1-1',
            texto: 'Subtarefa 1',
            concluida: false,
            children: []
          }
        ]
      },
      {
        id: 'task-2',
        texto: 'Segunda tarefa',
        concluida: true,
        children: []
      }
    ],
    totalCount: 3,
    completedCount: 1,
    progressPercentage: 33,
    addTask: mockAddTask,
    updateTask: mockUpdateTask,
    removeTask: mockRemoveTask,
    toggleTaskCompletion: mockToggleTaskCompletion,
    findTask: vi.fn(),
    getTaskPath: vi.fn(),
    getSubtasks: vi.fn(),
    getAllSubtasks: vi.fn(),
    getLevelStats: vi.fn(),
    toJSON: vi.fn(),
    fromJSON: vi.fn(),
    clear: vi.fn(),
    isEmpty: vi.fn()
  })
}))

describe('VisualizadorTarefasRefatorado', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAddTask.mockReturnValue('new-task-id')
  })

  describe('Renderização', () => {
    it('deve renderizar a lista de tarefas', () => {
      render(<VisualizadorTarefasRefatorado />)
      
      expect(screen.getByText('Tarefa principal')).toBeInTheDocument()
      expect(screen.getByText('Subtarefa 1')).toBeInTheDocument()
      expect(screen.getByText('Segunda tarefa')).toBeInTheDocument()
    })

    it('deve mostrar estatísticas de progresso', () => {
      render(<VisualizadorTarefasRefatorado />)
      
      expect(screen.getByText(/3 tarefas/i)).toBeInTheDocument()
      expect(screen.getByText(/1 concluída/i)).toBeInTheDocument()
      expect(screen.getByText(/33%/i)).toBeInTheDocument()
    })

    it('deve mostrar hierarquia de tarefas corretamente', () => {
      render(<VisualizadorTarefasRefatorado />)
      
      // Verificar se a subtarefa está aninhada
      const subtarefa = screen.getByText('Subtarefa 1')
      const subtarefaContainer = subtarefa.closest('[data-level="1"]')
      expect(subtarefaContainer).toBeInTheDocument()
    })
  })

  describe('Interações com tarefas', () => {
    it('deve permitir marcar tarefa como concluída', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const checkbox = screen.getAllByRole('checkbox')[0] // Primeira tarefa
      await user.click(checkbox)
      
      expect(mockToggleTaskCompletion).toHaveBeenCalledWith('task-1')
    })

    it('deve permitir adicionar nova tarefa', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const input = screen.getByPlaceholderText(/nova tarefa/i)
      await user.type(input, 'Nova tarefa teste')
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      expect(mockAddTask).toHaveBeenCalledWith('Nova tarefa teste', null)
    })

    it('deve permitir adicionar subtarefa', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const addSubtaskButton = screen.getAllByRole('button', { name: /adicionar subtarefa/i })[0]
      await user.click(addSubtaskButton)
      
      const input = screen.getByPlaceholderText(/nova subtarefa/i)
      await user.type(input, 'Nova subtarefa')
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      expect(mockAddTask).toHaveBeenCalledWith('Nova subtarefa', 'task-1')
    })

    it('deve permitir editar tarefa', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const editButton = screen.getAllByRole('button', { name: /editar/i })[0]
      await user.click(editButton)
      
      const input = screen.getByDisplayValue('Tarefa principal')
      await user.clear(input)
      await user.type(input, 'Tarefa editada')
      
      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)
      
      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { texto: 'Tarefa editada' })
    })

    it('deve permitir remover tarefa', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const deleteButton = screen.getAllByRole('button', { name: /remover/i })[0]
      await user.click(deleteButton)
      
      // Confirmar remoção
      const confirmButton = screen.getByRole('button', { name: /confirmar remoção/i })
      await user.click(confirmButton)
      
      expect(mockRemoveTask).toHaveBeenCalledWith('task-1')
    })
  })

  describe('Validação', () => {
    it('deve mostrar erro ao tentar adicionar tarefa vazia', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
      
      expect(mockAddTask).not.toHaveBeenCalled()
    })

    it('deve mostrar erro ao tentar salvar texto vazio na edição', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const editButton = screen.getAllByRole('button', { name: /editar/i })[0]
      await user.click(editButton)
      
      const input = screen.getByDisplayValue('Tarefa principal')
      await user.clear(input)
      
      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
      
      expect(mockUpdateTask).not.toHaveBeenCalled()
    })
  })

  describe('Estados de carregamento', () => {
    it('deve mostrar estado de carregamento durante operações', async () => {
      // Mock para simular operação assíncrona
      mockAddTask.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('new-id'), 100)))
      
      render(<VisualizadorTarefasRefatorado />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const input = screen.getByPlaceholderText(/nova tarefa/i)
      await user.type(input, 'Tarefa com loading')
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      // Verificar se mostra loading
      expect(screen.getByText(/salvando/i)).toBeInTheDocument()
      
      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.queryByText(/salvando/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter estrutura ARIA adequada', () => {
      render(<VisualizadorTarefasRefatorado />)
      
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(3) // 2 tarefas principais + 1 subtarefa
      
      // Verificar checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3)
      
      // Verificar labels
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAccessibleName()
      })
    })

    it('deve suportar navegação por teclado', async () => {
      render(<VisualizadorTarefasRefatorado />)
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0]
      firstCheckbox.focus()
      
      // Testar navegação com Tab
      await user.keyboard('{Tab}')
      expect(document.activeElement).not.toBe(firstCheckbox)
      
      // Testar ativação com Space
      firstCheckbox.focus()
      await user.keyboard(' ')
      
      expect(mockToggleTaskCompletion).toHaveBeenCalledWith('task-1')
    })
  })
})
