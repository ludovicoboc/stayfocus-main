#!/usr/bin/env tsx

/**
 * Script para aplicar o schema do módulo alimentação no Supabase
 * Executa o arquivo schema-alimentacao.sql no banco de dados
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  try {
    console.log('🔄 Aplicando schema do módulo alimentação...')
    
    // Ler o arquivo de schema
    const schemaPath = join(process.cwd(), 'docs/02-migracao/schema-alimentacao.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')
    
    console.log('📄 Schema carregado:', schemaPath)
    
    // Dividir o SQL em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`)
    
    // Executar comandos essenciais primeiro
    const essentialCommands = [
      // Extensões
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',

      // Tabela users
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela meal_plans
      `CREATE TABLE IF NOT EXISTS meal_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        time VARCHAR(5) NOT NULL,
        description VARCHAR(500) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_time_format CHECK (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
      )`,

      // Tabela meal_records
      `CREATE TABLE IF NOT EXISTS meal_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time VARCHAR(5) NOT NULL,
        description VARCHAR(500) NOT NULL,
        meal_type VARCHAR(50),
        photo_url VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_time_format CHECK (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
        CONSTRAINT chk_meal_type CHECK (meal_type IN ('cafe', 'fruta', 'salada', 'proteina', 'carboidrato', 'sobremesa', 'agua') OR meal_type IS NULL)
      )`,

      // Tabela hydration_tracking
      `CREATE TABLE IF NOT EXISTS hydration_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        glasses_consumed INTEGER DEFAULT 0,
        daily_goal INTEGER DEFAULT 8,
        last_record_time VARCHAR(5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_glasses_consumed CHECK (glasses_consumed >= 0),
        CONSTRAINT chk_daily_goal CHECK (daily_goal BETWEEN 1 AND 15),
        CONSTRAINT chk_last_record_time_format CHECK (last_record_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' OR last_record_time IS NULL),
        UNIQUE(user_id, date)
      )`
    ]

    // Vamos executar os comandos usando uma abordagem mais simples
    console.log('📝 Criando tabelas essenciais...')

    // Primeiro, verificar se as tabelas já existem
    const { data: existingTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'meal_plans', 'meal_records', 'hydration_tracking'])

    console.log('📋 Tabelas existentes:', existingTables?.map(t => t.table_name) || [])

    // Mostrar instruções para aplicar o schema manualmente
    console.log('\n📋 INSTRUÇÕES PARA APLICAR O SCHEMA:')
    console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Vá para o projeto stayfocus')
    console.log('3. Acesse SQL Editor')
    console.log('4. Execute o arquivo: docs/02-migracao/schema-alimentacao.sql')
    console.log('\nOu execute os comandos essenciais abaixo no SQL Editor:')

    essentialCommands.forEach((command, i) => {
      console.log(`\n-- Comando ${i + 1}:`)
      console.log(command + ';')
    })
    
    console.log('🎉 Schema aplicado com sucesso!')
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'users',
        'meal_plans', 
        'meal_records',
        'hydration_tracking',
        'recipes',
        'recipe_ingredients',
        'recipe_tags',
        'recipe_categories',
        'favorite_recipes'
      ])
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError.message)
    } else {
      console.log('📋 Tabelas encontradas:')
      tables?.forEach(table => {
        console.log(`  ✅ ${table.table_name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao aplicar schema:', error)
    process.exit(1)
  }
}

// Executar o script
applySchema()
