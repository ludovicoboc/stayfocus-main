import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormularioHiperfocoRefatorado } from '@/app/components/hiperfocos/FormularioHiperfocoRefatorado'
import { VisualizadorTarefasRefatorado } from '@/app/components/hiperfocos/VisualizadorTarefasRefatorado'
import { useHiperfocosStore } from '@/app/stores/hiperfocosStore'
import { TarefaNode } from '@/app/lib/services/tarefasHierarchy'

// Mock do store
const mockStore = {
  hiperfocos: [],
  tarefas: [],
  adicionarHiperfoco: vi.fn(),
  adicionarTarefa: vi.fn(),
  atualizarTarefa: vi.fn(),
  removerTarefa: vi.fn(),
  marcarTarefaConcluida: vi.fn()
}

vi.mock('@/app/stores/hiperfocosStore', () => ({
  useHiperfocosStore: () => mockStore,
  CORES_HIPERFOCOS: ['#FF5252', '#E91E63', '#9C27B0']
}))

describe('Integração Hiperfocos - Formulário e Visualizador', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.adicionarHiperfoco.mockReturnValue('hiperfoco-123')
    mockStore.adicionarTarefa.mockReturnValue('tarefa-123')
  })

  describe('Fluxo completo de criação', () => {
    it('deve criar hiperfoco e tarefas através do formulário', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      // Preencher formulário
      const tituloInput = screen.getByLabelText(/título/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)
      const tempoInput = screen.getByLabelText(/tempo limite/i)
      const tarefaInput = screen.getByLabelText(/tarefa 1/i)
      
      await user.type(tituloInput, 'Estudar React Avançado')
      await user.type(descricaoInput, 'Aprofundar conhecimentos em React')
      await user.type(tempoInput, '120')
      await user.type(tarefaInput, 'Estudar hooks customizados')
      
      // Adicionar segunda tarefa
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const tarefa2Input = screen.getByLabelText(/tarefa 2/i)
      await user.type(tarefa2Input, 'Praticar Context API')
      
      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      // Verificar chamadas ao store
      await waitFor(() => {
        expect(mockStore.adicionarHiperfoco).toHaveBeenCalledWith(
          'Estudar React Avançado',
          'Aprofundar conhecimentos em React',
          '#FF5252',
          120
        )
      })
      
      expect(mockStore.adicionarTarefa).toHaveBeenCalledTimes(2)
      expect(mockStore.adicionarTarefa).toHaveBeenCalledWith('hiperfoco-123', 'Estudar hooks customizados')
      expect(mockStore.adicionarTarefa).toHaveBeenCalledWith('hiperfoco-123', 'Praticar Context API')
      
      // Verificar feedback de sucesso
      expect(screen.getByText(/hiperfoco criado com sucesso/i)).toBeInTheDocument()
    })

    it('deve validar formulário antes de submeter', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      // Tentar submeter sem preencher campos obrigatórios
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      // Verificar que não foi chamado o store
      expect(mockStore.adicionarHiperfoco).not.toHaveBeenCalled()
      
      // Verificar mensagens de erro
      await waitFor(() => {
        expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
      })
    })
  })

  describe('Integração com visualizador de tarefas', () => {
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

    it('deve exibir tarefas hierárquicas corretamente', () => {
      render(<VisualizadorTarefasRefatorado initialTasks={mockTarefas} />)
      
      // Verificar estrutura hierárquica
      expect(screen.getByText('Tarefa principal')).toBeInTheDocument()
      expect(screen.getByText('Subtarefa 1')).toBeInTheDocument()
      expect(screen.getByText('Segunda tarefa')).toBeInTheDocument()
      
      // Verificar estatísticas
      expect(screen.getByText('3 tarefas')).toBeInTheDocument()
      expect(screen.getByText('1 concluída')).toBeInTheDocument()
      expect(screen.getByText('33% completo')).toBeInTheDocument()
    })

    it('deve permitir interações com tarefas', async () => {
      render(<VisualizadorTarefasRefatorado initialTasks={mockTarefas} />)
      
      // Marcar tarefa como concluída
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[0]) // Primeira tarefa
      
      // Verificar que a tarefa foi marcada
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true')
      
      // Adicionar nova tarefa
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const newTaskInput = screen.getByPlaceholderText(/nova tarefa/i)
      await user.type(newTaskInput, 'Nova tarefa de teste')
      
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      // Verificar que a nova tarefa foi adicionada
      expect(screen.getByText('Nova tarefa de teste')).toBeInTheDocument()
    })
  })

  describe('Validação integrada', () => {
    it('deve aplicar validações consistentes entre formulário e visualizador', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      
      // Testar validação de título vazio
      await user.click(tituloInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
      })
      
      // Testar validação de título muito longo
      await user.type(tituloInput, 'a'.repeat(256))
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/título deve ter no máximo 255 caracteres/i)).toBeInTheDocument()
      })
    })

    it('deve validar tarefas vazias no visualizador', async () => {
      render(<VisualizadorTarefasRefatorado initialTasks={[]} />)
      
      // Adicionar nova tarefa
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const newTaskInput = screen.getByPlaceholderText(/nova tarefa/i)
      
      // Tentar confirmar tarefa vazia
      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)
      
      // Verificar que mostra erro
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
    })
  })

  describe('Estados de carregamento e erro', () => {
    it('deve mostrar estados de carregamento durante operações', async () => {
      // Mock para simular operação lenta
      mockStore.adicionarHiperfoco.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('id'), 200))
      )
      
      render(<FormularioHiperfocoRefatorado />)
      
      // Preencher formulário mínimo
      const tituloInput = screen.getByLabelText(/título/i)
      await user.type(tituloInput, 'Teste')
      
      // Submeter
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      // Verificar estado de carregamento
      expect(screen.getByText(/criando/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.queryByText(/criando/i)).not.toBeInTheDocument()
      }, { timeout: 300 })
    })

    it('deve tratar erros de validação de forma consistente', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      // Preencher com dados inválidos
      const tituloInput = screen.getByLabelText(/título/i)
      const tempoInput = screen.getByLabelText(/tempo limite/i)
      
      await user.type(tituloInput, 'a'.repeat(300)) // Muito longo
      await user.type(tempoInput, '-10') // Negativo
      
      // Submeter
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      // Verificar que não foi chamado o store
      expect(mockStore.adicionarHiperfoco).not.toHaveBeenCalled()
      
      // Verificar contador de erros
      expect(screen.getByText(/2 erros encontrados/i)).toBeInTheDocument()
    })
  })

  describe('Acessibilidade integrada', () => {
    it('deve manter acessibilidade entre componentes', () => {
      render(<FormularioHiperfocoRefatorado />)
      
      // Verificar labels e roles
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /criar hiperfoco/i })).toBeInTheDocument()
      
      // Verificar estrutura semântica
      const form = screen.getByRole('form', { hidden: true })
      expect(form).toBeInTheDocument()
    })

    it('deve suportar navegação por teclado entre componentes', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)
      
      // Navegar com Tab
      tituloInput.focus()
      await user.tab()
      
      expect(descricaoInput).toHaveFocus()
    })
  })

  describe('Performance e otimização', () => {
    it('deve evitar re-renders desnecessários', async () => {
      const renderSpy = vi.fn()
      
      const TestComponent = () => {
        renderSpy()
        return <FormularioHiperfocoRefatorado />
      }
      
      render(<TestComponent />)
      
      const initialRenderCount = renderSpy.mock.calls.length
      
      // Interagir com o formulário
      const tituloInput = screen.getByLabelText(/título/i)
      await user.type(tituloInput, 'Teste')
      
      // Verificar que não houve re-renders excessivos
      const finalRenderCount = renderSpy.mock.calls.length
      expect(finalRenderCount - initialRenderCount).toBeLessThan(5)
    })
  })
})
