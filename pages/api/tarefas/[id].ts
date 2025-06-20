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

  switch (method) {
    case 'GET':
      return getTarefa(req, res, id)
    case 'PUT':
      return updateTarefa(req, res, id)
    case 'DELETE':
      return deleteTarefa(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}

// GET /api/tarefas/[id] - Buscar tarefa específica
async function getTarefa(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const { data, error } = await supabase
      .from('tarefas')
      .select(`
        *,
        hiperfoco:hiperfocos(id, user_id),
        subtarefas:tarefas!parent_id(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tarefa not found' })
      }
      console.error('Error fetching tarefa:', error)
      return res.status(500).json({ error: 'Failed to fetch tarefa' })
    }

    // Verificar se o hiperfoco pertence ao usuário
    if (!data.hiperfoco || data.hiperfoco.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Remover dados sensíveis do hiperfoco
    const { hiperfoco, ...tarefaData } = data
    const result = {
      ...tarefaData,
      subtarefas: data.subtarefas?.sort((a: any, b: any) => a.ordem - b.ordem) || []
    }

    return res.status(200).json({ data: result })
  } catch (error) {
    console.error('Error in getTarefa:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/tarefas/[id] - Atualizar tarefa
async function updateTarefa(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id, texto, concluida, cor, ordem, parent_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Buscar tarefa atual para verificar permissões
    const { data: tarefaAtual, error: fetchError } = await supabase
      .from('tarefas')
      .select(`
        *,
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

    // Preparar dados para atualização
    const updateData: any = {}

    if (texto !== undefined) {
      if (!texto || texto.length > 500) {
        return res.status(400).json({ 
          error: 'texto is required and must be 500 characters or less' 
        })
      }
      updateData.texto = texto
    }

    if (concluida !== undefined) {
      updateData.concluida = Boolean(concluida)
    }

    if (cor !== undefined) {
      if (cor && !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
        return res.status(400).json({ 
          error: 'cor must be a valid hex color (e.g., #FF5252) or null' 
        })
      }
      updateData.cor = cor || null
    }

    if (ordem !== undefined) {
      if (ordem < 0) {
        return res.status(400).json({ 
          error: 'ordem must be non-negative' 
        })
      }
      updateData.ordem = ordem
    }

    // Lidar com mudança de parent_id (mover tarefa na hierarquia)
    if (parent_id !== undefined) {
      let novoNivel = 0

      if (parent_id) {
        // Verificar se o novo pai existe e pertence ao mesmo hiperfoco
        const { data: novoParent, error: parentError } = await supabase
          .from('tarefas')
          .select('nivel, hiperfoco_id')
          .eq('id', parent_id)
          .single()

        if (parentError || !novoParent) {
          return res.status(400).json({ error: 'Parent task not found' })
        }

        if (novoParent.hiperfoco_id !== tarefaAtual.hiperfoco_id) {
          return res.status(400).json({ 
            error: 'Parent task must belong to the same hiperfoco' 
          })
        }

        // Verificar se não está criando ciclo (tarefa não pode ser pai de si mesma)
        if (parent_id === id) {
          return res.status(400).json({ 
            error: 'Task cannot be parent of itself' 
          })
        }

        novoNivel = novoParent.nivel + 1

        // Verificar limite de níveis
        if (novoNivel > 5) {
          return res.status(400).json({ 
            error: 'Maximum hierarchy level (5) exceeded' 
          })
        }
      }

      updateData.parent_id = parent_id || null
      updateData.nivel = novoNivel
    }

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const { data, error } = await supabase
      .from('tarefas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tarefa:', error)
      return res.status(500).json({ error: 'Failed to update tarefa' })
    }

    return res.status(200).json({ data })
  } catch (error) {
    console.error('Error in updateTarefa:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/tarefas/[id] - Deletar tarefa
async function deleteTarefa(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Buscar tarefa para verificar permissões
    const { data: tarefa, error: fetchError } = await supabase
      .from('tarefas')
      .select(`
        id,
        hiperfoco:hiperfocos(id, user_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !tarefa) {
      return res.status(404).json({ error: 'Tarefa not found' })
    }

    // Verificar se o hiperfoco pertence ao usuário
    if (!tarefa.hiperfoco || tarefa.hiperfoco.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Deletar tarefa (CASCADE irá deletar subtarefas automaticamente)
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tarefa:', error)
      return res.status(500).json({ error: 'Failed to delete tarefa' })
    }

    return res.status(204).end()
  } catch (error) {
    console.error('Error in deleteTarefa:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
