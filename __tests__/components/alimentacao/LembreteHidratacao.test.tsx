import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LembreteHidratacao } from '@/app/components/alimentacao/LembreteHidratacao'

// Mock do store Zustand
const mockStore = {
  coposBebidos: 0,
  metaDiaria: 8,
  ultimoRegistro: null,
  adicionarCopo: vi.fn(),
  removerCopo: vi.fn(),
  ajustarMeta: vi.fn(),
}

vi.mock('@/app/stores/alimentacaoStore', () => ({
  useAlimentacaoStore: () => mockStore
}))

describe('LembreteHidratacao', () => {
  beforeEach(() => {
    // Reset do mock store antes de cada teste
    mockStore.coposBebidos = 0
    mockStore.metaDiaria = 8
    mockStore.ultimoRegistro = null
    vi.clearAllMocks()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar o título corretamente', () => {
      render(<LembreteHidratacao />)
      expect(screen.getByText('Acompanhamento de Hidratação')).toBeInTheDocument()
    })

    it('deve mostrar o progresso inicial (0 de 8 copos)', () => {
      render(<LembreteHidratacao />)
      expect(screen.getByText('0 de 8 copos')).toBeInTheDocument()
    })

    it('deve mostrar 0% de progresso inicialmente', () => {
      render(<LembreteHidratacao />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('deve renderizar 8 copos vazios inicialmente', () => {
      render(<LembreteHidratacao />)
      const copos = screen.getAllByLabelText('Copo não bebido')
      expect(copos).toHaveLength(8)
    })

    it('deve renderizar os botões de ação', () => {
      render(<LembreteHidratacao />)
      expect(screen.getByText('Registrar Copo')).toBeInTheDocument()
      expect(screen.getByText('Remover Copo')).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de adicionar copos', () => {
    it('deve chamar adicionarCopo quando clicar no botão Registrar Copo', async () => {
      const user = userEvent.setup()
      render(<LembreteHidratacao />)
      
      const botaoAdicionar = screen.getByText('Registrar Copo')
      await user.click(botaoAdicionar)
      
      expect(mockStore.adicionarCopo).toHaveBeenCalledTimes(1)
    })

    it('deve desabilitar o botão Registrar Copo quando meta for atingida', () => {
      mockStore.coposBebidos = 8
      mockStore.metaDiaria = 8
      
      render(<LembreteHidratacao />)
      
      const botaoAdicionar = screen.getByText('Registrar Copo')
      expect(botaoAdicionar).toBeDisabled()
    })
  })

  describe('Funcionalidade de remover copos', () => {
    it('deve chamar removerCopo quando clicar no botão Remover Copo', async () => {
      const user = userEvent.setup()
      mockStore.coposBebidos = 3
      
      render(<LembreteHidratacao />)
      
      const botaoRemover = screen.getByText('Remover Copo')
      await user.click(botaoRemover)
      
      expect(mockStore.removerCopo).toHaveBeenCalledTimes(1)
    })

    it('deve desabilitar o botão Remover Copo quando não há copos bebidos', () => {
      mockStore.coposBebidos = 0
      
      render(<LembreteHidratacao />)
      
      const botaoRemover = screen.getByText('Remover Copo')
      expect(botaoRemover).toBeDisabled()
    })
  })

  describe('Cálculo de progresso', () => {
    it('deve mostrar 50% quando bebeu 4 de 8 copos', () => {
      mockStore.coposBebidos = 4
      mockStore.metaDiaria = 8
      
      render(<LembreteHidratacao />)
      
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('4 de 8 copos')).toBeInTheDocument()
    })

    it('deve mostrar 100% quando meta for atingida', () => {
      mockStore.coposBebidos = 8
      mockStore.metaDiaria = 8
      
      render(<LembreteHidratacao />)
      
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('deve limitar o progresso a 100% mesmo se exceder a meta', () => {
      mockStore.coposBebidos = 10
      mockStore.metaDiaria = 8
      
      render(<LembreteHidratacao />)
      
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Visualização dos copos', () => {
    it('deve mostrar copos bebidos e não bebidos corretamente', () => {
      mockStore.coposBebidos = 3
      mockStore.metaDiaria = 8
      
      render(<LembreteHidratacao />)
      
      const coposBebidos = screen.getAllByLabelText('Copo bebido')
      const coposNaoBebidos = screen.getAllByLabelText('Copo não bebido')
      
      expect(coposBebidos).toHaveLength(3)
      expect(coposNaoBebidos).toHaveLength(5)
    })
  })

  describe('Último registro', () => {
    it('deve mostrar o horário do último registro quando disponível', () => {
      mockStore.ultimoRegistro = '14:30'
      
      render(<LembreteHidratacao />)
      
      expect(screen.getByText('(Último: 14:30)')).toBeInTheDocument()
    })

    it('não deve mostrar último registro quando não há registro', () => {
      mockStore.ultimoRegistro = null
      
      render(<LembreteHidratacao />)
      
      expect(screen.queryByText(/Último:/)).not.toBeInTheDocument()
    })
  })

  describe('Ajuste de meta', () => {
    it('deve renderizar botões para ajustar meta', () => {
      render(<LembreteHidratacao />)
      
      // Procurar pelos botões de + e - para ajustar meta
      const botoes = screen.getAllByRole('button')
      expect(botoes.length).toBeGreaterThan(2) // Pelo menos os botões principais + ajuste de meta
    })
  })
})
