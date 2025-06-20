'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Tipos
interface Hiperfoco {
  id: string
  user_id: string
  titulo: string
  descricao?: string
  cor: string
  tempo_limite?: number
  status: 'ativo' | 'pausado' | 'concluido' | 'arquivado'
  data_criacao: string
  created_at: string
  updated_at: string
  tarefas?: Tarefa[]
}

interface Tarefa {
  id: string
  hiperfoco_id: string
  parent_id?: string
  texto: string
  concluida: boolean
  cor?: string
  ordem: number
  nivel: number
  created_at: string
  updated_at: string
  subtarefas?: Tarefa[]
}

interface CreateHiperfocoData {
  user_id: string
  titulo: string
  descricao?: string
  cor: string
  tempo_limite?: number
}

interface UpdateHiperfocoData {
  titulo?: string
  descricao?: string
  cor?: string
  tempo_limite?: number
  status?: 'ativo' | 'pausado' | 'concluido' | 'arquivado'
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Funções de API
const hiperfocoApi = {
  // GET /api/hiperfocos
  getHiperfocos: async (userId: string, filters?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ data: Hiperfoco[], count: number }> => {
    const params = new URLSearchParams({
      user_id: userId,
      ...filters
    })
    
    const response = await fetch(`${API_BASE_URL}/api/hiperfocos?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch hiperfocos: ${response.statusText}`)
    }
    return response.json()
  },

  // GET /api/hiperfocos/[id]
  getHiperfoco: async (id: string, userId: string): Promise<{ data: Hiperfoco }> => {
    const response = await fetch(`${API_BASE_URL}/api/hiperfocos/${id}?user_id=${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch hiperfoco: ${response.statusText}`)
    }
    return response.json()
  },

  // POST /api/hiperfocos
  createHiperfoco: async (data: CreateHiperfocoData): Promise<{ data: Hiperfoco }> => {
    const response = await fetch(`${API_BASE_URL}/api/hiperfocos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Failed to create hiperfoco: ${response.statusText}`)
    }
    return response.json()
  },

  // PUT /api/hiperfocos/[id]
  updateHiperfoco: async (id: string, data: UpdateHiperfocoData & { user_id: string }): Promise<{ data: Hiperfoco }> => {
    const response = await fetch(`${API_BASE_URL}/api/hiperfocos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Failed to update hiperfoco: ${response.statusText}`)
    }
    return response.json()
  },

  // DELETE /api/hiperfocos/[id]
  deleteHiperfoco: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/hiperfocos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) {
      throw new Error(`Failed to delete hiperfoco: ${response.statusText}`)
    }
  },
}

// Hooks React Query
export const useGetHiperfocos = (userId: string, filters?: {
  status?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: ['hiperfocos', userId, filters],
    queryFn: () => hiperfocoApi.getHiperfocos(userId, filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useGetHiperfoco = (id: string, userId: string) => {
  return useQuery({
    queryKey: ['hiperfocos', id, userId],
    queryFn: () => hiperfocoApi.getHiperfoco(id, userId),
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useCreateHiperfoco = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: hiperfocoApi.createHiperfoco,
    onSuccess: (data, variables) => {
      // Invalidar cache dos hiperfocos do usuário
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.user_id] 
      })
      
      // Adicionar o novo hiperfoco ao cache
      queryClient.setQueryData(
        ['hiperfocos', data.data.id, variables.user_id],
        { data: data.data }
      )
    },
  })
}

export const useUpdateHiperfoco = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateHiperfocoData & { user_id: string } }) =>
      hiperfocoApi.updateHiperfoco(id, data),
    onSuccess: (result, variables) => {
      // Invalidar cache dos hiperfocos do usuário
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.data.user_id] 
      })
      
      // Atualizar o hiperfoco específico no cache
      queryClient.setQueryData(
        ['hiperfocos', variables.id, variables.data.user_id],
        { data: result.data }
      )
    },
  })
}

export const useDeleteHiperfoco = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string, userId: string }) =>
      hiperfocoApi.deleteHiperfoco(id, userId),
    onSuccess: (_, variables) => {
      // Invalidar cache dos hiperfocos do usuário
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.userId] 
      })
      
      // Remover o hiperfoco específico do cache
      queryClient.removeQueries({ 
        queryKey: ['hiperfocos', variables.id, variables.userId] 
      })
    },
  })
}

// Hook para obter um user_id temporário (para desenvolvimento)
export const useUserId = () => {
  // Por enquanto, usar um UUID fixo para desenvolvimento
  // Em produção, isso viria do sistema de autenticação
  return '550e8400-e29b-41d4-a716-446655440000'
}

// Exportar tipos para uso em outros arquivos
export type { Hiperfoco, Tarefa, CreateHiperfocoData, UpdateHiperfocoData }
