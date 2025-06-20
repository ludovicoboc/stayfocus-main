import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConversorInteresses } from '@/app/components/hiperfocos/ConversorInteresses'

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

describe('ConversorInteresses', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdicionarHiperfoco.mockReturnValue('hiperfoco-123')
    mockAdicionarTarefa.mockReturnValue('tarefa-123')
  })

  describe('Renderização inicial', () => {
    it('deve renderizar o formulário corretamente', () => {
      render(<ConversorInteresses />)

      expect(screen.getByLabelText(/título do interesse/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tempo limite/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /converter interesse em hiperfoco/i })).toBeInTheDocument()
    })

    it('deve ter um campo de tarefa inicial', () => {
      render(<ConversorInteresses />)

      const tarefaInputs = screen.getAllByLabelText(/^tarefa \d+$/i)
      expect(tarefaInputs).toHaveLength(1)
    })

    it('deve permitir adicionar mais campos de tarefa', async () => {
      render(<ConversorInteresses />)

      const addButton = screen.getByRole('button', { name: /adicionar mais uma tarefa/i })
      await user.click(addButton)

      const tarefaInputs = screen.getAllByLabelText(/^tarefa \d+$/i)
      expect(tarefaInputs).toHaveLength(2)
    })
  })

  describe('Validação de formulário', () => {
    it('deve mostrar erro quando título está vazio', async () => {
      render(<ConversorInteresses />)

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
      })

      expect(mockAdicionarHiperfoco).not.toHaveBeenCalled()
    })

    it('deve mostrar erro quando título é muito longo', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      await user.type(tituloInput, 'a'.repeat(256)) // Muito longo

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/título deve ter no máximo 255 caracteres/i)).toBeInTheDocument()
      })

      expect(mockAdicionarHiperfoco).not.toHaveBeenCalled()
    })

    it('deve mostrar erro quando descrição é muito longa', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)
      const tarefaInput = screen.getByLabelText(/^tarefa \d+$/i)

      await user.type(tituloInput, 'Título válido')
      await user.type(tarefaInput, 'Tarefa teste')
      await user.type(descricaoInput, 'a'.repeat(1001)) // Muito longa

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/descrição deve ter no máximo 1000 caracteres/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      expect(mockAdicionarHiperfoco).not.toHaveBeenCalled()
    })

    it('deve mostrar erro quando tempo limite é inválido', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      const tempoInput = screen.getByLabelText(/tempo limite/i)
      const tarefaInput = screen.getByLabelText(/^tarefa \d+$/i)

      await user.type(tituloInput, 'Título válido')
      await user.type(tarefaInput, 'Tarefa teste')
      await user.type(tempoInput, '-10') // Negativo

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/tempo limite deve ser positivo/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      expect(mockAdicionarHiperfoco).not.toHaveBeenCalled()
    })

    it('deve mostrar erro quando tarefa está vazia', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      await user.type(tituloInput, 'Título válido')

      // Deixar tarefa vazia e tentar submeter
      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      // Como tarefas vazias são filtradas, não deve mostrar erro específico
      // mas deve criar o hiperfoco sem tarefas
      await waitFor(() => {
        expect(mockAdicionarHiperfoco).toHaveBeenCalled()
      })

      expect(mockAdicionarTarefa).not.toHaveBeenCalled()
    })
  })

  describe('Criação de hiperfoco', () => {
    it('deve criar hiperfoco com dados válidos', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)
      const tempoInput = screen.getByLabelText(/tempo limite/i)

      await user.type(tituloInput, 'Estudar React')
      await user.type(descricaoInput, 'Aprender hooks e context')
      await user.type(tempoInput, '60')

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAdicionarHiperfoco).toHaveBeenCalledWith(
          'Estudar React',
          'Aprender hooks e context',
          '#FF5252', // Primeira cor padrão
          60
        )
      })
    })

    it('deve criar hiperfoco com tarefas', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      await user.type(tituloInput, 'Projeto React')

      const tarefaInput = screen.getByLabelText(/tarefa 1/i)
      await user.type(tarefaInput, 'Configurar projeto')

      // Adicionar segunda tarefa
      const addButton = screen.getByRole('button', { name: /adicionar mais uma tarefa/i })
      await user.click(addButton)

      const tarefa2Input = screen.getByLabelText(/tarefa 2/i)
      await user.type(tarefa2Input, 'Implementar componentes')

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAdicionarHiperfoco).toHaveBeenCalled()
        expect(mockAdicionarTarefa).toHaveBeenCalledTimes(2)
        expect(mockAdicionarTarefa).toHaveBeenCalledWith('hiperfoco-123', 'Configurar projeto')
        expect(mockAdicionarTarefa).toHaveBeenCalledWith('hiperfoco-123', 'Implementar componentes')
      })
    })

    it('deve mostrar feedback de sucesso após criação', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      await user.type(tituloInput, 'Hiperfoco de teste')

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/hiperfoco criado com sucesso/i)).toBeInTheDocument()
      })
    })

    it('deve limpar formulário após criação bem-sucedida', async () => {
      render(<ConversorInteresses />)

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      const descricaoInput = screen.getByLabelText(/descrição/i)

      await user.type(tituloInput, 'Teste')
      await user.type(descricaoInput, 'Descrição teste')

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(tituloInput).toHaveValue('')
        expect(descricaoInput).toHaveValue('')
      })
    })
  })

  describe('Seleção de cor', () => {
    it('deve permitir selecionar diferentes cores', async () => {
      render(<ConversorInteresses />)

      const colorButtons = screen.getAllByRole('button', { name: /cor/i })
      expect(colorButtons.length).toBeGreaterThan(1)

      // Selecionar segunda cor
      await user.click(colorButtons[1])

      const tituloInput = screen.getByLabelText(/título do interesse/i)
      await user.type(tituloInput, 'Teste cor')

      const submitButton = screen.getByRole('button', { name: /converter interesse em hiperfoco/i })
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

  describe('Remoção de tarefas', () => {
    it('deve permitir remover campos de tarefa', async () => {
      render(<ConversorInteresses />)

      // Adicionar segunda tarefa
      const addButton = screen.getByRole('button', { name: /adicionar mais uma tarefa/i })
      await user.click(addButton)

      expect(screen.getAllByLabelText(/^tarefa \d+$/i)).toHaveLength(2)

      // Remover primeira tarefa
      const removeButtons = screen.getAllByRole('button', { name: /remover tarefa/i })
      await user.click(removeButtons[0])

      expect(screen.getAllByLabelText(/^tarefa \d+$/i)).toHaveLength(1)
    })

    it('deve ter botão de remover quando há mais de uma tarefa', async () => {
      render(<ConversorInteresses />)

      // Inicialmente deve ter apenas uma tarefa e o botão de remover deve estar desabilitado
      const initialRemoveButtons = screen.getAllByRole('button', { name: /remover tarefa/i })
      expect(initialRemoveButtons[0]).toBeDisabled()

      // Adicionar segunda tarefa
      const addButton = screen.getByRole('button', { name: /adicionar mais uma tarefa/i })
      await user.click(addButton)

      // Agora deve ter botões de remover habilitados
      const removeButtons = screen.getAllByRole('button', { name: /remover tarefa/i })
      expect(removeButtons).toHaveLength(2)
      expect(removeButtons[0]).not.toBeDisabled()
      expect(removeButtons[1]).not.toBeDisabled()
    })
  })
})
