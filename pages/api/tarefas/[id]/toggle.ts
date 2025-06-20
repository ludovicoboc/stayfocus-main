import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid tarefa ID is required' })
  }

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).json({ error: `Method ${method} not allowed` })
  }

  return toggleTarefa(req, res, id)
}

// PATCH /api/tarefas/[id]/toggle - Toggle status de conclusão da tarefa
async function toggleTarefa(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Buscar tarefa atual para verificar permissões e estado
    const { data: tarefaAtual, error: fetchError } = await supabase
      .from('tarefas')
      .select(`
        id,
        concluida,
        hiperfoco:hiperfocos(id, user_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !tarefaAtual) {
      return res.status(404).json({ error: 'Tarefa not found' })
    }

    // Verificar se o hiperfoco pertence ao usuário
    if (!tarefaAtual.hiperfoco || tarefaAtual.hiperfoco.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Toggle do status
    const novoConcluida = !tarefaAtual.concluida

    const { data, error } = await supabase
      .from('tarefas')
      .update({ concluida: novoConcluida })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling tarefa:', error)
      return res.status(500).json({ error: 'Failed to toggle tarefa' })
    }

    return res.status(200).json({ 
      data,
      message: `Tarefa ${novoConcluida ? 'concluída' : 'reaberta'} com sucesso`
    })
  } catch (error) {
    console.error('Error in toggleTarefa:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
