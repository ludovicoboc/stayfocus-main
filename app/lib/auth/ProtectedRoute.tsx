/**
 * Componente de Proteção de Rotas
 * Redireciona usuários não autenticados para a página de login
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context'

// ============================================================================
// TIPOS
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
  requireAuth?: boolean
}

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente que protege rotas exigindo autenticação
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return fallback || <DefaultLoadingFallback />
  }

  // Se requer autenticação mas usuário não está autenticado
  if (requireAuth && !isAuthenticated) {
    // Redirecionar para página de login
    router.push(redirectTo)
    return fallback || <DefaultRedirectFallback />
  }

  // Se não requer autenticação mas usuário está autenticado
  if (!requireAuth && isAuthenticated) {
    // Redirecionar para dashboard ou página principal
    router.push('/dashboard')
    return fallback || <DefaultRedirectFallback />
  }

  return <>{children}</>
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Guard simples que apenas esconde/mostra conteúdo baseado na autenticação
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return fallback || <DefaultLoadingFallback />
  }

  if (!isAuthenticated) {
    return fallback || <DefaultUnauthenticatedFallback />
  }

  return <>{children}</>
}

/**
 * Componente que só mostra conteúdo para usuários NÃO autenticados
 */
export function GuestOnly({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return fallback || <DefaultLoadingFallback />
  }

  if (isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}

// ============================================================================
// FALLBACKS PADRÃO
// ============================================================================

function DefaultLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando autenticação...</p>
      </div>
    </div>
  )
}

function DefaultRedirectFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Redirecionando...</p>
      </div>
    </div>
  )
}

function DefaultUnauthenticatedFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 mb-6">
          Você precisa estar logado para acessar esta página.
        </p>
        <a
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Fazer Login
        </a>
      </div>
    </div>
  )
}

// ============================================================================
// HOOKS UTILITÁRIOS
// ============================================================================

/**
 * Hook para proteção de rotas programática
 */
export function useRouteProtection() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const requireAuth = React.useCallback((redirectTo = '/login') => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
      return false
    }
    return true
  }, [isAuthenticated, loading, router])

  const requireGuest = React.useCallback((redirectTo = '/dashboard') => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo)
      return false
    }
    return true
  }, [isAuthenticated, loading, router])

  return {
    requireAuth,
    requireGuest,
    isAuthenticated,
    loading,
  }
}

// ============================================================================
// HOC (Higher-Order Component)
// ============================================================================

/**
 * HOC para proteger componentes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string
    fallback?: React.ReactNode
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute
        redirectTo={options.redirectTo}
        fallback={options.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * HOC para componentes que só devem ser visíveis para guests
 */
export function withGuest<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string
    fallback?: React.ReactNode
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute
        requireAuth={false}
        redirectTo={options.redirectTo}
        fallback={options.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }

  WrappedComponent.displayName = `withGuest(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ProtectedRoute
