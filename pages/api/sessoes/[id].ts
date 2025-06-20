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
    return res.status(400).json({ error: 'Valid sessao ID is required' })
  }

  switch (method) {
    case 'GET':
      return getSessao(req, res, id)
    case 'PUT':
      return updateSessao(req, res, id)
    case 'DELETE':
      return deleteSessao(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}

// GET /api/sessoes/[id] - Buscar sessão específica
async function getSessao(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const { data, error } = await supabase
      .from('sessoes_alternancia')
      .select(`
        id,
        titulo,
        tempo_inicio,
        duracao_estimada,
        duracao_real,
        concluida,
        created_at,
        updated_at,
        hiperfoco_atual:hiperfocos!sessoes_alternancia_hiperfoco_atual_fkey(
          id,
          titulo,
          cor,
          descricao
        ),
        hiperfoco_anterior:hiperfocos!sessoes_alternancia_hiperfoco_anterior_fkey(
          id,
          titulo,
          cor,
          descricao
        )
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Sessao not found' })
      }
      console.error('Error fetching sessao:', error)
      return res.status(500).json({ error: 'Failed to fetch sessao' })
    }

    return res.status(200).json({ data })
  } catch (error) {
    console.error('Error in getSessao:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/sessoes/[id] - Atualizar sessão
async function updateSessao(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { 
      user_id, 
      titulo, 
      hiperfoco_atual, 
      duracao_estimada,
      duracao_real,
      concluida 
    } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Buscar sessão atual para verificar permissões
    const { data: sessaoAtual, error: fetchError } = await supabase
      .from('sessoes_alternancia')
      .select('id, hiperfoco_atual')
      .eq('id', id)
      .eq('user_id', user_id)
      .single()

    if (fetchError || !sessaoAtual) {
      return res.status(404).json({ error: 'Sessao not found' })
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

    if (duracao_estimada !== undefined) {
      if (duracao_estimada <= 0) {
        return res.status(400).json({ 
          error: 'duracao_estimada must be positive' 
        })
      }
      updateData.duracao_estimada = duracao_estimada
    }

    if (duracao_real !== undefined) {
      if (duracao_real !== null && duracao_real <= 0) {
        return res.status(400).json({ 
          error: 'duracao_real must be positive or null' 
        })
      }
      updateData.duracao_real = duracao_real
    }

    if (concluida !== undefined) {
      updateData.concluida = Boolean(concluida)
    }

    // Lidar com mudança de hiperfoco
    if (hiperfoco_atual !== undefined) {
      // Verificar se o hiperfoco existe e pertence ao usuário (se fornecido)
      if (hiperfoco_atual) {
        const { data: hiperfoco, error: hiperfocoError } = await supabase
          .from('hiperfocos')
          .select('id')
          .eq('id', hiperfoco_atual)
          .eq('user_id', user_id)
          .single()

        if (hiperfocoError || !hiperfoco) {
          return res.status(400).json({ 
            error: 'hiperfoco_atual not found or access denied' 
          })
        }

        // Se está mudando o hiperfoco, salvar o anterior
        if (sessaoAtual.hiperfoco_atual && sessaoAtual.hiperfoco_atual !== hiperfoco_atual) {
          updateData.hiperfoco_anterior = sessaoAtual.hiperfoco_atual
        }
      }

      updateData.hiperfoco_atual = hiperfoco_atual || null
    }

    // Verificar se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const { data, error } = await supabase
      .from('sessoes_alternancia')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select(`
        id,
        titulo,
        tempo_inicio,
        duracao_estimada,
        duracao_real,
        concluida,
        created_at,
        updated_at,
        hiperfoco_atual:hiperfocos!sessoes_alternancia_hiperfoco_atual_fkey(
          id,
          titulo,
          cor
        ),
        hiperfoco_anterior:hiperfocos!sessoes_alternancia_hiperfoco_anterior_fkey(
          id,
          titulo,
          cor
        )
      `)
      .single()

    if (error) {
      console.error('Error updating sessao:', error)
      return res.status(500).json({ error: 'Failed to update sessao' })
    }

    return res.status(200).json({ data })
  } catch (error) {
    console.error('Error in updateSessao:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/sessoes/[id] - Deletar sessão
async function deleteSessao(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    const { error } = await supabase
      .from('sessoes_alternancia')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)

    if (error) {
      console.error('Error deleting sessao:', error)
      return res.status(500).json({ error: 'Failed to delete sessao' })
    }

    return res.status(204).end()
  } catch (error) {
    console.error('Error in deleteSessao:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
