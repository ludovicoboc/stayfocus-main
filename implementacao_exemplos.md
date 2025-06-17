# 🛠️ Exemplos de Implementação - Migração Alimentação

## 1. Interface de Serviços Unificada

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

export interface PlannedMeal {
  id: string
  time_scheduled: string
  description: string
  created_at: string
  updated_at: string
}

export interface MealRecord {
  id: string
  meal_date: string
  meal_time: string
  description: string
  meal_type: string | null
  photo_url: string | null
  created_at: string
}

// services/api-interface.ts
export interface ApiService {
  // Autenticação
  signIn(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>>
  signOut(): Promise<void>
  
  // Refeições Planejadas
  getPlannedMeals(): Promise<ApiResponse<PlannedMeal[]>>
  createPlannedMeal(meal: Omit<PlannedMeal, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<PlannedMeal>>
  updatePlannedMeal(id: string, meal: Partial<PlannedMeal>): Promise<ApiResponse<PlannedMeal>>
  deletePlannedMeal(id: string): Promise<ApiResponse<void>>
  
  // Registros de Refeições
  getMealRecords(date?: string): Promise<ApiResponse<MealRecord[]>>
  createMealRecord(record: Omit<MealRecord, 'id' | 'created_at'>): Promise<ApiResponse<MealRecord>>
  deleteMealRecord(id: string): Promise<ApiResponse<void>>
  
  // Hidratação
  getHydrationRecord(date: string): Promise<ApiResponse<HydrationRecord>>
  addWaterGlass(): Promise<ApiResponse<HydrationRecord>>
  removeWaterGlass(): Promise<ApiResponse<HydrationRecord>>
  updateWaterGoal(goal: number): Promise<ApiResponse<HydrationRecord>>
}
```

## 2. Implementação Supabase

```typescript
// services/supabase-service.ts
import { createClient } from '@supabase/supabase-js'
import { ApiService, ApiResponse, PlannedMeal, MealRecord } from './api-interface'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class SupabaseService implements ApiService {
  async signIn(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      return { data: null as any, error: error.message, status: 401 }
    }
    
    return {
      data: { user: data.user, token: data.session?.access_token || '' },
      status: 200
    }
  }

  async getPlannedMeals(): Promise<ApiResponse<PlannedMeal[]>> {
    const { data, error } = await supabase
      .from('planned_meals')
      .select('*')
      .order('time_scheduled')
    
    if (error) {
      return { data: [], error: error.message, status: 400 }
    }
    
    return { data: data || [], status: 200 }
  }

  async createPlannedMeal(meal: Omit<PlannedMeal, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<PlannedMeal>> {
    const { data, error } = await supabase
      .from('planned_meals')
      .insert([meal])
      .select()
      .single()
    
    if (error) {
      return { data: null as any, error: error.message, status: 400 }
    }
    
    return { data, status: 201 }
  }

  async createMealRecord(record: Omit<MealRecord, 'id' | 'created_at'>): Promise<ApiResponse<MealRecord>> {
    let photoUrl = record.photo_url
    
    // Upload de foto se necessário
    if (record.photo_url && record.photo_url.startsWith('data:')) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(`${Date.now()}.jpg`, record.photo_url)
      
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('meal-photos')
          .getPublicUrl(uploadData.path)
        photoUrl = publicUrl
      }
    }
    
    const { data, error } = await supabase
      .from('meal_records')
      .insert([{ ...record, photo_url: photoUrl }])
      .select()
      .single()
    
    if (error) {
      return { data: null as any, error: error.message, status: 400 }
    }
    
    return { data, status: 201 }
  }
}
```

## 3. Implementação FastAPI

```typescript
// services/fastapi-service.ts
import { ApiService, ApiResponse, PlannedMeal, MealRecord } from './api-interface'

