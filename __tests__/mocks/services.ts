import { vi } from 'vitest'
import { 
  createUser, 
  createHiperfoco, 
  createTarefa, 
  createSessao, 
  createHydrationRecord, 
  createMealPlan 
} from '../factories'

// Mock para AlimentacaoService
export const createMockAlimentacaoService = (overrides = {}) => {
  const defaultMethods = {
    // Meal Plans
    getMealPlansWithSummary: vi.fn().mockResolvedValue([
      {
        id: 'meal-plan-1',
        name: 'Plano Semanal',
        description: 'Plano de refeições para a semana',
        totalMeals: 21,
        totalCalories: 15000,
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        created_at: new Date().toISOString(),
      }
    ]),
    
    getMealPlan: vi.fn().mockResolvedValue(createMealPlan()),
    createMealPlan: vi.fn().mockResolvedValue(createMealPlan()),
    updateMealPlan: vi.fn().mockResolvedValue(createMealPlan()),
    deleteMealPlan: vi.fn().mockResolvedValue(undefined),
    
    // Meal Records
    getMealRecordsWithStats: vi.fn().mockResolvedValue([
      {
        id: 'meal-record-1',
        user_id: 'test-user-id',
        meal_type: 'breakfast',
        name: 'Café da manhã',
        description: 'Pão integral com queijo',
        calories: 280,
        date: new Date().toISOString().split('T')[0],
        time: '07:30',
        created_at: new Date().toISOString(),
        isLateForMealType: false,
        caloriesVsAverage: 0,
      }
    ]),
    
    createMealRecord: vi.fn().mockResolvedValue({
      id: 'new-meal-record',
      user_id: 'test-user-id',
      meal_type: 'breakfast',
      name: 'Test Meal',
      calories: 300,
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
      created_at: new Date().toISOString(),
    }),
    
    deleteMealRecord: vi.fn().mockResolvedValue(undefined),
    
    // Daily Summary
    getDailyNutritionSummary: vi.fn().mockResolvedValue({
      date: new Date().toISOString().split('T')[0],
      totalCalories: 1800,
      totalWaterMl: 2000,
      mealsByType: {
        breakfast: 1,
        lunch: 1,
        dinner: 1,
      },
      averageCaloriesPerMeal: 600,
      hydrationGoalMet: true,
      caloriesGoalMet: true,
    }),
    
    // Hydration
    createHydrationRecord: vi.fn().mockResolvedValue(createHydrationRecord()),
    getHydrationRecords: vi.fn().mockResolvedValue([createHydrationRecord()]),
    
    // Recipes
    getRecipes: vi.fn().mockResolvedValue([]),
    getRecipe: vi.fn().mockResolvedValue({
      id: 'recipe-1',
      name: 'Receita Teste',
      description: 'Uma receita de teste',
      ingredients: ['Ingrediente 1', 'Ingrediente 2'],
      instructions: ['Passo 1', 'Passo 2'],
      prep_time_minutes: 30,
      cook_time_minutes: 45,
      servings: 4,
      calories_per_serving: 350,
      category: 'main',
      tags: ['healthy', 'easy'],
      created_at: new Date().toISOString(),
    }),
    
    searchRecipes: vi.fn().mockResolvedValue([]),
    createRecipe: vi.fn().mockResolvedValue({
      id: 'new-recipe',
      name: 'Nova Receita',
      description: 'Receita criada em teste',
      ingredients: [],
      instructions: [],
      prep_time_minutes: 15,
      cook_time_minutes: 30,
      servings: 2,
      category: 'snack',
      tags: [],
      created_at: new Date().toISOString(),
    }),
    
    updateRecipe: vi.fn().mockResolvedValue({
      id: 'recipe-1',
      name: 'Receita Atualizada',
      description: 'Receita atualizada em teste',
      ingredients: [],
      instructions: [],
      prep_time_minutes: 20,
      cook_time_minutes: 40,
      servings: 3,
      category: 'main',
      tags: ['updated'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    
    deleteRecipe: vi.fn().mockResolvedValue(undefined),
    
    ...overrides,
  }

  return defaultMethods
}

// Mock para HiperfocosService
export const createMockHiperfocosService = (overrides = {}) => {
  const defaultMethods = {
    getHiperfocos: vi.fn().mockResolvedValue([createHiperfoco()]),
    getHiperfoco: vi.fn().mockResolvedValue(createHiperfoco()),
    createHiperfoco: vi.fn().mockResolvedValue(createHiperfoco()),
    updateHiperfoco: vi.fn().mockResolvedValue(createHiperfoco()),
    deleteHiperfoco: vi.fn().mockResolvedValue(undefined),
    
    // Tarefas
    getTarefas: vi.fn().mockResolvedValue([createTarefa()]),
    getTarefa: vi.fn().mockResolvedValue(createTarefa()),
    createTarefa: vi.fn().mockResolvedValue(createTarefa()),
    updateTarefa: vi.fn().mockResolvedValue(createTarefa()),
    deleteTarefa: vi.fn().mockResolvedValue(undefined),
    reorderTarefas: vi.fn().mockResolvedValue([createTarefa()]),
    
    // Sessões
    getSessoes: vi.fn().mockResolvedValue([createSessao()]),
    getSessao: vi.fn().mockResolvedValue(createSessao()),
    createSessao: vi.fn().mockResolvedValue(createSessao()),
    updateSessao: vi.fn().mockResolvedValue(createSessao()),
    finalizarSessao: vi.fn().mockResolvedValue(createSessao()),
    
    // Estatísticas
    getEstatisticas: vi.fn().mockResolvedValue({
      totalSessoes: 10,
      tempoTotalFoco: 250, // minutos
      tempoMedioSessao: 25,
      produtividadeSemanal: 85,
      hiperfocoMaisUsado: createHiperfoco(),
      tendenciaProductividade: 'crescente',
    }),
    
    ...overrides,
  }

  return defaultMethods
}

// Mock para AuthService
export const createMockAuthService = (overrides = {}) => {
  const defaultMethods = {
    login: vi.fn().mockResolvedValue({
      user: createUser(),
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        user: createUser(),
      },
    }),
    
    logout: vi.fn().mockResolvedValue(undefined),
    
    register: vi.fn().mockResolvedValue({
      user: createUser(),
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        user: createUser(),
      },
    }),
    
    getCurrentUser: vi.fn().mockResolvedValue(createUser()),
    updateUser: vi.fn().mockResolvedValue(createUser()),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    refreshSession: vi.fn().mockResolvedValue({
      access_token: 'new-mock-access-token',
      refresh_token: 'new-mock-refresh-token',
      expires_at: Date.now() + 3600000,
      user: createUser(),
    }),
    
    ...overrides,
  }

  return defaultMethods
}

// Mock para DataService
export const createMockDataService = (overrides = {}) => {
  const defaultMethods = {
    exportarDados: vi.fn().mockResolvedValue({
      sucesso: true,
      dados: 'mock-exported-data',
      timestamp: new Date().toISOString(),
    }),
    
    importarDadosDeArquivo: vi.fn().mockResolvedValue({
      sucesso: true,
      mensagem: 'Dados importados com sucesso',
      timestamp: new Date().toISOString(),
    }),
    
    importarDadosFromObject: vi.fn().mockReturnValue({
      sucesso: true,
      mensagem: 'Dados importados com sucesso',
      timestamp: new Date().toISOString(),
    }),
    
    validarDadosImportados: vi.fn().mockReturnValue({
      valido: true,
      timestamp: new Date().toISOString(),
    }),
    
    ...overrides,
  }

  return defaultMethods
}

// Mock para OfflineQueue
export const createMockOfflineQueue = (overrides = {}) => {
  const defaultMethods = {
    add: vi.fn(),
    remove: vi.fn().mockReturnValue(true),
    getAll: vi.fn().mockReturnValue([]),
    getPending: vi.fn().mockReturnValue([]),
    process: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
    clearCompleted: vi.fn(),
    getStats: vi.fn().mockReturnValue({
      total: 0,
      pending: 0,
      executing: 0,
      completed: 0,
      failed: 0,
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    
    ...overrides,
  }

  return defaultMethods
}

// Helper para criar mocks de serviços com diferentes estados
export const createServiceMockWithStates = (successResponse: any) => {
  return {
    success: vi.fn().mockResolvedValue(successResponse),
    loading: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
    error: vi.fn().mockRejectedValue(new Error('Service error')),
    networkError: vi.fn().mockRejectedValue(new Error('Network error')),
    timeout: vi.fn().mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      )
    ),
  }
}

// Helper para resetar todos os mocks de serviços
export const resetAllServiceMocks = () => {
  vi.clearAllMocks()
}
