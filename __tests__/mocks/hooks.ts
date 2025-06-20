import { vi } from 'vitest'
import { createUser, createHiperfoco, createTarefa, createSessao, createHydrationRecord, createMealPlan } from '../factories'

// Mock para useDashboard
export const createMockUseDashboard = (overrides = {}) => {
  const defaultData = {
    blocosDia: [],
    prioridadesDia: [],
    proximosCompromissos: [],
    prioridadesPendentes: 0,
    prioridadesConcluidas: 0,
    metasPausas: 4,
    mostrarPausas: true,
    metasPrioridades: 3,
    nomeUsuario: 'Test User',
    preferenciasVisuais: {
      altoContraste: false,
      reducaoEstimulos: false,
      textoGrande: false,
    },
    isLoading: false,
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useHiperfocos
export const createMockUseHiperfocos = (overrides = {}) => {
  const defaultData = {
    hiperfocos: [createHiperfoco(), createHiperfoco({ id: 'hiperfoco-2', titulo: 'Segundo Hiperfoco' })],
    hiperfocoAtivo: null,
    isLoading: false,
    error: null,
    adicionarHiperfoco: vi.fn(),
    editarHiperfoco: vi.fn(),
    removerHiperfoco: vi.fn(),
    ativarHiperfoco: vi.fn(),
    desativarHiperfoco: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useCreateHiperfoco (React Query mutation)
export const createMockUseCreateHiperfoco = (overrides = {}) => {
  const defaultData = {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(createHiperfoco()),
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: null,
    reset: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useTarefas
export const createMockUseTarefas = (overrides = {}) => {
  const defaultData = {
    tarefas: [createTarefa(), createTarefa({ id: 'tarefa-2', titulo: 'Segunda Tarefa' })],
    isLoading: false,
    error: null,
    adicionarTarefa: vi.fn(),
    editarTarefa: vi.fn(),
    removerTarefa: vi.fn(),
    marcarConcluida: vi.fn(),
    reordenarTarefas: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useSessoes
export const createMockUseSessoes = (overrides = {}) => {
  const defaultData = {
    sessoes: [createSessao(), createSessao({ id: 'sessao-2', tipo: 'pausa' })],
    sessaoAtiva: null,
    isLoading: false,
    error: null,
    iniciarSessao: vi.fn(),
    pausarSessao: vi.fn(),
    finalizarSessao: vi.fn(),
    cancelarSessao: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useOnlineStatus
export const createMockUseOnlineStatus = (overrides = {}) => {
  const defaultData = {
    isOnline: true,
    quality: 'good' as const,
    latency: 50,
    lastCheck: new Date().toISOString(),
    isSlowConnection: false,
    isOffline: false,
    checkConnectivity: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useFormValidation
export const createMockUseFormValidation = (overrides = {}) => {
  const defaultData = {
    errors: {},
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    validate: vi.fn().mockReturnValue(true),
    validateField: vi.fn().mockReturnValue(null),
    setFieldError: vi.fn(),
    clearErrors: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useHydration
export const createMockUseHydration = (overrides = {}) => {
  const defaultData = {
    records: [createHydrationRecord(), createHydrationRecord({ id: 'hydration-2', amount: 300 })],
    dailyGoal: 2000,
    currentAmount: 550,
    percentage: 27.5,
    isLoading: false,
    error: null,
    addRecord: vi.fn(),
    updateGoal: vi.fn(),
    getRecordsForDate: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useMealPlans
export const createMockUseMealPlans = (overrides = {}) => {
  const defaultData = {
    mealPlans: [createMealPlan(), createMealPlan({ id: 'meal-plan-2', description: 'Almoço' })],
    isLoading: false,
    error: null,
    createMealPlan: vi.fn(),
    updateMealPlan: vi.fn(),
    deleteMealPlan: vi.fn(),
    getMealPlan: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para useRecipes
export const createMockUseRecipes = (overrides = {}) => {
  const defaultData = {
    recipes: [],
    isLoading: false,
    error: null,
    searchRecipes: vi.fn(),
    getRecipe: vi.fn(),
    createRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
    ...overrides,
  }

  return vi.fn(() => defaultData)
}

// Mock para stores do Zustand
export const createMockStore = <T>(initialState: T, actions: Record<string, any> = {}) => {
  const state = { ...initialState }
  
  const mockActions = Object.keys(actions).reduce((acc, key) => {
    acc[key] = vi.fn(actions[key])
    return acc
  }, {} as Record<string, any>)

  return vi.fn(() => ({
    ...state,
    ...mockActions,
  }))
}

// Mock específico para useAppStore
export const createMockUseAppStore = (overrides = {}) => {
  const defaultState = {
    tarefas: [],
    blocosTempo: [],
    refeicoes: [],
    medicacoes: [],
    configuracao: {
      tempoFoco: 25,
      tempoPausa: 5,
      temaEscuro: false,
      reducaoEstimulos: false,
    },
    medicamentos: [],
    registrosHumor: [],
    ...overrides,
  }

  const actions = {
    adicionarTarefa: vi.fn(),
    removerTarefa: vi.fn(),
    editarTarefa: vi.fn(),
    marcarTarefaConcluida: vi.fn(),
    adicionarBlocoTempo: vi.fn(),
    removerBlocoTempo: vi.fn(),
    editarBlocoTempo: vi.fn(),
    adicionarRefeicao: vi.fn(),
    removerRefeicao: vi.fn(),
    editarRefeicao: vi.fn(),
    adicionarMedicacao: vi.fn(),
    removerMedicacao: vi.fn(),
    editarMedicacao: vi.fn(),
    atualizarConfiguracao: vi.fn(),
    adicionarMedicamento: vi.fn(),
    removerMedicamento: vi.fn(),
    editarMedicamento: vi.fn(),
    adicionarRegistroHumor: vi.fn(),
    removerRegistroHumor: vi.fn(),
    editarRegistroHumor: vi.fn(),
  }

  return createMockStore(defaultState, actions)
}

// Mock para useHiperfocosStore
export const createMockUseHiperfocosStore = (overrides = {}) => {
  const defaultState = {
    hiperfocos: [createHiperfoco()],
    hiperfocoAtivo: null,
    tarefas: [createTarefa()],
    ...overrides,
  }

  const actions = {
    adicionarHiperfoco: vi.fn(),
    editarHiperfoco: vi.fn(),
    removerHiperfoco: vi.fn(),
    ativarHiperfoco: vi.fn(),
    desativarHiperfoco: vi.fn(),
    adicionarTarefa: vi.fn(),
    editarTarefa: vi.fn(),
    removerTarefa: vi.fn(),
    marcarTarefaConcluida: vi.fn(),
    reordenarTarefas: vi.fn(),
  }

  return createMockStore(defaultState, actions)
}

// Mock para React Query hooks
export const createMockUseQuery = (data: any, options = {}) => {
  const defaultOptions = {
    data,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true,
    isFetching: false,
    refetch: vi.fn(),
    ...options,
  }

  return vi.fn(() => defaultOptions)
}

export const createMockUseMutation = (options = {}) => {
  const defaultOptions = {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: null,
    reset: vi.fn(),
    ...options,
  }

  return vi.fn(() => defaultOptions)
}

// Helper para criar mocks de hooks com loading states
export const createMockHookWithStates = (
  successData: any,
  loadingState = false,
  errorState: any = null
) => {
  return {
    loading: vi.fn(() => ({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    })),
    success: vi.fn(() => ({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
    })),
    error: vi.fn(() => ({
      data: null,
      isLoading: false,
      isError: true,
      error: errorState || new Error('Test error'),
    })),
  }
}

// Helper para resetar todos os mocks
export const resetAllHookMocks = () => {
  vi.clearAllMocks()
}
