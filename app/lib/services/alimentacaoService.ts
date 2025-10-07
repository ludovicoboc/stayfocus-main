import { createClient } from '@/app/lib/supabase/client'
import type { Refeicao, RegistroRefeicao } from '@/app/stores/alimentacaoStore'

const supabase = createClient()

// Tipos para inserção/atualização
type RefeicaoInsert = Omit<Refeicao, 'id'>
type RegistroRefeicaoInsert = Omit<RegistroRefeicao, 'id'>

// --- Funções de Leitura (Fetch) ---

export const fetchAlimentacaoData = async () => {
  const today = new Date().toISOString().split('T')[0]
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Usuário não autenticado.')
  const userId = userData.user.id

  const [
    { data: refeicoes, error: errorRefeicoes },
    { data: registros, error: errorRegistros },
    { data: hidratacao, error: errorHidratacao },
  ] = await Promise.all([
    supabase.from('alimentacao_refeicoes_programadas').select('*').eq('user_id', userId),
    supabase.from('alimentacao_registros').select('*').eq('user_id', userId),
    supabase.from('registros_hidratacao').select('*').eq('user_id', userId).eq('data', today).single(),
  ])

  if (errorRefeicoes || errorRegistros || errorHidratacao) {
    // Se o registro de hidratação não for encontrado (PGRST116), não é um erro fatal.
    if (errorHidratacao && errorHidratacao.code === 'PGRST116') {
        // não faz nada
    } else {
        console.error('Erro ao buscar dados de alimentação:', { errorRefeicoes, errorRegistros, errorHidratacao })
        throw new Error('Não foi possível carregar os dados de alimentação.')
    }
  }

  return {
    refeicoes: refeicoes || [],
    registros: registros || [],
    hidratacao: hidratacao || { copos_bebidos: 0, meta_diaria: 8, data: today }
  }
}

// --- Funções de Refeição Programada ---

export const addRefeicao = async (refeicao: RefeicaoInsert) => {
  const { data, error } = await supabase.from('alimentacao_refeicoes_programadas').insert(refeicao).select().single()
  if (error) throw error
  return data
}

export const updateRefeicao = async (id: string, updates: Partial<RefeicaoInsert>) => {
  const { data, error } = await supabase.from('alimentacao_refeicoes_programadas').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteRefeicao = async (id: string) => {
  const { error } = await supabase.from('alimentacao_refeicoes_programadas').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Registro de Refeição ---

export const addRegistroRefeicao = async (registro: RegistroRefeicaoInsert) => {
  const { data, error } = await supabase.from('alimentacao_registros').insert(registro).select().single()
  if (error) throw error
  return data
}

export const deleteRegistroRefeicao = async (id: string) => {
  const { error } = await supabase.from('alimentacao_registros').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Hidratação ---

export const upsertHidratacao = async (hidratacao: { copos_bebidos: number, meta_diaria: number, data: string }) => {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) throw new Error('Usuário não autenticado.')
    const userId = userData.user.id

    const { data, error } = await supabase.from('registros_hidratacao').upsert({ ...hidratacao, user_id: userId }).select().single()
    if (error) throw error
    return data
}