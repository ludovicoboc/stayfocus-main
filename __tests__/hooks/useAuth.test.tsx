import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider, useAuth, useIsAuthenticated, useCurrentUser, useAuthLoading } from '@/app/lib/auth'
import { createMockSupabaseClient } from '../utils/test-utils'

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

// Wrapper para testes com providers
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

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Inicialização', () => {
    it('deve inicializar com estado de loading', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('deve verificar usuário atual na inicialização', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(mockDataProvider.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('deve restaurar sessão do localStorage se válida', async () => {
      const mockSession = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000, // 1 hora no futuro
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSession))
      mockDataProvider.refreshSession.mockResolvedValue({
        user: mockSession.user,
        session: mockSession,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockDataProvider.refreshSession).toHaveBeenCalledTimes(1)
    })

    it('deve remover sessão expirada do localStorage', async () => {
      const expiredSession = {
        access_token: 'expired-token',
        expires_at: Date.now() - 3600000, // 1 hora no passado
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session')
      expect(mockDataProvider.getCurrentUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('Login', () => {
    it('deve fazer login com credenciais válidas', async () => {
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123')
      })

      expect(loginResult.user).toEqual(mockUser)
      expect(loginResult.session).toEqual(mockSession)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBe(null)
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrong-password')
      })

      expect(loginResult.error).toBe('Credenciais inválidas')
      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Credenciais inválidas')
    })

    it('deve lidar com exceção durante login', async () => {
      mockDataProvider.login.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123')
      })

      expect(loginResult.error).toBe('Network error')
      expect(result.current.error).toBe('Network error')
    })
  })

  describe('Logout', () => {
    it('deve fazer logout com sucesso', async () => {
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

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session')
      expect(mockDataProvider.logout).toHaveBeenCalledTimes(1)
    })

    it('deve lidar com erro durante logout', async () => {
      mockDataProvider.logout.mockRejectedValue(new Error('Logout failed'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.error).toBe('Logout failed')
    })
  })

  describe('Refresh Session', () => {
    it('deve renovar sessão com sucesso', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      }

      mockDataProvider.refreshSession.mockResolvedValue({
        user: mockUser,
        session: newSession,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshSession()
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_session',
        JSON.stringify(newSession)
      )
    })

    it('deve fazer logout se refresh falhar', async () => {
      mockDataProvider.refreshSession.mockResolvedValue({
        user: null,
        session: null,
        error: 'Invalid refresh token',
      })
      mockDataProvider.logout.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshSession()
      })

      expect(result.current.user).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockDataProvider.logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Clear Error', () => {
    it('deve limpar erro', async () => {
      mockDataProvider.login.mockResolvedValue({
        user: null,
        session: null,
        error: 'Test error',
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com', 'wrong-password')
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })
})

describe('Hooks auxiliares de autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  it('useIsAuthenticated deve retornar status de autenticação', async () => {
    const { result } = renderHook(() => useIsAuthenticated(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBe(false)
    })
  })

  it('useCurrentUser deve retornar usuário atual', async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current).toBe(null)
    })
  })

  it('useAuthLoading deve retornar status de loading', () => {
    const { result } = renderHook(() => useAuthLoading(), {
      wrapper: createWrapper(),
    })

    expect(result.current).toBe(true)
  })
})
