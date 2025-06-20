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

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).json({ error: `Method ${method} not allowed` })
  }

  return finalizarSessao(req, res, id)
}

// PATCH /api/sessoes/[id]/finalizar - Finalizar sessão calculando duração real
async function finalizarSessao(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { user_id, duracao_real } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Buscar sessão atual para verificar permissões e estado
    const { data: sessaoAtual, error: fetchError } = await supabase
      .from('sessoes_alternancia')
      .select(`
        id,
        tempo_inicio,
        concluida,
        duracao_estimada
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .single()

    if (fetchError || !sessaoAtual) {
      return res.status(404).json({ error: 'Sessao not found' })
    }

    // Verificar se a sessão já foi concluída
    if (sessaoAtual.concluida) {
      return res.status(400).json({ error: 'Sessao already completed' })
    }

    // Calcular duração real se não fornecida
    let duracaoRealFinal = duracao_real
    
    if (duracaoRealFinal === undefined) {
      const tempoInicio = new Date(sessaoAtual.tempo_inicio)
      const agora = new Date()
      const diferencaMs = agora.getTime() - tempoInicio.getTime()
      duracaoRealFinal = Math.round(diferencaMs / (1000 * 60)) // Converter para minutos
    }

    // Validar duração real
    if (duracaoRealFinal <= 0) {
      return res.status(400).json({ 
        error: 'duracao_real must be positive' 
      })
    }

    const { data, error } = await supabase
      .from('sessoes_alternancia')
      .update({ 
        concluida: true,
        duracao_real: duracaoRealFinal
      })
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
      console.error('Error finalizing sessao:', error)
      return res.status(500).json({ error: 'Failed to finalize sessao' })
    }

    // Calcular estatísticas da sessão
    const eficiencia = Math.round((sessaoAtual.duracao_estimada / duracaoRealFinal) * 100)
    const diferenca = duracaoRealFinal - sessaoAtual.duracao_estimada
    const status = diferenca === 0 ? 'exato' : diferenca > 0 ? 'excedeu' : 'antecipou'

    return res.status(200).json({ 
      data,
      estatisticas: {
        duracao_estimada: sessaoAtual.duracao_estimada,
        duracao_real: duracaoRealFinal,
        diferenca: Math.abs(diferenca),
        eficiencia,
        status
      },
      message: 'Sessão finalizada com sucesso'
    })
  } catch (error) {
    console.error('Error in finalizarSessao:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
