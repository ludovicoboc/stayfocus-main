-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS COMPLETAS
-- =============================================================================
-- 
-- Este script implementa políticas RLS para todas as tabelas do sistema
-- garantindo isolamento completo de dados entre usuários.
--
-- Execução: Execute este script no SQL Editor do Supabase Dashboard
-- Pré-requisitos: Tabelas já criadas e extensões habilitadas
--
-- =============================================================================

-- Habilitar RLS em todas as tabelas principais
-- =============================================================================

-- Tabelas do módulo Hiperfocos
ALTER TABLE hiperfocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_alternancia ENABLE ROW LEVEL SECURITY;

-- Tabelas do módulo Alimentação
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS PARA TABELA: users
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Políticas para users (perfil do usuário)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: hiperfocos
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own hiperfocos" ON hiperfocos;
DROP POLICY IF EXISTS "Users can insert their own hiperfocos" ON hiperfocos;
DROP POLICY IF EXISTS "Users can update their own hiperfocos" ON hiperfocos;
DROP POLICY IF EXISTS "Users can delete their own hiperfocos" ON hiperfocos;

-- Políticas para hiperfocos
CREATE POLICY "Users can view their own hiperfocos" ON hiperfocos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hiperfocos" ON hiperfocos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hiperfocos" ON hiperfocos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hiperfocos" ON hiperfocos
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: tarefas
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own tarefas" ON tarefas;
DROP POLICY IF EXISTS "Users can insert their own tarefas" ON tarefas;
DROP POLICY IF EXISTS "Users can update their own tarefas" ON tarefas;
DROP POLICY IF EXISTS "Users can delete their own tarefas" ON tarefas;

-- Políticas para tarefas
CREATE POLICY "Users can view their own tarefas" ON tarefas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tarefas" ON tarefas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tarefas" ON tarefas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tarefas" ON tarefas
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: sessoes_alternancia
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own sessoes" ON sessoes_alternancia;
DROP POLICY IF EXISTS "Users can insert their own sessoes" ON sessoes_alternancia;
DROP POLICY IF EXISTS "Users can update their own sessoes" ON sessoes_alternancia;
DROP POLICY IF EXISTS "Users can delete their own sessoes" ON sessoes_alternancia;

-- Políticas para sessoes_alternancia
CREATE POLICY "Users can view their own sessoes" ON sessoes_alternancia
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessoes" ON sessoes_alternancia
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessoes" ON sessoes_alternancia
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessoes" ON sessoes_alternancia
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: meal_plans
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;

-- Políticas para meal_plans
CREATE POLICY "Users can view own meal plans" ON meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: meal_records
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own meal records" ON meal_records;
DROP POLICY IF EXISTS "Users can insert own meal records" ON meal_records;
DROP POLICY IF EXISTS "Users can update own meal records" ON meal_records;
DROP POLICY IF EXISTS "Users can delete own meal records" ON meal_records;

-- Políticas para meal_records
CREATE POLICY "Users can view own meal records" ON meal_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal records" ON meal_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal records" ON meal_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal records" ON meal_records
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: hydration_tracking
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own hydration data" ON hydration_tracking;
DROP POLICY IF EXISTS "Users can insert own hydration data" ON hydration_tracking;
DROP POLICY IF EXISTS "Users can update own hydration data" ON hydration_tracking;
DROP POLICY IF EXISTS "Users can delete own hydration data" ON hydration_tracking;

-- Políticas para hydration_tracking
CREATE POLICY "Users can view own hydration data" ON hydration_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration data" ON hydration_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration data" ON hydration_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration data" ON hydration_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: recipes
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Políticas para recipes
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POLÍTICAS PARA TABELA: recipe_ingredients
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own recipe ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Users can insert own recipe ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Users can update own recipe ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "Users can delete own recipe ingredients" ON recipe_ingredients;

-- Políticas para recipe_ingredients (baseado no user_id da receita)
CREATE POLICY "Users can view own recipe ingredients" ON recipe_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own recipe ingredients" ON recipe_ingredients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own recipe ingredients" ON recipe_ingredients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM recipes 
            WHERE recipes.id = recipe_ingredients.recipe_id 
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own recipe ingredients" ON recipe_ingredients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

