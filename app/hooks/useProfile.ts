import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/lib/auth'
import { getDataProvider } from '@/app/lib/dataProviders'
import { usePerfilStore } from '@/app/stores/perfilStore'
import { UserProfile, UserPreferences } from '@/app/lib/dataProviders/types'

export interface CreateProfileData {
  name: string
  timezone: string
  preferences: UserPreferences
}

export interface DailyGoals {
  horasSono: number
  tarefasPrioritarias: number
  coposAgua: number
  pausasProgramadas: number
}

export interface UseProfileReturn {
  // Estado
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  
  // Operações CRUD
  createProfile: (data: CreateProfileData) => Promise<UserProfile>
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>
  deleteProfile: () => Promise<void>
  
  // Operações específicas
  updateBasicInfo: (data: { name: string }) => Promise<UserProfile>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserProfile>
  updateDailyGoals: (goals: DailyGoals) => Promise<UserProfile>
  
  // Sincronização
  syncWithLocal: () => void
  refreshProfile: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const dataProvider = getDataProvider()
  const perfilStore = usePerfilStore()

  // Função para sincronizar perfil com localStorage
  const syncProfileToLocal = (profileData: UserProfile) => {
    if (!profileData) return

    // Mapear dados do Supabase para o formato do perfilStore
    perfilStore.atualizarNome(profileData.name)

    // Mapear preferências
    const preferences = profileData.preferences
    if (preferences) {
      perfilStore.atualizarPreferenciasVisuais({
        altoContraste: preferences.stimulus_reduction || false,
        reducaoEstimulos: preferences.stimulus_reduction || false,
        textoGrande: false, // Não temos equivalente direto
      })

      // Converter meta de água de ml para copos (assumindo 250ml por copo)
      const coposAgua = Math.round((preferences.daily_water_goal_ml || 2000) / 250)

      perfilStore.atualizarMetasDiarias({
        horasSono: 8, // Valor padrão, não temos no perfil ainda
        tarefasPrioritarias: 3, // Valor padrão
        coposAgua,
        pausasProgramadas: 4, // Valor padrão
      })

      perfilStore.alternarNotificacoes()
      if (perfilStore.notificacoesAtivas !== preferences.notifications_enabled) {
        perfilStore.alternarNotificacoes()
      }
    }
  }

  // Query para buscar perfil
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        return null
      }
      const profileData = await dataProvider.getProfile()
      if (profileData) {
        syncProfileToLocal(profileData)
      }
      return profileData
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutation para criar perfil
  const createProfileMutation = useMutation({
    mutationFn: async (data: CreateProfileData) => {
      validateCreateProfileData(data)
      return await dataProvider.createProfile(data)
    },
    onSuccess: (newProfile) => {
      queryClient.setQueryData(['profile', user?.id], newProfile)
      syncProfileToLocal(newProfile)
    },
  })

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      validateUpdateProfileData(data)
      return await dataProvider.updateProfile(data)
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', user?.id], updatedProfile)
      syncProfileToLocal(updatedProfile)
    },
  })

  // Mutation para deletar perfil
  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      return await dataProvider.deleteProfile()
    },
    onSuccess: () => {
      queryClient.setQueryData(['profile', user?.id], null)
      perfilStore.resetarPerfil()
    },
  })



  // Função para sincronizar localStorage com perfil
  const syncWithLocal = () => {
    if (!profile) return

    // Atualizar perfil com dados do localStorage
    const localData = {
      name: perfilStore.nome,
      preferences: {
        ...profile.preferences,
        notifications_enabled: perfilStore.notificacoesAtivas,
        daily_water_goal_ml: perfilStore.metasDiarias.coposAgua * 250,
        stimulus_reduction: perfilStore.preferenciasVisuais.reducaoEstimulos,
      },
    }

    updateProfileMutation.mutate(localData)
  }

  // Operações específicas
  const updateBasicInfo = async (data: { name: string }): Promise<UserProfile> => {
    return await updateProfileMutation.mutateAsync(data)
  }

  const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<UserProfile> => {
    return await updateProfileMutation.mutateAsync({ preferences })
  }

  const updateDailyGoals = async (goals: DailyGoals): Promise<UserProfile> => {
    // Converter metas diárias para formato do perfil
    const preferences: Partial<UserPreferences> = {
      daily_water_goal_ml: goals.coposAgua * 250,
    }

    return await updateProfileMutation.mutateAsync({ preferences })
  }

  const refreshProfile = async (): Promise<void> => {
    await refetch()
  }

  return {
    profile: profile || null,
    isLoading: isLoading || createProfileMutation.isPending || updateProfileMutation.isPending,
    error: (error as Error)?.message || 
           createProfileMutation.error?.message || 
           updateProfileMutation.error?.message || 
           deleteProfileMutation.error?.message || 
           null,
    
    createProfile: createProfileMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    deleteProfile: deleteProfileMutation.mutateAsync,
    
    updateBasicInfo,
    updatePreferences,
    updateDailyGoals,
    
    syncWithLocal,
    refreshProfile,
  }
}

// Funções de validação
function validateCreateProfileData(data: CreateProfileData): void {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Nome é obrigatório')
  }

  if (data.name.trim().length < 2) {
    throw new Error('Nome deve ter pelo menos 2 caracteres')
  }

  if (!data.timezone) {
    throw new Error('Timezone é obrigatório')
  }

  // Validar timezone básico
  if (!data.timezone.includes('/')) {
    throw new Error('Timezone inválido')
  }

  validatePreferences(data.preferences)
}

function validateUpdateProfileData(data: Partial<UserProfile>): void {
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório')
    }
    if (data.name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres')
    }
  }

  if (data.timezone !== undefined) {
    if (!data.timezone) {
      throw new Error('Timezone é obrigatório')
    }
    if (!data.timezone.includes('/')) {
      throw new Error('Timezone inválido')
    }
  }

  if (data.preferences) {
    validatePreferences(data.preferences)
  }
}

function validatePreferences(preferences: Partial<UserPreferences>): void {
  if (preferences.pomodoro_focus_minutes !== undefined) {
    if (preferences.pomodoro_focus_minutes <= 0 || preferences.pomodoro_focus_minutes > 120) {
      throw new Error('Minutos de foco deve estar entre 1 e 120')
    }
  }

  if (preferences.pomodoro_short_break_minutes !== undefined) {
    if (preferences.pomodoro_short_break_minutes <= 0 || preferences.pomodoro_short_break_minutes > 60) {
      throw new Error('Pausa curta deve estar entre 1 e 60 minutos')
    }
  }

  if (preferences.pomodoro_long_break_minutes !== undefined) {
    if (preferences.pomodoro_long_break_minutes <= 0 || preferences.pomodoro_long_break_minutes > 120) {
      throw new Error('Pausa longa deve estar entre 1 e 120 minutos')
    }
  }

  if (preferences.daily_water_goal_ml !== undefined) {
    if (preferences.daily_water_goal_ml <= 0) {
      throw new Error('Meta de água deve ser positiva')
    }
  }

  if (preferences.theme !== undefined) {
    if (!['light', 'dark'].includes(preferences.theme)) {
      throw new Error('Tema deve ser light ou dark')
    }
  }
}
