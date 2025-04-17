'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient' // Ajuste o caminho se necessário
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Alert } from '@/app/components/ui/Alert'
import { usuarioService } from '@/app/lib/services/usuarioService' // Importar serviço

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null) // Para mensagens de sucesso (ex: verifique seu email)

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Você pode adicionar opções aqui, como redirecionamento após confirmação de email
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/callback`,
        // }
      })

      if (error) {
        throw error
      }

      // Verifica se a confirmação de email está habilitada no Supabase
      if (data.user && data.user.identities?.length === 0) {
         // Isso pode indicar que a confirmação de email está habilitada e o usuário não está ativo ainda.
         // Ou pode indicar um problema. A API do Supabase pode mudar, verifique a documentação.
         setMessage('Verifique seu e-mail para confirmar o registro.')
         // Não redireciona automaticamente, espera a confirmação
      } else if (data.session) {
         // Se a confirmação não for necessária ou já estiver logado
         setMessage('Registro bem-sucedido! Criando perfil e redirecionando...')

         // Criar perfil no banco de dados
         if (data.user && data.user.id && data.user.email) {
           try {
             // TODO: Coletar o nome no formulário de registro
             const nomePlaceholder = data.user.email.split('@')[0] || 'Usuário';
             await usuarioService.criar({
               // O ID do usuário do Supabase Auth é usado como ID na tabela Usuario
               // Isso requer que o campo `id` no modelo Prisma Usuario seja `String @id @default(uuid())`
               // ou que você ajuste o serviço para permitir passar o ID.
               // Assumindo que o ID é gerenciado pelo Supabase Auth e passado aqui.
               // Se o schema Prisma não tiver ID explícito, remova a linha abaixo.
               // id: data.user.id, // Descomente se o ID for gerenciado externamente
               email: data.user.email,
               nome: nomePlaceholder,
               // Adicione valores padrão para outros campos se necessário
             })
             console.log(`Perfil criado para ${data.user.email}`)
             router.push('/') // Ajuste o redirecionamento
             router.refresh()
           } catch (profileError: any) {
             console.error('Erro ao criar perfil:', profileError)
             // Informa o usuário sobre o erro na criação do perfil, mas o registro no Auth funcionou
             setError(`Registro de autenticação bem-sucedido, mas falha ao criar perfil: ${profileError.message}`)
             // Não redireciona, permite que o usuário veja o erro
           }
         } else {
            // Caso não tenhamos user/id/email após signUp (inesperado se session existe)
            setError('Erro inesperado: Não foi possível obter dados do usuário após o registro para criar o perfil.')
         }

      } else {
         // Caso inesperado, talvez confirmação de email habilitada
         setMessage('Registro enviado. Verifique seu e-mail para os próximos passos.')
      }


    } catch (error: any) {
      console.error('Erro no registro:', error)
      setError(error.error_description || error.message || 'Ocorreu um erro durante o registro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="info">{message}</Alert>}
      <div>
        <label htmlFor="email-register" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <Input
          id="email-register"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password-register" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Senha
        </label>
        <Input
          id="password-register"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full"
          disabled={loading}
          minLength={6} // Supabase exige mínimo de 6 caracteres por padrão
        />
      </div>
      <div>
        <label htmlFor="confirm-password-register" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirmar Senha
        </label>
        <Input
          id="confirm-password-register"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full"
          disabled={loading}
          minLength={6}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Registrando...' : 'Registrar'}
      </Button>
    </form>
  )
}