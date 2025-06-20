import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Configuração das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
  )
}

/**
 * Cliente Supabase para uso no lado do cliente (browser)
 * Usa o novo padrão @supabase/ssr para melhor compatibilidade com Next.js
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Cliente Supabase básico (compatibilidade com código legado)
 * @deprecated Use o cliente 'supabase' acima para novos desenvolvimentos
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Configurações do Supabase
 */
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  projectId: supabaseUrl.split('//')[1].split('.')[0], // Extrai o project ID da URL
} as const

/**
 * Tipos de dados para TypeScript
 */
export type Database = {
  public: {
    Tables: {
      // Definições das tabelas serão adicionadas conforme necessário
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      // Views serão definidas conforme necessário
    }
    Functions: {
      // Functions serão definidas conforme necessário
    }
    Enums: {
      // Enums serão definidos conforme necessário
    }
  }
}

export default supabase
