'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseClient' // Ajuste o caminho se necessário
import { Button } from '@/app/components/ui/Button' // Assumindo que você tem um componente Button
import { LogOut } from 'lucide-react' // Ícone opcional

interface LogoutButtonProps {
  className?: string
  iconOnly?: boolean // Para exibir apenas o ícone
}

export function LogoutButton({ className, iconOnly = false }: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // Logout bem-sucedido, redireciona para a página de login ou inicial
      router.push('/auth/login') // Ajuste o redirecionamento conforme necessário
      router.refresh() // Garante atualização do estado no servidor
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Opcional: Mostrar uma notificação de erro para o usuário
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline" // Ou outra variante apropriada
      onClick={handleLogout}
      disabled={loading}
      className={className}
      aria-label="Sair"
    >
      {iconOnly ? (
        <LogOut className="h-5 w-5" />
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {loading ? 'Saindo...' : 'Sair'}
        </>
      )}
    </Button>
  )
}