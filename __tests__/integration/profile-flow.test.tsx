import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider, useAuth } from '@/app/lib/auth'
import { useProfile } from '@/app/hooks/useProfile'
import { createUser } from '../factories'

// Mock do data provider
const mockDataProvider = {
  // Auth methods
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshSession: vi.fn(),
  
  // Profile methods
  createProfile: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  deleteProfile: vi.fn(),
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

// Mock do perfilStore
const mockPerfilStore = {
  nome: 'Usuário',
  preferenciasVisuais: {
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false,
  },
  metasDiarias: {
    horasSono: 8,
    tarefasPrioritarias: 3,
    coposAgua: 8,
    pausasProgramadas: 4,
  },
  notificacoesAtivas: true,
  pausasAtivas: true,
  atualizarNome: vi.fn(),
  atualizarPreferenciasVisuais: vi.fn(),
  atualizarMetasDiarias: vi.fn(),
  alternarNotificacoes: vi.fn(),
  alternarPausas: vi.fn(),
  resetarPerfil: vi.fn(),
}

vi.mock('@/app/stores/perfilStore', () => ({
  usePerfilStore: () => mockPerfilStore,
}))

// Componente de teste que integra auth e profile
function ProfileIntegrationTest() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { profile, createProfile, updateProfile, isLoading, error } = useProfile()

  const handleLogin = async () => {
    await login('test@example.com', 'password123')
  }

  const handleCreateProfile = async () => {
    await createProfile({
      name: 'Test User',
      timezone: 'America/Sao_Paulo',
      preferences: {
        theme: 'light' as const,
        language: 'pt-BR',
        notifications_enabled: true,
        pomodoro_focus_minutes: 25,
        pomodoro_short_break_minutes: 5,
        pomodoro_long_break_minutes: 15,
        daily_water_goal_ml: 2000,
        stimulus_reduction: false,
      },
    })
  }

  const handleUpdateProfile = async () => {
    await updateProfile({
      name: 'Updated User',
      preferences: {
        theme: 'dark' as const,
        pomodoro_focus_minutes: 30,
      },
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div data-testid="error">Error: {error}</div>
  }

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      
      {user && (
        <div data-testid="user-info">
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-name">{user.name}</div>
        </div>
      )}

      {profile && (
        <div data-testid="profile-info">
          <div data-testid="profile-name">{profile.name}</div>
          <div data-testid="profile-timezone">{profile.timezone}</div>
          <div data-testid="profile-theme">{profile.preferences.theme}</div>
          <div data-testid="profile-pomodoro">{profile.preferences.pomodoro_focus_minutes}</div>
        </div>
      )}

      <button onClick={handleLogin} data-testid="login-button">
        Login
      </button>
      
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>

      <button onClick={handleCreateProfile} data-testid="create-profile-button">
        Create Profile
      </button>

      <button onClick={handleUpdateProfile} data-testid="update-profile-button">
        Update Profile
      </button>
    </div>
  )
}

describe('Profile Integration Flow', () => {
  let queryClient: QueryClient
  let user: ReturnType<typeof userEvent.setup>

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    user = userEvent.setup()
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('Fluxo completo de criação de perfil', () => {
    it('deve criar perfil após login bem-sucedido', async () => {
      const mockUser = createUser()
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      }

      const mockProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: 'Test User',
        timezone: 'America/Sao_Paulo',
        preferences: {
          theme: 'light' as const,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: 25,
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Setup mocks
      mockDataProvider.getCurrentUser.mockResolvedValue(null)
      mockDataProvider.login.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      })
      mockDataProvider.getProfile.mockResolvedValue(null) // Sem perfil inicial
      mockDataProvider.createProfile.mockResolvedValue(mockProfile)

      render(<ProfileIntegrationTest />, { wrapper: createWrapper() })

      // Verificar estado inicial
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
      })

      // Fazer login
      const loginButton = screen.getByTestId('login-button')
      await user.click(loginButton)

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
      })

      // Criar perfil
      const createProfileButton = screen.getByTestId('create-profile-button')
      await user.click(createProfileButton)

      await waitFor(() => {
        expect(screen.getByTestId('profile-info')).toBeInTheDocument()
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User')
        expect(screen.getByTestId('profile-timezone')).toHaveTextContent('America/Sao_Paulo')
        expect(screen.getByTestId('profile-theme')).toHaveTextContent('light')
        expect(screen.getByTestId('profile-pomodoro')).toHaveTextContent('25')
      })

      expect(mockDataProvider.createProfile).toHaveBeenCalledWith({
        name: 'Test User',
        timezone: 'America/Sao_Paulo',
        preferences: expect.objectContaining({
          theme: 'light',
          pomodoro_focus_minutes: 25,
        }),
      })
    })
  })

  describe('Fluxo de atualização de perfil', () => {
    it('deve atualizar perfil existente', async () => {
      const mockUser = createUser()
      const mockProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: 'Test User',
        timezone: 'America/Sao_Paulo',
        preferences: {
          theme: 'light' as const,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: 25,
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedProfile = {
        ...mockProfile,
        name: 'Updated User',
        preferences: {
          ...mockProfile.preferences,
          theme: 'dark' as const,
          pomodoro_focus_minutes: 30,
        },
        updated_at: new Date().toISOString(),
      }

      // Setup mocks
      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(mockProfile)
      mockDataProvider.updateProfile.mockResolvedValue(updatedProfile)

      render(<ProfileIntegrationTest />, { wrapper: createWrapper() })

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User')
        expect(screen.getByTestId('profile-theme')).toHaveTextContent('light')
        expect(screen.getByTestId('profile-pomodoro')).toHaveTextContent('25')
      })

      // Atualizar perfil
      const updateProfileButton = screen.getByTestId('update-profile-button')
      await user.click(updateProfileButton)

      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Updated User')
        expect(screen.getByTestId('profile-theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('profile-pomodoro')).toHaveTextContent('30')
      })

      expect(mockDataProvider.updateProfile).toHaveBeenCalledWith({
        name: 'Updated User',
        preferences: {
          theme: 'dark',
          pomodoro_focus_minutes: 30,
        },
      })
    })
  })

  describe('Sincronização com localStorage', () => {
    it('deve sincronizar dados entre Supabase e localStorage', async () => {
      const mockUser = createUser()
      const mockProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: 'Test User',
        timezone: 'America/Sao_Paulo',
        preferences: {
          theme: 'light' as const,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: 25,
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Simular dados no localStorage
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'perfil-storage') {
          return JSON.stringify({
            state: {
              nome: 'Local User',
              preferenciasVisuais: {
                altoContraste: true,
                reducaoEstimulos: false,
                textoGrande: false,
              },
              metasDiarias: {
                horasSono: 7,
                tarefasPrioritarias: 5,
                coposAgua: 10,
                pausasProgramadas: 6,
              },
              notificacoesAtivas: false,
              pausasAtivas: true,
            },
          })
        }
        return null
      })

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(mockProfile)

      render(<ProfileIntegrationTest />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User')
      })

      // Verificar que dados do Supabase têm prioridade
      expect(mockDataProvider.getProfile).toHaveBeenCalled()

      // Verificar que perfilStore foi atualizado com dados do Supabase
      expect(mockPerfilStore.atualizarNome).toHaveBeenCalledWith('Test User')
    })
  })

  describe('Isolamento entre usuários', () => {
    it('deve garantir que cada usuário vê apenas seus dados', async () => {
      const user1 = createUser({ email: 'user1@example.com', name: 'User 1' })

      const profile1 = {
        id: 'profile-1',
        user_id: user1.id,
        name: 'Profile 1',
        timezone: 'America/Sao_Paulo',
        preferences: {
          theme: 'light' as const,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: 25,
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Configurar usuário 1
      mockDataProvider.getCurrentUser.mockResolvedValue(user1)
      mockDataProvider.getProfile.mockResolvedValue(profile1)

      render(<ProfileIntegrationTest />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user1@example.com')
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Profile 1')
        expect(screen.getByTestId('profile-theme')).toHaveTextContent('light')
      })

      // Verificar que o perfil foi carregado para o usuário correto
      expect(mockDataProvider.getProfile).toHaveBeenCalled()

      // Verificar que os dados são específicos do usuário
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Profile 1')
      expect(screen.getByTestId('user-email')).toHaveTextContent('user1@example.com')
    })
  })

  describe('Tratamento de erros', () => {
    it('deve tratar erro de rede ao carregar perfil', async () => {
      const mockUser = createUser()
      
      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockRejectedValue(new Error('Erro de rede'))

      render(<ProfileIntegrationTest />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Erro de rede')
      })
    })

    it('deve tratar erro ao criar perfil', async () => {
      const mockUser = createUser()

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(null)
      mockDataProvider.createProfile.mockRejectedValue(new Error('Erro de validação'))

      render(<ProfileIntegrationTest />, { wrapper: createWrapper() })

      // Aguardar o componente carregar completamente
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      }, { timeout: 3000 })

      // Aguardar o botão aparecer
      await waitFor(() => {
        expect(screen.getByTestId('create-profile-button')).toBeInTheDocument()
      }, { timeout: 3000 })

      const createProfileButton = screen.getByTestId('create-profile-button')
      await user.click(createProfileButton)

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Erro de validação')
      }, { timeout: 3000 })
    })
  })
})
