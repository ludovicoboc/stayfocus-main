/**
 * Utilitários para migração de dados do localStorage para o servidor
 */

import { alimentacaoService } from '@/app/lib/services/alimentacao'

export interface LocalStorageData {
  planosRefeicao: Array<{
    id: string
    time: string
    description: string
    is_active: boolean
  }>
  registrosRefeicao: Array<{
    id: string
    date: string
    time: string
    description: string
    meal_type?: string
    photo_url?: string
  }>
  hidratacao: {
    coposBebidos: number
    metaDiaria: number
    ultimoRegistro: string | null
    data: string
  }
}

/**
 * Extrai dados do localStorage
 */
export function extractLocalStorageData(): LocalStorageData | null {
  try {
    // Extrair dados do Zustand store
    const alimentacaoStore = localStorage.getItem('alimentacao-store')
    
    if (!alimentacaoStore) {
      console.log('Nenhum dado encontrado no localStorage')
      return null
    }

    const data = JSON.parse(alimentacaoStore)
    
    return {
      planosRefeicao: data.state?.planosRefeicao || [],
      registrosRefeicao: data.state?.registrosRefeicao || [],
      hidratacao: {
        coposBebidos: data.state?.coposBebidos || 0,
        metaDiaria: data.state?.metaDiaria || 8,
        ultimoRegistro: data.state?.ultimoRegistro || null,
        data: new Date().toISOString().split('T')[0], // Data atual
      }
    }
  } catch (error) {
    console.error('Erro ao extrair dados do localStorage:', error)
    return null
  }
}

/**
 * Migra planos de refeição para o servidor
 */
export async function migrateMealPlans(planos: LocalStorageData['planosRefeicao']) {
  const results = {
    success: 0,
    errors: 0,
    details: [] as Array<{ plano: any; error?: string }>
  }

  for (const plano of planos) {
    try {
      await alimentacaoService.createMealPlan(plano.time, plano.description)
      results.success++
      results.details.push({ plano })
      console.log(`✅ Plano migrado: ${plano.time} - ${plano.description}`)
    } catch (error) {
      results.errors++
      results.details.push({ 
        plano, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      })
      console.error(`❌ Erro ao migrar plano: ${plano.time} - ${plano.description}`, error)
    }
  }

  return results
}

/**
 * Migra registros de refeição para o servidor
 */
export async function migrateMealRecords(registros: LocalStorageData['registrosRefeicao']) {
  const results = {
    success: 0,
    errors: 0,
    details: [] as Array<{ registro: any; error?: string }>
  }

  for (const registro of registros) {
    try {
      await alimentacaoService.createMealRecord(
        registro.date,
        registro.time,
        registro.description,
        registro.meal_type,
        registro.photo_url
      )
      results.success++
      results.details.push({ registro })
      console.log(`✅ Registro migrado: ${registro.date} ${registro.time} - ${registro.description}`)
    } catch (error) {
      results.errors++
      results.details.push({ 
        registro, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      })
      console.error(`❌ Erro ao migrar registro: ${registro.date} ${registro.time}`, error)
    }
  }

  return results
}

/**
 * Migra dados de hidratação para o servidor
 */
export async function migrateHydrationData(hidratacao: LocalStorageData['hidratacao']) {
  const results = {
    success: 0,
    errors: 0,
    details: [] as Array<{ action: string; error?: string }>
  }

  try {
    // Criar registros de hidratação baseados nos copos bebidos
    const amountPerGlass = 250 // ml por copo
    const totalAmount = hidratacao.coposBebidos * amountPerGlass

    if (totalAmount > 0) {
      // Criar um registro de hidratação para o dia atual
      await alimentacaoService.createHydrationRecord(
        totalAmount,
        hidratacao.data,
        hidratacao.ultimoRegistro || undefined
      )
      
      results.success++
      results.details.push({ 
        action: `Hidratação migrada: ${hidratacao.coposBebidos} copos (${totalAmount}ml)` 
      })
      console.log(`✅ Hidratação migrada: ${hidratacao.coposBebidos} copos`)
    } else {
      results.details.push({ 
        action: 'Nenhum dado de hidratação para migrar' 
      })
    }
  } catch (error) {
    results.errors++
    results.details.push({ 
      action: 'Migração de hidratação', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    })
    console.error('❌ Erro ao migrar hidratação:', error)
  }

  return results
}

