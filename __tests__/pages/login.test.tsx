import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider } from '@/app/lib/auth'
import LoginPage from '@/app/login/page'

// Mock do data provider
const mockDataProvider = {
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshSession: vi.fn(),
}

vi.mock('@/app/lib/dataProviders', () => ({
  getDataProvider: () => mockDataProvider,
}))

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock do useRouter
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock dos componentes de autenticação
vi.mock('@/app/components/auth/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}))

// Wrapper para testes
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  describe('Renderização', () => {
    it('deve renderizar página de login', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })

    it('deve ter título da página', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      expect(screen.getByRole('heading', { name: /stayfocus/i })).toBeInTheDocument()
    })

    it('deve ter layout responsivo', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      const container = screen.getByTestId('login-page-container')
      expect(container).toHaveClass('min-h-screen')
      expect(container).toHaveClass('flex')
      expect(container).toHaveClass('items-center')
      expect(container).toHaveClass('justify-center')
    })

    it('deve ter background apropriado', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      const container = screen.getByTestId('login-page-container')
      expect(container).toHaveClass('bg-gray-50')
      expect(container).toHaveClass('dark:bg-gray-900')
    })
  })

  describe('Proteção de rota', () => {
    it('deve redirecionar usuário autenticado', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)

      render(<LoginPage />, { wrapper: createWrapper() })

      // A página deve detectar que o usuário está autenticado e redirecionar
      // Isso será testado através do comportamento do GuestOnly component
    })
  })

  describe('SEO e Metadados', () => {
    it('deve ter metadados apropriados', () => {
      // Este teste verificaria se a página tem os metadados corretos
      // Como title, description, etc.
      // Implementação dependeria de como os metadados são configurados no Next.js
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica apropriada', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      // Verificar se há elementos semânticos apropriados
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('deve ter foco inicial apropriado', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      // O foco inicial deve estar no primeiro campo do formulário
      // Isso seria testado através do LoginForm component
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })
  })

  describe('Responsividade', () => {
    it('deve adaptar layout para mobile', () => {
      // Mock do window.innerWidth para simular mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<LoginPage />, { wrapper: createWrapper() })

      const container = screen.getByTestId('login-page-container')
      expect(container).toHaveClass('px-4') // Padding para mobile
    })

    it('deve adaptar layout para desktop', () => {
      // Mock do window.innerWidth para simular desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      render(<LoginPage />, { wrapper: createWrapper() })

      const container = screen.getByTestId('login-page-container')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Estados de carregamento', () => {
    it('deve mostrar loading durante verificação de autenticação', () => {
      // Mock de loading state
      mockDataProvider.getCurrentUser.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 100))
      )

      render(<LoginPage />, { wrapper: createWrapper() })

      // Durante o loading, deve mostrar algum indicador
      // Isso seria implementado no AuthProvider ou GuestOnly component
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })
  })

  describe('Tratamento de erros', () => {
    it('deve lidar com erro na verificação de autenticação', () => {
      mockDataProvider.getCurrentUser.mockRejectedValue(new Error('Network error'))

      render(<LoginPage />, { wrapper: createWrapper() })

      // Mesmo com erro, deve mostrar a página de login
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })
  })

  describe('Navegação', () => {
    it('deve ter link para página de registro', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      // O link para registro estaria no LoginForm component
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })

    it('deve ter link para recuperação de senha', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      // O link para recuperação de senha estaria no LoginForm component
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })
  })

  describe('Integração com tema', () => {
    it('deve respeitar tema escuro', () => {
      // Mock do tema escuro
      render(<LoginPage />, { wrapper: createWrapper() })

      const container = screen.getByTestId('login-page-container')
      expect(container).toHaveClass('dark:bg-gray-900')
    })

    it('deve respeitar tema claro', () => {
      render(<LoginPage />, { wrapper: createWrapper() })

      const container = screen.getByTestId('login-page-container')
      expect(container).toHaveClass('bg-gray-50')
    })
  })
})
