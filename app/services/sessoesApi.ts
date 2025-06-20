import type { Sessao, CreateSessaoData, UpdateSessaoData } from '@/app/types/sessoes'

const API_BASE = '/api/sessoes'

export const sessoesApi = {
  // Listar sessões do usuário
  async getSessoes(userId: string): Promise<Sessao[]> {
    const response = await fetch(`${API_BASE}?user_id=${userId}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar sessões: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Buscar sessão específica
  async getSessao(id: string): Promise<Sessao> {
    const response = await fetch(`${API_BASE}/${id}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar sessão: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Criar nova sessão
  async createSessao(data: CreateSessaoData): Promise<Sessao> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        tempo_inicio: new Date().toISOString(),
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao criar sessão: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Atualizar sessão
  async updateSessao(id: string, data: UpdateSessaoData): Promise<Sessao> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar sessão: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Deletar sessão
  async deleteSessao(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar sessão: ${response.statusText}`)
    }
  },

  // Buscar sessões ativas
  async getSessoesAtivas(userId: string): Promise<Sessao[]> {
    const response = await fetch(`${API_BASE}?user_id=${userId}&concluida=false`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar sessões ativas: ${response.statusText}`)
    }
    
    return response.json()
  },

  // Finalizar sessão (helper)
  async finalizarSessao(id: string, duracaoReal: number): Promise<Sessao> {
    return this.updateSessao(id, {
      concluida: true,
      tempo_fim: new Date().toISOString(),
      duracao_real: duracaoReal,
    })
  },
}