/**
 * Executa migração completa dos dados
 */
export async function migrateAllData(): Promise<{
  success: boolean
  summary: {
    mealPlans: { success: number; errors: number }
    mealRecords: { success: number; errors: number }
    hydration: { success: number; errors: number }
  }
  details: any
}> {
  console.log('🚀 Iniciando migração de dados...')
  
  const localData = extractLocalStorageData()
  
  if (!localData) {
    return {
      success: false,
      summary: {
        mealPlans: { success: 0, errors: 0 },
        mealRecords: { success: 0, errors: 0 },
        hydration: { success: 0, errors: 0 }
      },
      details: { error: 'Nenhum dado encontrado no localStorage' }
    }
  }

  console.log('📊 Dados encontrados:', {
    planos: localData.planosRefeicao.length,
    registros: localData.registrosRefeicao.length,
    hidratacao: localData.hidratacao.coposBebidos > 0 ? 'Sim' : 'Não'
  })

  // Migrar planos de refeição
  const mealPlansResult = await migrateMealPlans(localData.planosRefeicao)
  
  // Migrar registros de refeição
  const mealRecordsResult = await migrateMealRecords(localData.registrosRefeicao)
  
  // Migrar dados de hidratação
  const hydrationResult = await migrateHydrationData(localData.hidratacao)

  const summary = {
    mealPlans: { success: mealPlansResult.success, errors: mealPlansResult.errors },
    mealRecords: { success: mealRecordsResult.success, errors: mealRecordsResult.errors },
    hydration: { success: hydrationResult.success, errors: hydrationResult.errors }
  }

  const totalSuccess = summary.mealPlans.success + summary.mealRecords.success + summary.hydration.success
  const totalErrors = summary.mealPlans.errors + summary.mealRecords.errors + summary.hydration.errors

  console.log('📈 Resumo da migração:', summary)
  console.log(`✅ Total de sucessos: ${totalSuccess}`)
  console.log(`❌ Total de erros: ${totalErrors}`)

  return {
    success: totalErrors === 0,
    summary,
    details: {
      mealPlans: mealPlansResult.details,
      mealRecords: mealRecordsResult.details,
      hydration: hydrationResult.details
    }
  }
}

/**
 * Cria backup dos dados locais antes da migração
 */
export function createLocalBackup(): string | null {
  try {
    const localData = extractLocalStorageData()
    if (!localData) return null

    const backup = {
      timestamp: new Date().toISOString(),
      data: localData
    }

    const backupString = JSON.stringify(backup, null, 2)
    
    // Salvar no localStorage com chave específica
    localStorage.setItem('alimentacao-backup', backupString)
    
    console.log('💾 Backup criado com sucesso')
    return backupString
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error)
    return null
  }
}

/**
 * Limpa dados locais após migração bem-sucedida
 */
export function clearLocalDataAfterMigration(): boolean {
  try {
    // Manter o backup, mas limpar os dados principais
    const alimentacaoStore = localStorage.getItem('alimentacao-store')
    
    if (alimentacaoStore) {
      const data = JSON.parse(alimentacaoStore)
      
      // Resetar apenas os dados migrados, manter configurações
      data.state = {
        ...data.state,
        planosRefeicao: [],
        registrosRefeicao: [],
        coposBebidos: 0,
        ultimoRegistro: null,
        // Manter metaDiaria e outras configurações
      }
      
      localStorage.setItem('alimentacao-store', JSON.stringify(data))
      console.log('🧹 Dados locais limpos após migração')
      return true
    }
    
    return false
  } catch (error) {
    console.error('❌ Erro ao limpar dados locais:', error)
    return false
  }
}
