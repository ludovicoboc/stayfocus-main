/**
 * Testes TDD para ConcursoForm
 * Seguindo metodologia RED-GREEN-REFACTOR estabelecida
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ConcursoForm } from '@/app/components/concursos/ConcursoForm'
import { useConcursosStore } from '@/app/stores/concursosStore'
import { createConcurso, createConteudoProgramatico } from '../../factories/estudos-concursos'

// Mock do store
vi.mock('@/app/stores/concursosStore')
const mockUseConcursosStore = useConcursosStore as vi.MockedFunction<typeof useConcursosStore>

describe('ConcursoForm', () => {
  const mockAdicionarConcurso = vi.fn()
  const mockAtualizarConcurso = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseConcursosStore.mockReturnValue({
      concursos: [],
      adicionarConcurso: mockAdicionarConcurso,
      atualizarConcurso: mockAtualizarConcurso,
      removerConcurso: vi.fn(),
      atualizarProgresso: vi.fn()
    })
  })

  describe('🔴 RED: Component Rendering & Basic Validation', () => {
    it('deve renderizar formulário vazio para novo concurso', () => {
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      expect(screen.getByText(/novo concurso/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/organizadora/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/data.*inscrição/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/data.*prova/i)).toBeInTheDocument()
    })

    it('deve renderizar formulário preenchido para edição', () => {
      const concursoExistente = createConcurso({
        titulo: 'Analista TRT - Edição',
        organizadora: 'FCC'
      })

      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose}
          concursoParaEditar={concursoExistente}
        />
      )

      expect(screen.getByText(/editar concurso/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('Analista TRT - Edição')).toBeInTheDocument()
      expect(screen.getByDisplayValue('FCC')).toBeInTheDocument()
    })

    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      // Campos obrigatórios devem mostrar erro
      expect(screen.getByLabelText(/título/i)).toBeInvalid()
      expect(screen.getByLabelText(/organizadora/i)).toBeInvalid()
    })

    it('deve validar formato de datas', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      const dataInscricaoInput = screen.getByLabelText(/data.*inscrição/i)
      const dataProvaInput = screen.getByLabelText(/data.*prova/i)

      await user.type(dataInscricaoInput, '2024-12-31')
      await user.type(dataProvaInput, '2024-06-01') // Data anterior à inscrição

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      expect(screen.getByText(/data da prova deve ser posterior/i)).toBeInTheDocument()
    })
  })

  describe('🟢 GREEN: Form Submission & Data Handling', () => {
    it('deve criar novo concurso com dados válidos', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      // Preencher formulário
      await user.type(screen.getByLabelText(/título/i), 'Analista Administrativo TRT')
      await user.type(screen.getByLabelText(/organizadora/i), 'FCC')
      await user.type(screen.getByLabelText(/data.*inscrição/i), '2024-06-01')
      await user.type(screen.getByLabelText(/data.*prova/i), '2024-08-15')
      await user.type(screen.getByLabelText(/edital/i), 'https://exemplo.com/edital.pdf')

      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAdicionarConcurso).toHaveBeenCalledWith(
          expect.objectContaining({
            titulo: 'Analista Administrativo TRT',
            organizadora: 'FCC',
            dataInscricao: '2024-06-01',
            dataProva: '2024-08-15',
            edital: 'https://exemplo.com/edital.pdf',
            status: 'planejado'
          })
        )
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('deve atualizar concurso existente', async () => {
      const user = userEvent.setup()
      const concursoExistente = createConcurso({
        id: 'concurso-123',
        titulo: 'Título Original'
      })

      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose}
          concursoParaEditar={concursoExistente}
        />
      )

      // Alterar título
      const tituloInput = screen.getByDisplayValue('Título Original')
      await user.clear(tituloInput)
      await user.type(tituloInput, 'Título Atualizado')

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAtualizarConcurso).toHaveBeenCalledWith(
          'concurso-123',
          expect.objectContaining({
            titulo: 'Título Atualizado'
          })
        )
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('deve gerenciar conteúdo programático dinamicamente', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      // Adicionar disciplina
      const novaDisciplinaInput = screen.getByPlaceholderText(/nova disciplina/i)
      await user.type(novaDisciplinaInput, 'Direito Administrativo')
      
      const adicionarDisciplinaButton = screen.getByRole('button', { name: /adicionar disciplina/i })
      await user.click(adicionarDisciplinaButton)

      expect(screen.getByText('Direito Administrativo')).toBeInTheDocument()

      // Adicionar tópico à disciplina
      const novoTopicoInput = screen.getByPlaceholderText(/novo tópico/i)
      await user.type(novoTopicoInput, 'Princípios da Administração')
      
      const adicionarTopicoButton = screen.getByRole('button', { name: /adicionar tópico/i })
      await user.click(adicionarTopicoButton)

      expect(screen.getByText('Princípios da Administração')).toBeInTheDocument()
    })
  })

  describe('🔵 REFACTOR: Advanced Features & Performance', () => {
    it('deve implementar extração automática de conteúdo do edital', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      const editalInput = screen.getByLabelText(/edital/i)
      await user.type(editalInput, 'https://exemplo.com/edital.pdf')

      const extrairButton = screen.getByRole('button', { name: /extrair conteúdo/i })
      await user.click(extrairButton)

      // Deve mostrar loading
      expect(screen.getByText(/extraindo conteúdo/i)).toBeInTheDocument()

      // Aguardar conclusão da extração
      await waitFor(() => {
        expect(screen.getByText(/conteúdo extraído com sucesso/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('deve validar URL do edital', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      const editalInput = screen.getByLabelText(/edital/i)
      await user.type(editalInput, 'url-invalida')

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      expect(screen.getByText(/url inválida/i)).toBeInTheDocument()
    })

    it('deve ser acessível via teclado', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      // Navegar por todos os campos usando Tab
      await user.tab()
      expect(screen.getByLabelText(/título/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/organizadora/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/data.*inscrição/i)).toHaveFocus()

      // Testar Escape para fechar modal
      await user.keyboard('{Escape}')
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('deve lidar com formulários grandes sem perda de performance', async () => {
      const concursoComMuitoConteudo = createConcurso({
        conteudoProgramatico: Array.from({ length: 50 }, () => 
          createConteudoProgramatico({
            topicos: Array.from({ length: 20 }, (_, i) => `Tópico ${i + 1}`)
          })
        )
      })

      const startTime = performance.now()
      
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose}
          concursoParaEditar={concursoComMuitoConteudo}
        />
      )

      const renderTime = performance.now() - startTime
      expect(renderTime).toBeLessThan(100) // < 100ms para renderizar
    })

    it('deve implementar auto-save para prevenir perda de dados', async () => {
      const user = userEvent.setup()
      vi.useFakeTimers()

      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      // Digitar no campo título
      await user.type(screen.getByLabelText(/título/i), 'Teste Auto-save')

      // Avançar timer para trigger do auto-save
      vi.advanceTimersByTime(2000)

      // Verificar se dados foram salvos no localStorage
      expect(localStorage.getItem('concurso-form-draft')).toContain('Teste Auto-save')

      vi.useRealTimers()
    })
  })

  describe('🧪 Edge Cases & Error Handling', () => {
    it('deve lidar com erro na submissão', async () => {
      const user = userEvent.setup()
      mockAdicionarConcurso.mockImplementation(() => {
        throw new Error('Erro de rede')
      })

      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      // Preencher e submeter formulário
      await user.type(screen.getByLabelText(/título/i), 'Teste Erro')
      await user.type(screen.getByLabelText(/organizadora/i), 'Banca')
      
      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erro ao salvar concurso/i)).toBeInTheDocument()
      })
    })

    it('deve resetar formulário ao fechar modal', async () => {
      const user = userEvent.setup()
      render(
        <ConcursoForm 
          isOpen={true} 
          onClose={mockOnClose} 
        />
      )

      // Preencher campo
      await user.type(screen.getByLabelText(/título/i), 'Teste Reset')

      // Fechar modal
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
