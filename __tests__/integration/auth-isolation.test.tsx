import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider, useAuth } from '@/app/lib/auth'

// Mock do localStorage
const createMockStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
}

// Componente de teste para verificar estado de autenticação
function AuthTestComponent() {
  const { user, isAuthenticated, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `User: ${user.email}` : 'No user'}
      </div>
    </div>
  )
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Isolamento de Dados de Autenticação', () => {
  let mockStorage: ReturnType<typeof createMockStorage>

  beforeEach(() => {
    mockStorage = createMockStorage()
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    })
    vi.clearAllMocks()
  })

  describe('Isolamento de Sessões', () => {
    it('deve iniciar sem usuário autenticado', async () => {
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })
    })

    it('deve manter sessões isoladas entre diferentes usuários', async () => {
      // Simular sessão do usuário 1
      const user1Session = {
        user: { id: '1', email: 'user1@test.com', name: 'User 1' },
        token: 'token1',
        expiresAt: Date.now() + 3600000,
      }

      mockStorage.setItem('auth_session', JSON.stringify(user1Session))

      const { rerender } = render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: user1@test.com')
      })

      // Simular logout e login de usuário 2
      mockStorage.clear()
      const user2Session = {
        user: { id: '2', email: 'user2@test.com', name: 'User 2' },
        token: 'token2',
        expiresAt: Date.now() + 3600000,
      }
      mockStorage.setItem('auth_session', JSON.stringify(user2Session))

      // Re-renderizar para simular nova sessão
      rerender(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: user2@test.com')
      })

      // Verificar que não há vazamento de dados entre sessões
      expect(mockStorage.getItem).toHaveBeenCalledWith('auth_session')
      expect(screen.queryByText('user1@test.com')).not.toBeInTheDocument()
    })

    it('deve limpar dados ao fazer logout', async () => {
      // Configurar sessão inicial
      const userSession = {
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
      }

      mockStorage.setItem('auth_session', JSON.stringify(userSession))

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Simular logout limpando localStorage
      mockStorage.clear()

      // Re-renderizar para simular mudança de estado
      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })
    })

    it('deve rejeitar sessões expiradas', async () => {
      // Configurar sessão expirada
      const expiredSession = {
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        token: 'expired-token',
        expiresAt: Date.now() - 1000, // Expirada há 1 segundo
      }

      mockStorage.setItem('auth_session', JSON.stringify(expiredSession))

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })

      // Verificar que a sessão expirada foi removida
      expect(mockStorage.removeItem).toHaveBeenCalledWith('auth_session')
    })

    it('deve validar formato de dados de sessão', async () => {
      // Configurar dados inválidos
      mockStorage.setItem('auth_session', 'invalid-json')

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      })

      // Verificar que dados inválidos foram removidos
      expect(mockStorage.removeItem).toHaveBeenCalledWith('auth_session')
    })
  })

  describe('Segurança de Dados', () => {
    it('não deve expor tokens ou dados sensíveis no DOM', async () => {
      const userSession = {
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        token: 'secret-token-123',
        expiresAt: Date.now() + 3600000,
      }

      mockStorage.setItem('auth_session', JSON.stringify(userSession))

      const { container } = render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Verificar que o token não aparece no DOM
      expect(container.innerHTML).not.toContain('secret-token-123')
      expect(container.innerHTML).not.toContain('token')
    })

    it('deve manter dados de usuário isolados por ID', async () => {
      const user1Session = {
        user: { id: '1', email: 'user1@test.com', name: 'User 1' },
        token: 'token1',
        expiresAt: Date.now() + 3600000,
      }

      mockStorage.setItem('auth_session', JSON.stringify(user1Session))

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('User: user1@test.com')
      })

      // Verificar que apenas dados do usuário correto são exibidos
      expect(screen.queryByText('user2@test.com')).not.toBeInTheDocument()
      expect(screen.queryByText('User 2')).not.toBeInTheDocument()
    })
  })
})
