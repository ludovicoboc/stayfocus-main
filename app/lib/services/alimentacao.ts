/**
 * Service Layer - Alimentação
 * Camada de abstração sobre os Data Providers para funcionalidades de alimentação
 * Inclui validações, transformações e lógica de negócio
 */

import { getDataProvider } from '../dataProviders'
import type {
  MealPlan,
  MealRecord,
  HydrationRecord,
  Recipe,
  CreateMealPlanDto,
  UpdateMealPlanDto,
  CreateMealRecordDto,
  CreateRecipeDto,
  UpdateRecipeDto,
  GetMealRecordsParams,
  GetRecipesParams,
} from '../dataProviders/types'

// ============================================================================
// TIPOS ESPECÍFICOS DO SERVICE
// ============================================================================

export interface MealPlanSummary {
  id: string
  name: string
  description?: string
  totalMeals: number
  totalCalories: number
  mealTypes: string[]
  created_at: string
}

export interface DailyNutritionSummary {
  date: string
  totalCalories: number
  totalWaterMl: number
  mealsByType: Record<string, number>
  waterGoalProgress: number // 0-1
  calorieGoalProgress: number // 0-1
}

export interface MealRecordWithStats extends MealRecord {
  isLateForMealType?: boolean
  caloriesVsAverage?: number
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const NUTRITION_GOALS = {
  DAILY_WATER_ML: 2000,
  DAILY_CALORIES: 2000,
  MEAL_TIME_WINDOWS: {
    breakfast: { start: '06:00', end: '10:00' },
    lunch: { start: '11:00', end: '15:00' },
    dinner: { start: '17:00', end: '21:00' },
    snack: { start: '00:00', end: '23:59' },
  },
} as const

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class AlimentacaoService {
  private dataProvider = getDataProvider()

  // ========================================
  // MEAL PLANS
  // ========================================

  /**
   * Obtém todos os planos de refeição com resumo
   */
  async getMealPlansWithSummary(): Promise<MealPlanSummary[]> {
    const mealPlans = await this.dataProvider.getMealPlans()
    
    return mealPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      totalMeals: plan.meals.length,
      totalCalories: plan.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
      mealTypes: [...new Set(plan.meals.map(meal => meal.meal_type))],
      created_at: plan.created_at,
    }))
  }

  /**
   * Cria um plano de refeição com validações
   */
  async createMealPlan(data: CreateMealPlanDto): Promise<MealPlan> {
    // Validações
    this.validateMealPlanData(data)

    // Ordenar refeições por horário
    const sortedMeals = data.meals.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time)
      }
      return 0
    }).map((meal, index) => ({
      ...meal,
      order: index + 1,
    }))

    return this.dataProvider.createMealPlan({
      ...data,
      meals: sortedMeals,
    })
  }

  /**
   * Atualiza um plano de refeição
   */
  async updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan> {
    if (data.meals) {
      // Validar e ordenar refeições
      this.validateMealPlanData({ name: '', meals: data.meals })
      
      const sortedMeals = data.meals.sort((a, b) => {
        if (a.time && b.time) {
          return a.time.localeCompare(b.time)
        }
        return 0
      }).map((meal, index) => ({
        ...meal,
        order: index + 1,
      }))

      data.meals = sortedMeals
    }

    return this.dataProvider.updateMealPlan(id, data)
  }

  /**
   * Deleta um plano de refeição
   */
  async deleteMealPlan(id: string): Promise<void> {
    return this.dataProvider.deleteMealPlan(id)
  }

  // ========================================
  // MEAL RECORDS
  // ========================================

  /**
   * Obtém registros de refeição com estatísticas
   */
  async getMealRecordsWithStats(params?: GetMealRecordsParams): Promise<MealRecordWithStats[]> {
    const records = await this.dataProvider.getMealRecords(params)
    
    return records.map(record => ({
      ...record,
      isLateForMealType: this.isMealLate(record.meal_type, record.time),
      caloriesVsAverage: this.calculateCaloriesVsAverage(record.calories || 0, record.meal_type),
    }))
  }

  /**
   * Cria um registro de refeição com validações
   */
  async createMealRecord(data: CreateMealRecordDto): Promise<MealRecord> {
    // Validações
    this.validateMealRecordData(data)

    return this.dataProvider.createMealRecord(data)
  }

  /**
   * Deleta um registro de refeição
   */
  async deleteMealRecord(id: string): Promise<void> {
    return this.dataProvider.deleteMealRecord(id)
  }

  /**
   * Obtém resumo nutricional do dia
   */
  async getDailyNutritionSummary(date: string): Promise<DailyNutritionSummary> {
    const [mealRecords, hydrationRecords] = await Promise.all([
      this.dataProvider.getMealRecords({ date }),
      this.dataProvider.getHydrationRecords(date),
    ])

    const totalCalories = mealRecords.reduce((sum, meal) => sum + (meal.calories || 0), 0)
    const totalWaterMl = hydrationRecords.reduce((sum, hydration) => sum + hydration.amount_ml, 0)

    const mealsByType = mealRecords.reduce((acc, meal) => {
      acc[meal.meal_type] = (acc[meal.meal_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      date,
      totalCalories,
      totalWaterMl,
      mealsByType,
      waterGoalProgress: Math.min(1, totalWaterMl / NUTRITION_GOALS.DAILY_WATER_ML),
      calorieGoalProgress: Math.min(1, totalCalories / NUTRITION_GOALS.DAILY_CALORIES),
    }
  }

  // ========================================
  // HIDRATAÇÃO
  // ========================================

  /**
   * Obtém registros de hidratação
   */
  async getHydrationRecords(date?: string): Promise<HydrationRecord[]> {
    return this.dataProvider.getHydrationRecords(date)
  }

  /**
   * Cria um registro de hidratação
   */
  async createHydrationRecord(amount_ml: number, date?: string, time?: string): Promise<HydrationRecord> {
    const now = new Date()
    const recordDate = date || now.toISOString().split('T')[0]
    const recordTime = time || now.toTimeString().split(' ')[0].substring(0, 5)

    // Validações
    if (amount_ml <= 0 || amount_ml > 2000) {
      throw new Error('Quantidade de água deve estar entre 1ml e 2000ml')
    }

    return this.dataProvider.createHydrationRecord(amount_ml, recordDate, recordTime)
  }

  /**
   * Deleta um registro de hidratação
   */
  async deleteHydrationRecord(id: string): Promise<void> {
    return this.dataProvider.deleteHydrationRecord(id)
  }

  /**
   * Obtém progresso de hidratação do dia
   */
  async getHydrationProgress(date?: string): Promise<{
    current: number
    goal: number
    progress: number
    remaining: number
  }> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const records = await this.getHydrationRecords(targetDate)
    
    const current = records.reduce((sum, record) => sum + record.amount_ml, 0)
    const goal = NUTRITION_GOALS.DAILY_WATER_ML
    const progress = Math.min(1, current / goal)
    const remaining = Math.max(0, goal - current)

    return { current, goal, progress, remaining }
  }

  // ========================================
  // RECEITAS
  // ========================================

  /**
   * Obtém receitas com filtros
   */
  async getRecipes(filters?: {
    category?: string
    tags?: string[]
    prepTimeMax?: number
    servings?: number
    search?: string
  }): Promise<Recipe[]> {
    return this.dataProvider.getRecipes(filters)
  }

  /**
   * Obtém receita por ID
   */
  async getRecipe(id: string): Promise<Recipe> {
    if (!id) {
      throw new Error('ID da receita é obrigatório')
    }
    return this.dataProvider.getRecipe(id)
  }

  /**
   * Busca receitas por texto
   */
  async searchRecipes(query: string): Promise<Recipe[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Consulta de busca deve ter pelo menos 2 caracteres')
    }
    return this.dataProvider.searchRecipes(query.trim())
  }

  /**
   * Obtém categorias de receitas
   */
  async getRecipeCategories(): Promise<any[]> {
    return this.dataProvider.getRecipeCategories()
  }

  /**
   * Obtém receitas favoritas do usuário
   */
  async getFavoriteRecipes(): Promise<Recipe[]> {
    return this.dataProvider.getFavoriteRecipes()
  }

  /**
   * Cria uma nova receita
   */
  async createRecipe(data: {
    name: string
    description?: string
    prep_time_minutes?: number
    servings?: number
    calories?: string
    image_url?: string
    instructions: string[]
    ingredients: Array<{
      name: string
      quantity: number
      unit: string
    }>
    tags: string[]
  }): Promise<Recipe> {
    this.validateRecipeData(data)
    return this.dataProvider.createRecipe(data)
  }

  /**
   * Atualiza uma receita existente
   */
  async updateRecipe(id: string, data: any): Promise<Recipe> {
    if (!id) {
      throw new Error('ID da receita é obrigatório')
    }

    if (data.name !== undefined || data.instructions !== undefined || data.ingredients !== undefined) {
      this.validateRecipeData(data, true) // Validação parcial para updates
    }

    return this.dataProvider.updateRecipe(id, data)
  }

  /**
   * Deleta uma receita
   */
  async deleteRecipe(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID da receita é obrigatório')
    }
    return this.dataProvider.deleteRecipe(id)
  }

  /**
   * Adiciona receita aos favoritos
   */
  async addFavoriteRecipe(recipeId: string): Promise<void> {
    if (!recipeId) {
      throw new Error('ID da receita é obrigatório')
    }
    return this.dataProvider.addFavoriteRecipe(recipeId)
  }

  /**
   * Remove receita dos favoritos
   */
  async removeFavoriteRecipe(recipeId: string): Promise<void> {
    if (!recipeId) {
      throw new Error('ID da receita é obrigatório')
    }
    return this.dataProvider.removeFavoriteRecipe(recipeId)
  }

  /**
   * Upload de imagem de receita
   */
  async uploadRecipeImage(file: File): Promise<string> {
    if (!file) {
      throw new Error('Arquivo é obrigatório')
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP')
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB')
    }

    return this.dataProvider.uploadRecipeImage(file)
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private validateMealPlanData(data: CreateMealPlanDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome do plano é obrigatório')
    }

    if (data.name.length > 100) {
      throw new Error('Nome do plano deve ter no máximo 100 caracteres')
    }

    if (data.description && data.description.length > 500) {
      throw new Error('Descrição deve ter no máximo 500 caracteres')
    }

    // Validar refeições
    data.meals.forEach((meal, index) => {
      if (!meal.name || meal.name.trim().length === 0) {
        throw new Error(`Nome da refeição ${index + 1} é obrigatório`)
      }

      if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.meal_type)) {
        throw new Error(`Tipo de refeição inválido: ${meal.meal_type}`)
      }

      if (meal.calories && (meal.calories < 0 || meal.calories > 5000)) {
        throw new Error(`Calorias da refeição ${index + 1} devem estar entre 0 e 5000`)
      }

      if (meal.time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(meal.time)) {
        throw new Error(`Horário da refeição ${index + 1} deve estar no formato HH:MM`)
      }
    })
  }

  private validateMealRecordData(data: CreateMealRecordDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome da refeição é obrigatório')
    }

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(data.meal_type)) {
      throw new Error('Tipo de refeição inválido')
    }

    if (data.calories && (data.calories < 0 || data.calories > 5000)) {
      throw new Error('Calorias devem estar entre 0 e 5000')
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('Data deve estar no formato YYYY-MM-DD')
    }

    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
      throw new Error('Horário deve estar no formato HH:MM')
    }

    // Validar se a data não é futura
    const recordDate = new Date(data.date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    if (recordDate > today) {
      throw new Error('Não é possível registrar refeições em datas futuras')
    }
  }

  private isMealLate(mealType: string, time: string): boolean {
    const window = NUTRITION_GOALS.MEAL_TIME_WINDOWS[mealType as keyof typeof NUTRITION_GOALS.MEAL_TIME_WINDOWS]
    if (!window) return false

    return time > window.end
  }

  private calculateCaloriesVsAverage(calories: number, mealType: string): number {
    // Médias aproximadas por tipo de refeição
    const averages = {
      breakfast: 400,
      lunch: 600,
      dinner: 700,
      snack: 200,
    }

    const average = averages[mealType as keyof typeof averages] || 400
    return calories - average
  }

  private validateRecipeData(data: any, isPartialUpdate = false): void {
    // Validações obrigatórias (sempre)
    if (!isPartialUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Nome da receita é obrigatório')
      }
      if (data.name.length > 255) {
        throw new Error('Nome da receita deve ter no máximo 255 caracteres')
      }
    }

    // Validações opcionais
    if (data.description && data.description.length > 1000) {
      throw new Error('Descrição deve ter no máximo 1000 caracteres')
    }

    if (data.prep_time_minutes !== undefined) {
      if (data.prep_time_minutes < 0 || data.prep_time_minutes > 1440) {
        throw new Error('Tempo de preparo deve estar entre 0 e 1440 minutos (24 horas)')
      }
    }

    if (data.servings !== undefined) {
      if (data.servings < 1 || data.servings > 50) {
        throw new Error('Número de porções deve estar entre 1 e 50')
      }
    }

    // Validar instruções
    if (!isPartialUpdate || data.instructions !== undefined) {
      if (!data.instructions || !Array.isArray(data.instructions) || data.instructions.length === 0) {
        throw new Error('Instruções são obrigatórias')
      }

      data.instructions.forEach((instruction: string, index: number) => {
        if (!instruction || instruction.trim().length === 0) {
          throw new Error(`Instrução ${index + 1} não pode estar vazia`)
        }
        if (instruction.length > 500) {
          throw new Error(`Instrução ${index + 1} deve ter no máximo 500 caracteres`)
        }
      })
    }

    // Validar ingredientes
    if (!isPartialUpdate || data.ingredients !== undefined) {
      if (!data.ingredients || !Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        throw new Error('Ingredientes são obrigatórios')
      }

      data.ingredients.forEach((ingredient: any, index: number) => {
        if (!ingredient.name || ingredient.name.trim().length === 0) {
          throw new Error(`Nome do ingrediente ${index + 1} é obrigatório`)
        }
        if (ingredient.name.length > 255) {
          throw new Error(`Nome do ingrediente ${index + 1} deve ter no máximo 255 caracteres`)
        }
        if (!ingredient.quantity || ingredient.quantity <= 0) {
          throw new Error(`Quantidade do ingrediente ${index + 1} deve ser maior que zero`)
        }
        if (!ingredient.unit || ingredient.unit.trim().length === 0) {
          throw new Error(`Unidade do ingrediente ${index + 1} é obrigatória`)
        }
        if (ingredient.unit.length > 50) {
          throw new Error(`Unidade do ingrediente ${index + 1} deve ter no máximo 50 caracteres`)
        }
      })
    }

    // Validar tags
    if (data.tags !== undefined) {
      if (Array.isArray(data.tags)) {
        data.tags.forEach((tag: string, index: number) => {
          if (!tag || tag.trim().length === 0) {
            throw new Error(`Tag ${index + 1} não pode estar vazia`)
          }
          if (tag.length > 100) {
            throw new Error(`Tag ${index + 1} deve ter no máximo 100 caracteres`)
          }
        })
      }
    }
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const alimentacaoService = new AlimentacaoService()

// ============================================================================
// EXPORTS
// ============================================================================

export default alimentacaoService
