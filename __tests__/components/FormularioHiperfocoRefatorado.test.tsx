import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormularioHiperfocoRefatorado } from '@/app/components/hiperfocos/FormularioHiperfocoRefatorado'

// Mock do store
const mockAdicionarHiperfoco = vi.fn()
const mockAdicionarTarefa = vi.fn()

vi.mock('@/app/stores/hiperfocosStore', () => ({
  useHiperfocosStore: () => ({
    adicionarHiperfoco: mockAdicionarHiperfoco,
    adicionarTarefa: mockAdicionarTarefa
  }),
  CORES_HIPERFOCOS: ['#FF5252', '#E91E63', '#9C27B0']
}))

describe('FormularioHiperfocoRefatorado', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdicionarHiperfoco.mockReturnValue('hiperfoco-123')
    mockAdicionarTarefa.mockReturnValue('tarefa-123')
  })

  describe('Renderização', () => {
    it('deve renderizar todos os campos do formulário', () => {
      render(<FormularioHiperfocoRefatorado />)
      
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tempo limite/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /criar hiperfoco/i })).toBeInTheDocument()
    })

    it('deve mostrar campo para adicionar tarefas', () => {
      render(<FormularioHiperfocoRefatorado />)
      
      expect(screen.getByLabelText(/tarefa 1/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /adicionar tarefa/i })).toBeInTheDocument()
    })

    it('deve mostrar seletor de cores', () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const colorButtons = screen.getAllByRole('button', { name: /selecionar cor/i })
      expect(colorButtons.length).toBeGreaterThan(1)
    })
  })

  describe('Validação em tempo real', () => {
    it('deve mostrar erro quando título está vazio e campo perde foco', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      
      await user.click(tituloInput)
      await user.tab() // Sair do campo (blur)
      
      await waitFor(() => {
        expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro quando título é muito longo', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      
      await user.type(tituloInput, 'a'.repeat(256))
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/título deve ter no máximo 255 caracteres/i)).toBeInTheDocument()
      })
    })

    it('deve validar descrição com debounce', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const descricaoInput = screen.getByLabelText(/descrição/i)
      
      await user.type(descricaoInput, 'a'.repeat(1001))
      
      // Aguardar debounce
      await waitFor(() => {
        expect(screen.getByText(/descrição deve ter no máximo 1000 caracteres/i)).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('deve validar tempo limite', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tempoInput = screen.getByLabelText(/tempo limite/i)
      
      await user.type(tempoInput, '-10')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/tempo limite deve ser positivo/i)).toBeInTheDocument()
      })
    })

    it('deve validar tarefas vazias', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tarefaInput = screen.getByLabelText(/tarefa 1/i)
      
      await user.click(tarefaInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validação de formulário completo', () => {
    it('deve impedir submissão com erros de validação', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
      })
      
      expect(mockAdicionarHiperfoco).not.toHaveBeenCalled()
    })

    it('deve permitir submissão com dados válidos', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)
      const tempoInput = screen.getByLabelText(/tempo limite/i)
      const tarefaInput = screen.getByLabelText(/tarefa 1/i)
      
      await user.type(tituloInput, 'Hiperfoco Teste')
      await user.type(descricaoInput, 'Descrição do teste')
      await user.type(tempoInput, '60')
      await user.type(tarefaInput, 'Primeira tarefa')
      
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockAdicionarHiperfoco).toHaveBeenCalledWith(
          'Hiperfoco Teste',
          'Descrição do teste',
          '#FF5252',
          60
        )
      })
      
      expect(mockAdicionarTarefa).toHaveBeenCalledWith('hiperfoco-123', 'Primeira tarefa')
    })
  })

  describe('Gerenciamento de tarefas', () => {
    it('deve adicionar nova tarefa', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      expect(screen.getByLabelText(/tarefa 2/i)).toBeInTheDocument()
    })

    it('deve remover tarefa', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      // Adicionar segunda tarefa primeiro
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      expect(screen.getByLabelText(/tarefa 2/i)).toBeInTheDocument()
      
      // Remover primeira tarefa
      const removeButtons = screen.getAllByRole('button', { name: /remover tarefa/i })
      await user.click(removeButtons[0])
      
      expect(screen.queryByLabelText(/tarefa 1/i)).not.toBeInTheDocument()
      expect(screen.getByLabelText(/tarefa 1/i)).toBeInTheDocument() // A segunda virou primeira
    })

    it('deve validar todas as tarefas', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      // Adicionar segunda tarefa
      const addButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addButton)
      
      const tarefa1Input = screen.getByLabelText(/tarefa 1/i)
      const tarefa2Input = screen.getByLabelText(/tarefa 2/i)
      
      await user.type(tarefa1Input, 'Tarefa válida')
      // Deixar tarefa 2 vazia
      
      await user.tab() // Sair do campo
      
      await waitFor(() => {
        expect(screen.getByText(/texto da tarefa é obrigatório/i)).toBeInTheDocument()
      })
    })
  })

  describe('Seleção de cores', () => {
    it('deve permitir selecionar cor diferente', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const colorButtons = screen.getAllByRole('button', { name: /selecionar cor/i })
      
      // Selecionar segunda cor
      await user.click(colorButtons[1])
      
      // Preencher formulário e submeter
      const tituloInput = screen.getByLabelText(/título/i)
      await user.type(tituloInput, 'Teste cor')
      
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockAdicionarHiperfoco).toHaveBeenCalledWith(
          'Teste cor',
          '',
          '#E91E63', // Segunda cor
          undefined
        )
      })
    })
  })

  describe('Estados do formulário', () => {
    it('deve mostrar estado de carregamento durante submissão', async () => {
      // Mock para simular operação assíncrona
      mockAdicionarHiperfoco.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('id'), 100))
      )
      
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      await user.type(tituloInput, 'Teste loading')
      
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      expect(screen.getByText(/criando/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText(/criando/i)).not.toBeInTheDocument()
      })
    })

    it('deve desabilitar formulário durante carregamento', async () => {
      mockAdicionarHiperfoco.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('id'), 100))
      )
      
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      await user.type(tituloInput, 'Teste')
      
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      expect(tituloInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(tituloInput).not.toBeDisabled()
      })
    })

    it('deve limpar formulário após sucesso', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)
      
      await user.type(tituloInput, 'Teste')
      await user.type(descricaoInput, 'Descrição')
      
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(tituloInput).toHaveValue('')
        expect(descricaoInput).toHaveValue('')
      })
    })
  })

  describe('Feedback visual', () => {
    it('deve mostrar indicadores visuais de erro', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      
      await user.click(tituloInput)
      await user.tab()
      
      await waitFor(() => {
        expect(tituloInput).toHaveClass('border-red-500')
      })
    })

    it('deve mostrar indicadores visuais de sucesso', async () => {
      render(<FormularioHiperfocoRefatorado />)
      
      const tituloInput = screen.getByLabelText(/título/i)
      
      await user.type(tituloInput, 'Título válido')
      await user.tab()
      
      await waitFor(() => {
        expect(tituloInput).toHaveClass('border-green-500')
      })
    })

    it('deve mostrar contador de caracteres', () => {
      render(<FormularioHiperfocoRefatorado />)
      
      expect(screen.getByText(/0\/255/)).toBeInTheDocument() // Contador do título
      expect(screen.getByText(/0\/1000/)).toBeInTheDocument() // Contador da descrição
    })
  })
})
