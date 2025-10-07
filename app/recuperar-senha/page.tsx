'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'
import { Mail, Send } from 'lucide-react'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetar-senha`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Se um usuário com este e-mail existir, um link de recuperação de senha será enviado.')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recuperar Senha</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Digite seu e-mail para receber as instruções.
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
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

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-500">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-2" />
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          <p>
            Lembrou da senha?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}