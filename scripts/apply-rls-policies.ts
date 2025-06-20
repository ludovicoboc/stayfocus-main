#!/usr/bin/env tsx

/**
 * Script para aplicar políticas RLS (Row Level Security) no Supabase
 * 
 * Este script aplica todas as políticas RLS necessárias para garantir
 * isolamento de dados entre usuários.
 * 
 * Uso: npx tsx scripts/apply-rls-policies.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente necessárias:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Lista de tabelas que devem ter RLS habilitado
const TABLES_WITH_RLS = [
  'users',
  'hiperfocos',
  'tarefas',
  'sessoes_alternancia',
  'meal_plans',
  'meal_records',
  'hydration_tracking',
  'recipes',
  'recipe_ingredients',
  'recipe_tags',
  'recipe_categories',
  'recipe_category_assignments',
  'favorite_recipes',
]

// Políticas RLS por tabela
const RLS_POLICIES = {
  users: [
    {
      name: 'Users can view own profile',
      command: 'SELECT',
      using: 'auth.uid() = id',
    },
    {
      name: 'Users can update own profile',
      command: 'UPDATE',
      using: 'auth.uid() = id',
    },
    {
      name: 'Users can insert own profile',
      command: 'INSERT',
      check: 'auth.uid() = id',
    },
  ],
  hiperfocos: [
    {
      name: 'Users can view their own hiperfocos',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert their own hiperfocos',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update their own hiperfocos',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete their own hiperfocos',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  tarefas: [
    {
      name: 'Users can view their own tarefas',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert their own tarefas',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update their own tarefas',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete their own tarefas',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  sessoes_alternancia: [
    {
      name: 'Users can view their own sessoes',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert their own sessoes',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update their own sessoes',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete their own sessoes',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  meal_plans: [
    {
      name: 'Users can view own meal plans',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert own meal plans',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update own meal plans',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete own meal plans',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  meal_records: [
    {
      name: 'Users can view own meal records',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert own meal records',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update own meal records',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete own meal records',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  hydration_tracking: [
    {
      name: 'Users can view own hydration data',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert own hydration data',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update own hydration data',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete own hydration data',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  recipes: [
    {
      name: 'Users can view own recipes',
      command: 'SELECT',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can insert own recipes',
      command: 'INSERT',
      check: 'auth.uid() = user_id',
    },
    {
      name: 'Users can update own recipes',
      command: 'UPDATE',
      using: 'auth.uid() = user_id',
    },
    {
      name: 'Users can delete own recipes',
      command: 'DELETE',
      using: 'auth.uid() = user_id',
    },
  ],
  recipe_categories: [
    {
      name: 'Anyone can view recipe categories',
      command: 'SELECT',
      using: 'true',
    },
  ],
}

async function enableRLSOnTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
    })

    if (error) {
      console.error(`❌ Erro ao habilitar RLS na tabela ${tableName}:`, error.message)
      return false
    }

    console.log(`✅ RLS habilitado na tabela: ${tableName}`)
    return true
  } catch (error) {
    console.error(`❌ Erro inesperado ao habilitar RLS na tabela ${tableName}:`, error)
    return false
  }
}

async function createPolicy(tableName: string, policy: any): Promise<boolean> {
  try {
    // Primeiro, tentar remover a política se ela existir
    await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "${policy.name}" ON ${tableName};`
    })

    // Criar a nova política
    let sql = `CREATE POLICY "${policy.name}" ON ${tableName} FOR ${policy.command}`
    
    if (policy.using) {
      sql += ` USING (${policy.using})`
    }
    
    if (policy.check) {
      sql += ` WITH CHECK (${policy.check})`
    }
    
    sql += ';'

    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error(`❌ Erro ao criar política "${policy.name}" na tabela ${tableName}:`, error.message)
      return false
    }

    console.log(`✅ Política criada: ${policy.name} (${tableName})`)
    return true
  } catch (error) {
    console.error(`❌ Erro inesperado ao criar política "${policy.name}" na tabela ${tableName}:`, error)
    return false
  }
}

async function verifyRLSStatus(): Promise<void> {
  try {
    console.log('\n🔍 Verificando status do RLS...')
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename = ANY($1)
        ORDER BY tablename;
      `,
      params: [TABLES_WITH_RLS]
    })

    if (error) {
      console.error('❌ Erro ao verificar status do RLS:', error.message)
      return
    }

    console.log('\n📋 Status do RLS por tabela:')
    data?.forEach((row: any) => {
      const status = row.rls_enabled ? '✅ Habilitado' : '❌ Desabilitado'
      console.log(`  ${row.tablename}: ${status}`)
    })
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar RLS:', error)
  }
}

async function verifyPolicies(): Promise<void> {
  try {
    console.log('\n🔍 Verificando políticas criadas...')
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          policyname,
          cmd
        FROM pg_policies 
        WHERE schemaname = 'public'
          AND tablename = ANY($1)
        ORDER BY tablename, policyname;
      `,
      params: [TABLES_WITH_RLS]
    })

    if (error) {
      console.error('❌ Erro ao verificar políticas:', error.message)
      return
    }

    console.log('\n📋 Políticas criadas:')
    let currentTable = ''
    data?.forEach((row: any) => {
      if (row.tablename !== currentTable) {
        currentTable = row.tablename
        console.log(`\n  ${currentTable}:`)
      }
      console.log(`    ✅ ${row.policyname} (${row.cmd})`)
    })
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar políticas:', error)
  }
}

async function main(): Promise<void> {
  console.log('🚀 Iniciando aplicação de políticas RLS...\n')

  let successCount = 0
  let totalOperations = 0

  // 1. Habilitar RLS em todas as tabelas
  console.log('📋 Habilitando RLS nas tabelas...')
  for (const tableName of TABLES_WITH_RLS) {
    totalOperations++
    const success = await enableRLSOnTable(tableName)
    if (success) successCount++
  }

  // 2. Criar políticas para cada tabela
  console.log('\n🔐 Criando políticas RLS...')
  for (const [tableName, policies] of Object.entries(RLS_POLICIES)) {
    for (const policy of policies) {
      totalOperations++
      const success = await createPolicy(tableName, policy)
      if (success) successCount++
    }
  }

  // 3. Verificar resultados
  await verifyRLSStatus()
  await verifyPolicies()

  // 4. Resumo final
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO DA APLICAÇÃO DE POLÍTICAS RLS')
  console.log('='.repeat(50))
  console.log(`✅ Operações bem-sucedidas: ${successCount}/${totalOperations}`)
  console.log(`📋 Tabelas processadas: ${TABLES_WITH_RLS.length}`)
  
  if (successCount === totalOperations) {
    console.log('\n🎉 Todas as políticas RLS foram aplicadas com sucesso!')
    console.log('🔒 O sistema agora está protegido com isolamento de dados por usuário.')
  } else {
    console.log('\n⚠️  Algumas operações falharam. Verifique os logs acima.')
    process.exit(1)
  }
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
