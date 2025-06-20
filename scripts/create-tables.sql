-- Schema essencial para o módulo alimentação
-- Execute este script no SQL Editor do Supabase Dashboard

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (base para todo o sistema)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Tabela de receitas favoritas
CREATE TABLE IF NOT EXISTS favorite_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_records_user_date ON meal_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON hydration_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

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
