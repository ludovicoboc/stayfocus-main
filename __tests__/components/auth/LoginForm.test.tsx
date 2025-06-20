import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider } from '@/app/lib/auth'
import { LoginForm } from '@/app/components/auth/LoginForm'
import '../../setup-components'

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
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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

describe('LoginForm Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  describe('Renderização', () => {
    it('deve renderizar formulário de login', () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrando|entrar/i })).toBeInTheDocument()
    })

    it('deve renderizar link para registro', () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument()
    })

    it('deve renderizar título do formulário', () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument()
    })
  })

  describe('Validação de formulário', () => {
    it('deve mostrar erro para email inválido', async () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'email-invalido')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro para campos obrigatórios', async () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const submitButton = screen.getByRole('button', { name: /entrar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
      })
    })

    it('deve limpar erros quando usuário digita', async () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      // Submeter formulário vazio para gerar erros
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
      })

      // Digitar no campo deve limpar o erro
      await user.type(emailInput, 'test@example.com')

      await waitFor(() => {
        expect(screen.queryByText(/email é obrigatório/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Submissão do formulário', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.login.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token' },
      })

      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockDataProvider.login).toHaveBeenCalledWith('test@example.com', 'password123')
      })

      // Deve redirecionar após login bem-sucedido
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('deve mostrar erro de login', async () => {
      mockDataProvider.login.mockResolvedValue({
        user: null,
        session: null,
        error: 'Credenciais inválidas',
      })

      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrong-password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
      })
    })

    it('deve desabilitar botão durante submissão', async () => {
      mockDataProvider.login.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ user: null, session: null }), 100))
      )

      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/entrando/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('deve ter aria-invalid quando há erros', async () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('deve ter aria-describedby para mensagens de erro', async () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/email é obrigatório/i)
        expect(emailInput).toHaveAttribute('aria-describedby', errorMessage.id)
      })
    })
  })

  describe('Funcionalidades extras', () => {
    it('deve permitir submissão com Enter', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.login.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token' },
      })

      render(<LoginForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockDataProvider.login).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('deve mostrar/ocultar senha', async () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      const passwordInput = screen.getByLabelText(/^senha$/i)
      const toggleButton = screen.getByRole('button', { name: /mostrar senha/i })

      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument()
    })

    it('deve ter link para recuperação de senha', () => {
      render(<LoginForm />, { wrapper: createWrapper() })

      expect(screen.getByRole('link', { name: /esqueceu a senha/i })).toBeInTheDocument()
    })
  })
})
