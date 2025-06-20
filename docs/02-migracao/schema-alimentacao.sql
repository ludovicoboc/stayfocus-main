-- =============================================================================
-- SCHEMA DE BANCO DE DADOS - MÓDULO ALIMENTAÇÃO
-- Compatível com PostgreSQL (Supabase + FastAPI local)
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELAS CORE
-- =============================================================================

-- Tabela de usuários (base para todo o sistema)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TABELAS DO MÓDULO ALIMENTAÇÃO
-- =============================================================================

-- Tabela de refeições planejadas
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time VARCHAR(5) NOT NULL, -- HH:MM format
    description VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_time_format CHECK (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);

-- Tabela de registros de refeições
CREATE TABLE IF NOT EXISTS meal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time VARCHAR(5) NOT NULL, -- HH:MM format
    description VARCHAR(500) NOT NULL,
    meal_type VARCHAR(50), -- 'cafe', 'fruta', 'salada', 'proteina', 'carboidrato', 'sobremesa', 'agua'
    photo_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_time_format CHECK (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    CONSTRAINT chk_meal_type CHECK (meal_type IN ('cafe', 'fruta', 'salada', 'proteina', 'carboidrato', 'sobremesa', 'agua') OR meal_type IS NULL)
);

-- Tabela de controle de hidratação
CREATE TABLE IF NOT EXISTS hydration_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    glasses_consumed INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 8,
    last_record_time VARCHAR(5), -- HH:MM format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_glasses_consumed CHECK (glasses_consumed >= 0),
    CONSTRAINT chk_daily_goal CHECK (daily_goal BETWEEN 1 AND 15),
    CONSTRAINT chk_last_record_time_format CHECK (last_record_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' OR last_record_time IS NULL),
    UNIQUE(user_id, date)
);

-- =============================================================================
-- TABELAS DO MÓDULO RECEITAS
-- =============================================================================

-- Tabela de categorias de receitas
CREATE TABLE IF NOT EXISTS recipe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prep_time_minutes INTEGER,
    servings INTEGER,
    calories VARCHAR(50),
    image_url VARCHAR(1000),
    instructions TEXT[], -- Array de strings para os passos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_prep_time CHECK (prep_time_minutes > 0 OR prep_time_minutes IS NULL),
    CONSTRAINT chk_servings CHECK (servings > 0 OR servings IS NULL)
);

-- Tabela de ingredientes de receitas
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_quantity CHECK (quantity > 0)
);

-- Tabela de tags de receitas
CREATE TABLE IF NOT EXISTS recipe_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorização de receitas
CREATE TABLE IF NOT EXISTS recipe_category_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES recipe_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, category_id)
);

-- Tabela de receitas favoritas
CREATE TABLE IF NOT EXISTS favorite_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

-- =============================================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para meal_plans
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_active ON meal_plans(user_id, is_active);

-- Índices para meal_records
CREATE INDEX IF NOT EXISTS idx_meal_records_user_id ON meal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_records_user_date ON meal_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_records_date ON meal_records(date);
CREATE INDEX IF NOT EXISTS idx_meal_records_meal_type ON meal_records(meal_type);

-- Índices para hydration_tracking
CREATE INDEX IF NOT EXISTS idx_hydration_user_id ON hydration_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON hydration_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hydration_date ON hydration_tracking(date);

-- Índices para recipes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON recipes(prep_time_minutes);

-- Índices para recipe_ingredients
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_name ON recipe_ingredients(name);

-- Índices para recipe_tags
CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag ON recipe_tags(tag);

-- Índices para favorite_recipes
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user_id ON favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_recipe_id ON favorite_recipes(recipe_id);

-- =============================================================================
-- DADOS INICIAIS (SEED DATA)
-- =============================================================================

-- Inserir categorias padrão de receitas
INSERT INTO recipe_categories (name) VALUES 
    ('Café da Manhã'),
    ('Almoço'),
    ('Jantar'),
    ('Lanche'),
    ('Sobremesa'),
    ('Bebida'),
    ('Vegetariana'),
    ('Vegana'),
    ('Sem Glúten'),
    ('Baixa Caloria')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- TRIGGERS E FUNÇÕES
