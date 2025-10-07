'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Check } from 'lucide-react'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else if (data.user) {
        setSuccess('Registro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.')
        setTimeout(() => {
            router.push('/login')
        }, 3000);
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Criar sua conta</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Junte-se a nós e organize sua vida.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nome completo
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-md focus:border-blue-500 focus:bg-white focus:ring-0 dark:bg-gray-700 dark:text-white"
                placeholder="Seu nome"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              E-mail
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-md focus:border-blue-500 focus:bg-white focus:ring-0 dark:bg-gray-700 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <div className="relative mt-1">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="password"
                type="password"
                required
                minLength={6}
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
              Confirmar Senha
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
                placeholder="Repita a senha"
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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          <p>
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}