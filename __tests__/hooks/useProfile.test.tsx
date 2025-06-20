import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider } from '@/app/lib/auth'
import { useProfile } from '@/app/hooks/useProfile'
import { createUser } from '../factories'

// Mock do data provider
const mockDataProvider = {
  // Auth methods
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshSession: vi.fn(),
  
  // Profile methods (que vamos implementar)
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
  nome: 'Test User',
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

describe('useProfile Hook', () => {
  let queryClient: QueryClient

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
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('Estado inicial', () => {
    it('deve inicializar com estado padrão', async () => {
      mockDataProvider.getCurrentUser.mockResolvedValue(null)
      
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      expect(result.current.profile).toBe(null)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('deve carregar perfil quando usuário está autenticado', async () => {
      const mockUser = createUser()
      const mockProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: mockUser.name,
        avatar_url: mockUser.avatar_url,
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

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(mockProfile)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile)
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Criar perfil', () => {
    it('deve criar perfil com dados válidos', async () => {
      const mockUser = createUser()
      const createData = {
        name: 'New User',
        timezone: 'America/Sao_Paulo',
        preferences: {
          theme: 'dark' as const,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: 25,
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
      }

      const mockCreatedProfile = {
        id: 'profile-new',
        user_id: mockUser.id,
        ...createData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(null) // Sem perfil inicial
      mockDataProvider.createProfile.mockResolvedValue(mockCreatedProfile)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let createdProfile: any
      await act(async () => {
        createdProfile = await result.current.createProfile(createData)
      })

      expect(createdProfile).toEqual(mockCreatedProfile)
      expect(mockDataProvider.createProfile).toHaveBeenCalledWith(createData)
      
      await waitFor(() => {
        expect(result.current.profile).toEqual(mockCreatedProfile)
      })
    })

    it('deve rejeitar criação com dados inválidos', async () => {
      const mockUser = createUser()
      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(null)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Dados inválidos - nome vazio
      const invalidData = {
        name: '',
        timezone: 'America/Sao_Paulo',
        preferences: {},
      }

      await act(async () => {
        try {
          await result.current.createProfile(invalidData as any)
          expect.fail('Deveria ter rejeitado dados inválidos')
        } catch (error) {
          expect(error).toBeDefined()
        }
      })
    })
  })

  describe('Atualizar perfil', () => {
    it('deve atualizar informações básicas', async () => {
      const mockUser = createUser()
      const mockProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: 'Old Name',
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
        name: 'New Name',
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(mockProfile)
      mockDataProvider.updateProfile.mockResolvedValue(updatedProfile)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile)
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updateBasicInfo({ name: 'New Name' })
      })

      expect(updated).toEqual(updatedProfile)
      expect(mockDataProvider.updateProfile).toHaveBeenCalledWith({
        name: 'New Name',
      })

      await waitFor(() => {
        expect(result.current.profile).toEqual(updatedProfile)
      })
    })

    it('deve atualizar preferências', async () => {
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

      const newPreferences = {
        theme: 'dark' as const,
        pomodoro_focus_minutes: 30,
        stimulus_reduction: true,
      }

      const updatedProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          ...newPreferences,
        },
        updated_at: new Date().toISOString(),
      }

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(mockProfile)
      mockDataProvider.updateProfile.mockResolvedValue(updatedProfile)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile)
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updatePreferences(newPreferences)
      })

      expect(updated).toEqual(updatedProfile)
      expect(mockDataProvider.updateProfile).toHaveBeenCalledWith({
        preferences: newPreferences,
      })
    })
  })

  describe('Deletar perfil', () => {
    it('deve deletar perfil com sucesso', async () => {
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

      mockDataProvider.getCurrentUser.mockResolvedValue(mockUser)
      mockDataProvider.getProfile.mockResolvedValue(mockProfile)
      mockDataProvider.deleteProfile.mockResolvedValue(undefined)

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile)
      })

      await act(async () => {
        await result.current.deleteProfile()
      })

      expect(mockDataProvider.deleteProfile).toHaveBeenCalled()
      
      await waitFor(() => {
        expect(result.current.profile).toBe(null)
      })
    })
  })
})