-- =============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_meal_records_updated_at BEFORE UPDATE ON meal_records 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_hydration_tracking_updated_at BEFORE UPDATE ON hydration_tracking 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- RLS (ROW LEVEL SECURITY) - PARA SUPABASE
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para meal_plans
CREATE POLICY "Users can view own meal plans" ON meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para meal_records
CREATE POLICY "Users can view own meal records" ON meal_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal records" ON meal_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal records" ON meal_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal records" ON meal_records
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para hydration_tracking
CREATE POLICY "Users can view own hydration data" ON hydration_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration data" ON hydration_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration data" ON hydration_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration data" ON hydration_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para recipes
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para recipe_ingredients
CREATE POLICY "Users can view own recipe ingredients" ON recipe_ingredients
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can insert own recipe ingredients" ON recipe_ingredients
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can update own recipe ingredients" ON recipe_ingredients
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can delete own recipe ingredients" ON recipe_ingredients
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

-- Políticas RLS para recipe_tags
CREATE POLICY "Users can view own recipe tags" ON recipe_tags
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can insert own recipe tags" ON recipe_tags
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can update own recipe tags" ON recipe_tags
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can delete own recipe tags" ON recipe_tags
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

-- Políticas RLS para recipe_category_assignments
CREATE POLICY "Users can view own recipe categories" ON recipe_category_assignments
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can insert own recipe categories" ON recipe_category_assignments
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can update own recipe categories" ON recipe_category_assignments
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

CREATE POLICY "Users can delete own recipe categories" ON recipe_category_assignments
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM recipes WHERE id = recipe_id));

-- Políticas RLS para favorite_recipes
CREATE POLICY "Users can view own favorite recipes" ON favorite_recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite recipes" ON favorite_recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite recipes" ON favorite_recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para recipe_categories (apenas leitura pública)
CREATE POLICY "Anyone can view recipe categories" ON recipe_categories
    FOR SELECT USING (true);

-- =============================================================================
-- VIEWS ÚTEIS
-- =============================================================================

-- View para receitas com detalhes completos
CREATE OR REPLACE VIEW recipes_detailed AS
SELECT 
    r.id,
    r.user_id,
    r.name,
    r.description,
    r.prep_time_minutes,
    r.servings,
    r.calories,
    r.image_url,
    r.instructions,
    r.created_at,
    r.updated_at,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'name', ri.name,
                'quantity', ri.quantity,
                'unit', ri.unit
            )
        ) FILTER (WHERE ri.id IS NOT NULL), 
        '[]'::json
    ) AS ingredients,
    COALESCE(
        json_agg(DISTINCT rt.tag) FILTER (WHERE rt.tag IS NOT NULL), 
        '[]'::json
    ) AS tags,
    COALESCE(
        json_agg(DISTINCT rc.name) FILTER (WHERE rc.name IS NOT NULL), 
        '[]'::json
    ) AS categories,
    EXISTS(SELECT 1 FROM favorite_recipes fr WHERE fr.recipe_id = r.id AND fr.user_id = r.user_id) AS is_favorite
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
LEFT JOIN recipe_category_assignments rca ON r.id = rca.recipe_id
LEFT JOIN recipe_categories rc ON rca.category_id = rc.id
GROUP BY r.id, r.user_id, r.name, r.description, r.prep_time_minutes, 
         r.servings, r.calories, r.image_url, r.instructions, r.created_at, r.updated_at;

-- View para estatísticas de hidratação
CREATE OR REPLACE VIEW hydration_stats AS
SELECT 
    user_id,
    date,
    glasses_consumed,
    daily_goal,
    ROUND((glasses_consumed::decimal / daily_goal * 100), 2) AS completion_percentage,
    CASE 
        WHEN glasses_consumed >= daily_goal THEN 'completed'
        WHEN glasses_consumed >= (daily_goal * 0.8) THEN 'almost_there'
        WHEN glasses_consumed >= (daily_goal * 0.5) THEN 'halfway'
        ELSE 'getting_started'
    END AS status,
    last_record_time
FROM hydration_tracking;

-- =============================================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE meal_plans IS 'Planejamento de refeições do usuário com horários e descrições';
COMMENT ON TABLE meal_records IS 'Registro histórico de refeições consumidas com fotos opcionais';
COMMENT ON TABLE hydration_tracking IS 'Controle diário de consumo de água por usuário';
COMMENT ON TABLE recipes IS 'Receitas culinárias criadas pelos usuários';
COMMENT ON TABLE recipe_ingredients IS 'Ingredientes das receitas com quantidades';
COMMENT ON TABLE recipe_tags IS 'Tags para categorização livre das receitas';
COMMENT ON TABLE recipe_categories IS 'Categorias pré-definidas para receitas';
COMMENT ON TABLE favorite_recipes IS 'Receitas marcadas como favoritas pelos usuários';

-- =============================================================================
-- FIM DO SCRIPT
-- ============================================================================= 