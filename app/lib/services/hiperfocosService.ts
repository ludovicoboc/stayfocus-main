import { createClient } from '@/app/lib/supabase/client'
import type { Hiperfoco, Tarefa, SessaoAlternancia } from '@/app/stores/hiperfocosStore'

const supabase = createClient()

// Tipos para inserção/atualização
type HiperfocoInsert = Omit<Hiperfoco, 'id' | 'tarefas' | 'subTarefas' | 'dataCriacao'>
type TarefaInsert = Omit<Tarefa, 'id'>
type SubTarefaInsert = Omit<Tarefa, 'id'> // Sub-tarefas têm a mesma estrutura de Tarefas
type SessaoInsert = Omit<SessaoAlternancia, 'id'>

// --- Funções de Leitura (Fetch) ---

export const fetchHiperfocosData = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Usuário não autenticado.')
  const userId = userData.user.id

  const { data: hiperfocos, error: hiperfocosError } = await supabase
    .from('hiperfocos')
    .select('*')
    .eq('user_id', userId)

  if (hiperfocosError) throw hiperfocosError

  // Para cada hiperfoco, buscar suas tarefas e sessões
  const hiperfocosCompletos = await Promise.all(
    hiperfocos.map(async (h) => {
      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('hiperfoco_id', h.id)

      if (tarefasError) throw tarefasError

      const tarefasComSubtarefas = await Promise.all(
        tarefas.map(async (t) => {
          const { data: subTarefas, error: subTarefasError } = await supabase
            .from('sub_tarefas')
            .select('*')
            .eq('tarefa_id', t.id)

          if (subTarefasError) throw subTarefasError
          return { ...t, subTarefas: subTarefas || [] }
        })
      )

      const subTarefasMap = tarefasComSubtarefas.reduce((acc, t) => {
          acc[t.id] = t.subTarefas;
          return acc;
      }, {} as Record<string, Tarefa[]>)


      return { ...h, tarefas: tarefasComSubtarefas.map(({subTarefas, ...rest}) => rest), subTarefas: subTarefasMap }
    })
  )

  const { data: sessoes, error: sessoesError } = await supabase
    .from('sessoes_hiperfoco')
    .select('*')
    .eq('user_id', userId)

  if (sessoesError) throw sessoesError

  return { hiperfocos: hiperfocosCompletos, sessoes: sessoes || [] }
}


// --- Funções de Hiperfoco ---

export const addHiperfoco = async (hiperfoco: HiperfocoInsert) => {
  const { data, error } = await supabase.from('hiperfocos').insert(hiperfoco).select().single()
  if (error) throw error
  return { ...data, tarefas: [], subTarefas: {} } // Retorna com a estrutura completa
}

export const updateHiperfoco = async (id: string, updates: Partial<HiperfocoInsert>) => {
  const { data, error } = await supabase.from('hiperfocos').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteHiperfoco = async (id: string) => {
  const { error } = await supabase.from('hiperfocos').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Tarefa ---

export const addTarefa = async (tarefa: TarefaInsert, hiperfocoId: string) => {
  const { data, error } = await supabase.from('tarefas').insert({ ...tarefa, hiperfoco_id: hiperfocoId }).select().single()
  if (error) throw error
  return data
}

export const updateTarefa = async (id: string, updates: Partial<TarefaInsert>) => {
    const { data, error } = await supabase.from('tarefas').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
}

export const deleteTarefa = async (id: string) => {
  const { error } = await supabase.from('tarefas').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Sub-tarefa ---

export const addSubTarefa = async (subTarefa: SubTarefaInsert, tarefaId: string) => {
  const { data, error } = await supabase.from('sub_tarefas').insert({ ...subTarefa, tarefa_id: tarefaId }).select().single()
  if (error) throw error
  return data
}

export const updateSubTarefa = async (id: string, updates: Partial<SubTarefaInsert>) => {
    const { data, error } = await supabase.from('sub_tarefas').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
}

export const deleteSubTarefa = async (id: string) => {
  const { error } = await supabase.from('sub_tarefas').delete().eq('id', id)
  if (error) throw error
}

// --- Funções de Sessão de Alternância ---

export const addSessao = async (sessao: SessaoInsert) => {
  const { data, error } = await supabase.from('sessoes_hiperfoco').insert(sessao).select().single()
  if (error) throw error
  return data
}

export const updateSessao = async (id: string, updates: Partial<SessaoInsert>) => {
    const { data, error } = await supabase.from('sessoes_hiperfoco').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
}

export const deleteSessao = async (id: string) => {
  const { error } = await supabase.from('sessoes_hiperfoco').delete().eq('id', id)
  if (error) throw error
}