import { createClient } from '@supabase/supabase-js'

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Testa a conexão básica com o Supabase
 * @returns Promise<boolean> - true se a conexão foi bem-sucedida
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🔄 Testando conexão com Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Anon Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...')
    
    // Tenta fazer uma query simples para verificar a conexão
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      // Se a tabela 'users' não existir, isso é esperado neste momento
      // O importante é que a conexão foi estabelecida
      if (error.code === 'PGRST116' || error.message.includes('relation "public.users" does not exist')) {
        console.log('✅ Conexão com Supabase estabelecida com sucesso!')
        console.log('ℹ️  Tabela "users" ainda não existe (isso é esperado)')
        return true
      }
      
      console.error('❌ Erro na conexão com Supabase:', error)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 Dados retornados:', data)
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado ao testar conexão:', error)
    return false
  }
}

/**
 * Testa a autenticação do Supabase
 * @returns Promise<boolean> - true se o sistema de auth está funcionando
 */
export async function testAuth(): Promise<boolean> {
  try {
    console.log('🔄 Testando sistema de autenticação...')
    
    // Verifica se consegue acessar o sistema de auth
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && error.message !== 'Invalid JWT') {
      console.error('❌ Erro no sistema de autenticação:', error)
      return false
    }
    
    console.log('✅ Sistema de autenticação funcionando!')
    console.log('👤 Usuário atual:', user ? 'Logado' : 'Não logado (esperado)')
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado no teste de auth:', error)
    return false
  }
}

/**
 * Executa todos os testes de conexão
 * @returns Promise<boolean> - true se todos os testes passaram
 */
export async function runAllTests(): Promise<boolean> {
  console.log('🚀 Iniciando testes de conexão com Supabase...')
  console.log('=' .repeat(50))
  
  const connectionTest = await testConnection()
  const authTest = await testAuth()
  
  console.log('=' .repeat(50))
  console.log('📋 Resumo dos testes:')
  console.log(`   Conexão: ${connectionTest ? '✅' : '❌'}`)
  console.log(`   Autenticação: ${authTest ? '✅' : '❌'}`)
  
  const allPassed = connectionTest && authTest
  console.log(`🎯 Resultado geral: ${allPassed ? '✅ SUCESSO' : '❌ FALHA'}`)
  
  return allPassed
}

// Exporta o cliente para uso em outros arquivos
export default supabase
