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
    return res.status(400).json({ error: 'Valid hiperfoco ID is required' })
  }

  switch (method) {
    case 'GET':
      return getHiperfoco(req, res, id)
    case 'PUT':
      return updateHiperfoco(req, res, id)
    case 'DELETE':
      return deleteHiperfoco(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}

// GET /api/hiperfocos/[id] - Buscar hiperfoco específico
async function getHiperfoco(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const { data, error } = await supabase
      .from('hiperfocos')
      .select(`
        id,
        titulo,
        descricao,
        cor,
        tempo_limite,
        status,
        data_criacao,
        created_at,
        updated_at,
        tarefas:tarefas(
          id,
          texto,
          concluida,
          cor,
          ordem,
          nivel,
          parent_id,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Hiperfoco not found' })
      }
      console.error('Error fetching hiperfoco:', error)
      return res.status(500).json({ error: 'Failed to fetch hiperfoco' })
    }

    // Organizar tarefas em hierarquia
    const hiperfocoWithHierarchy = {
      ...data,
      tarefas: organizarTarefasHierarquia(data.tarefas || [])
    }

    return res.status(200).json({ data: hiperfocoWithHierarchy })
  } catch (error) {
    console.error('Error in getHiperfoco:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/hiperfocos/[id] - Atualizar hiperfoco
async function updateHiperfoco(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id, titulo, descricao, cor, tempo_limite, status } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Preparar dados para atualização
    const updateData: any = {}

    if (titulo !== undefined) {
      if (!titulo || titulo.length > 255) {
        return res.status(400).json({ 
          error: 'titulo is required and must be 255 characters or less' 
        })
      }
      updateData.titulo = titulo
    }

    if (descricao !== undefined) {
      updateData.descricao = descricao || null
    }

    if (cor !== undefined) {
      const corRegex = /^#[0-9A-Fa-f]{6}$/
      if (!corRegex.test(cor)) {
        return res.status(400).json({ 
          error: 'cor must be a valid hex color (e.g., #FF5252)' 
        })
      }
      updateData.cor = cor
    }

    if (tempo_limite !== undefined) {
      if (tempo_limite !== null && tempo_limite <= 0) {
        return res.status(400).json({ 
          error: 'tempo_limite must be positive or null' 
        })
      }
      updateData.tempo_limite = tempo_limite
    }

    if (status !== undefined) {
      const validStatuses = ['ativo', 'pausado', 'concluido', 'arquivado']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `status must be one of: ${validStatuses.join(', ')}` 
        })
      }
      updateData.status = status
    }

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const { data, error } = await supabase
      .from('hiperfocos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Hiperfoco not found' })
      }
      console.error('Error updating hiperfoco:', error)
      return res.status(500).json({ error: 'Failed to update hiperfoco' })
    }

    return res.status(200).json({ data })
  } catch (error) {
    console.error('Error in updateHiperfoco:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/hiperfocos/[id] - Deletar hiperfoco
async function deleteHiperfoco(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const { error } = await supabase
      .from('hiperfocos')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)

    if (error) {
      console.error('Error deleting hiperfoco:', error)
      return res.status(500).json({ error: 'Failed to delete hiperfoco' })
    }

    return res.status(204).end()
  } catch (error) {
    console.error('Error in deleteHiperfoco:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Função auxiliar para organizar tarefas em hierarquia
function organizarTarefasHierarquia(tarefas: any[]): any[] {
  const tarefasMap = new Map()
  const tarefasPrincipais: any[] = []

  // Primeiro, criar um mapa de todas as tarefas
  tarefas.forEach(tarefa => {
    tarefasMap.set(tarefa.id, { ...tarefa, subtarefas: [] })
  })

  // Depois, organizar a hierarquia
  tarefas.forEach(tarefa => {
    const tarefaCompleta = tarefasMap.get(tarefa.id)
    
    if (tarefa.parent_id) {
      // É uma subtarefa
      const pai = tarefasMap.get(tarefa.parent_id)
      if (pai) {
        pai.subtarefas.push(tarefaCompleta)
      }
    } else {
      // É uma tarefa principal
      tarefasPrincipais.push(tarefaCompleta)
    }
  })

  // Ordenar por ordem
  const ordenarPorOrdem = (lista: any[]) => {
    lista.sort((a, b) => a.ordem - b.ordem)
    lista.forEach(item => {
      if (item.subtarefas && item.subtarefas.length > 0) {
        ordenarPorOrdem(item.subtarefas)
      }
    })
  }

  ordenarPorOrdem(tarefasPrincipais)
  return tarefasPrincipais
}
