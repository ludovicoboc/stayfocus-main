import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider } from '@/app/lib/auth'
import { RegisterForm } from '@/app/components/auth/RegisterForm'

// Mock do data provider
const mockDataProvider = {
  register: vi.fn(),
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

describe('RegisterForm Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  describe('Renderização', () => {
    it('deve renderizar formulário de registro', () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
    })

    it('deve renderizar link para login', () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/já tem uma conta/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument()
    })

    it('deve renderizar título do formulário', () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument()
    })
  })

  describe('Validação de formulário', () => {
    it('deve mostrar erro para email inválido', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.type(emailInput, 'email-invalido')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro para campos obrigatórios', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const submitButton = screen.getByRole('button', { name: /criar conta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
      })
    })

    it('deve validar força da senha', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const passwordInput = screen.getByLabelText(/^senha$/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument()
      })
    })

    it('deve validar confirmação de senha', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'different-password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar indicador de força da senha', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const passwordInput = screen.getByLabelText(/^senha$/i)

      // Senha fraca
      await user.type(passwordInput, '123')
      expect(screen.getByText(/fraca/i)).toBeInTheDocument()

      // Limpar e testar senha forte
      await user.clear(passwordInput)
      await user.type(passwordInput, 'Password123!')
      expect(screen.getByText(/forte/i)).toBeInTheDocument()
    })
  })

  describe('Submissão do formulário', () => {
    it('deve registrar usuário com dados válidos', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.register.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token' },
      })

      render(<RegisterForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockDataProvider.register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        })
      })

      // Deve redirecionar após registro bem-sucedido
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('deve mostrar erro de registro', async () => {
      mockDataProvider.register.mockResolvedValue({
        user: null,
        session: null,
        error: 'Email já está em uso',
      })

      render(<RegisterForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email já está em uso/i)).toBeInTheDocument()
      })
    })

    it('deve desabilitar botão durante submissão', async () => {
      mockDataProvider.register.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ user: null, session: null }), 100))
      )

      render(<RegisterForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/criando conta/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

      expect(nameInput).toHaveAttribute('type', 'text')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('deve ter aria-invalid quando há erros', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('deve ter aria-describedby para mensagens de erro', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

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

      mockDataProvider.register.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token' },
      })

      render(<RegisterForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Password123!')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockDataProvider.register).toHaveBeenCalled()
      })
    })

    it('deve mostrar/ocultar senhas', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const passwordInput = screen.getByLabelText(/^senha$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
      const toggleButtons = screen.getAllByRole('button', { name: /mostrar senha/i })

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')

      await user.click(toggleButtons[0])

      expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('deve aceitar termos de uso', async () => {
      render(<RegisterForm />, { wrapper: createWrapper() })

      const termsCheckbox = screen.getByLabelText(/aceito os termos/i)
      const submitButton = screen.getByRole('button', { name: /criar conta/i })

      expect(termsCheckbox).not.toBeChecked()

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/você deve aceitar os termos/i)).toBeInTheDocument()
      })

      await user.click(termsCheckbox)
      expect(termsCheckbox).toBeChecked()
    })
  })
})
