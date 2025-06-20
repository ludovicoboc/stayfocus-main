#!/usr/bin/env node

/**
 * Script para testar a conexão com o Supabase
 * Executa: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🚀 Testando conexão com Supabase...')
  console.log('=' .repeat(50))
  
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌')
    process.exit(1)
  }
  
  console.log('✅ Variáveis de ambiente configuradas')
  console.log('   URL:', supabaseUrl)
  console.log('   Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...')
  console.log('')
  
  // Criar cliente
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Teste 1: Conexão básica
    console.log('🔄 Teste 1: Conexão básica...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.users" does not exist')) {
        console.log('✅ Conexão estabelecida (tabela users ainda não existe - esperado)')
      } else {
        console.error('❌ Erro na conexão:', error.message)
        return false
      }
    } else {
      console.log('✅ Conexão estabelecida e tabela users encontrada')
    }
    
    // Teste 2: Sistema de autenticação
    console.log('🔄 Teste 2: Sistema de autenticação...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Invalid JWT' && authError.message !== 'Auth session missing!') {
      console.error('❌ Erro no sistema de auth:', authError.message)
      return false
    }
    
    console.log('✅ Sistema de autenticação funcionando')
    console.log('   Usuário atual:', user ? 'Logado' : 'Não logado (esperado)')
    
    // Teste 3: Verificar configuração do projeto
    console.log('🔄 Teste 3: Configuração do projeto...')
    const projectId = supabaseUrl.split('//')[1].split('.')[0]
    console.log('✅ Project ID extraído:', projectId)
    
    console.log('')
    console.log('=' .repeat(50))
    console.log('🎉 TODOS OS TESTES PASSARAM!')
    console.log('✅ Supabase está configurado corretamente')
    console.log('✅ Pronto para começar o desenvolvimento')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    return false
  }
}

// Executar o teste
testSupabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