export class FastApiService implements ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'
  private token: string | null = null

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    })

    const data = await response.json()
    
    return {
      data: response.ok ? data : null,
      error: response.ok ? undefined : data.detail || 'Erro na requisição',
      status: response.status
    }
  }

  async signIn(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    if (response.data) {
      this.token = response.data.access_token
      return {
        data: { user: response.data.user, token: response.data.access_token },
        status: 200
      }
    }
    
    return { data: null as any, error: response.error, status: response.status }
  }

  async getPlannedMeals(): Promise<ApiResponse<PlannedMeal[]>> {
    return this.request<PlannedMeal[]>('/api/planned-meals')
  }

  async createPlannedMeal(meal: Omit<PlannedMeal, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<PlannedMeal>> {
    return this.request<PlannedMeal>('/api/planned-meals', {
      method: 'POST',
      body: JSON.stringify(meal)
    })
  }

  async createMealRecord(record: Omit<MealRecord, 'id' | 'created_at'>): Promise<ApiResponse<MealRecord>> {
    // Para FastAPI, vamos manter foto como base64 por simplicidade
    return this.request<MealRecord>('/api/meal-records', {
      method: 'POST',
      body: JSON.stringify(record)
    })
  }
}
```

## 4. Factory de Serviços

```typescript
// services/api-factory.ts
import { SupabaseService } from './supabase-service'
import { FastApiService } from './fastapi-service'
import { ApiService } from './api-interface'

export function createApiService(): ApiService {
  const apiMode = process.env.NEXT_PUBLIC_API_MODE || 'supabase'
  
  switch (apiMode) {
    case 'fastapi':
      return new FastApiService()
    case 'supabase':
    default:
      return new SupabaseService()
  }
}

export const apiService = createApiService()
```

## 5. Store Migrado

```typescript
// stores/alimentacaoStore.ts (migrado)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '@/services/api-factory'
import { PlannedMeal, MealRecord } from '@/types/api'

interface AlimentacaoState {
  // Estados
  refeicoes: PlannedMeal[]
  registros: MealRecord[]
  coposBebidos: number
  metaDiaria: number
  loading: boolean
  error: string | null
  
  // Ações
  fetchRefeicoes: () => Promise<void>
  adicionarRefeicao: (horario: string, descricao: string) => Promise<void>
  atualizarRefeicao: (id: string, horario: string, descricao: string) => Promise<void>
  removerRefeicao: (id: string) => Promise<void>
  
  fetchRegistros: (date?: string) => Promise<void>
  adicionarRegistro: (horario: string, descricao: string, tipoIcone: string | null, foto: string | null) => Promise<void>
  removerRegistro: (id: string) => Promise<void>
  
  fetchHidratacao: () => Promise<void>
  adicionarCopo: () => Promise<void>
  removerCopo: () => Promise<void>
  ajustarMeta: (valor: number) => Promise<void>
}

export const useAlimentacaoStore = create<AlimentacaoState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      refeicoes: [],
      registros: [],
      coposBebidos: 0,
      metaDiaria: 8,
      loading: false,
      error: null,
      
      // Ações para refeições
      fetchRefeicoes: async () => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.getPlannedMeals()
          if (response.error) {
            set({ error: response.error, loading: false })
          } else {
            set({ refeicoes: response.data, loading: false })
          }
        } catch (error) {
          set({ error: 'Erro ao carregar refeições', loading: false })
        }
      },
      
      adicionarRefeicao: async (horario, descricao) => {
        set({ loading: true, error: null })
        try {
          const response = await apiService.createPlannedMeal({
            time_scheduled: horario,
            description: descricao
          })
          
          if (response.error) {
            set({ error: response.error, loading: false })
          } else {
            set((state) => ({
              refeicoes: [...state.refeicoes, response.data],
              loading: false
            }))
          }
        } catch (error) {
          set({ error: 'Erro ao adicionar refeição', loading: false })
        }
      },
      
      // Ações para registros
      adicionarRegistro: async (horario, descricao, tipoIcone, foto) => {
        set({ loading: true, error: null })
        try {
          const hoje = new Date().toISOString().split('T')[0]
          const response = await apiService.createMealRecord({
            meal_date: hoje,
            meal_time: horario,
            description: descricao,
            meal_type: tipoIcone,
            photo_url: foto
          })
          
          if (response.error) {
            set({ error: response.error, loading: false })
          } else {
            set((state) => ({
              registros: [...state.registros, response.data],
              loading: false
            }))
          }
        } catch (error) {
          set({ error: 'Erro ao adicionar registro', loading: false })
        }
      },
      
      // Ações para hidratação
      adicionarCopo: async () => {
        try {
          const response = await apiService.addWaterGlass()
          if (response.data) {
            set({
              coposBebidos: response.data.glasses_consumed,
              ultimoRegistro: response.data.last_intake_time
            })
          }
        } catch (error) {
          set({ error: 'Erro ao adicionar copo' })
        }
      }
    }),
    {
      name: 'alimentacao-storage',
      // Manter apenas dados não-críticos no localStorage como cache
      partialize: (state) => ({
        metaDiaria: state.metaDiaria,
        // Não persistir dados que vêm da API
      })
    }
  )
)
```

## 6. Hook de Inicialização

```typescript
// hooks/useAlimentacaoInit.ts
import { useEffect } from 'react'
import { useAlimentacaoStore } from '@/stores/alimentacaoStore'