-- =============================================================================
-- POLÍTICAS PARA TABELA: recipe_tags
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own recipe tags" ON recipe_tags;
DROP POLICY IF EXISTS "Users can insert own recipe tags" ON recipe_tags;
DROP POLICY IF EXISTS "Users can update own recipe tags" ON recipe_tags;
DROP POLICY IF EXISTS "Users can delete own recipe tags" ON recipe_tags;

-- Políticas para recipe_tags (baseado no user_id da receita)
CREATE POLICY "Users can view own recipe tags" ON recipe_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_tags.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own recipe tags" ON recipe_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_tags.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own recipe tags" ON recipe_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_tags.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own recipe tags" ON recipe_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_tags.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

-- =============================================================================
-- POLÍTICAS PARA TABELA: recipe_categories
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Anyone can view recipe categories" ON recipe_categories;

-- Políticas para recipe_categories (leitura pública)
CREATE POLICY "Anyone can view recipe categories" ON recipe_categories
    FOR SELECT USING (true);

-- =============================================================================
-- POLÍTICAS PARA TABELA: recipe_category_assignments
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own recipe category assignments" ON recipe_category_assignments;
DROP POLICY IF EXISTS "Users can insert own recipe category assignments" ON recipe_category_assignments;
DROP POLICY IF EXISTS "Users can delete own recipe category assignments" ON recipe_category_assignments;

-- Políticas para recipe_category_assignments (baseado no user_id da receita)
CREATE POLICY "Users can view own recipe category assignments" ON recipe_category_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_category_assignments.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own recipe category assignments" ON recipe_category_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_category_assignments.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own recipe category assignments" ON recipe_category_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_category_assignments.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

-- =============================================================================
-- POLÍTICAS PARA TABELA: favorite_recipes
-- =============================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own favorite recipes" ON favorite_recipes;
DROP POLICY IF EXISTS "Users can insert own favorite recipes" ON favorite_recipes;
DROP POLICY IF EXISTS "Users can delete own favorite recipes" ON favorite_recipes;

-- Políticas para favorite_recipes
CREATE POLICY "Users can view own favorite recipes" ON favorite_recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite recipes" ON favorite_recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite recipes" ON favorite_recipes
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- VERIFICAÇÃO E VALIDAÇÃO
-- =============================================================================

-- Verificar se RLS está habilitado em todas as tabelas
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'hiperfocos', 'tarefas', 'sessoes_alternancia',
        'meal_plans', 'meal_records', 'hydration_tracking', 'recipes',
        'recipe_ingredients', 'recipe_tags', 'recipe_categories',
        'recipe_category_assignments', 'favorite_recipes'
    )
ORDER BY tablename;

-- Verificar políticas criadas
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'hiperfocos', 'tarefas', 'sessoes_alternancia',
        'meal_plans', 'meal_records', 'hydration_tracking', 'recipes',
        'recipe_ingredients', 'recipe_tags', 'recipe_categories',
        'recipe_category_assignments', 'favorite_recipes'
    )
ORDER BY tablename, policyname;

-- =============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON POLICY "Users can view their own hiperfocos" ON hiperfocos IS
'Permite que usuários vejam apenas seus próprios hiperfocos usando auth.uid()';

COMMENT ON POLICY "Users can view own meal plans" ON meal_plans IS
'Permite que usuários vejam apenas seus próprios planos de refeição';

COMMENT ON POLICY "Users can view own recipe ingredients" ON recipe_ingredients IS
'Permite acesso aos ingredientes apenas das receitas que pertencem ao usuário';

COMMENT ON POLICY "Anyone can view recipe categories" ON recipe_categories IS
'Categorias de receitas são públicas para todos os usuários';

-- =============================================================================
-- FINALIZAÇÃO
-- =============================================================================

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE 'RLS Policies aplicadas com sucesso!';
    RAISE NOTICE 'Tabelas protegidas: users, hiperfocos, tarefas, sessoes_alternancia, meal_plans, meal_records, hydration_tracking, recipes, recipe_ingredients, recipe_tags, recipe_categories, recipe_category_assignments, favorite_recipes';
    RAISE NOTICE 'Verificar logs acima para confirmar que todas as políticas foram criadas corretamente.';
END $$;
