import { createClient } from '@supabase/supabase-js'

// Obtenha a URL e a chave anônima do Supabase das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verifique se as variáveis de ambiente estão definidas
if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Crie e exporte o cliente Supabase
// Usamos 'forceConsistentTypeExports: true' no tsconfig.json para garantir
// que a exportação seja consistente, mesmo que o tipo seja inferido.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)