export function useAlimentacaoInit() {
  const { 
    fetchRefeicoes, 
    fetchRegistros, 
    fetchHidratacao,
    loading,
    error 
  } = useAlimentacaoStore()
  
  useEffect(() => {
    // Carregar dados iniciais
    const loadInitialData = async () => {
      await Promise.all([
        fetchRefeicoes(),
        fetchRegistros(),
        fetchHidratacao()
      ])
    }
    
    loadInitialData()
  }, [fetchRefeicoes, fetchRegistros, fetchHidratacao])
  
  return { loading, error }
}
```

## 7. Componente com Estados de Loading

```typescript
// components/alimentacao/PlanejadorRefeicoes.tsx (migrado)
'use client'

import { useState, useEffect } from 'react'
import { useAlimentacaoStore } from '@/stores/alimentacaoStore'
import { useAlimentacaoInit } from '@/hooks/useAlimentacaoInit'

export function PlanejadorRefeicoes() {
  const { 
    refeicoes, 
    adicionarRefeicao, 
    atualizarRefeicao, 
    removerRefeicao,
    loading,
    error
  } = useAlimentacaoStore()
  
  const { loading: initLoading } = useAlimentacaoInit()
  const [novaRefeicao, setNovaRefeicao] = useState({ horario: '', descricao: '' })
  
  const handleAdicionarRefeicao = async () => {
    if (!novaRefeicao.horario || !novaRefeicao.descricao) return
    
    await adicionarRefeicao(novaRefeicao.horario, novaRefeicao.descricao)
    setNovaRefeicao({ horario: '', descricao: '' })
  }
  
  if (initLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-alimentacao-primary"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Erro: {error}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Resto do componente igual ao original */}
      {refeicoes.map((refeicao) => (
        <div key={refeicao.id} className="flex items-center p-3 bg-white rounded-lg border">
          {/* Conteúdo da refeição */}
        </div>
      ))}
      
      {/* Formulário de nova refeição */}
      <button
        onClick={handleAdicionarRefeicao}
        disabled={loading || !novaRefeicao.horario || !novaRefeicao.descricao}
        className="px-4 py-2 bg-alimentacao-primary text-white rounded-lg disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Adicionar'}
      </button>
    </div>
  )
}
```

## 8. Script de Migração de Dados

```typescript
// scripts/migrate-data.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LocalStorageData {
  refeicoes: Array<{ id: string; horario: string; descricao: string }>
  registros: Array<{ id: string; data: string; horario: string; descricao: string; tipoIcone: string | null; foto: string | null }>
  coposBebidos: number
  metaDiaria: number
}

export async function migrarDadosLocalStorage(userId: string) {
  // Ler dados do localStorage
  const dadosStr = localStorage.getItem('alimentacao-storage')
  if (!dadosStr) return
  
  const dados: LocalStorageData = JSON.parse(dadosStr)
  
  try {
    // Migrar refeições planejadas
    if (dados.refeicoes?.length > 0) {
      const refeicoesMigrar = dados.refeicoes.map(r => ({
        user_id: userId,
        time_scheduled: r.horario,
        description: r.descricao
      }))
      
      await supabase.from('planned_meals').insert(refeicoesMigrar)
    }
    
    // Migrar registros de refeições
    if (dados.registros?.length > 0) {
      const registrosMigrar = dados.registros.map(r => ({
        user_id: userId,
        meal_date: r.data,
        meal_time: r.horario,
        description: r.descricao,
        meal_type: r.tipoIcone,
        photo_url: r.foto
      }))
      
      await supabase.from('meal_records').insert(registrosMigrar)
    }
    
    // Migrar configurações de hidratação
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      daily_water_goal: dados.metaDiaria || 8
    })
    
    console.log('Migração concluída com sucesso!')
    
    // Limpar localStorage após migração bem-sucedida
    localStorage.removeItem('alimentacao-storage')
    
  } catch (error) {
    console.error('Erro na migração:', error)
    throw error
  }
}
```

---

*Exemplos de implementação para a migração do módulo de alimentação* 