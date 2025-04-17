'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabaseClient' // Ajuste o caminho se necessário
import type { Session, User } from '@supabase/supabase-js'

// Tipo para o valor do contexto
interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void> // Adicionando signOut ao contexto para conveniência
}

// Criação do contexto com um valor padrão inicial
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true, // Começa como true até a primeira verificação
  signOut: async () => { throw new Error("signOut() not implemented") },
})

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provedor do contexto
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Função assíncrona para buscar a sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
      } catch (error) {
        console.error("Erro ao buscar sessão inicial:", error)
      } finally {
        setLoading(false) // Marca como carregado após a primeira tentativa
      }
    }

    getInitialSession()

    // Escuta mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth Event:', event, newSession) // Log para debug
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false) // Marca como carregado após qualquer mudança
      }
    )

    // Limpa o listener quando o componente desmontar
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Função signOut exposta pelo contexto
  const signOut = async () => {
    setLoading(true) // Opcional: indicar loading durante o signOut
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // O listener onAuthStateChange cuidará de atualizar session/user para null
    } catch (error) {
      console.error("Erro ao fazer signOut:", error)
      // Poderia definir um estado de erro aqui se necessário
    } finally {
      // O setLoading será false quando o onAuthStateChange for chamado
    }
  }


  const value: AuthContextType = {
    session,
    user,
    loading,
    signOut
  }

  // Não renderiza children até que o estado inicial de autenticação seja carregado
  // Isso evita piscar a UI ou mostrar conteúdo protegido para usuários não logados brevemente
  // if (loading) {
  //   return <div>Carregando autenticação...</div>; // Ou um spinner/skeleton
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}