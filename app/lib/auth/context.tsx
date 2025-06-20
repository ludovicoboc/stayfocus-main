/**
 * Contexto de Autenticação Unificado
 * Funciona com qualquer DataProvider (Supabase ou FastAPI)
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getDataProvider } from '../dataProviders'
import type { User, AuthResponse } from '../dataProviders/types'
import { useSafeLocalStorage } from '@/app/hooks/useIsClient'

// ============================================================================
// TIPOS
// ============================================================================

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (data: { email: string; password: string; name?: string }) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// ============================================================================
// CONTEXTO
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  })

  const safeLocalStorage = useSafeLocalStorage()

  const dataProvider = getDataProvider()

  // ========================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ========================================

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await dataProvider.login(email, password)

      if (response.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Erro no login',
          user: null,
          isAuthenticated: false,
        }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          user: response.user,
          isAuthenticated: !!response.user,
        }))

        // Salvar sessão no localStorage para persistência
        if (response.session && safeLocalStorage) {
          safeLocalStorage.setItem('auth_session', JSON.stringify(response.session))
        }
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        user: null,
        isAuthenticated: false,
      }))

      return {
        user: null,
        session: null,
        error: errorMessage,
      }
    }
  }, [dataProvider])

  const register = useCallback(async (data: { email: string; password: string; name?: string }): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await dataProvider.register(data)

      if (response.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error!,
        }))
        return response
      }

      if (response.user && response.session) {
        // Salvar sessão no localStorage
        if (safeLocalStorage) {
          safeLocalStorage.setItem('auth_session', JSON.stringify(response.session))
        }

        setState(prev => ({
          ...prev,
          user: response.user!,
          loading: false,
          error: null,
          isAuthenticated: true,
        }))
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no registro'

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))

      return {
        user: null,
        session: null,
        error: errorMessage,
      }
    }
  }, [dataProvider])

  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      await dataProvider.logout()
      
      // Limpar sessão do localStorage
      if (safeLocalStorage) {
        safeLocalStorage.removeItem('auth_session')
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        user: null,
        isAuthenticated: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [dataProvider])

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const response = await dataProvider.refreshSession()

      if (response.error) {
        // Sessão inválida, fazer logout
        await logout()
      } else if (response.user) {
        setState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          error: null,
        }))

        // Atualizar sessão no localStorage
        if (response.session && safeLocalStorage) {
          safeLocalStorage.setItem('auth_session', JSON.stringify(response.session))
        }
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error)
      await logout()
    }
  }, [dataProvider, logout])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // ========================================
  // INICIALIZAÇÃO E VERIFICAÇÃO DE SESSÃO
  // ========================================

  const initializeAuth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      // Verificar se há uma sessão salva (apenas no cliente)
      if (safeLocalStorage) {
        const savedSession = safeLocalStorage.getItem('auth_session')

        if (savedSession) {
          try {
            const session = JSON.parse(savedSession)

            // Verificar se a sessão não expirou
            if (session.expires_at && Date.now() < session.expires_at) {
              // Tentar renovar a sessão
              await refreshSession()
              return
            } else {
              // Sessão expirada, remover
              safeLocalStorage.removeItem('auth_session')
            }
          } catch (error) {
            console.warn('Erro ao parsear sessão salva:', error)
            safeLocalStorage.removeItem('auth_session')
          }
        }
      }

      // Verificar usuário atual no provider
      const currentUser = await dataProvider.getCurrentUser()
      
      setState(prev => ({
        ...prev,
        loading: false,
        user: currentUser,
        isAuthenticated: !!currentUser,
        error: null,
      }))
    } catch (error) {
      console.error('Erro na inicialização da autenticação:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        user: null,
        isAuthenticated: false,
        error: null, // Não mostrar erro na inicialização
      }))
    }
  }, [dataProvider, refreshSession])

  // ========================================
  // EFEITOS
  // ========================================

  // Inicializar autenticação quando o componente montar
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Verificar sessão periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(() => {
      refreshSession()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [state.isAuthenticated, refreshSession])

  // Escutar mudanças no localStorage (para sincronizar entre abas)
  useEffect(() => {
    if (!safeLocalStorage) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session') {
        if (e.newValue === null) {
          // Sessão removida em outra aba
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
          }))
        } else if (e.newValue && !state.isAuthenticated) {
          // Nova sessão criada em outra aba
          initializeAuth()
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [state.isAuthenticated, initializeAuth, safeLocalStorage])

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshSession,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

// ============================================================================
// HOOKS AUXILIARES
// ============================================================================

/**
 * Hook para verificar se o usuário está autenticado
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook para obter apenas o usuário atual
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth()
  return user
}

/**
 * Hook para verificar se está carregando
 */
export function useAuthLoading(): boolean {
  const { loading } = useAuth()
  return loading
}

/**
 * Hook para obter apenas as funções de autenticação
 */
export function useAuthActions() {
  const { login, logout, refreshSession, clearError } = useAuth()
  return { login, logout, refreshSession, clearError }
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica se há uma sessão válida no localStorage
 */
export function hasValidSession(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }

    const savedSession = localStorage.getItem('auth_session')
    if (!savedSession) return false

    const session = JSON.parse(savedSession)
    return session.expires_at && Date.now() < session.expires_at
  } catch {
    return false
  }
}

/**
 * Remove a sessão do localStorage
 */
export function clearStoredSession(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('auth_session')
  }
}
