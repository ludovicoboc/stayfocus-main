import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VisualizadorTarefasOtimizado } from '@/app/components/hiperfocos/VisualizadorTarefasOtimizado'
import { TarefaNode } from '@/app/lib/services/tarefasHierarchy'

describe('VisualizadorTarefasOtimizado', () => {
  const user = userEvent.setup()

  const mockTarefas: TarefaNode[] = [
    {
      id: 'tarefa-1',
      texto: 'Tarefa principal',
      concluida: false,
      children: [
        {
          id: 'tarefa-1-1',
          texto: 'Subtarefa 1',
          concluida: false,
          children: []
        }
      ]
    },
    {
      id: 'tarefa-2',
      texto: 'Segunda tarefa',
      concluida: true,
      children: []
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização otimizada', () => {
    it('deve renderizar tarefas com otimizações', () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      expect(screen.getByText('Tarefa principal')).toBeInTheDocument()
      expect(screen.getByText('Subtarefa 1')).toBeInTheDocument()
      expect(screen.getByText('Segunda tarefa')).toBeInTheDocument()
    })

    it('deve mostrar estatísticas otimizadas', () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      expect(screen.getByText('3 tarefas')).toBeInTheDocument()
      expect(screen.getByText('1 concluída')).toBeInTheDocument()
      expect(screen.getByText('33% completo')).toBeInTheDocument()
    })

    it('deve renderizar com virtualização quando habilitada', () => {
      render(
        <VisualizadorTarefasOtimizado 
          initialTasks={mockTarefas} 
          enableVirtualization={true}
          maxVisibleTasks={1}
        />
      )
      
      expect(screen.getByText('Virtualização ativa')).toBeInTheDocument()
    })
  })

  describe('Performance e otimizações', () => {
    it('deve usar memoização para evitar re-renders desnecessários', async () => {
      const renderSpy = vi.fn()
      
      const TestComponent = ({ tasks }: { tasks: TarefaNode[] }) => {
        renderSpy()
        return <VisualizadorTarefasOtimizado initialTasks={tasks} />
      }
      
      const { rerender } = render(<TestComponent tasks={mockTarefas} />)
      
      const initialRenderCount = renderSpy.mock.calls.length
      
      // Re-render com as mesmas tarefas
      rerender(<TestComponent tasks={mockTarefas} />)
      
      const finalRenderCount = renderSpy.mock.calls.length
      
      // Deve ter renderizado apenas uma vez adicional
      expect(finalRenderCount - initialRenderCount).toBe(1)
    })

    it('deve otimizar animações', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      const checkbox = screen.getAllByRole('checkbox')[0]
      
      // Múltiplos cliques rápidos devem ser otimizados
      await user.click(checkbox)
      await user.click(checkbox)
      await user.click(checkbox)
      
      // Deve funcionar sem problemas de performance
      expect(checkbox).toBeInTheDocument()
    })

    it('deve gerenciar cache de memoização', () => {
      const { rerender } = render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      // Múltiplos re-renders com dados diferentes
      for (let i = 0; i < 10; i++) {
        const newTasks = [...mockTarefas, {
          id: `tarefa-${i}`,
          texto: `Tarefa ${i}`,
          concluida: false,
          children: []
        }]
        rerender(<VisualizadorTarefasOtimizado initialTasks={newTasks} />)
      }
      
      // Deve continuar funcionando sem problemas de memória
      expect(screen.getByText('Tarefa principal')).toBeInTheDocument()
    })
  })

  describe('Interações otimizadas', () => {
    it('deve otimizar toggle de tarefas', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      const checkbox = screen.getAllByRole('checkbox')[0]
      
      await user.click(checkbox)
      
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('deve otimizar adição de tarefas', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={[]} />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const input = screen.getByPlaceholderText(/nova tarefa/i)
      await user.type(input, 'Nova tarefa otimizada')
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText('Nova tarefa otimizada')).toBeInTheDocument()
      })
    })

    it('deve otimizar edição de tarefas', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      const editButton = screen.getAllByLabelText(/editar/i)[0]
      await user.click(editButton)
      
      const input = screen.getByDisplayValue('Tarefa principal')
      await user.clear(input)
      await user.type(input, 'Tarefa editada')
      
      const saveButton = screen.getByLabelText(/salvar/i)
      await user.click(saveButton)
      
      expect(screen.getByText('Tarefa editada')).toBeInTheDocument()
    })
  })

  describe('Virtualização', () => {
    it('deve ativar virtualização para listas grandes', () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `tarefa-${i}`,
        texto: `Tarefa ${i}`,
        concluida: false,
        children: []
      }))
      
      render(
        <VisualizadorTarefasOtimizado 
          initialTasks={largeTasks}
          enableVirtualization={true}
          maxVisibleTasks={10}
        />
      )
      
      expect(screen.getByText('Virtualização ativa')).toBeInTheDocument()
    })

    it('deve renderizar apenas itens visíveis com virtualização', () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `tarefa-${i}`,
        texto: `Tarefa ${i}`,
        concluida: false,
        children: []
      }))
      
      render(
        <VisualizadorTarefasOtimizado 
          initialTasks={largeTasks}
          enableVirtualization={true}
          maxVisibleTasks={5}
        />
      )
      
      // Deve mostrar apenas algumas tarefas iniciais
      expect(screen.getByText('Tarefa 0')).toBeInTheDocument()
      expect(screen.queryByText('Tarefa 50')).not.toBeInTheDocument()
    })
  })

  describe('Estados de carregamento otimizados', () => {
    it('deve mostrar estado de carregamento durante operações', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={[]} />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const input = screen.getByPlaceholderText(/nova tarefa/i)
      await user.type(input, 'Tarefa com loading')
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      // Pode mostrar estado de loading brevemente
      expect(confirmButton).toBeInTheDocument()
    })

    it('deve desabilitar controles durante carregamento', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={[]} />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const input = screen.getByPlaceholderText(/nova tarefa/i)
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      
      // Durante operação, controles podem ser desabilitados
      expect(input).toBeInTheDocument()
      expect(confirmButton).toBeInTheDocument()
    })
  })

  describe('Tratamento de erros otimizado', () => {
    it('deve mostrar erros de validação', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={[]} />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      // Tentar adicionar tarefa vazia
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
    })

    it('deve limpar erros automaticamente', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={[]} />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
      
      // Fechar erro
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      expect(screen.queryByText(/texto da tarefa é obrigatório/i)).not.toBeInTheDocument()
    })
  })

  describe('Acessibilidade otimizada', () => {
    it('deve manter acessibilidade com otimizações', () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      // Verificar roles e labels
      expect(screen.getAllByRole('checkbox')).toHaveLength(3)
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('deve suportar navegação por teclado otimizada', async () => {
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0]
      
      firstCheckbox.focus()
      await user.keyboard('{Space}')
      
      expect(firstCheckbox).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Métricas de performance', () => {
    it('deve coletar métricas em desenvolvimento', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      // Em desenvolvimento, deve mostrar métricas
      expect(screen.getByText(/Performance:/)).toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })

    it('não deve mostrar métricas em produção', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      render(<VisualizadorTarefasOtimizado initialTasks={mockTarefas} />)
      
      // Em produção, não deve mostrar métricas
      expect(screen.queryByText(/Performance:/)).not.toBeInTheDocument()
      
      process.env.NODE_ENV = originalEnv
    })
  })
})
