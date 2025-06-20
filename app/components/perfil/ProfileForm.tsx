'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/app/hooks/useProfile'
import { UserPreferences } from '@/app/lib/dataProviders/types'

export function ProfileForm() {
  const { 
    profile, 
    isLoading, 
    error, 
    createProfile, 
    updateProfile,
    updateBasicInfo,
    updatePreferences 
  } = useProfile()

  const [formData, setFormData] = useState({
    name: '',
    timezone: 'America/Sao_Paulo',
    theme: 'light' as const,
    language: 'pt-BR',
    notifications_enabled: true,
    pomodoro_focus_minutes: 25,
    pomodoro_short_break_minutes: 5,
    pomodoro_long_break_minutes: 15,
    daily_water_goal_ml: 2000,
    stimulus_reduction: false,
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Atualizar formulário quando perfil carrega
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        timezone: profile.timezone,
        theme: profile.preferences.theme,
        language: profile.preferences.language,
        notifications_enabled: profile.preferences.notifications_enabled,
        pomodoro_focus_minutes: profile.preferences.pomodoro_focus_minutes,
        pomodoro_short_break_minutes: profile.preferences.pomodoro_short_break_minutes,
        pomodoro_long_break_minutes: profile.preferences.pomodoro_long_break_minutes,
        daily_water_goal_ml: profile.preferences.daily_water_goal_ml,
        stimulus_reduction: profile.preferences.stimulus_reduction,
      })
    }
  }, [profile])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (formData.pomodoro_focus_minutes <= 0) {
      errors.pomodoro_focus_minutes = 'Deve ser maior que 0'
    }

    if (formData.pomodoro_short_break_minutes <= 0) {
      errors.pomodoro_short_break_minutes = 'Deve ser maior que 0'
    }

    if (formData.pomodoro_long_break_minutes <= 0) {
      errors.pomodoro_long_break_minutes = 'Deve ser maior que 0'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const preferences: UserPreferences = {
        theme: formData.theme,
        language: formData.language,
        notifications_enabled: formData.notifications_enabled,
        pomodoro_focus_minutes: formData.pomodoro_focus_minutes,
        pomodoro_short_break_minutes: formData.pomodoro_short_break_minutes,
        pomodoro_long_break_minutes: formData.pomodoro_long_break_minutes,
        daily_water_goal_ml: formData.daily_water_goal_ml,
        stimulus_reduction: formData.stimulus_reduction,
      }

      if (profile) {
        // Atualizar perfil existente
        await updateProfile({
          name: formData.name,
          timezone: formData.timezone,
          preferences,
        })
      } else {
        // Criar novo perfil
        await createProfile({
          name: formData.name,
          timezone: formData.timezone,
          preferences,
        })
      }

      // Limpar erros de validação após sucesso
      setValidationErrors({})
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBasicInfoChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Validar em tempo real
    if (field === 'name') {
      const errors = { ...validationErrors }
      if (!value.trim()) {
        errors.name = 'Nome é obrigatório'
      } else if (value.trim().length < 2) {
        errors.name = 'Nome deve ter pelo menos 2 caracteres'
      } else {
        delete errors.name
      }
      setValidationErrors(errors)
    }

    if (profile && field === 'name' && value.trim().length >= 2) {
      try {
        await updateBasicInfo({ name: value })
      } catch (error) {
        // Silenciar erro para não interromper digitação
      }
    }
  }

  const handlePreferenceChange = async (field: keyof UserPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (profile) {
      try {
        await updatePreferences({ [field]: value })
      } catch (error) {
        // Silenciar erro para não interromper interação
      }
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (error && !profile) {
    return <div>Erro: {error}</div>
  }

  if (submitError) {
    return <div>Erro: {submitError}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleBasicInfoChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="America/Sao_Paulo">São Paulo</option>
          <option value="America/New_York">New York</option>
          <option value="Europe/London">London</option>
        </select>
      </div>

      {/* Preferências */}
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
          Tema
        </label>
        <select
          id="theme"
          value={formData.theme}
          onChange={(e) => {
            const value = e.target.value as 'light' | 'dark'
            setFormData(prev => ({ ...prev, theme: value }))
            if (profile) {
              handlePreferenceChange('theme', value)
            }
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>

      <div>
        <label htmlFor="pomodoro_focus_minutes" className="block text-sm font-medium text-gray-700">
          Minutos de Foco
        </label>
        <input
          type="number"
          id="pomodoro_focus_minutes"
          value={formData.pomodoro_focus_minutes}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0
            setFormData(prev => ({ ...prev, pomodoro_focus_minutes: value }))

            // Validar em tempo real
            const errors = { ...validationErrors }
            if (value <= 0) {
              errors.pomodoro_focus_minutes = 'Deve ser maior que 0'
            } else {
              delete errors.pomodoro_focus_minutes
            }
            setValidationErrors(errors)

            if (profile && value > 0) {
              handlePreferenceChange('pomodoro_focus_minutes', value)
            }
          }}
          min="1"
          max="120"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {validationErrors.pomodoro_focus_minutes && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.pomodoro_focus_minutes}</p>
        )}
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.notifications_enabled}
            onChange={(e) => {
              const value = e.target.checked
              setFormData(prev => ({ ...prev, notifications_enabled: value }))
              if (profile) {
                handlePreferenceChange('notifications_enabled', value)
              }
            }}
            className="rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Notificações</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Salvando...' : profile ? 'Atualizar Perfil' : 'Criar Perfil'}
      </button>
    </form>
  )
}
