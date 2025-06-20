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
      return getHiperfocos(req, res)
    case 'POST':
      return createHiperfoco(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: `Method ${method} not allowed` })
  }
}

// GET /api/hiperfocos - Listar hiperfocos do usuário
async function getHiperfocos(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_id, status, limit = 50, offset = 0 } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    let query = supabase
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
      .eq('user_id', user_id)
      .order('data_criacao', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    // Filtrar por status se fornecido
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching hiperfocos:', error)
      return res.status(500).json({ error: 'Failed to fetch hiperfocos' })
    }

    // Organizar tarefas em hierarquia
    const hiperfocosWithHierarchy = data?.map(hiperfoco => ({
      ...hiperfoco,
      tarefas: organizarTarefasHierarquia(hiperfoco.tarefas || [])
    }))

    return res.status(200).json({
      data: hiperfocosWithHierarchy,
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error in getHiperfocos:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/hiperfocos - Criar novo hiperfoco
async function createHiperfoco(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user_id, titulo, descricao, cor, tempo_limite } = req.body

    // Validações
    if (!user_id || !titulo || !cor) {
      return res.status(400).json({ 
        error: 'user_id, titulo and cor are required' 
      })
    }

    // Validar formato da cor
    const corRegex = /^#[0-9A-Fa-f]{6}$/
    if (!corRegex.test(cor)) {
      return res.status(400).json({ 
        error: 'cor must be a valid hex color (e.g., #FF5252)' 
      })
    }

    // Validar título
    if (titulo.length > 255) {
      return res.status(400).json({ 
        error: 'titulo must be 255 characters or less' 
      })
    }

    // Validar tempo limite
    if (tempo_limite !== undefined && tempo_limite <= 0) {
      return res.status(400).json({ 
        error: 'tempo_limite must be positive' 
      })
    }

    const { data, error } = await supabase
      .from('hiperfocos')
      .insert({
        user_id,
        titulo,
        descricao: descricao || null,
        cor,
        tempo_limite: tempo_limite || null,
        status: 'ativo'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating hiperfoco:', error)
      return res.status(500).json({ error: 'Failed to create hiperfoco' })
    }

    return res.status(201).json({ data })
  } catch (error) {
    console.error('Error in createHiperfoco:', error)
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
