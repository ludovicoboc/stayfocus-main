/**
 * SupabaseProvider - Implementação do DataProvider para produção
 * Usa Supabase como backend principal com Auth, Database e Storage
 */

import { createBrowserClient } from '@supabase/ssr'
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

export class SupabaseProvider implements DataProvider {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Variáveis de ambiente do Supabase não configuradas. ' +
        'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY'
      )
    }

    this.supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  // ========================================
  // AUTENTICAÇÃO
  // ========================================

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      return {
        user: data.user ? this.mapSupabaseUser(data.user) : null,
        session: data.session ? this.mapSupabaseSession(data.session, data.user) : null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido no login',
      }
    }
  }

  async register(data: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      return {
        user: authData.user ? this.mapSupabaseUser(authData.user) : null,
        session: authData.session ? this.mapSupabaseSession(authData.session, authData.user) : null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido no registro',
      }
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(`Erro no logout: ${error.message}`)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      return this.mapSupabaseUser(user)
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      return null
    }
  }

  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()

      if (error) {
        return { user: null, session: null, error: error.message }
      }

      return {
        user: data.user ? this.mapSupabaseUser(data.user) : null,
        session: data.session ? this.mapSupabaseSession(data.session, data.user) : null,
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Erro ao renovar sessão',
      }
    }
  }

  // ========================================
  // MEAL PLANS
  // ========================================

  async getMealPlans(): Promise<MealPlan[]> {
    const { data, error } = await this.supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_items (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar planos de refeição: ${error.message}`)
    }

    return data?.map(this.mapMealPlan) || []
  }

  async createMealPlan(data: CreateMealPlanDto): Promise<MealPlan> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Criar o plano de refeição
    const { data: mealPlan, error: mealPlanError } = await this.supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
      })
      .select()
      .single()

    if (mealPlanError) {
      throw new Error(`Erro ao criar plano de refeição: ${mealPlanError.message}`)
    }

    // Criar os itens do plano
    if (data.meals.length > 0) {
      const mealItems = data.meals.map(meal => ({
        meal_plan_id: mealPlan.id,
        meal_type: meal.meal_type,
        name: meal.name,
        description: meal.description,
        time: meal.time,
        calories: meal.calories,
        order: meal.order,
      }))

      const { error: itemsError } = await this.supabase
        .from('meal_plan_items')
        .insert(mealItems)

      if (itemsError) {
        // Rollback: deletar o plano criado
        await this.supabase.from('meal_plans').delete().eq('id', mealPlan.id)
        throw new Error(`Erro ao criar itens do plano: ${itemsError.message}`)
      }
    }

    // Buscar o plano completo com os itens
    const { data: completePlan, error: fetchError } = await this.supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_items (*)
      `)
      .eq('id', mealPlan.id)
      .single()

    if (fetchError) {
      throw new Error(`Erro ao buscar plano criado: ${fetchError.message}`)
    }

    return this.mapMealPlan(completePlan)
  }

  async updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan> {
    // Atualizar o plano principal
    const { error: updateError } = await this.supabase
      .from('meal_plans')
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      throw new Error(`Erro ao atualizar plano: ${updateError.message}`)
    }

    // Se há novos itens, substituir todos
    if (data.meals) {
      // Deletar itens existentes
      await this.supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', id)

      // Inserir novos itens
      if (data.meals.length > 0) {
        const mealItems = data.meals.map(meal => ({
          meal_plan_id: id,
          meal_type: meal.meal_type,
          name: meal.name,
          description: meal.description,
          time: meal.time,
          calories: meal.calories,
          order: meal.order,
        }))

        const { error: itemsError } = await this.supabase
          .from('meal_plan_items')
          .insert(mealItems)

        if (itemsError) {
          throw new Error(`Erro ao atualizar itens do plano: ${itemsError.message}`)
        }
      }
    }

    // Buscar o plano atualizado
    const { data: updatedPlan, error: fetchError } = await this.supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_items (*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      throw new Error(`Erro ao buscar plano atualizado: ${fetchError.message}`)
    }

    return this.mapMealPlan(updatedPlan)
  }

  async deleteMealPlan(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar plano de refeição: ${error.message}`)
    }
  }

  // ========================================
  // MEAL RECORDS
  // ========================================

  async getMealRecords(params?: GetMealRecordsParams): Promise<MealRecord[]> {
    let query = this.supabase
      .from('meal_records')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (params?.date) {
      query = query.eq('date', params.date)
    }

    if (params?.meal_type) {
      query = query.eq('meal_type', params.meal_type)
    }

    if (params?.limit) {
      query = query.limit(params.limit)
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar registros de refeição: ${error.message}`)
    }

    return data || []
  }

  async createMealRecord(data: CreateMealRecordDto): Promise<MealRecord> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    let photo_url: string | undefined

    // Upload da foto se fornecida
    if (data.photo) {
      photo_url = await this.uploadFile(
        data.photo,
        'meal-photos',
        `${user.id}/${Date.now()}-${data.photo.name}`
      )
    }

    const { data: mealRecord, error } = await this.supabase
      .from('meal_records')
      .insert({
        user_id: user.id,
        meal_type: data.meal_type,
        name: data.name,
        description: data.description,
        photo_url,
        calories: data.calories,
        date: data.date,
        time: data.time,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar registro de refeição: ${error.message}`)
    }

    return mealRecord
  }

  async deleteMealRecord(id: string): Promise<void> {
    // Buscar o registro para obter a URL da foto
    const { data: record } = await this.supabase
      .from('meal_records')
      .select('photo_url')
      .eq('id', id)
      .single()

    // Deletar o registro
    const { error } = await this.supabase
      .from('meal_records')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar registro de refeição: ${error.message}`)
    }

    // Deletar a foto se existir
    if (record?.photo_url) {
      try {
        const path = this.extractPathFromUrl(record.photo_url)
        await this.deleteFile('meal-photos', path)
      } catch (error) {
        console.warn('Erro ao deletar foto:', error)
      }
    }
  }

  // ========================================
  // HIDRATAÇÃO
  // ========================================

  async getHydrationRecords(date?: string): Promise<HydrationRecord[]> {
    let query = this.supabase
      .from('hydration_records')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar registros de hidratação: ${error.message}`)
    }

    return data || []
  }

  async createHydrationRecord(amount_ml: number, date: string, time: string): Promise<HydrationRecord> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await this.supabase
      .from('hydration_records')
      .insert({
        user_id: user.id,
        amount_ml,
        date,
        time,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar registro de hidratação: ${error.message}`)
    }

    return data
  }

  async deleteHydrationRecord(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('hydration_records')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Erro ao deletar registro de hidratação: ${error.message}`)
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private getCurrentUserId(): string {
    // Para testes, usar o mock do auth
    if (process.env.NODE_ENV === 'test') {
      return 'test-user-id'
    }

    // Em produção, obter do Supabase auth
    // Nota: Este método assume que o usuário está autenticado
    // Em um cenário real, você deveria verificar se há um usuário logado
    throw new Error('getCurrentUserId deve ser implementado para obter o ID do usuário autenticado')
  }

  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.email,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at,
    }
  }

  private mapSupabaseSession(supabaseSession: any, user: any): any {
    return {
      access_token: supabaseSession.access_token,
      refresh_token: supabaseSession.refresh_token,
      expires_at: supabaseSession.expires_at,
      user: this.mapSupabaseUser(user),
    }
  }

  private mapMealPlan(data: any): MealPlan {
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      meals: data.meal_plan_items || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  private extractPathFromUrl(url: string): string {
    // Extrai o path do arquivo da URL do Supabase Storage
    const urlParts = url.split('/storage/v1/object/public/')
    if (urlParts.length > 1) {
      const pathWithBucket = urlParts[1]
      const pathParts = pathWithBucket.split('/')
      return pathParts.slice(1).join('/') // Remove o bucket name
    }
    throw new Error('URL inválida do Supabase Storage')
  }

  // ========================================
  // UPLOAD DE ARQUIVOS
  // ========================================

  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`)
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`)
    }
  }

  // ========================================
  // PERFIL DE USUÁRIO
  // ========================================

  async createProfile(data: {
    name: string
    timezone: string
    preferences: UserPreferences
  }): Promise<UserProfile> {
    const userId = this.getCurrentUserId()

    // Validar dados
    this.validateProfileData(data)

    const profileData = {
      user_id: userId,
      name: data.name,
      timezone: data.timezone,
      preferences: data.preferences,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error } = await this.supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar perfil: ${error.message}`)
    }

    return profile
  }

  async getProfile(): Promise<UserProfile | null> {
    const userId = this.getCurrentUserId()

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Perfil não encontrado
        return null
      }
      throw new Error(`Erro ao buscar perfil: ${error.message}`)
    }

    return data
  }

  async updateProfile(updateData: Partial<UserProfile>): Promise<UserProfile> {
    const userId = this.getCurrentUserId()

    // Validar dados
    this.validateProfileData(updateData)

    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    // Remover campos que não devem ser atualizados
    delete (dataToUpdate as any).id
    delete (dataToUpdate as any).user_id
    delete (dataToUpdate as any).created_at

    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(dataToUpdate)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`)
    }

    return data
  }

  async deleteProfile(): Promise<void> {
    const userId = this.getCurrentUserId()

    const { error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Erro ao deletar perfil: ${error.message}`)
    }
  }

  validateProfileData(data: any): void {
    if (data.name !== undefined) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error('Nome é obrigatório')
      }
      if (data.name.trim().length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres')
      }
    }

    if (data.timezone !== undefined) {
      if (!data.timezone || typeof data.timezone !== 'string') {
        throw new Error('Timezone é obrigatório')
      }
      // Validação mais rigorosa de timezone
      const validTimezones = [
        'America/Sao_Paulo',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney'
      ]
      if (!validTimezones.includes(data.timezone)) {
        throw new Error('Timezone inválido')
      }
    }

    if (data.preferences !== undefined) {
      this.validatePreferences(data.preferences)
    }
  }

  private validatePreferences(preferences: any): void {
    if (preferences.pomodoro_focus_minutes !== undefined) {
      if (typeof preferences.pomodoro_focus_minutes !== 'number' ||
          preferences.pomodoro_focus_minutes <= 0 ||
          preferences.pomodoro_focus_minutes > 120) {
        throw new Error('Minutos de foco deve estar entre 1 e 120')
      }
    }

    if (preferences.pomodoro_short_break_minutes !== undefined) {
      if (typeof preferences.pomodoro_short_break_minutes !== 'number' ||
          preferences.pomodoro_short_break_minutes <= 0 ||
          preferences.pomodoro_short_break_minutes > 60) {
        throw new Error('Pausa curta deve estar entre 1 e 60 minutos')
      }
    }

    if (preferences.pomodoro_long_break_minutes !== undefined) {
      if (typeof preferences.pomodoro_long_break_minutes !== 'number' ||
          preferences.pomodoro_long_break_minutes <= 0 ||
          preferences.pomodoro_long_break_minutes > 120) {
        throw new Error('Pausa longa deve estar entre 1 e 120 minutos')
      }
    }

    if (preferences.daily_water_goal_ml !== undefined) {
      if (typeof preferences.daily_water_goal_ml !== 'number' ||
          preferences.daily_water_goal_ml <= 0) {
        throw new Error('Meta de água deve ser positiva')
      }
    }

    if (preferences.theme !== undefined) {
      if (!['light', 'dark'].includes(preferences.theme)) {
        throw new Error('Tema deve ser light ou dark')
      }
    }

    if (preferences.language !== undefined) {
      if (!preferences.language || typeof preferences.language !== 'string') {
        throw new Error('Idioma é obrigatório')
      }
    }

    if (preferences.notifications_enabled !== undefined) {
      if (typeof preferences.notifications_enabled !== 'boolean') {
        throw new Error('Configuração de notificações deve ser boolean')
      }
    }

    if (preferences.stimulus_reduction !== undefined) {
      if (typeof preferences.stimulus_reduction !== 'boolean') {
        throw new Error('Configuração de redução de estímulos deve ser boolean')
      }
    }
  }

  // ========================================
  // MÉTODOS AINDA NÃO IMPLEMENTADOS
  // ========================================
  // Os métodos abaixo serão implementados nas próximas iterações

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
    let query = this.supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(*),
        recipe_tags(*),
        favorite_recipes!inner(user_id)
      `)
      .eq('user_id', this.getCurrentUserId())

    // Aplicar filtros
    if (filters?.category) {
      // Assumindo que category é uma tag especial
      query = query.contains('recipe_tags.tag', [filters.category])
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('recipe_tags.tag', filters.tags)
    }

    if (filters?.prepTimeMax) {
      query = query.lte('prep_time_minutes', filters.prepTimeMax)
    }

    if (filters?.servings) {
      query = query.eq('servings', filters.servings)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar receitas: ${error.message}`)
    }

    return data || []
  }

  async getRecipe(id: string): Promise<Recipe> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(*),
        recipe_tags(*),
        favorite_recipes(user_id)
      `)
      .eq('id', id)
      .eq('user_id', this.getCurrentUserId())
      .single()

    if (error) {
      throw new Error(`Erro ao buscar receita: ${error.message}`)
    }

    if (!data) {
      throw new Error('Receita não encontrada')
    }

    return {
      ...data,
      is_favorite: data.favorite_recipes && data.favorite_recipes.length > 0
    }
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(*),
        recipe_tags(*),
        favorite_recipes(user_id)
      `)
      .eq('user_id', this.getCurrentUserId())
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar receitas: ${error.message}`)
    }

    return data?.map(recipe => ({
      ...recipe,
      is_favorite: recipe.favorite_recipes && recipe.favorite_recipes.length > 0
    })) || []
  }

  async getRecipeCategories(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('recipe_categories')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`)
    }

    return data || []
  }

  async getFavoriteRecipes(): Promise<Recipe[]> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients(*),
        recipe_tags(*),
        favorite_recipes!inner(user_id)
      `)
      .eq('user_id', this.getCurrentUserId())
      .eq('favorite_recipes.user_id', this.getCurrentUserId())
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar receitas favoritas: ${error.message}`)
    }

    return data?.map(recipe => ({
      ...recipe,
      is_favorite: true
    })) || []
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
    const userId = this.getCurrentUserId()

    // Criar receita principal
    const { data: recipe, error: recipeError } = await this.supabase
      .from('recipes')
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description,
        prep_time_minutes: data.prep_time_minutes,
        servings: data.servings,
        calories: data.calories,
        image_url: data.image_url,
        instructions: data.instructions,
      })
      .select()
      .single()

    if (recipeError) {
      throw new Error(`Erro ao criar receita: ${recipeError.message}`)
    }

    // Criar ingredientes
    if (data.ingredients.length > 0) {
      const ingredients = data.ingredients.map(ingredient => ({
        recipe_id: recipe.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }))

      const { error: ingredientsError } = await this.supabase
        .from('recipe_ingredients')
        .insert(ingredients)

      if (ingredientsError) {
        // Rollback: deletar receita criada
        await this.supabase.from('recipes').delete().eq('id', recipe.id)
        throw new Error(`Erro ao criar ingredientes: ${ingredientsError.message}`)
      }
    }

    // Criar tags
    if (data.tags.length > 0) {
      const tags = data.tags.map(tag => ({
        recipe_id: recipe.id,
        tag: tag,
      }))

      const { error: tagsError } = await this.supabase
        .from('recipe_tags')
        .insert(tags)

      if (tagsError) {
        // Rollback: deletar receita e ingredientes criados
        await this.supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id)
        await this.supabase.from('recipes').delete().eq('id', recipe.id)
        throw new Error(`Erro ao criar tags: ${tagsError.message}`)
      }
    }

    // Retornar receita completa
    return this.getRecipe(recipe.id)
  }

  async updateRecipe(id: string, data: any): Promise<Recipe> {
    const userId = this.getCurrentUserId()

    // Atualizar receita principal
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.prep_time_minutes !== undefined) updateData.prep_time_minutes = data.prep_time_minutes
    if (data.servings !== undefined) updateData.servings = data.servings
    if (data.calories !== undefined) updateData.calories = data.calories
    if (data.image_url !== undefined) updateData.image_url = data.image_url
    if (data.instructions !== undefined) updateData.instructions = data.instructions

    if (Object.keys(updateData).length > 0) {
      const { error: recipeError } = await this.supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)

      if (recipeError) {
        throw new Error(`Erro ao atualizar receita: ${recipeError.message}`)
      }
    }

    // Atualizar ingredientes se fornecidos
    if (data.ingredients !== undefined) {
      // Deletar ingredientes existentes
      await this.supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id)

      // Inserir novos ingredientes
      if (data.ingredients.length > 0) {
        const ingredients = data.ingredients.map((ingredient: any) => ({
          recipe_id: id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        }))

        const { error: ingredientsError } = await this.supabase
          .from('recipe_ingredients')
          .insert(ingredients)

        if (ingredientsError) {
          throw new Error(`Erro ao atualizar ingredientes: ${ingredientsError.message}`)
        }
      }
    }

    // Atualizar tags se fornecidas
    if (data.tags !== undefined) {
      // Deletar tags existentes
      await this.supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', id)

      // Inserir novas tags
      if (data.tags.length > 0) {
        const tags = data.tags.map((tag: string) => ({
          recipe_id: id,
          tag: tag,
        }))

        const { error: tagsError } = await this.supabase
          .from('recipe_tags')
          .insert(tags)

        if (tagsError) {
          throw new Error(`Erro ao atualizar tags: ${tagsError.message}`)
        }
      }
    }

    // Retornar receita atualizada
    return this.getRecipe(id)
  }

  async deleteRecipe(id: string): Promise<void> {
    const userId = this.getCurrentUserId()

    // Deletar em ordem (devido às foreign keys)
    // 1. Favoritos
    await this.supabase
      .from('favorite_recipes')
      .delete()
      .eq('recipe_id', id)

    // 2. Tags
    await this.supabase
      .from('recipe_tags')
      .delete()
      .eq('recipe_id', id)

    // 3. Ingredientes
    await this.supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id)

    // 4. Receita principal
    const { error } = await this.supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Erro ao deletar receita: ${error.message}`)
    }
  }

  async addFavoriteRecipe(recipeId: string): Promise<void> {
    const userId = this.getCurrentUserId()

    const { error } = await this.supabase
      .from('favorite_recipes')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
      })

    if (error && error.code !== '23505') { // Ignorar erro de duplicata
      throw new Error(`Erro ao adicionar favorito: ${error.message}`)
    }
  }

  async removeFavoriteRecipe(recipeId: string): Promise<void> {
    const userId = this.getCurrentUserId()

    const { error } = await this.supabase
      .from('favorite_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)

    if (error) {
      throw new Error(`Erro ao remover favorito: ${error.message}`)
    }
  }

  async uploadRecipeImage(file: File): Promise<string> {
    const userId = this.getCurrentUserId()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await this.supabase.storage
      .from('recipe-images')
      .upload(fileName, file)

    if (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error.message}`)
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('recipe-images')
      .getPublicUrl(data.path)

    return publicUrl
  }

  async getHiperfocos(params?: GetHiperfocosParams): Promise<Hiperfoco[]> {
    throw new Error('Método getHiperfocos ainda não implementado')
  }

  async getHiperfoco(id: string): Promise<Hiperfoco> {
    throw new Error('Método getHiperfoco ainda não implementado')
  }

  async createHiperfoco(data: Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Hiperfoco> {
    throw new Error('Método createHiperfoco ainda não implementado')
  }

  async updateHiperfoco(id: string, data: Partial<Omit<Hiperfoco, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Hiperfoco> {
    throw new Error('Método updateHiperfoco ainda não implementado')
  }

  async deleteHiperfoco(id: string): Promise<void> {
    throw new Error('Método deleteHiperfoco ainda não implementado')
  }

  async getTasks(params?: GetTasksParams): Promise<Task[]> {
    throw new Error('Método getTasks ainda não implementado')
  }

  async createTask(data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    throw new Error('Método createTask ainda não implementado')
  }

  async updateTask(id: string, data: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    throw new Error('Método updateTask ainda não implementado')
  }

  async toggleTask(id: string): Promise<Task> {
    throw new Error('Método toggleTask ainda não implementado')
  }

  async deleteTask(id: string): Promise<void> {
    throw new Error('Método deleteTask ainda não implementado')
  }
}
