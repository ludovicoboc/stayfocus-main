import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { SupabaseProvider } from '@/app/lib/dataProviders/supabase'

// Teste de integração com dados reais no Supabase
// ATENÇÃO: Este teste usa o banco de dados real e deve ser executado com cuidado

describe('Profile Integration with Real Data', () => {
  let dataProvider: SupabaseProvider
  let testUserId: string
  let createdProfileId: string

  beforeAll(async () => {
    // Verificar se estamos em ambiente de teste
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Testes de integração devem ser executados apenas em ambiente de teste')
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    dataProvider = new SupabaseProvider()
    
    // Usar um ID de usuário de teste fixo
    testUserId = 'test-user-' + Date.now()
    
    // Mock do getCurrentUserId para retornar nosso usuário de teste
    // @ts-ignore
    dataProvider.getCurrentUserId = () => testUserId
  })

  afterAll(async () => {
    // Limpar dados de teste criados
    if (createdProfileId) {
      try {
        await dataProvider.deleteProfile()
      } catch (error) {
        console.warn('Erro ao limpar dados de teste:', error)
      }
    }
  })

  beforeEach(() => {
    // Reset para cada teste
    createdProfileId = ''
  })

  describe('CRUD Operations with Real Database', () => {
    it('deve criar perfil no banco real', async () => {
      const profileData = {
        name: 'Test User Real',
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

      const createdProfile = await dataProvider.createProfile(profileData)

      expect(createdProfile).toBeDefined()
      expect(createdProfile.id).toBeDefined()
      expect(createdProfile.user_id).toBe(testUserId)
      expect(createdProfile.name).toBe(profileData.name)
      expect(createdProfile.timezone).toBe(profileData.timezone)
      expect(createdProfile.preferences).toEqual(profileData.preferences)
      expect(createdProfile.created_at).toBeDefined()
      expect(createdProfile.updated_at).toBeDefined()

      createdProfileId = createdProfile.id
    })

    it('deve buscar perfil criado', async () => {
      // Primeiro criar um perfil
      const profileData = {
        name: 'Test User for Get',
        timezone: 'America/New_York',
        preferences: {
          theme: 'dark' as const,
          language: 'en-US',
          notifications_enabled: false,
          pomodoro_focus_minutes: 30,
          pomodoro_short_break_minutes: 10,
          pomodoro_long_break_minutes: 20,
          daily_water_goal_ml: 3000,
          stimulus_reduction: true,
        },
      }

      const createdProfile = await dataProvider.createProfile(profileData)
      createdProfileId = createdProfile.id

      // Buscar o perfil
      const fetchedProfile = await dataProvider.getProfile()

      expect(fetchedProfile).toBeDefined()
      expect(fetchedProfile!.id).toBe(createdProfile.id)
      expect(fetchedProfile!.name).toBe(profileData.name)
      expect(fetchedProfile!.preferences.theme).toBe('dark')
    })

    it('deve atualizar perfil existente', async () => {
      // Criar perfil inicial
      const initialData = {
        name: 'Initial Name',
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

      const createdProfile = await dataProvider.createProfile(initialData)
      createdProfileId = createdProfile.id

      // Atualizar dados
      const updateData = {
        name: 'Updated Name',
        preferences: {
          theme: 'dark' as const,
          pomodoro_focus_minutes: 30,
        },
      }

      const updatedProfile = await dataProvider.updateProfile(updateData)

      expect(updatedProfile.name).toBe('Updated Name')
      expect(updatedProfile.preferences.theme).toBe('dark')
      expect(updatedProfile.preferences.pomodoro_focus_minutes).toBe(30)
      // Verificar que outros campos não foram alterados
      expect(updatedProfile.preferences.language).toBe('pt-BR')
      expect(updatedProfile.timezone).toBe('America/Sao_Paulo')
    })

    it('deve deletar perfil', async () => {
      // Criar perfil para deletar
      const profileData = {
        name: 'Profile to Delete',
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

      const createdProfile = await dataProvider.createProfile(profileData)
      createdProfileId = createdProfile.id

      // Verificar que existe
      const fetchedProfile = await dataProvider.getProfile()
      expect(fetchedProfile).toBeDefined()

      // Deletar
      await dataProvider.deleteProfile()

      // Verificar que foi deletado
      const deletedProfile = await dataProvider.getProfile()
      expect(deletedProfile).toBe(null)

      createdProfileId = '' // Já foi deletado
    })
  })

  describe('Validações com Banco Real', () => {
    it('deve rejeitar dados inválidos', async () => {
      const invalidData = {
        name: '', // Nome vazio
        timezone: 'Invalid/Timezone',
        preferences: {
          theme: 'invalid' as any,
          language: 'pt-BR',
          notifications_enabled: true,
          pomodoro_focus_minutes: -1, // Valor inválido
          pomodoro_short_break_minutes: 5,
          pomodoro_long_break_minutes: 15,
          daily_water_goal_ml: 2000,
          stimulus_reduction: false,
        },
      }

      await expect(dataProvider.createProfile(invalidData)).rejects.toThrow()
    })

    it('deve validar timezone', async () => {
      const invalidTimezoneData = {
        name: 'Test User',
        timezone: 'Invalid/Timezone',
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

      await expect(dataProvider.createProfile(invalidTimezoneData)).rejects.toThrow('Timezone inválido')
    })
  })

  describe('Isolamento de Dados', () => {
    it('deve isolar dados entre usuários diferentes', async () => {
      // Criar perfil para usuário 1
      const user1Id = 'test-user-1-' + Date.now()
      // @ts-ignore
      dataProvider.getCurrentUserId = () => user1Id

      const profile1Data = {
        name: 'User 1',
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

      const createdProfile1 = await dataProvider.createProfile(profile1Data)

      // Trocar para usuário 2
      const user2Id = 'test-user-2-' + Date.now()
      // @ts-ignore
      dataProvider.getCurrentUserId = () => user2Id

      // Verificar que usuário 2 não vê perfil do usuário 1
      const profile2 = await dataProvider.getProfile()
      expect(profile2).toBe(null)

      // Criar perfil para usuário 2
      const profile2Data = {
        name: 'User 2',
        timezone: 'America/New_York',
        preferences: {
          theme: 'dark' as const,
          language: 'en-US',
          notifications_enabled: false,
          pomodoro_focus_minutes: 30,
          pomodoro_short_break_minutes: 10,
          pomodoro_long_break_minutes: 20,
          daily_water_goal_ml: 3000,
          stimulus_reduction: true,
        },
      }

      const createdProfile2 = await dataProvider.createProfile(profile2Data)

      // Verificar que cada usuário vê apenas seu perfil
      expect(createdProfile1.user_id).toBe(user1Id)
      expect(createdProfile2.user_id).toBe(user2Id)
      expect(createdProfile1.name).toBe('User 1')
      expect(createdProfile2.name).toBe('User 2')

      // Limpar dados de teste
      // @ts-ignore
      dataProvider.getCurrentUserId = () => user1Id
      await dataProvider.deleteProfile()
      
      // @ts-ignore
      dataProvider.getCurrentUserId = () => user2Id
      await dataProvider.deleteProfile()

      // Voltar ao usuário de teste original
      // @ts-ignore
      dataProvider.getCurrentUserId = () => testUserId
    })
  })
})
