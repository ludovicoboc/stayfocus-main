/**
 * Sistema de Autenticação Unificado - Exports
 * Centraliza todas as exportações relacionadas à autenticação
 */

// ============================================================================
// CONTEXTO E HOOKS PRINCIPAIS
// ============================================================================

export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useAuthActions,
  hasValidSession,
  clearStoredSession,
} from './context'

export type { AuthState, AuthContextType } from './context'

// ============================================================================
// PROTEÇÃO DE ROTAS
// ============================================================================

export {
  ProtectedRoute,
  AuthGuard,
  GuestOnly,
  useRouteProtection,
  withAuth,
  withGuest,
} from './ProtectedRoute'

// ============================================================================
// UTILITÁRIOS E HELPERS
// ============================================================================

/**
 * Verifica se o usuário tem permissão para acessar uma funcionalidade
 * (Placeholder para futuras implementações de roles/permissions)
 */
export function hasPermission(permission: string): boolean {
  // TODO: Implementar sistema de permissões
  console.warn('Sistema de permissões ainda não implementado')
  return true
}

/**
 * Obtém o token de autenticação atual
 */
export function getAuthToken(): string | null {
  try {
    const session = localStorage.getItem('auth_session')
    if (!session) return null

    const parsedSession = JSON.parse(session)
    return parsedSession.access_token || null
  } catch {
    return null
  }
}

/**
 * Verifica se o token está expirado
 */
export function isTokenExpired(): boolean {
  try {
    const session = localStorage.getItem('auth_session')
    if (!session) return true

    const parsedSession = JSON.parse(session)
    if (!parsedSession.expires_at) return true

    return Date.now() >= parsedSession.expires_at
  } catch {
    return true
  }
}

/**
 * Calcula o tempo restante até a expiração do token (em milissegundos)
 */
export function getTokenTimeToExpiry(): number {
  try {
    const session = localStorage.getItem('auth_session')
    if (!session) return 0

    const parsedSession = JSON.parse(session)
    if (!parsedSession.expires_at) return 0

    const timeLeft = parsedSession.expires_at - Date.now()
    return Math.max(0, timeLeft)
  } catch {
    return 0
  }
}

// ============================================================================
// CONFIGURAÇÕES DE AUTENTICAÇÃO
// ============================================================================

export const AUTH_CONFIG = {
  // Rotas que não requerem autenticação
  PUBLIC_ROUTES: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],

  // Rotas que redirecionam usuários autenticados
  GUEST_ONLY_ROUTES: [
    '/login',
    '/register',
  ],

  // Rota padrão após login
  DEFAULT_REDIRECT_AFTER_LOGIN: '/dashboard',

  // Rota padrão para usuários não autenticados
  DEFAULT_REDIRECT_FOR_GUESTS: '/login',

  // Tempo de renovação automática da sessão (em milissegundos)
  SESSION_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos

  // Tempo antes da expiração para mostrar aviso (em milissegundos)
  SESSION_WARNING_TIME: 2 * 60 * 1000, // 2 minutos
} as const

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export interface AuthError {
  code: string
  message: string
  details?: any
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

// ============================================================================
// VALIDADORES
// ============================================================================

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida força da senha
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida dados de login
 */
export function validateLoginCredentials(credentials: LoginCredentials): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!credentials.email) {
    errors.email = 'Email é obrigatório'
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'Email inválido'
  }

  if (!credentials.password) {
    errors.password = 'Senha é obrigatória'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

// Removido export default para evitar problemas de referência circular
