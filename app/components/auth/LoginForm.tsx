'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth, isValidEmail, validateLoginCredentials } from '@/app/lib/auth'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const router = useRouter()
  const { login, loading: authLoading, error: authError, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Limpar erro geral quando usuário digita
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }

    // Limpar erro de autenticação
    if (authError) {
      clearError()
    }
  }

  const validateForm = (): boolean => {
    const validation = validateLoginCredentials(formData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.error) {
        setErrors({ general: result.error })
      } else if (result.user) {
        // Login bem-sucedido
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(redirectTo)
        }
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Erro inesperado',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  const isLoading = authLoading || isSubmitting

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Entrar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Entre na sua conta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              onKeyPress={handleKeyPress}
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              onKeyPress={handleKeyPress}
              error={errors.password}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Erro geral */}
          {(errors.general || authError) && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              {errors.general || authError}
            </div>
          )}

          {/* Botão de submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
