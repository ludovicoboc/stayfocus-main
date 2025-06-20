import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      return getSessoes(req, res)
    case 'POST':
      return createSessao(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}

// GET /api/sessoes - Listar sessões do usuário
async function getSessoes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      user_id, 
      concluida, 
      limit = 50, 
      offset = 0,
      order_by = 'tempo_inicio',
      order_direction = 'desc'
    } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    let query = supabase
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
          cor
        ),
        hiperfoco_anterior:hiperfocos!sessoes_alternancia_hiperfoco_anterior_fkey(
          id,
          titulo,
          cor
        )
      `)
      .eq('user_id', user_id)
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    // Filtrar por status se fornecido
    if (concluida !== undefined && concluida !== 'all') {
      query = query.eq('concluida', concluida === 'true')
    }

    // Ordenação
    const validOrderBy = ['tempo_inicio', 'created_at', 'duracao_estimada', 'titulo']
    const validDirection = ['asc', 'desc']
    
    if (validOrderBy.includes(order_by as string) && validDirection.includes(order_direction as string)) {
      query = query.order(order_by as string, { ascending: order_direction === 'asc' })
    } else {
      query = query.order('tempo_inicio', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching sessoes:', error)
      return res.status(500).json({ error: 'Failed to fetch sessoes' })
    }

    return res.status(200).json({
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error in getSessoes:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/sessoes - Criar nova sessão
async function createSessao(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      user_id, 
      titulo, 
      hiperfoco_atual, 
      duracao_estimada,
      tempo_inicio 
    } = req.body

    // Validações básicas
    if (!user_id || !titulo || !duracao_estimada) {
      return res.status(400).json({ 
        error: 'user_id, titulo and duracao_estimada are required' 
      })
    }

    // Validar título
    if (titulo.length > 255) {
      return res.status(400).json({ 
        error: 'titulo must be 255 characters or less' 
      })
    }

    // Validar duração estimada
    if (duracao_estimada <= 0) {
      return res.status(400).json({ 
        error: 'duracao_estimada must be positive' 
      })
    }

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
    }

    const { data, error } = await supabase
      .from('sessoes_alternancia')
      .insert({
        user_id,
        titulo,
        hiperfoco_atual: hiperfoco_atual || null,
        hiperfoco_anterior: null,
        tempo_inicio: tempo_inicio || new Date().toISOString(),
        duracao_estimada,
        concluida: false
      })
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
      console.error('Error creating sessao:', error)
      return res.status(500).json({ error: 'Failed to create sessao' })
    }

    return res.status(201).json({ data })
  } catch (error) {
    console.error('Error in createSessao:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
