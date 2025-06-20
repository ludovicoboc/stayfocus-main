import { vi } from 'vitest'

// Tipos para as entidades do sistema
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
  avatar_url?: string
  preferences?: Record<string, any>
}

export interface Hiperfoco {
  id: string
  titulo: string
  descricao: string
  cor: string
  tempo_limite: number
  user_id: string
  created_at: string
  updated_at: string
  ativo?: boolean
  ordem?: number
}

export interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  concluida: boolean
  hiperfoco_id: string
  user_id: string
  ordem: number
  created_at: string
  updated_at: string
  prioridade?: 'baixa' | 'media' | 'alta'
  data_vencimento?: string
}

export interface Sessao {
  id: string
  inicio: string
  fim?: string
  tipo: 'foco' | 'pausa' | 'pausa_longa'
  duracao_planejada: number
  duracao_real?: number
  hiperfoco_id: string
  user_id: string
  created_at: string
  updated_at: string
  pausas?: number
  interrupcoes?: number
}

export interface HydrationRecord {
  id: string
  user_id: string
  amount: number
  timestamp: string
  created_at: string
  updated_at: string
}

export interface MealPlan {
  id: string
  user_id: string
  time: string
  description: string
  calories?: number
  created_at: string
  updated_at: string
}

// Contadores para IDs únicos
let userCounter = 1
let hiperfocoCounter = 1
let tarefaCounter = 1
let sessaoCounter = 1
let hydrationCounter = 1
let mealPlanCounter = 1

// Factory para usuários
export const createUser = (overrides: Partial<User> = {}): User => {
  const id = `user-${userCounter++}`
  const now = new Date().toISOString()
  
  return {
    id,
    email: `user${userCounter}@example.com`,
    name: `Test User ${userCounter}`,
    created_at: now,
    updated_at: now,
    avatar_url: `https://example.com/avatar/${id}.jpg`,
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'pt-BR',
    },
    ...overrides,
  }
}

// Factory para hiperfocos
export const createHiperfoco = (overrides: Partial<Hiperfoco> = {}): Hiperfoco => {
  const id = `hiperfoco-${hiperfocoCounter++}`
  const now = new Date().toISOString()
  
  const cores = ['#FF5252', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3']
  const cor = cores[hiperfocoCounter % cores.length]
  
  return {
    id,
    titulo: `Hiperfoco ${hiperfocoCounter}`,
    descricao: `Descrição do hiperfoco ${hiperfocoCounter}`,
    cor,
    tempo_limite: 60,
    user_id: 'test-user-id',
    created_at: now,
    updated_at: now,
    ativo: true,
    ordem: hiperfocoCounter - 1,
    ...overrides,
  }
}

// Factory para tarefas
export const createTarefa = (overrides: Partial<Tarefa> = {}): Tarefa => {
  const id = `tarefa-${tarefaCounter++}`
  const now = new Date().toISOString()
  
  return {
    id,
    titulo: `Tarefa ${tarefaCounter}`,
    descricao: `Descrição da tarefa ${tarefaCounter}`,
    concluida: false,
    hiperfoco_id: 'test-hiperfoco-id',
    user_id: 'test-user-id',
    ordem: tarefaCounter - 1,
    created_at: now,
    updated_at: now,
    prioridade: 'media',
    ...overrides,
  }
}

// Factory para sessões
export const createSessao = (overrides: Partial<Sessao> = {}): Sessao => {
  const id = `sessao-${sessaoCounter++}`
  const now = new Date().toISOString()
  
  return {
    id,
    inicio: now,
    tipo: 'foco',
    duracao_planejada: 25,
    hiperfoco_id: 'test-hiperfoco-id',
    user_id: 'test-user-id',
    created_at: now,
    updated_at: now,
    pausas: 0,
    interrupcoes: 0,
    ...overrides,
  }
}

// Factory para registros de hidratação
export const createHydrationRecord = (overrides: Partial<HydrationRecord> = {}): HydrationRecord => {
  const id = `hydration-${hydrationCounter++}`
  const now = new Date().toISOString()
  
  return {
    id,
    user_id: 'test-user-id',
    amount: 250,
    timestamp: now,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

// Factory para planos de refeição
export const createMealPlan = (overrides: Partial<MealPlan> = {}): MealPlan => {
  const id = `meal-plan-${mealPlanCounter++}`
  const now = new Date().toISOString()
  
  return {
    id,
    user_id: 'test-user-id',
    time: '08:00',
    description: `Refeição ${mealPlanCounter}`,
    calories: 300,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

// Factory para listas de dados
export const createList = <T>(factory: (overrides?: any) => T, count: number, overrides: any[] = []): T[] => {
  return Array.from({ length: count }, (_, index) => 
    factory(overrides[index] || {})
  )
}

// Factory para dados relacionados (hiperfoco com tarefas)
export const createHiperfocoWithTarefas = (
  hiperfocoOverrides: Partial<Hiperfoco> = {},
  tarefasCount = 3,
  tarefasOverrides: Partial<Tarefa>[] = []
) => {
  const hiperfoco = createHiperfoco(hiperfocoOverrides)
  const tarefas = createList(
    (overrides) => createTarefa({ hiperfoco_id: hiperfoco.id, ...overrides }),
    tarefasCount,
    tarefasOverrides
  )
  
  return { hiperfoco, tarefas }
}

// Factory para sessão completa (com hiperfoco e tarefas)
export const createSessaoCompleta = (
  sessaoOverrides: Partial<Sessao> = {},
  hiperfocoOverrides: Partial<Hiperfoco> = {},
  tarefasCount = 2
) => {
  const hiperfoco = createHiperfoco(hiperfocoOverrides)
  const tarefas = createList(
    (overrides) => createTarefa({ hiperfoco_id: hiperfoco.id, ...overrides }),
    tarefasCount
  )
  const sessao = createSessao({ hiperfoco_id: hiperfoco.id, ...sessaoOverrides })
  
  return { sessao, hiperfoco, tarefas }
}

// Utility para resetar contadores (útil em testes)
export const resetCounters = () => {
  userCounter = 1
  hiperfocoCounter = 1
  tarefaCounter = 1
  sessaoCounter = 1
  hydrationCounter = 1
  mealPlanCounter = 1
}

// Utility para criar dados com timestamps específicos
export const withTimestamp = <T extends { created_at: string; updated_at: string }>(
  factory: () => T,
  timestamp: string
): T => {
  const data = factory()
  return {
    ...data,
    created_at: timestamp,
    updated_at: timestamp,
  }
}

// Utility para criar dados com IDs específicos
export const withId = <T extends { id: string }>(
  factory: () => T,
  id: string
): T => {
  const data = factory()
  return {
    ...data,
    id,
  }
}

// Mock factories para hooks e services
export const createMockHook = (returnValue: any, loading = false, error = null) => {
  return vi.fn(() => ({
    data: returnValue,
    isLoading: loading,
    error,
    refetch: vi.fn(),
    mutate: vi.fn(),
  }))
}

export const createMockService = (methods: string[] = []) => {
  const service: Record<string, any> = {}
  
  methods.forEach(method => {
    service[method] = vi.fn().mockResolvedValue({ data: null, error: null })
  })
  
  return service
}
