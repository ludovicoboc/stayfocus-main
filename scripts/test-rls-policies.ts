#!/usr/bin/env tsx

/**
 * Script para testar políticas RLS (Row Level Security) no Supabase
 * 
 * Este script testa se as políticas RLS estão funcionando corretamente,
 * verificando isolamento de dados entre usuários.
 * 
 * Uso: npx tsx scripts/test-rls-policies.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente necessárias:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Usuários de teste
const TEST_USERS = {
  user1: {
    email: 'test-user-1@example.com',
    password: 'test-password-123',
    name: 'Test User 1',
  },
  user2: {
    email: 'test-user-2@example.com',
    password: 'test-password-456',
    name: 'Test User 2',
  },
}

// Tabelas para testar
const TABLES_TO_TEST = [
  'hiperfocos',
  'tarefas',
  'meal_plans',
  'meal_records',
  'recipes',
]

interface TestResult {
  table: string
  operation: string
  expected: 'success' | 'blocked'
  actual: 'success' | 'blocked' | 'error'
  message?: string
}

class RLSTestRunner {
  private results: TestResult[] = []
  private currentUser: any = null

  async signUpUser(userKey: keyof typeof TEST_USERS): Promise<boolean> {
    try {
      const user = TEST_USERS[userKey]
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
          },
        },
      })

      if (error && !error.message.includes('already registered')) {
        console.error(`❌ Erro ao criar usuário ${userKey}:`, error.message)
        return false
      }

      console.log(`✅ Usuário ${userKey} criado/verificado`)
      return true
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar usuário ${userKey}:`, error)
      return false
    }
  }

  async signInUser(userKey: keyof typeof TEST_USERS): Promise<boolean> {
    try {
      const user = TEST_USERS[userKey]
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      if (error) {
        console.error(`❌ Erro ao fazer login do usuário ${userKey}:`, error.message)
        return false
      }

      this.currentUser = data.user
      console.log(`✅ Login realizado para usuário ${userKey} (ID: ${this.currentUser?.id})`)
      return true
    } catch (error) {
      console.error(`❌ Erro inesperado ao fazer login do usuário ${userKey}:`, error)
      return false
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
    this.currentUser = null
  }

  async testInsertOwnData(table: string): Promise<TestResult> {
    const testData = this.getTestData(table)
    
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(testData)
        .select()

      if (error) {
        return {
          table,
          operation: 'insert_own_data',
          expected: 'success',
          actual: 'blocked',
          message: error.message,
        }
      }

      return {
        table,
        operation: 'insert_own_data',
        expected: 'success',
        actual: 'success',
        message: `Inserção própria permitida (ID: ${data?.[0]?.id})`,
      }
    } catch (error) {
      return {
        table,
        operation: 'insert_own_data',
        expected: 'success',
        actual: 'error',
        message: `Erro inesperado: ${error}`,
      }
    }
  }

  async testInsertOtherUserData(table: string, otherUserId: string): Promise<TestResult> {
    const testData = {
      ...this.getTestData(table),
      user_id: otherUserId, // Tentar inserir para outro usuário
    }
    
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(testData)

      if (error && error.message.includes('row-level security')) {
        return {
          table,
          operation: 'insert_other_user_data',
          expected: 'blocked',
          actual: 'blocked',
          message: 'RLS bloqueou inserção maliciosa',
        }
      }

      return {
        table,
        operation: 'insert_other_user_data',
        expected: 'blocked',
        actual: 'success',
        message: '⚠️ FALHA DE SEGURANÇA: Inserção maliciosa permitida!',
      }
    } catch (error) {
      return {
        table,
        operation: 'insert_other_user_data',
        expected: 'blocked',
        actual: 'error',
        message: `Erro inesperado: ${error}`,
      }
    }
  }

  async testSelectOwnData(table: string): Promise<TestResult> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', this.currentUser?.id)

      if (error) {
        return {
          table,
          operation: 'select_own_data',
          expected: 'success',
          actual: 'blocked',
          message: error.message,
        }
      }

      return {
        table,
        operation: 'select_own_data',
        expected: 'success',
        actual: 'success',
        message: `Dados próprios acessíveis (${data?.length} registros)`,
      }
    } catch (error) {
      return {
        table,
        operation: 'select_own_data',
        expected: 'success',
        actual: 'error',
        message: `Erro inesperado: ${error}`,
      }
    }
  }

  async testSelectOtherUserData(table: string, otherUserId: string): Promise<TestResult> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', otherUserId)

      if (error) {
        return {
          table,
          operation: 'select_other_user_data',
          expected: 'blocked',
          actual: 'blocked',
          message: 'RLS bloqueou acesso a dados de outro usuário',
        }
      }

      if (data && data.length === 0) {
        return {
          table,
          operation: 'select_other_user_data',
          expected: 'blocked',
          actual: 'blocked',
          message: 'RLS isolou dados corretamente (array vazio)',
        }
      }

      return {
        table,
        operation: 'select_other_user_data',
        expected: 'blocked',
        actual: 'success',
        message: `⚠️ VAZAMENTO DE DADOS: ${data?.length} registros de outro usuário acessíveis!`,
      }
    } catch (error) {
      return {
        table,
        operation: 'select_other_user_data',
        expected: 'blocked',
        actual: 'error',
        message: `Erro inesperado: ${error}`,
      }
    }
  }

  private getTestData(table: string): any {
    const baseData = {
      user_id: this.currentUser?.id,
      created_at: new Date().toISOString(),
    }

    switch (table) {
      case 'hiperfocos':
        return {
          ...baseData,
          titulo: `Teste RLS ${Date.now()}`,
          descricao: 'Hiperfoco de teste para RLS',
          cor: '#FF5722',
          status: 'ativo',
        }
      case 'tarefas':
        return {
          ...baseData,
          texto: `Tarefa de teste ${Date.now()}`,
          concluida: false,
        }
      case 'meal_plans':
        return {
          ...baseData,
          name: `Plano de teste ${Date.now()}`,
          description: 'Plano de refeição para teste RLS',
        }
      case 'meal_records':
        return {
          ...baseData,
          date: new Date().toISOString().split('T')[0],
          meal_type: 'breakfast',
          food_name: 'Teste RLS',
          calories: 100,
        }
      case 'recipes':
        return {
          ...baseData,
          name: `Receita de teste ${Date.now()}`,
          description: 'Receita para teste RLS',
          prep_time_minutes: 30,
          servings: 2,
        }
      default:
        return baseData
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando testes de RLS...\n')

    // Criar usuários de teste
    console.log('👥 Criando usuários de teste...')
    await this.signUpUser('user1')
    await this.signUpUser('user2')

    // Fazer login como usuário 1
    console.log('\n🔐 Fazendo login como User 1...')
    await this.signInUser('user1')
    const user1Id = this.currentUser?.id

    // Testar operações do usuário 1
    console.log('\n📝 Testando operações do User 1...')
    for (const table of TABLES_TO_TEST) {
      this.results.push(await this.testInsertOwnData(table))
      this.results.push(await this.testSelectOwnData(table))
    }

    // Fazer login como usuário 2
    console.log('\n🔐 Fazendo login como User 2...')
    await this.signOut()
    await this.signInUser('user2')
    const user2Id = this.currentUser?.id

    // Testar isolamento entre usuários
    console.log('\n🔒 Testando isolamento entre usuários...')
    for (const table of TABLES_TO_TEST) {
      this.results.push(await this.testSelectOtherUserData(table, user1Id))
      this.results.push(await this.testInsertOtherUserData(table, user1Id))
    }

    await this.signOut()
  }

  printResults(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESULTADOS DOS TESTES RLS')
    console.log('='.repeat(60))

    let passed = 0
    let failed = 0

    this.results.forEach((result) => {
      const success = result.expected === result.actual
      const icon = success ? '✅' : '❌'
      const status = success ? 'PASSOU' : 'FALHOU'
      
      console.log(`${icon} ${result.table}.${result.operation}: ${status}`)
      if (result.message) {
        console.log(`   ${result.message}`)
      }
      
      if (success) {
        passed++
      } else {
        failed++
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log(`📈 RESUMO: ${passed} passou, ${failed} falhou`)
    
    if (failed === 0) {
      console.log('🎉 Todos os testes passaram! RLS está funcionando corretamente.')
    } else {
      console.log('⚠️  Alguns testes falharam. Verifique as políticas RLS.')
    }
  }
}

async function main(): Promise<void> {
  const testRunner = new RLSTestRunner()
  
  try {
    await testRunner.runAllTests()
    testRunner.printResults()
  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  }
}

// Executar os testes
main().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
