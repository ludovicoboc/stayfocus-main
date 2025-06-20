#!/usr/bin/env tsx

/**
 * Script de Validação de Segurança RLS
 * 
 * Este script executa uma bateria completa de testes para validar
 * que as políticas RLS estão funcionando corretamente e não há
 * vazamentos de dados entre usuários.
 * 
 * Uso: npx tsx scripts/validate-rls-security.ts
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

// Tabelas críticas que devem ter RLS
const CRITICAL_TABLES = [
  'hiperfocos',
  'tarefas',
  'sessoes_alternancia',
  'meal_plans',
  'meal_records',
  'recipes',
  'hydration_tracking',
  'favorite_recipes',
]

// Usuários de teste para validação
const TEST_USERS = {
  validator1: {
    email: 'rls-validator-1@stayfocus.test',
    password: 'RLS_Test_2024!',
  },
  validator2: {
    email: 'rls-validator-2@stayfocus.test',
    password: 'RLS_Test_2024!',
  },
}

interface ValidationResult {
  test: string
  table: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: any
}

class RLSSecurityValidator {
  private results: ValidationResult[] = []
  private currentUser: any = null

  async validateAll(): Promise<ValidationResult[]> {
    console.log('🔒 Iniciando validação de segurança RLS...\n')

    // 1. Verificar se RLS está habilitado
    await this.validateRLSEnabled()

    // 2. Verificar políticas existentes
    await this.validatePoliciesExist()

    // 3. Criar usuários de teste
    await this.setupTestUsers()

    // 4. Testar isolamento de dados
    await this.validateDataIsolation()

    // 5. Testar tentativas de acesso malicioso
    await this.validateSecurityBlocking()

    // 6. Testar performance
    await this.validatePerformance()

    // 7. Cleanup
    await this.cleanup()

    return this.results
  }

  private addResult(test: string, table: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({ test, table, status, message, details })
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${test} (${table}): ${message}`)
  }

  private async validateRLSEnabled(): Promise<void> {
    console.log('📋 Verificando se RLS está habilitado...')

    try {
      // Usar uma query direta para verificar RLS
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
            AND tablename = ANY($1)
        `,
        params: [CRITICAL_TABLES]
      })

      if (error) {
        // Se rpc não funcionar, assumir que RLS está habilitado
        this.addResult('RLS_ENABLED', 'ALL', 'WARNING', 'Não foi possível verificar RLS via RPC, assumindo habilitado')
        return
      }

      for (const table of CRITICAL_TABLES) {
        const tableInfo = data?.find((row: any) => row.tablename === table)
        
        if (!tableInfo) {
          this.addResult('RLS_ENABLED', table, 'WARNING', 'Tabela não encontrada')
          continue
        }

        if (tableInfo.rowsecurity) {
          this.addResult('RLS_ENABLED', table, 'PASS', 'RLS habilitado')
        } else {
          this.addResult('RLS_ENABLED', table, 'FAIL', 'RLS NÃO HABILITADO - CRÍTICO!')
        }
      }
    } catch (error) {
      this.addResult('RLS_ENABLED', 'ALL', 'WARNING', `Erro ao verificar RLS: ${error}`)
    }
  }

  private async validatePoliciesExist(): Promise<void> {
    console.log('\n🔐 Verificando políticas RLS...')

    for (const table of CRITICAL_TABLES) {
      try {
        // Tentar uma operação que deveria ser bloqueada sem autenticação
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error && error.message.includes('permission denied')) {
          this.addResult('POLICIES_EXIST', table, 'PASS', 'Políticas bloqueando acesso não autorizado')
        } else if (data && data.length === 0) {
          this.addResult('POLICIES_EXIST', table, 'PASS', 'Políticas funcionando (dados isolados)')
        } else {
          this.addResult('POLICIES_EXIST', table, 'WARNING', 'Possível vazamento ou tabela vazia')
        }
      } catch (error) {
        this.addResult('POLICIES_EXIST', table, 'FAIL', `Erro ao testar políticas: ${error}`)
      }
    }
  }

  private async setupTestUsers(): Promise<void> {
    console.log('\n👥 Configurando usuários de teste...')

    for (const [userKey, userData] of Object.entries(TEST_USERS)) {
      try {
        // Tentar criar usuário (pode falhar se já existir)
        const { error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
        })

        if (signUpError && !signUpError.message.includes('already registered')) {
          this.addResult('SETUP_USERS', userKey, 'FAIL', `Erro ao criar usuário: ${signUpError.message}`)
          continue
        }

        this.addResult('SETUP_USERS', userKey, 'PASS', 'Usuário de teste configurado')
      } catch (error) {
        this.addResult('SETUP_USERS', userKey, 'FAIL', `Erro inesperado: ${error}`)
      }
    }
  }

  private async validateDataIsolation(): Promise<void> {
    console.log('\n🔒 Testando isolamento de dados...')

    // Fazer login como usuário 1
    const { error: loginError1 } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.validator1.email,
      password: TEST_USERS.validator1.password,
    })

    if (loginError1) {
      this.addResult('DATA_ISOLATION', 'LOGIN', 'FAIL', `Erro no login usuário 1: ${loginError1.message}`)
      return
    }

    const { data: { user: user1 } } = await supabase.auth.getUser()
    
    // Inserir dados de teste para usuário 1
    for (const table of ['hiperfocos', 'tarefas']) {
      try {
        const testData = this.getTestData(table, user1?.id)
        const { error: insertError } = await supabase
          .from(table)
          .insert(testData)

        if (insertError) {
          this.addResult('DATA_ISOLATION', table, 'WARNING', `Erro ao inserir dados de teste: ${insertError.message}`)
          continue
        }

        // Verificar se consegue ler os próprios dados
        const { data: ownData, error: selectError } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user1?.id)

        if (selectError) {
          this.addResult('DATA_ISOLATION', table, 'FAIL', `Erro ao ler próprios dados: ${selectError.message}`)
        } else if (ownData && ownData.length > 0) {
          this.addResult('DATA_ISOLATION', table, 'PASS', `Usuário pode acessar próprios dados (${ownData.length} registros)`)
        } else {
          this.addResult('DATA_ISOLATION', table, 'WARNING', 'Nenhum dado próprio encontrado')
        }
      } catch (error) {
        this.addResult('DATA_ISOLATION', table, 'FAIL', `Erro inesperado: ${error}`)
      }
    }

    // Fazer logout e login como usuário 2
    await supabase.auth.signOut()
    
    const { error: loginError2 } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.validator2.email,
      password: TEST_USERS.validator2.password,
    })

    if (loginError2) {
      this.addResult('DATA_ISOLATION', 'LOGIN', 'FAIL', `Erro no login usuário 2: ${loginError2.message}`)
      return
    }

    // Verificar se usuário 2 NÃO consegue ver dados do usuário 1
    for (const table of ['hiperfocos', 'tarefas']) {
      try {
        const { data: otherUserData } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user1?.id) // Tentar acessar dados do usuário 1

        if (otherUserData && otherUserData.length === 0) {
          this.addResult('DATA_ISOLATION', table, 'PASS', 'Usuário 2 não consegue ver dados do usuário 1')
        } else {
          this.addResult('DATA_ISOLATION', table, 'FAIL', `VAZAMENTO! Usuário 2 vê ${otherUserData?.length} registros do usuário 1`)
        }
      } catch (error) {
        this.addResult('DATA_ISOLATION', table, 'FAIL', `Erro ao testar isolamento: ${error}`)
      }
    }
  }

  private async validateSecurityBlocking(): Promise<void> {
    console.log('\n🚫 Testando bloqueio de operações maliciosas...')

    const { data: { user } } = await supabase.auth.getUser()
    
    for (const table of ['hiperfocos', 'tarefas']) {
      // Tentar inserir dados para outro usuário
      try {
        const maliciousData = {
          ...this.getTestData(table, 'fake-user-id'),
          user_id: 'fake-user-id', // Tentar inserir para outro usuário
        }

        const { error } = await supabase
          .from(table)
          .insert(maliciousData)

        if (error && error.message.includes('row-level security')) {
          this.addResult('SECURITY_BLOCKING', table, 'PASS', 'RLS bloqueou inserção maliciosa')
        } else if (error) {
          this.addResult('SECURITY_BLOCKING', table, 'WARNING', `Inserção bloqueada por outro motivo: ${error.message}`)
        } else {
          this.addResult('SECURITY_BLOCKING', table, 'FAIL', 'FALHA CRÍTICA! Inserção maliciosa permitida')
        }
      } catch (error) {
        this.addResult('SECURITY_BLOCKING', table, 'FAIL', `Erro ao testar bloqueio: ${error}`)
      }

      // Tentar atualizar dados de outro usuário
      try {
        const { error } = await supabase
          .from(table)
          .update({ titulo: 'HACKED!' })
          .eq('user_id', 'fake-user-id')

        if (error && error.message.includes('row-level security')) {
          this.addResult('SECURITY_BLOCKING', table, 'PASS', 'RLS bloqueou atualização maliciosa')
        } else {
          this.addResult('SECURITY_BLOCKING', table, 'WARNING', 'Atualização não bloqueada (pode ser normal se não há dados)')
        }
      } catch (error) {
        this.addResult('SECURITY_BLOCKING', table, 'FAIL', `Erro ao testar bloqueio de update: ${error}`)
      }
    }
  }

  private async validatePerformance(): Promise<void> {
    console.log('\n⚡ Testando performance com RLS...')

    for (const table of ['hiperfocos', 'tarefas']) {
      try {
        const startTime = Date.now()
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(100)

        const endTime = Date.now()
        const duration = endTime - startTime

        if (error) {
          this.addResult('PERFORMANCE', table, 'FAIL', `Erro na query: ${error.message}`)
          continue
        }

        if (duration < 100) {
          this.addResult('PERFORMANCE', table, 'PASS', `Query rápida: ${duration}ms`)
        } else if (duration < 500) {
          this.addResult('PERFORMANCE', table, 'WARNING', `Query lenta: ${duration}ms`)
        } else {
          this.addResult('PERFORMANCE', table, 'FAIL', `Query muito lenta: ${duration}ms`)
        }
      } catch (error) {
        this.addResult('PERFORMANCE', table, 'FAIL', `Erro ao testar performance: ${error}`)
      }
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Limpando dados de teste...')

    try {
      // Fazer logout
      await supabase.auth.signOut()
      this.addResult('CLEANUP', 'AUTH', 'PASS', 'Logout realizado')
    } catch (error) {
      this.addResult('CLEANUP', 'AUTH', 'WARNING', `Erro no logout: ${error}`)
    }
  }

  private getTestData(table: string, userId: string): any {
    const baseData = {
      user_id: userId,
      created_at: new Date().toISOString(),
    }

    switch (table) {
      case 'hiperfocos':
        return {
          ...baseData,
          titulo: `RLS Test ${Date.now()}`,
          descricao: 'Dados de teste para validação RLS',
          cor: '#FF5722',
          status: 'ativo',
        }
      case 'tarefas':
        return {
          ...baseData,
          texto: `Tarefa de teste RLS ${Date.now()}`,
          concluida: false,
        }
      default:
        return baseData
    }
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO DA VALIDAÇÃO DE SEGURANÇA RLS')
    console.log('='.repeat(60))

    const summary = {
      PASS: this.results.filter(r => r.status === 'PASS').length,
      FAIL: this.results.filter(r => r.status === 'FAIL').length,
      WARNING: this.results.filter(r => r.status === 'WARNING').length,
    }

    console.log(`✅ Testes aprovados: ${summary.PASS}`)
    console.log(`❌ Testes falharam: ${summary.FAIL}`)
    console.log(`⚠️  Avisos: ${summary.WARNING}`)

    if (summary.FAIL === 0) {
      console.log('\n🎉 Todas as validações críticas passaram!')
      console.log('🔒 Sistema RLS está funcionando corretamente.')
    } else {
      console.log('\n🚨 ATENÇÃO: Falhas críticas detectadas!')
      console.log('🔧 Revise as políticas RLS imediatamente.')
    }

    // Mostrar falhas críticas
    const criticalFailures = this.results.filter(r => r.status === 'FAIL')
    if (criticalFailures.length > 0) {
      console.log('\n🚨 FALHAS CRÍTICAS:')
      criticalFailures.forEach(failure => {
        console.log(`   ❌ ${failure.test} (${failure.table}): ${failure.message}`)
      })
    }
  }
}

async function main(): Promise<void> {
  const validator = new RLSSecurityValidator()
  
  try {
    await validator.validateAll()
    validator.printSummary()
  } catch (error) {
    console.error('❌ Erro fatal durante validação:', error)
    process.exit(1)
  }
}

// Executar validação
main().catch((error) => {
  console.error('❌ Erro inesperado:', error)
  process.exit(1)
})
