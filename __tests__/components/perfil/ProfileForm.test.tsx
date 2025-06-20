import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthProvider } from '@/app/lib/auth'
import { ProfileForm } from '@/app/components/perfil/ProfileForm'
import { createUser } from '../../factories'

// Mock do useProfile hook
const mockUseProfile = {
  profile: null,
  isLoading: false,
  error: null,
  createProfile: vi.fn(),
  updateProfile: vi.fn(),
  updateBasicInfo: vi.fn(),
  updatePreferences: vi.fn(),
  deleteProfile: vi.fn(),
  syncWithLocal: vi.fn(),
  refreshProfile: vi.fn(),
}

vi.mock('@/app/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile,
}))

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

describe('ProfileForm Component', () => {
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
    mockDataProvider.getCurrentUser.mockResolvedValue(null)
  })

  describe('Renderização', () => {
    it('deve renderizar formulário vazio quando não há perfil', () => {
      mockUseProfile.profile = null
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /criar perfil/i })).toBeInTheDocument()
    })

    it('deve renderizar formulário preenchido quando há perfil', () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
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

      mockUseProfile.profile = mockProfile
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()

      // Verificar timezone selecionado
      const timezoneSelect = screen.getByLabelText(/timezone/i) as HTMLSelectElement
      expect(timezoneSelect.value).toBe('America/Sao_Paulo')

      expect(screen.getByRole('button', { name: /atualizar perfil/i })).toBeInTheDocument()
    })

    it('deve mostrar loading quando carregando', () => {
      mockUseProfile.isLoading = true
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/carregando/i)).toBeInTheDocument()
    })

    it('deve mostrar erro quando há erro', () => {
      mockUseProfile.profile = null
      mockUseProfile.isLoading = false
      mockUseProfile.error = 'Erro ao carregar perfil'

      render(<ProfileForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/erro ao carregar perfil/i)).toBeInTheDocument()
    })
  })

  describe('Criação de perfil', () => {
    beforeEach(() => {
      mockUseProfile.profile = null
      mockUseProfile.isLoading = false
      mockUseProfile.error = null
    })

    it('deve criar perfil com dados válidos', async () => {
      const mockCreatedProfile = {
        id: 'profile-new',
        user_id: 'user-123',
        name: 'New User',
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

      mockUseProfile.createProfile.mockResolvedValue(mockCreatedProfile)
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const timezoneSelect = screen.getByLabelText(/timezone/i)
      const submitButton = screen.getByRole('button', { name: /criar perfil/i })

      await user.type(nameInput, 'New User')
      await user.selectOptions(timezoneSelect, 'America/Sao_Paulo')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUseProfile.createProfile).toHaveBeenCalledWith({
          name: 'New User',
          timezone: 'America/Sao_Paulo',
          preferences: expect.objectContaining({
            theme: 'light',
            language: 'pt-BR',
            notifications_enabled: true,
          }),
        })
      })
    })

    it('deve validar campos obrigatórios', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)

      // Simular digitação e depois apagar para acionar validação
      await user.type(nameInput, 'a')
      await user.clear(nameInput)

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
      })

      // Tentar submeter formulário com campo vazio
      const submitButton = screen.getByRole('button', { name: /criar perfil/i })
      await user.click(submitButton)

      expect(mockUseProfile.createProfile).not.toHaveBeenCalled()
    })

    it('deve mostrar erro de validação para nome muito curto', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const submitButton = screen.getByRole('button', { name: /criar perfil/i })

      await user.type(nameInput, 'A') // Nome muito curto
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument()
      })
    })
  })

  describe('Atualização de perfil', () => {
    beforeEach(() => {
      mockUseProfile.profile = {
        id: 'profile-123',
        user_id: 'user-123',
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
      mockUseProfile.isLoading = false
      mockUseProfile.error = null
    })

    it('deve atualizar nome do perfil', async () => {
      const updatedProfile = {
        ...mockUseProfile.profile!,
        name: 'Updated Name',
        updated_at: new Date().toISOString(),
      }

      mockUseProfile.updateBasicInfo.mockResolvedValue(updatedProfile)
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByDisplayValue('Test User')
      const submitButton = screen.getByRole('button', { name: /atualizar perfil/i })

      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUseProfile.updateBasicInfo).toHaveBeenCalledWith({
          name: 'Updated Name',
        })
      })
    })

    it('deve atualizar timezone', async () => {
      const updatedProfile = {
        ...mockUseProfile.profile!,
        timezone: 'America/New_York',
        updated_at: new Date().toISOString(),
      }

      mockUseProfile.updateProfile.mockResolvedValue(updatedProfile)
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      const timezoneSelect = screen.getByLabelText(/timezone/i)
      const submitButton = screen.getByRole('button', { name: /atualizar perfil/i })

      await user.selectOptions(timezoneSelect, 'America/New_York')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUseProfile.updateProfile).toHaveBeenCalledWith({
          name: 'Test User',
          timezone: 'America/New_York',
          preferences: expect.objectContaining({
            theme: 'light',
            language: 'pt-BR',
            notifications_enabled: true,
          }),
        })
      })
    })
  })

  describe('Preferências', () => {
    beforeEach(() => {
      mockUseProfile.profile = {
        id: 'profile-123',
        user_id: 'user-123',
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
    })

    it('deve atualizar tema', async () => {
      const updatedProfile = {
        ...mockUseProfile.profile!,
        preferences: {
          ...mockUseProfile.profile!.preferences,
          theme: 'dark' as const,
        },
        updated_at: new Date().toISOString(),
      }

      mockUseProfile.updatePreferences.mockResolvedValue(updatedProfile)
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      const themeSelect = screen.getByLabelText(/tema/i)
      await user.selectOptions(themeSelect, 'dark')

      await waitFor(() => {
        expect(mockUseProfile.updatePreferences).toHaveBeenCalledWith({
          theme: 'dark',
        })
      })
    })

    it('deve atualizar configurações de Pomodoro', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() })

      const focusInput = screen.getByLabelText(/minutos de foco/i)
      await user.clear(focusInput)
      await user.type(focusInput, '30')

      await waitFor(() => {
        expect(mockUseProfile.updatePreferences).toHaveBeenCalledWith({
          pomodoro_focus_minutes: 30,
        })
      })
    })

    it('deve validar valores de Pomodoro', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() })

      const focusInput = screen.getByLabelText(/minutos de foco/i)
      await user.clear(focusInput)
      await user.type(focusInput, '0') // Valor inválido

      await waitFor(() => {
        expect(screen.getByText(/deve ser maior que 0/i)).toBeInTheDocument()
      })
    })

    it('deve alternar notificações', async () => {
      render(<ProfileForm />, { wrapper: createWrapper() })

      const notificationsToggle = screen.getByLabelText(/notificações/i)
      await user.click(notificationsToggle)

      await waitFor(() => {
        expect(mockUseProfile.updatePreferences).toHaveBeenCalledWith({
          notifications_enabled: false,
        })
      })
    })
  })

  describe('Tratamento de erros', () => {
    it('deve mostrar erro quando criação falha', async () => {
      mockUseProfile.profile = null
      mockUseProfile.createProfile.mockRejectedValue(new Error('Erro de rede'))
      
      render(<ProfileForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByLabelText(/nome/i)
      const submitButton = screen.getByRole('button', { name: /criar perfil/i })

      await user.type(nameInput, 'Test User')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erro de rede/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro quando atualização falha', async () => {
      mockUseProfile.profile = {
        id: 'profile-123',
        user_id: 'user-123',
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

      // Mock para rejeitar a atualização
      mockUseProfile.updateProfile.mockRejectedValue(new Error('Erro de validação'))

      render(<ProfileForm />, { wrapper: createWrapper() })

      const nameInput = screen.getByDisplayValue('Test User')
      const submitButton = screen.getByRole('button', { name: /atualizar perfil/i })

      await user.clear(nameInput)
      await user.type(nameInput, 'New Name')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/erro de validação/i)).toBeInTheDocument()
      })
    })
  })
})
