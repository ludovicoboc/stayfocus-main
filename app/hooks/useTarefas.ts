'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Tipos
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

interface CreateTarefaData {
  hiperfoco_id: string
  user_id: string
  texto: string
  parent_id?: string
  cor?: string
  ordem?: number
}

interface UpdateTarefaData {
  texto?: string
  concluida?: boolean
  cor?: string
  ordem?: number
  parent_id?: string
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Funções de API
const tarefaApi = {
  // GET /api/tarefas
  getTarefas: async (hiperfocoId: string, userId: string, filters?: {
    parent_id?: string
    nivel?: number
  }): Promise<{ data: Tarefa[], count: number }> => {
    const params = new URLSearchParams({
      hiperfoco_id: hiperfocoId,
      user_id: userId,
      ...filters
    })
    
    const response = await fetch(`${API_BASE_URL}/api/tarefas?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch tarefas: ${response.statusText}`)
    }
    return response.json()
  },

  // GET /api/tarefas/[id]
  getTarefa: async (id: string, userId: string): Promise<{ data: Tarefa }> => {
    const response = await fetch(`${API_BASE_URL}/api/tarefas/${id}?user_id=${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch tarefa: ${response.statusText}`)
    }
    return response.json()
  },

  // POST /api/tarefas
  createTarefa: async (data: CreateTarefaData): Promise<{ data: Tarefa }> => {
    const response = await fetch(`${API_BASE_URL}/api/tarefas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Failed to create tarefa: ${response.statusText}`)
    }
    return response.json()
  },

  // PUT /api/tarefas/[id]
  updateTarefa: async (id: string, data: UpdateTarefaData & { user_id: string }): Promise<{ data: Tarefa }> => {
    const response = await fetch(`${API_BASE_URL}/api/tarefas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`Failed to update tarefa: ${response.statusText}`)
    }
    return response.json()
  },

  // PATCH /api/tarefas/[id]/toggle
  toggleTarefa: async (id: string, userId: string): Promise<{ data: Tarefa }> => {
    const response = await fetch(`${API_BASE_URL}/api/tarefas/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) {
      throw new Error(`Failed to toggle tarefa: ${response.statusText}`)
    }
    return response.json()
  },

  // DELETE /api/tarefas/[id]
  deleteTarefa: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/tarefas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) {
      throw new Error(`Failed to delete tarefa: ${response.statusText}`)
    }
  },
}

// Hooks React Query
export const useGetTarefas = (hiperfocoId: string, userId: string, filters?: {
  parent_id?: string
  nivel?: number
}) => {
  return useQuery({
    queryKey: ['tarefas', hiperfocoId, userId, filters],
    queryFn: () => tarefaApi.getTarefas(hiperfocoId, userId, filters),
    enabled: !!hiperfocoId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export const useGetTarefa = (id: string, userId: string) => {
  return useQuery({
    queryKey: ['tarefas', id, userId],
    queryFn: () => tarefaApi.getTarefa(id, userId),
    enabled: !!id && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export const useCreateTarefa = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tarefaApi.createTarefa,
    onSuccess: (data, variables) => {
      // Invalidar cache das tarefas do hiperfoco
      queryClient.invalidateQueries({ 
        queryKey: ['tarefas', variables.hiperfoco_id, variables.user_id] 
      })
      
      // Invalidar cache dos hiperfocos para atualizar contadores
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.user_id] 
      })
    },
  })
}

export const useUpdateTarefa = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateTarefaData & { user_id: string } }) =>
      tarefaApi.updateTarefa(id, data),
    onSuccess: (result, variables) => {
      // Invalidar cache das tarefas
      queryClient.invalidateQueries({ 
        queryKey: ['tarefas', variables.data.user_id] 
      })
      
      // Invalidar cache dos hiperfocos para atualizar contadores
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.data.user_id] 
      })
    },
  })
}

export const useToggleTarefa = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string, userId: string }) =>
      tarefaApi.toggleTarefa(id, userId),
    onSuccess: (_, variables) => {
      // Invalidar cache das tarefas
      queryClient.invalidateQueries({ 
        queryKey: ['tarefas', variables.userId] 
      })
      
      // Invalidar cache dos hiperfocos para atualizar contadores
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.userId] 
      })
    },
  })
}

export const useDeleteTarefa = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string, userId: string }) =>
      tarefaApi.deleteTarefa(id, userId),
    onSuccess: (_, variables) => {
      // Invalidar cache das tarefas
      queryClient.invalidateQueries({ 
        queryKey: ['tarefas', variables.userId] 
      })
      
      // Invalidar cache dos hiperfocos para atualizar contadores
      queryClient.invalidateQueries({ 
        queryKey: ['hiperfocos', variables.userId] 
      })
    },
  })
}

// Exportar tipos para uso em outros arquivos
export type { Tarefa, CreateTarefaData, UpdateTarefaData }
