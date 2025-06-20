import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SupabaseProvider } from '@/app/lib/dataProviders/supabase'
import { createUser } from '../factories'

// Mock do Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}

vi.mock('@/app/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  default: mockSupabaseClient,
}))

// Mock do createBrowserClient
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockSupabaseClient),
}))

// Definir variáveis de ambiente para o teste
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

describe('Profile API', () => {
  let dataProvider: SupabaseProvider
  let mockUser: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = createUser()

    // Mock auth user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id, email: mockUser.email } },
      error: null,
    })

    // Mock getCurrentUserId para retornar o ID do usuário mockado
    dataProvider = new SupabaseProvider()
    // @ts-ignore - Acessar método privado para teste
    dataProvider.getCurrentUserId = vi.fn().mockReturnValue(mockUser.id)
  })

  describe('createProfile', () => {
    it('deve criar perfil com dados válidos', async () => {
      const profileData = {
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
      }

      const mockCreatedProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCreatedProfile,
          error: null,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await dataProvider.createProfile(profileData)

      expect(result).toEqual(mockCreatedProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        ...profileData,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })

    it('deve rejeitar dados inválidos', async () => {
      const invalidData = {
        name: '', // Nome vazio
        timezone: 'Invalid/Timezone',
        preferences: {
          theme: 'invalid' as any,
          language: '',
          notifications_enabled: 'not-boolean' as any,
          pomodoro_focus_minutes: -1, // Valor inválido
          pomodoro_short_break_minutes: 0,
          pomodoro_long_break_minutes: 0,
          daily_water_goal_ml: -100,
          stimulus_reduction: 'not-boolean' as any,
        },
      }

      await expect(dataProvider.createProfile(invalidData)).rejects.toThrow()
    })

    it('deve tratar erro do Supabase', async () => {
      const profileData = {
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
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await expect(dataProvider.createProfile(profileData)).rejects.toThrow('Database error')
    })
  })

  describe('getProfile', () => {
    it('deve buscar perfil do usuário autenticado', async () => {
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

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await dataProvider.getProfile()

      expect(result).toEqual(mockProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUser.id)
    })

    it('deve retornar null quando perfil não existe', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await dataProvider.getProfile()

      expect(result).toBe(null)
    })

    it('deve tratar erro de usuário não autenticado', async () => {
      // Mock getCurrentUserId para lançar erro
      // @ts-ignore
      dataProvider.getCurrentUserId = vi.fn().mockImplementation(() => {
        throw new Error('Usuário não autenticado')
      })

      await expect(dataProvider.getProfile()).rejects.toThrow('Usuário não autenticado')
    })
  })

  describe('updateProfile', () => {
    it('deve atualizar dados básicos do perfil', async () => {
      const updateData = {
        name: 'Updated Name',
        timezone: 'America/New_York',
      }

      const mockUpdatedProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: 'Updated Name',
        timezone: 'America/New_York',
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

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUpdatedProfile,
          error: null,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await dataProvider.updateProfile(updateData)

      expect(result).toEqual(mockUpdatedProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.update).toHaveBeenCalledWith({
        ...updateData,
        updated_at: expect.any(String),
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUser.id)
    })

    it('deve atualizar preferências parciais', async () => {
      const updateData = {
        preferences: {
          theme: 'dark' as const,
          pomodoro_focus_minutes: 30,
        },
      }

      const mockUpdatedProfile = {
        id: 'profile-123',
        user_id: mockUser.id,
        name: 'Test User',
        timezone: 'America/Sao_Paulo',
        preferences: {
          theme: 'dark' as const,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: 30,
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUpdatedProfile,
          error: null,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const result = await dataProvider.updateProfile(updateData)

      expect(result).toEqual(mockUpdatedProfile)
      expect(mockQuery.update).toHaveBeenCalledWith({
        preferences: updateData.preferences,
        updated_at: expect.any(String),
      })
    })

    it('deve validar dados antes de atualizar', async () => {
      const invalidData = {
        name: '', // Nome vazio
        preferences: {
          pomodoro_focus_minutes: -1, // Valor inválido
        },
      }

      await expect(dataProvider.updateProfile(invalidData)).rejects.toThrow()
    })
  })

  describe('deleteProfile', () => {
    it('deve deletar perfil do usuário autenticado', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await dataProvider.deleteProfile()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUser.id)
    })

    it('deve tratar erro ao deletar perfil inexistente', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await expect(dataProvider.deleteProfile()).rejects.toThrow('Profile not found')
    })
  })

  describe('Validações', () => {
    it('deve validar nome obrigatório', () => {
      const invalidData = { name: '' }
      expect(() => dataProvider.validateProfileData(invalidData)).toThrow('Nome é obrigatório')
    })

    it('deve validar timezone válido', () => {
      const invalidData = { timezone: 'Invalid/Timezone' }
      expect(() => dataProvider.validateProfileData(invalidData)).toThrow('Timezone inválido')
    })

    it('deve validar preferências de Pomodoro', () => {
      const invalidData = {
        preferences: {
          pomodoro_focus_minutes: 0,
          pomodoro_short_break_minutes: -1,
          pomodoro_long_break_minutes: 200,
        },
      }
      expect(() => dataProvider.validateProfileData(invalidData)).toThrow()
    })

    it('deve validar meta de água', () => {
      const invalidData = {
        preferences: {
          daily_water_goal_ml: -100,
        },
      }
      expect(() => dataProvider.validateProfileData(invalidData)).toThrow('Meta de água deve ser positiva')
    })

    it('deve aceitar dados válidos', () => {
      const validData = {
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
      }
      expect(() => dataProvider.validateProfileData(validData)).not.toThrow()
    })
  })
})
