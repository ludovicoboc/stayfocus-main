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
      return getTarefas(req, res)
    case 'POST':
      return createTarefa(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}

// GET /api/tarefas - Listar tarefas de um hiperfoco
async function getTarefas(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { hiperfoco_id, user_id, parent_id, nivel } = req.query

    if (!hiperfoco_id || !user_id) {
      return res.status(400).json({ error: 'hiperfoco_id and user_id are required' })
    }

    // Verificar se o hiperfoco pertence ao usuário
    const { data: hiperfoco, error: hiperfocoError } = await supabase
      .from('hiperfocos')
      .select('id')
      .eq('id', hiperfoco_id)
      .eq('user_id', user_id)
      .single()

    if (hiperfocoError || !hiperfoco) {
      return res.status(404).json({ error: 'Hiperfoco not found or access denied' })
    }

    let query = supabase
      .from('tarefas')
      .select('*')
      .eq('hiperfoco_id', hiperfoco_id)
      .order('ordem', { ascending: true })

    // Filtros opcionais
    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', parent_id)
      }
    }

    if (nivel !== undefined) {
      query = query.eq('nivel', Number(nivel))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tarefas:', error)
      return res.status(500).json({ error: 'Failed to fetch tarefas' })
    }

    return res.status(200).json({
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error in getTarefas:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/tarefas - Criar nova tarefa
async function createTarefa(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      hiperfoco_id, 
      user_id, 
      texto, 
      parent_id, 
      cor, 
      ordem 
    } = req.body

    // Validações básicas
    if (!hiperfoco_id || !user_id || !texto) {
      return res.status(400).json({ 
        error: 'hiperfoco_id, user_id and texto are required' 
      })
    }

    // Verificar se o hiperfoco pertence ao usuário
    const { data: hiperfoco, error: hiperfocoError } = await supabase
      .from('hiperfocos')
      .select('id')
      .eq('id', hiperfoco_id)
      .eq('user_id', user_id)
      .single()

    if (hiperfocoError || !hiperfoco) {
      return res.status(404).json({ error: 'Hiperfoco not found or access denied' })
    }

    // Validar texto
    if (texto.length > 500) {
      return res.status(400).json({ 
        error: 'texto must be 500 characters or less' 
      })
    }

    // Validar cor se fornecida
    if (cor) {
      const corRegex = /^#[0-9A-Fa-f]{6}$/
      if (!corRegex.test(cor)) {
        return res.status(400).json({ 
          error: 'cor must be a valid hex color (e.g., #FF5252)' 
        })
      }
    }

    // Determinar nível baseado no parent_id
    let nivel = 0
    if (parent_id) {
      const { data: parentTarefa, error: parentError } = await supabase
        .from('tarefas')
        .select('nivel')
        .eq('id', parent_id)
        .eq('hiperfoco_id', hiperfoco_id)
        .single()

      if (parentError || !parentTarefa) {
        return res.status(400).json({ error: 'Parent task not found' })
      }

      nivel = parentTarefa.nivel + 1

      // Verificar limite de níveis
      if (nivel > 5) {
        return res.status(400).json({ 
          error: 'Maximum hierarchy level (5) exceeded' 
        })
      }
    }

    // Determinar ordem se não fornecida
    let ordemFinal = ordem
    if (ordemFinal === undefined) {
      const { data: ultimaTarefa } = await supabase
        .from('tarefas')
        .select('ordem')
        .eq('hiperfoco_id', hiperfoco_id)
        .eq('parent_id', parent_id || null)
        .order('ordem', { ascending: false })
        .limit(1)
        .single()

      ordemFinal = ultimaTarefa ? ultimaTarefa.ordem + 1 : 0
    }

    const { data, error } = await supabase
      .from('tarefas')
      .insert({
        hiperfoco_id,
        parent_id: parent_id || null,
        texto,
        cor: cor || null,
        ordem: ordemFinal,
        nivel,
        concluida: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tarefa:', error)
      return res.status(500).json({ error: 'Failed to create tarefa' })
    }

    return res.status(201).json({ data })
  } catch (error) {
    console.error('Error in createTarefa:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
