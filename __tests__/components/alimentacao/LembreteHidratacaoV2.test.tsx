import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LembreteHidratacaoV2 } from '@/app/components/alimentacao/LembreteHidratacaoV2'

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

// Mock do service
vi.mock('@/app/lib/services/alimentacao', () => ({
  alimentacaoService: {
    getHydrationProgress: vi.fn(),
    createHydrationRecord: vi.fn(),
    deleteHydrationRecord: vi.fn(),
  }
}))

// Wrapper com QueryClient para testes
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Não tentar novamente nos testes
        gcTime: 0, // Não cachear nos testes
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('LembreteHidratacaoV2', () => {
  let mockService: any

  beforeEach(async () => {
    // Reset dos mocks antes de cada teste
    mockStore.coposBebidos = 0
    mockStore.metaDiaria = 8
    mockStore.ultimoRegistro = null
    vi.clearAllMocks()

    // Obter referência ao mock do service
    const { alimentacaoService } = await import('@/app/lib/services/alimentacao')
    mockService = alimentacaoService

    // Mock padrão do service (sucesso)
    mockService.getHydrationProgress.mockResolvedValue({
      current: 0,
      goal: 2000,
      progress: 0,
      remaining: 2000,
    })
  })

  describe('Renderização com React Query', () => {
    it('deve mostrar loading state inicialmente', async () => {
      // Fazer o service demorar para responder
      mockService.getHydrationProgress.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      // Verificar se há elementos de loading (skeleton)
      await waitFor(() => {
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('deve renderizar dados do servidor quando online', async () => {
      mockService.getHydrationProgress.mockResolvedValue({
        current: 1000, // 4 copos de 250ml
        goal: 2000,    // 8 copos de 250ml
        progress: 0.5,
        remaining: 1000,
      })

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('4 de 8 copos')).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
      })

      // Verificar indicador online
      const onlineIndicator = document.querySelector('.bg-green-500')
      expect(onlineIndicator).toBeInTheDocument()
    })

    it('deve usar fallback do localStorage quando offline', async () => {
      // Simular erro de rede
      mockService.getHydrationProgress.mockRejectedValue(new Error('Network error'))
      
      mockStore.coposBebidos = 3
      mockStore.metaDiaria = 8

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('3 de 8 copos')).toBeInTheDocument()
        expect(screen.getByText('(Modo offline)')).toBeInTheDocument()
      })

      // Verificar indicador offline
      const offlineIndicator = document.querySelector('.bg-yellow-500')
      expect(offlineIndicator).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de adicionar copos', () => {
    it('deve chamar o service para adicionar copo quando online', async () => {
      mockService.createHydrationRecord.mockResolvedValue({
        id: '1',
        user_id: 'user1',
        amount_ml: 250,
        date: '2024-01-15',
        time: '10:00',
        created_at: '2024-01-15T10:00:00Z',
      })

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Registrar Copo')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const botaoAdicionar = screen.getByText('Registrar Copo')
      await user.click(botaoAdicionar)

      // Aguardar um pouco mais para a mutation ser processada
      await waitFor(() => {
        expect(mockService.createHydrationRecord).toHaveBeenCalledWith(250, undefined, undefined)
      }, { timeout: 2000 })
    })

    it('deve mostrar loading no botão durante a requisição', async () => {
      // Fazer o service demorar para responder
      let resolvePromise: any
      mockService.createHydrationRecord.mockImplementation(
        () => new Promise(resolve => {
          resolvePromise = resolve
        })
      )

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Registrar Copo')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const botaoAdicionar = screen.getByText('Registrar Copo')
      await user.click(botaoAdicionar)

      // Verificar se há spinner de loading
      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
      }, { timeout: 500 })

      // Resolver a promise para limpar o estado
      if (resolvePromise) {
        resolvePromise({
          id: '1',
          user_id: 'user1',
          amount_ml: 250,
          date: '2024-01-15',
          time: '10:00',
          created_at: '2024-01-15T10:00:00Z',
        })
      }
    })
  })

  describe('Ajuste de meta', () => {
    it('deve usar o store local para ajustar meta', async () => {
      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Aumentar meta diária')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const botaoAumentar = screen.getByLabelText('Aumentar meta diária')
      await user.click(botaoAumentar)

      expect(mockStore.ajustarMeta).toHaveBeenCalledWith(1)
    })

    it('deve desabilitar botão de diminuir quando meta é 1', async () => {
      mockStore.metaDiaria = 1

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        const botaoDiminuir = screen.getByLabelText('Diminuir meta diária')
        expect(botaoDiminuir).toBeDisabled()
      })
    })

    it('deve desabilitar botão de aumentar quando meta é 15', async () => {
      mockStore.metaDiaria = 15

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        const botaoAumentar = screen.getByLabelText('Aumentar meta diária')
        expect(botaoAumentar).toBeDisabled()
      })
    })
  })

  describe('Indicadores visuais', () => {
    it('deve mostrar copos bebidos e não bebidos corretamente', async () => {
      mockService.getHydrationProgress.mockResolvedValue({
        current: 750, // 3 copos de 250ml
        goal: 2000,   // 8 copos de 250ml
        progress: 0.375,
        remaining: 1250,
      })

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        const coposBebidos = screen.getAllByLabelText('Copo bebido')
        const coposNaoBebidos = screen.getAllByLabelText('Copo não bebido')
        
        expect(coposBebidos).toHaveLength(3)
        expect(coposNaoBebidos).toHaveLength(5)
      })
    })

    it('deve mostrar último registro quando disponível', async () => {
      mockStore.ultimoRegistro = '14:30'

      render(
        <TestWrapper>
          <LembreteHidratacaoV2 />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('(Último: 14:30)')).toBeInTheDocument()
      })
    })
  })
})
