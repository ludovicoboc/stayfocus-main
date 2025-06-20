/**
 * FastAPIProvider - Mock server para TDD e desenvolvimento
 * Simula respostas de uma API FastAPI com dados controlados e edge cases
 */

import type {
  DataProvider,
  AuthResponse,
  User,
  MealPlan,
  MealRecord,
  HydrationRecord,
  Recipe,
  Hiperfoco,
  Task,
  CreateMealPlanDto,
  UpdateMealPlanDto,
  CreateMealRecordDto,
  CreateRecipeDto,
  UpdateRecipeDto,
  GetMealRecordsParams,
  GetRecipesParams,
  GetHiperfocosParams,
  GetTasksParams,
} from './types'

// ============================================================================
// CONFIGURAÇÕES DO MOCK
// ============================================================================

interface MockConfig {
  enableDelays: boolean
  delayMs: number
  simulateErrors: boolean
  errorRate: number // 0-1, probabilidade de erro
  enableLogging: boolean
}

const DEFAULT_CONFIG: MockConfig = {
  enableDelays: true,
  delayMs: 500, // Simula latência de rede
  simulateErrors: false,
  errorRate: 0.1,
  enableLogging: true,
}

// ============================================================================
// DADOS MOCK
// ============================================================================

class MockDatabase {
  private static instance: MockDatabase
  private users: User[] = []
  private mealPlans: MealPlan[] = []
  private mealRecords: MealRecord[] = []
  private hydrationRecords: HydrationRecord[] = []
  private recipes: Recipe[] = []
  private hiperfocos: Hiperfoco[] = []
  private tasks: Task[] = []
  private currentUser: User | null = null
  private nextId = 1

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase()
      MockDatabase.instance.initializeData()
    }
    return MockDatabase.instance
  }

  private initializeData() {
    // Usuário de teste
    this.users = [
      {
        id: 'user-1',
        email: 'teste@stayfocus.com',
        name: 'Usuário Teste',
        avatar_url: 'https://via.placeholder.com/150',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    ]

    // Dados de exemplo para alimentação
    this.mealPlans = [
      {
        id: 'meal-plan-1',
        user_id: 'user-1',
        name: 'Plano Semanal Saudável',
        description: 'Plano de refeições balanceadas para a semana',
        meals: [
          {
            id: 'meal-item-1',
            meal_plan_id: 'meal-plan-1',
            meal_type: 'breakfast',
            name: 'Aveia com frutas',
            description: 'Aveia integral com banana e morango',
            time: '07:00',
            calories: 350,
            order: 1,
          },
          {
            id: 'meal-item-2',
            meal_plan_id: 'meal-plan-1',
            meal_type: 'lunch',
            name: 'Salada com frango',
            description: 'Salada verde com peito de frango grelhado',
            time: '12:00',
            calories: 450,
            order: 2,
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    ]

    this.mealRecords = [
      {
        id: 'meal-record-1',
        user_id: 'user-1',
        meal_type: 'breakfast',
        name: 'Café da manhã',
        description: 'Pão integral com queijo',
        photo_url: 'https://via.placeholder.com/300x200',
        calories: 280,
        date: '2024-01-15',
        time: '07:30',
        created_at: '2024-01-15T07:30:00Z',
      }
    ]

    this.hydrationRecords = [
      {
        id: 'hydration-1',
        user_id: 'user-1',
        amount_ml: 250,
        date: '2024-01-15',
        time: '08:00',
        created_at: '2024-01-15T08:00:00Z',
      }
    ]

    // Dados de exemplo para hiperfocos
    this.hiperfocos = [
      {
        id: 'hiperfoco-1',
        user_id: 'user-1',
        title: 'Projeto React',
        description: 'Desenvolvimento do módulo de autenticação',
        color: '#3B82F6',
        time_limit_minutes: 120,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    ]

    this.tasks = [
      {
        id: 'task-1',
        user_id: 'user-1',
        hiperfoco_id: 'hiperfoco-1',
        text: 'Implementar login com email',
        completed: false,
        color: '#3B82F6',
        order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
    ]
  }

  // Métodos de acesso aos dados
  getUsers() { return [...this.users] }
  getMealPlans() { return [...this.mealPlans] }
  getMealRecords() { return [...this.mealRecords] }
  getHydrationRecords() { return [...this.hydrationRecords] }
  getRecipes() { return [...this.recipes] }
  getHiperfocos() { return [...this.hiperfocos] }
  getTasks() { return [...this.tasks] }
  getCurrentUser() { return this.currentUser }
  setCurrentUser(user: User | null) { this.currentUser = user }

  addUser(user: User) {
    this.users.push(user)
  }

  generateId(): string {
    return `mock-${this.nextId++}-${Date.now()}`
  }

  addMealPlan(mealPlan: MealPlan) {
    this.mealPlans.push(mealPlan)
  }

  updateMealPlan(id: string, updates: Partial<MealPlan>) {
    const index = this.mealPlans.findIndex(mp => mp.id === id)
    if (index >= 0) {
      this.mealPlans[index] = { ...this.mealPlans[index], ...updates }
    }
  }

  deleteMealPlan(id: string) {
    this.mealPlans = this.mealPlans.filter(mp => mp.id !== id)
  }

  addMealRecord(record: MealRecord) {
    this.mealRecords.push(record)
  }

  deleteMealRecord(id: string) {
    this.mealRecords = this.mealRecords.filter(mr => mr.id !== id)
  }

  addHydrationRecord(record: HydrationRecord) {
    this.hydrationRecords.push(record)
  }

  deleteHydrationRecord(id: string) {
    this.hydrationRecords = this.hydrationRecords.filter(hr => hr.id !== id)
  }
}

// ============================================================================
// FASTAPI PROVIDER
// ============================================================================

export class FastAPIProvider implements DataProvider {
  private config: MockConfig
  private db: MockDatabase

  constructor(config: Partial<MockConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.db = MockDatabase.getInstance()
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  private async delay(): Promise<void> {
    if (this.config.enableDelays) {
      await new Promise(resolve => setTimeout(resolve, this.config.delayMs))
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[FastAPIProvider] ${message}`, data || '')
    }
  }

  private shouldSimulateError(): boolean {
    return this.config.simulateErrors && Math.random() < this.config.errorRate
  }

  private throwRandomError(): never {
    const errors = [
      'Erro de conexão com o servidor',
      'Timeout na requisição',
      'Erro interno do servidor',
      'Dados inválidos',
    ]
    const randomError = errors[Math.floor(Math.random() * errors.length)]
    throw new Error(`[MOCK ERROR] ${randomError}`)
  }

  // ========================================
  // AUTENTICAÇÃO
  // ========================================

  async login(email: string, password: string): Promise<AuthResponse> {
    await this.delay()
    this.log('Login attempt', { email })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    // Simular validação
    if (email === 'teste@stayfocus.com' && password === '123456') {
      const user = this.db.getUsers()[0]
      this.db.setCurrentUser(user)
      
      return {
        user,
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hora
          user,
        },
      }
    }

    return {
      user: null,
      session: null,
      error: 'Credenciais inválidas',
    }
  }

  async register(data: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    await this.delay()
    this.log('Register attempt', { email: data.email, name: data.name })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    // Verificar se email já existe
    const existingUsers = this.db.getUsers()
    if (existingUsers.some(user => user.email === data.email)) {
      return {
        user: null,
        session: null,
        error: 'Email já está em uso',
      }
    }

    // Criar novo usuário
    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name || 'Usuário',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Adicionar usuário ao banco de dados mock
    this.db.addUser(newUser)
    this.db.setCurrentUser(newUser)

    return {
      user: newUser,
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000, // 1 hora
        user: newUser,
      },
    }
  }

  async logout(): Promise<void> {
    await this.delay()
    this.log('Logout')
    this.db.setCurrentUser(null)
  }

  async getCurrentUser(): Promise<User | null> {
    await this.delay()
    const user = this.db.getCurrentUser()
    this.log('Get current user', user?.email)
    return user
  }

  async refreshSession(): Promise<AuthResponse> {
    await this.delay()
    this.log('Refresh session')

    const user = this.db.getCurrentUser()
    if (!user) {
      return {
        user: null,
        session: null,
        error: 'Sessão expirada',
      }
    }

    return {
      user,
      session: {
        access_token: 'mock-new-access-token',
        refresh_token: 'mock-new-refresh-token',
        expires_at: Date.now() + 3600000,
        user,
      },
    }
  }

  // ========================================
  // MEAL PLANS
  // ========================================

  async getMealPlans(): Promise<MealPlan[]> {
    await this.delay()
    this.log('Get meal plans')

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    return this.db.getMealPlans()
  }

  async createMealPlan(data: CreateMealPlanDto): Promise<MealPlan> {
    await this.delay()
    this.log('Create meal plan', data.name)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const user = this.db.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const now = new Date().toISOString()
    const mealPlan: MealPlan = {
      id: this.db.generateId(),
      user_id: user.id,
      name: data.name,
      description: data.description,
      meals: data.meals.map((meal, index) => ({
        id: this.db.generateId(),
        meal_plan_id: '', // Será preenchido após criação
        ...meal,
      })),
      created_at: now,
      updated_at: now,
    }

    // Atualizar meal_plan_id nos itens
    mealPlan.meals.forEach(meal => {
      meal.meal_plan_id = mealPlan.id
    })

    this.db.addMealPlan(mealPlan)
    return mealPlan
  }

  async updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan> {
    await this.delay()
    this.log('Update meal plan', id)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const mealPlans = this.db.getMealPlans()
    const existingPlan = mealPlans.find(mp => mp.id === id)
    
    if (!existingPlan) {
      throw new Error('Plano de refeição não encontrado')
    }

    const updatedPlan: MealPlan = {
      ...existingPlan,
      name: data.name || existingPlan.name,
      description: data.description !== undefined ? data.description : existingPlan.description,
      meals: data.meals ? data.meals.map(meal => ({
        id: this.db.generateId(),
        meal_plan_id: id,
        ...meal,
      })) : existingPlan.meals,
      updated_at: new Date().toISOString(),
    }

    this.db.updateMealPlan(id, updatedPlan)
    return updatedPlan
  }

  async deleteMealPlan(id: string): Promise<void> {
    await this.delay()
    this.log('Delete meal plan', id)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    this.db.deleteMealPlan(id)
  }

  // ========================================
  // MEAL RECORDS
  // ========================================

  async getMealRecords(params?: GetMealRecordsParams): Promise<MealRecord[]> {
    await this.delay()
    this.log('Get meal records', params)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    let records = this.db.getMealRecords()

    // Aplicar filtros
    if (params?.date) {
      records = records.filter(r => r.date === params.date)
    }

    if (params?.meal_type) {
      records = records.filter(r => r.meal_type === params.meal_type)
    }

    // Aplicar paginação
    if (params?.offset || params?.limit) {
      const offset = params.offset || 0
      const limit = params.limit || 10
      records = records.slice(offset, offset + limit)
    }

    return records
  }

  async createMealRecord(data: CreateMealRecordDto): Promise<MealRecord> {
    await this.delay()
    this.log('Create meal record', data.name)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const user = this.db.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Simular upload de foto
    let photo_url: string | undefined
    if (data.photo) {
      photo_url = `https://mock-storage.com/meal-photos/${Date.now()}-${data.photo.name}`
    }

    const mealRecord: MealRecord = {
      id: this.db.generateId(),
      user_id: user.id,
      meal_type: data.meal_type,
      name: data.name,
      description: data.description,
      photo_url,
      calories: data.calories,
      date: data.date,
      time: data.time,
      created_at: new Date().toISOString(),
    }

    this.db.addMealRecord(mealRecord)
    return mealRecord
  }

  async deleteMealRecord(id: string): Promise<void> {
    await this.delay()
    this.log('Delete meal record', id)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    this.db.deleteMealRecord(id)
  }

  // ========================================
  // HIDRATAÇÃO
  // ========================================

  async getHydrationRecords(date?: string): Promise<HydrationRecord[]> {
    await this.delay()
    this.log('Get hydration records', date)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    let records = this.db.getHydrationRecords()

    if (date) {
      records = records.filter(r => r.date === date)
    }

    return records
  }

  async createHydrationRecord(amount_ml: number, date: string, time: string): Promise<HydrationRecord> {
    await this.delay()
    this.log('Create hydration record', { amount_ml, date, time })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const user = this.db.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const record: HydrationRecord = {
      id: this.db.generateId(),
      user_id: user.id,
      amount_ml,
      date,
      time,
      created_at: new Date().toISOString(),
    }

    this.db.addHydrationRecord(record)
    return record
  }

  async deleteHydrationRecord(id: string): Promise<void> {
    await this.delay()
    this.log('Delete hydration record', id)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    this.db.deleteHydrationRecord(id)
  }

  // ========================================
  // UPLOAD DE ARQUIVOS
  // ========================================

  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    await this.delay()
    this.log('Upload file', { bucket, path, fileName: file.name })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    // Simular upload retornando URL mock
    return `https://mock-storage.com/${bucket}/${path}`
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    await this.delay()
    this.log('Delete file', { bucket, path })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    // Simular deleção (não faz nada no mock)
  }

  // ========================================
  // MÉTODOS AINDA NÃO IMPLEMENTADOS
  // ========================================

  // ========================================
  // RECEITAS
  // ========================================

  async getRecipes(filters?: {
    category?: string
    tags?: string[]
    prepTimeMax?: number
    servings?: number
    search?: string
  }): Promise<Recipe[]> {
    await this.delay()
    this.log('Get recipes', filters)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    let recipes = this.db.getRecipes()

    // Aplicar filtros
    if (filters?.category) {
      recipes = recipes.filter(recipe =>
        recipe.tags?.some(tag => tag.tag === filters.category)
      )
    }

    if (filters?.tags && filters.tags.length > 0) {
      recipes = recipes.filter(recipe =>
        filters.tags!.some(filterTag =>
          recipe.tags?.some(recipeTag => recipeTag.tag === filterTag)
        )
      )
    }

    if (filters?.prepTimeMax) {
      recipes = recipes.filter(recipe =>
        !recipe.prep_time_minutes || recipe.prep_time_minutes <= filters.prepTimeMax!
      )
    }

    if (filters?.servings) {
      recipes = recipes.filter(recipe => recipe.servings === filters.servings)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      recipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchLower) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchLower))
      )
    }

    return recipes
  }

  async getRecipe(id: string): Promise<Recipe> {
    await this.delay()
    this.log('Get recipe', id)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const recipe = this.db.getRecipe(id)
    if (!recipe) {
      throw new Error('Receita não encontrada')
    }

    return recipe
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    await this.delay()
    this.log('Search recipes', query)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const searchLower = query.toLowerCase()
    const recipes = this.db.getRecipes()

    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchLower) ||
      (recipe.description && recipe.description.toLowerCase().includes(searchLower)) ||
      recipe.ingredients?.some(ingredient =>
        ingredient.name.toLowerCase().includes(searchLower)
      )
    )
  }

  async getRecipeCategories(): Promise<any[]> {
    await this.delay()
    this.log('Get recipe categories')

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    return this.db.getRecipeCategories()
  }

  async getFavoriteRecipes(): Promise<Recipe[]> {
    await this.delay()
    this.log('Get favorite recipes')

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const recipes = this.db.getRecipes()
    return recipes.filter(recipe => recipe.is_favorite)
  }

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
    await this.delay()
    this.log('Create recipe', data)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const user = this.db.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const recipeId = this.db.generateId()
    const now = new Date().toISOString()

    const recipe: Recipe = {
      id: recipeId,
      user_id: user.id,
      name: data.name,
      description: data.description,
      prep_time_minutes: data.prep_time_minutes,
      servings: data.servings,
      calories: data.calories,
      image_url: data.image_url,
      instructions: data.instructions,
      created_at: now,
      updated_at: now,
      ingredients: data.ingredients.map(ingredient => ({
        id: this.db.generateId(),
        recipe_id: recipeId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
      tags: data.tags.map(tag => ({
        id: this.db.generateId(),
        recipe_id: recipeId,
        tag: tag,
      })),
      is_favorite: false,
    }

    this.db.addRecipe(recipe)
    return recipe
  }

  async updateRecipe(id: string, data: any): Promise<Recipe> {
    await this.delay()
    this.log('Update recipe', { id, data })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const recipe = this.db.getRecipe(id)
    if (!recipe) {
      throw new Error('Receita não encontrada')
    }

    const updatedRecipe: Recipe = {
      ...recipe,
      ...data,
      updated_at: new Date().toISOString(),
    }

    // Atualizar ingredientes se fornecidos
    if (data.ingredients) {
      updatedRecipe.ingredients = data.ingredients.map((ingredient: any) => ({
        id: ingredient.id || this.db.generateId(),
        recipe_id: id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))
    }

    // Atualizar tags se fornecidas
    if (data.tags) {
      updatedRecipe.tags = data.tags.map((tag: string) => ({
        id: this.db.generateId(),
        recipe_id: id,
        tag: tag,
      }))
    }

    this.db.updateRecipe(id, updatedRecipe)
    return updatedRecipe
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.delay()
    this.log('Delete recipe', id)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    this.db.deleteRecipe(id)
  }

  async addFavoriteRecipe(recipeId: string): Promise<void> {
    await this.delay()
    this.log('Add favorite recipe', recipeId)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const recipe = this.db.getRecipe(recipeId)
    if (!recipe) {
      throw new Error('Receita não encontrada')
    }

    this.db.updateRecipe(recipeId, { ...recipe, is_favorite: true })
  }

  async removeFavoriteRecipe(recipeId: string): Promise<void> {
    await this.delay()
    this.log('Remove favorite recipe', recipeId)

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    const recipe = this.db.getRecipe(recipeId)
    if (!recipe) {
      throw new Error('Receita não encontrada')
    }

    this.db.updateRecipe(recipeId, { ...recipe, is_favorite: false })
  }

  async uploadRecipeImage(file: File): Promise<string> {
    await this.delay()
    this.log('Upload recipe image', { fileName: file.name, size: file.size })

    if (this.shouldSimulateError()) {
      this.throwRandomError()
    }

    // Simular upload retornando URL mock
    return `https://mock-storage.com/recipe-images/${Date.now()}-${file.name}`
  }

  async getHiperfocos(params?: GetHiperfocosParams): Promise<Hiperfoco[]> {
    await this.delay()
    this.log('Get hiperfocos - NOT IMPLEMENTED')
    return this.db.getHiperfocos()
  }

  async getHiperfoco(id: string): Promise<Hiperfoco> {
    throw new Error('Método getHiperfoco ainda não implementado no FastAPIProvider')
  }

  async createHiperfoco(data: Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Hiperfoco> {
    throw new Error('Método createHiperfoco ainda não implementado no FastAPIProvider')
  }

  async updateHiperfoco(id: string, data: Partial<Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Hiperfoco> {
    throw new Error('Método updateHiperfoco ainda não implementado no FastAPIProvider')
  }

  async deleteHiperfoco(id: string): Promise<void> {
    throw new Error('Método deleteHiperfoco ainda não implementado no FastAPIProvider')
  }

  async getTasks(params?: GetTasksParams): Promise<Task[]> {
    await this.delay()
    this.log('Get tasks - NOT IMPLEMENTED')
    return this.db.getTasks()
  }

  async createTask(data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    throw new Error('Método createTask ainda não implementado no FastAPIProvider')
  }

  async updateTask(id: string, data: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    throw new Error('Método updateTask ainda não implementado no FastAPIProvider')
  }

  async toggleTask(id: string): Promise<Task> {
    throw new Error('Método toggleTask ainda não implementado no FastAPIProvider')
  }

  async deleteTask(id: string): Promise<void> {
    throw new Error('Método deleteTask ainda não implementado no FastAPIProvider')
  }
}
