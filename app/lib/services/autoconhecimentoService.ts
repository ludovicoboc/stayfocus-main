import { createClient } from '@/app/lib/supabase/client'
import type { Nota } from '@/app/stores/autoconhecimentoStore'

const supabase = createClient()

type NotaInsert = Omit<Nota, 'id' | 'dataCriacao' | 'dataAtualizacao'>

// --- Funções de Leitura (Fetch) ---

export const fetchNotas = async () => {
  const { data, error } = await supabase.from('autoconhecimento_notas').select('*')
  if (error) throw error
  return data || []
}

// --- Funções de Escrita (Mutations) ---

export const addNota = async (nota: NotaInsert) => {
  const { data, error } = await supabase.from('autoconhecimento_notas').insert(nota).select().single()
  if (error) throw error
  return data
}

export const updateNota = async (id: string, updates: Partial<NotaInsert>) => {
  const { data, error } = await supabase.from('autoconhecimento_notas').update({ ...updates, data_atualizacao: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteNota = async (id: string) => {
  const { error } = await supabase.from('autoconhecimento_notas').delete().eq('id', id)
  if (error) throw error
}