'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Check } from 'lucide-react'

export default function ResetarSenhaPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Supabase adiciona o token de acesso como um fragmento na URL.
    // O cliente Supabase o detecta automaticamente e o armazena na sessão.
    // Não é necessário manuseio manual do token aqui.
  }, [])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(`Erro ao redefinir a senha: ${error.message}`)
    } else {
      setSuccess('Sua senha foi redefinida com sucesso! Você será redirecionado para o login.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Redefinir sua Senha</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Digite sua nova senha abaixo.
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nova Senha
            </label>
            <div className="relative mt-1">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-md focus:border-blue-500 focus:bg-white focus:ring-0 dark:bg-gray-700 dark:text-white"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative mt-1">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-md focus:border-blue-500 focus:bg-white focus:ring-0 dark:bg-gray-700 dark:text-white"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            <Check className="w-5 h-5 mr-2" />
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}