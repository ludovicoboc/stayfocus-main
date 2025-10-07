import { createClient } from '@/app/lib/supabase/client'
import type { Categoria, Transacao, Envelope, PagamentoRecorrente } from '@/app/stores/financasStore'

const supabase = createClient()

// Tipos para inserção/atualização, sem os campos gerados pelo DB
type CategoriaInsert = Omit<Categoria, 'id'>
type TransacaoInsert = Omit<Transacao, 'id'>
type EnvelopeInsert = Omit<Envelope, 'id'>
type PagamentoRecorrenteInsert = Omit<PagamentoRecorrente, 'id'>

// --- Funções de Leitura (Fetch) ---

export const fetchFinancasData = async () => {
  const [
    { data: categorias, error: errorCategorias },
    { data: transacoes, error: errorTransacoes },
    { data: envelopes, error: errorEnvelopes },
    { data: pagamentosRecorrentes, error: errorPagamentosRecorrentes },
  ] = await Promise.all([
    supabase.from('financas_categorias').select('*'),
    supabase.from('financas_transacoes').select('*'),
    supabase.from('financas_envelopes').select('*'),
    supabase.from('financas_pagamentos_recorrentes').select('*'),
  ])

  if (errorCategorias || errorTransacoes || errorEnvelopes || errorPagamentosRecorrentes) {
    console.error('Erro ao buscar dados de finanças:', { errorCategorias, errorTransacoes, errorEnvelopes, errorPagamentosRecorrentes })
    throw new Error('Não foi possível carregar os dados financeiros.')
  }

  return { categorias, transacoes, envelopes, pagamentosRecorrentes }
}

// --- Funções de Categoria ---

export const addCategoria = async (categoria: CategoriaInsert) => {
  const { data, error } = await supabase.from('financas_categorias').insert(categoria).select().single()
  if (error) throw error
  return data
}

export const updateCategoria = async (id: string, updates: Partial<CategoriaInsert>) => {
  const { data, error } = await supabase.from('financas_categorias').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteCategoria = async (id: string) => {
  const { error } = await supabase.from('financas_categorias').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Transação ---

export const addTransacao = async (transacao: TransacaoInsert) => {
  const { data, error } = await supabase.from('financas_transacoes').insert(transacao).select().single()
  if (error) throw error
  return data
}

export const deleteTransacao = async (id: string) => {
  const { error } = await supabase.from('financas_transacoes').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Envelope ---

export const addEnvelope = async (envelope: EnvelopeInsert) => {
    const { data, error } = await supabase.from('financas_envelopes').insert(envelope).select().single()
    if (error) throw error
    return data
}

export const updateEnvelope = async (id: string, updates: Partial<EnvelopeInsert>) => {
    const { data, error } = await supabase.from('financas_envelopes').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
}

export const deleteEnvelope = async (id: string) => {
    const { error } = await supabase.from('financas_envelopes').delete().eq('id', id)
    if (error) throw error
}

// --- Funções de Pagamento Recorrente ---

export const addPagamentoRecorrente = async (pagamento: PagamentoRecorrenteInsert) => {
    const { data, error } = await supabase.from('financas_pagamentos_recorrentes').insert(pagamento).select().single()
    if (error) throw error
    return data
}

export const updatePagamentoRecorrente = async (id: string, updates: Partial<PagamentoRecorrenteInsert>) => {
    const { data, error } = await supabase.from('financas_pagamentos_recorrentes').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
}

export const deletePagamentoRecorrente = async (id: string) => {
    const { error } = await supabase.from('financas_pagamentos_recorrentes').delete().eq('id', id)
    if (error) throw error
}