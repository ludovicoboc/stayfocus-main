import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider, useAuth } from '@/app/lib/auth'

// Mock do data provider
const mockDataProvider = {
  login: vi.fn(),
  register: vi.fn(),
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

// Componente de teste para verificar estado de autenticação
const AuthTestComponent = () => {
  const { user, isAuthenticated, loading, login, logout, error } = useAuth()

  if (loading) {
    return <div data-testid="loading">Loading...</div>
  }

  return (
    <div data-testid="auth-test">
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-info">
          <span data-testid="user-email">{user.email}</span>
          <span data-testid="user-name">{user.name}</span>
        </div>
      )}
      {error && <div data-testid="auth-error">{error}</div>}
      <button
        data-testid="login-button"
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}

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

describe('Fluxo de Autenticação - Integração', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Estado inicial', () => {
    it('deve inicializar com usuário não autenticado', async () => {
      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument()
    })

    it('deve restaurar usuário autenticado na inicialização', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    })
  })

  describe('Fluxo de login', () => {
    it('deve fazer login completo com sucesso', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      }

      mockDataProvider.login.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const loginButton = screen.getByTestId('login-button')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_session',
        JSON.stringify(mockSession)
      )
    })

    it('deve lidar com erro de login', async () => {
      mockDataProvider.login.mockResolvedValue({
        user: null,
        session: null,
        error: 'Credenciais inválidas',
      })

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      const loginButton = screen.getByTestId('login-button')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-error')).toHaveTextContent('Credenciais inválidas')
      })

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
    })
  })

  describe('Fluxo de logout', () => {
    it('deve fazer logout completo com sucesso', async () => {
      // Primeiro, simular usuário logado
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.logout.mockResolvedValue(undefined)

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      const logoutButton = screen.getByTestId('logout-button')
      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(screen.queryByTestId('user-info')).not.toBeInTheDocument()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session')
    })
  })

  describe('Persistência de sessão', () => {
    it('deve restaurar sessão válida do localStorage', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockSession = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000, // 1 hora no futuro
        user: mockUser,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))
      mockDataProvider.refreshSession.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      expect(mockDataProvider.refreshSession).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    })

    it('deve remover sessão expirada', async () => {
      const expiredSession = {
        access_token: 'expired-token',
        expires_at: Date.now() - 3600000, // 1 hora no passado
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession))

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session')
      expect(mockDataProvider.getCurrentUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('Renovação automática de sessão', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('deve renovar sessão automaticamente', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.refreshSession.mockResolvedValue({
        user: mockUser,
        session: { access_token: 'new-token' },
      })

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      // Avançar 5 minutos para triggerar renovação automática
      vi.advanceTimersByTime(5 * 60 * 1000)

      await waitFor(() => {
        expect(mockDataProvider.refreshSession).toHaveBeenCalled()
      })
    })
  })

  describe('Sincronização entre abas', () => {
    it('deve sincronizar logout entre abas', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })

      // Simular remoção de sessão em outra aba
      const storageEvent = new StorageEvent('storage', {
        key: 'auth_session',
        newValue: null,
        oldValue: JSON.stringify({ access_token: 'token' }),
      })

      window.dispatchEvent(storageEvent)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })
    })

    it('deve sincronizar login entre abas', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockSession = {
        access_token: 'new-token',
        user: mockUser,
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(null)
      mockDataProvider.refreshSession.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })

      render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      // Simular criação de sessão em outra aba
      const storageEvent = new StorageEvent('storage', {
        key: 'auth_session',
        newValue: JSON.stringify(mockSession),
        oldValue: null,
      })

      window.dispatchEvent(storageEvent)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      })
    })
  })

  describe('Isolamento de dados', () => {
    it('deve garantir que dados são específicos do usuário', async () => {
      const user1 = {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User 1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const user2 = {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User 2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Primeiro login
      mockDataProvider.getCurrentUser.mockResolvedValue(user1)

      const { rerender } = render(<AuthTestComponent />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user1@example.com')
      })

      // Simular logout e login com outro usuário
      mockDataProvider.getCurrentUser.mockResolvedValue(user2)

      rerender(<AuthTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user2@example.com')
      })

      // Verificar que os dados são diferentes
      expect(screen.getByTestId('user-email')).not.toHaveTextContent('user1@example.com')
    })
  })
})
