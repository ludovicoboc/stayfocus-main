/**
 * Tipos e interfaces para o sistema de Data Providers
 * Arquitetura Dual-Track: Supabase (produção) + FastAPI (desenvolvimento/TDD)
 */

// ============================================================================
// TIPOS DE RESPOSTA E AUTENTICAÇÃO
// ============================================================================

export interface AuthResponse {
  user: User | null
  session: Session | null
  error?: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

// ============================================================================
// TIPOS PARA ALIMENTAÇÃO
// ============================================================================

export interface MealPlan {
  id: string
  user_id: string
  name: string
  description?: string
  meals: MealPlanItem[]
  created_at: string
  updated_at: string
}

export interface MealPlanItem {
  id: string
  meal_plan_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  description?: string
  time?: string
  calories?: number
  order: number
}

export interface MealRecord {
  id: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  description?: string
  photo_url?: string
  calories?: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
  created_at: string
}

export interface HydrationRecord {
  id: string
  user_id: string
  amount_ml: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
  created_at: string
}

// ============================================================================
// TIPOS PARA RECEITAS
// ============================================================================

export interface Recipe {
  id: string
  user_id: string
  name: string
  description?: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  prep_time_minutes?: number
  cook_time_minutes?: number
  servings?: number
  calories_per_serving?: number
  photo_url?: string
  tags: string[]
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  name: string
  amount: string
  unit: string
  order: number
}

// ============================================================================
// TIPOS PARA HIPERFOCOS
// ============================================================================

export interface Hiperfoco {
  id: string
  user_id: string
  title: string
  description?: string
  color: string
  time_limit_minutes?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  hiperfoco_id: string
  parent_task_id?: string // Para sub-tarefas
  text: string
  completed: boolean
  color?: string
  order: number
  created_at: string
  updated_at: string
}

export interface AlternanceSession {
  id: string
  user_id: string
  title: string
  current_hiperfoco_id?: string
  previous_hiperfoco_id?: string
  start_time: string
  estimated_duration_minutes: number
  completed: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// TIPOS PARA SAÚDE
// ============================================================================

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage?: string
  frequency: string[]
  times: string[] // Horários específicos
  start_date: string
  end_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MedicationRecord {
  id: string
  user_id: string
  medication_id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  taken: boolean
  notes?: string
  created_at: string
}

export interface MoodRecord {
  id: string
  user_id: string
  mood_level: number // 1-10
  energy_level: number // 1-10
  anxiety_level: number // 1-10
  notes?: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  created_at: string
}

// ============================================================================
// TIPOS PARA ESTUDOS
// ============================================================================

export interface StudySession {
  id: string
  user_id: string
  subject: string
  description?: string
  duration_minutes: number
  pomodoro_count: number
  start_time: string
  end_time: string
  date: string // YYYY-MM-DD
  productivity_rating?: number // 1-10
  notes?: string
  created_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  study_session_id?: string
  type: 'focus' | 'short_break' | 'long_break'
  duration_minutes: number
  start_time: string
  end_time?: string
  completed: boolean
  created_at: string
}

// ============================================================================
// TIPOS PARA SONO
// ============================================================================

export interface SleepRecord {
  id: string
  user_id: string
  bedtime: string // HH:MM
  wake_time: string // HH:MM
  sleep_quality: number // 1-10
  duration_hours: number
  date: string // YYYY-MM-DD
  notes?: string
  created_at: string
}

// ============================================================================
// TIPOS PARA LAZER
// ============================================================================

export interface LeisureActivity {
  id: string
  user_id: string
  name: string
  category: string
  duration_minutes: number
  enjoyment_rating?: number // 1-10
  date: string // YYYY-MM-DD
  time: string // HH:MM
  notes?: string
  created_at: string
}

// ============================================================================
// TIPOS PARA PERFIL E CONFIGURAÇÕES
// ============================================================================

export interface UserProfile {
  id: string
  user_id: string
  name: string
  avatar_url?: string
  timezone: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notifications_enabled: boolean
  pomodoro_focus_minutes: number
  pomodoro_short_break_minutes: number
  pomodoro_long_break_minutes: number
  daily_water_goal_ml: number
  stimulus_reduction: boolean
}

// ============================================================================
// DTOs PARA CRIAÇÃO E ATUALIZAÇÃO
// ============================================================================

export interface CreateMealPlanDto {
  name: string
  description?: string
  meals: Omit<MealPlanItem, 'id' | 'meal_plan_id'>[]
}

export interface UpdateMealPlanDto {
  name?: string
  description?: string
  meals?: Omit<MealPlanItem, 'id' | 'meal_plan_id'>[]
}

export interface CreateMealRecordDto {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  description?: string
  photo?: File
  calories?: number
  date: string
  time: string
}

export interface CreateRecipeDto {
  name: string
  description?: string
  ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[]
  instructions: string[]
  prep_time_minutes?: number
  cook_time_minutes?: number
  servings?: number
  calories_per_serving?: number
  photo?: File
  tags: string[]
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface UpdateRecipeDto {
  name?: string
  description?: string
  ingredients?: Omit<RecipeIngredient, 'id' | 'recipe_id'>[]
  instructions?: string[]
  prep_time_minutes?: number
  cook_time_minutes?: number
  servings?: number
  calories_per_serving?: number
  photo?: File
  tags?: string[]
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  is_favorite?: boolean
}

// ============================================================================
// PARÂMETROS DE CONSULTA
// ============================================================================

export interface GetMealRecordsParams {
  date?: string
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  limit?: number
  offset?: number
}

export interface GetRecipesParams {
  category?: string
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  is_favorite?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface GetHiperfocosParams {
  limit?: number
  offset?: number
  order_by?: 'created_at' | 'updated_at' | 'title'
  order_direction?: 'asc' | 'desc'
}

export interface GetTasksParams {
  hiperfoco_id?: string
  completed?: boolean
  parent_task_id?: string
  limit?: number
  offset?: number
}

// ============================================================================
// INTERFACE PRINCIPAL DO DATA PROVIDER
// ============================================================================

export interface DataProvider {
  // ========================================
  // AUTENTICAÇÃO
  // ========================================
  login(email: string, password: string): Promise<AuthResponse>
  register(data: { email: string; password: string; name?: string }): Promise<AuthResponse>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  refreshSession(): Promise<AuthResponse>

