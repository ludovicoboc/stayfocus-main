'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient' // Ajuste o caminho se necessário
import { Button } from '@/app/components/ui/Button' // Assumindo que você tem um componente Button
import { Input } from '@/app/components/ui/Input'   // Assumindo que você tem um componente Input
import { Alert } from '@/app/components/ui/Alert'   // Assumindo que você tem um componente Alert

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Login bem-sucedido, redireciona para a página inicial ou dashboard
      // Você pode querer usar router.refresh() para atualizar o estado do servidor
      router.push('/') // Ajuste o redirecionamento conforme necessário
      router.refresh() // Garante que o layout/server components sejam atualizados com o novo estado de auth

    } catch (error: any) {
      console.error('Erro no login:', error)
      setError(error.error_description || error.message || 'Ocorreu um erro durante o login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}