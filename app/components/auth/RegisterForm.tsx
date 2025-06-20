'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { useAuth, isValidEmail, validatePassword } from '@/app/lib/auth'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

interface RegisterFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
  general?: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export function RegisterForm({ onSuccess, redirectTo = '/' }: RegisterFormProps) {
  const router = useRouter()
  const { register, loading: authLoading, error: authError, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) {
      return { score: 0, label: '', color: '' }
    }

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) {
      return { score, label: 'Fraca', color: 'text-red-600' }
    } else if (score <= 4) {
      return { score, label: 'Média', color: 'text-yellow-600' }
    } else {
      return { score, label: 'Forte', color: 'text-green-600' }
    }
  }

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptTerms' ? e.target.checked : e.target.value
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
    const newErrors: FormErrors = {}

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(', ')
      }
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    // Validar termos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      })

      if (result.error) {
        setErrors({ general: result.error })
      } else if (result.user) {
        // Registro bem-sucedido
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
  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Criar Conta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Crie sua conta para começar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Input
              label="Nome"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              onKeyPress={handleKeyPress}
              error={errors.name}
              disabled={isLoading}
              autoComplete="name"
              autoFocus
              required
            />
          </div>

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
              autoComplete="new-password"
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

            {/* Indicador de força da senha */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2
                          ? 'bg-red-500'
                          : passwordStrength.score <= 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="relative">
            <Input
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              onKeyPress={handleKeyPress}
              error={errors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>

            {/* Indicador de confirmação */}
            {formData.confirmPassword && (
              <div className="absolute right-10 top-8">
                {formData.password === formData.confirmPassword ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>

          {/* Termos de uso */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange('acceptTerms')}
              disabled={isLoading}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400">
              Aceito os{' '}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                target="_blank"
              >
                termos de uso
              </Link>{' '}
              e{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                target="_blank"
              >
                política de privacidade
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {errors.acceptTerms}
            </div>
          )}

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
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