  // ========================================
  // MEAL PLANS
  // ========================================
  getMealPlans(): Promise<MealPlan[]>
  createMealPlan(data: CreateMealPlanDto): Promise<MealPlan>
  updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan>
  deleteMealPlan(id: string): Promise<void>

  // ========================================
  // MEAL RECORDS
  // ========================================
  getMealRecords(params?: GetMealRecordsParams): Promise<MealRecord[]>
  createMealRecord(data: CreateMealRecordDto): Promise<MealRecord>
  deleteMealRecord(id: string): Promise<void>

  // ========================================
  // HIDRATAÇÃO
  // ========================================
  getHydrationRecords(date?: string): Promise<HydrationRecord[]>
  createHydrationRecord(amount_ml: number, date: string, time: string): Promise<HydrationRecord>
  deleteHydrationRecord(id: string): Promise<void>

  // ========================================
  // RECEITAS
  // ========================================
  getRecipes(params?: GetRecipesParams): Promise<Recipe[]>
  getRecipe(id: string): Promise<Recipe>
  createRecipe(data: CreateRecipeDto): Promise<Recipe>
  updateRecipe(id: string, data: UpdateRecipeDto): Promise<Recipe>
  deleteRecipe(id: string): Promise<void>
  toggleRecipeFavorite(id: string): Promise<Recipe>

  // ========================================
  // HIPERFOCOS
  // ========================================
  getHiperfocos(params?: GetHiperfocosParams): Promise<Hiperfoco[]>
  getHiperfoco(id: string): Promise<Hiperfoco>
  createHiperfoco(data: Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Hiperfoco>
  updateHiperfoco(id: string, data: Partial<Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Hiperfoco>
  deleteHiperfoco(id: string): Promise<void>

  // ========================================
  // TAREFAS
  // ========================================
  getTasks(params?: GetTasksParams): Promise<Task[]>
  createTask(data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task>
  updateTask(id: string, data: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task>
  toggleTask(id: string): Promise<Task>
  deleteTask(id: string): Promise<void>

  // ========================================
  // PERFIL DE USUÁRIO
  // ========================================
  createProfile(data: {
    name: string
    timezone: string
    preferences: UserPreferences
  }): Promise<UserProfile>
  getProfile(): Promise<UserProfile | null>
  updateProfile(data: Partial<UserProfile>): Promise<UserProfile>
  deleteProfile(): Promise<void>
  validateProfileData(data: any): void

  // ========================================
  // UPLOAD DE ARQUIVOS
  // ========================================
  uploadFile(file: File, bucket: string, path: string): Promise<string> // Retorna URL do arquivo
  deleteFile(bucket: string, path: string): Promise<void>
}
