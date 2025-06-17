# 🥗 Plano de Migração: Módulo de Alimentação
## localStorage → Arquitetura Dual (Supabase + FastAPI)

---

## 📊 1. Relatório de Auditoria do localStorage

### Inventário de Chaves Identificadas
- **Chave Principal**: `alimentacao-storage`
- **Relacionadas**: `receitas-storage`, `perfil-storage`

### Estrutura de Dados Encontrada

#### 🍽️ Alimentação Store (`alimentacao-storage`)
```typescript
// Tipos identificados
type Refeicao = {
  id: string
  horario: string
  descricao: string
}

type RegistroRefeicao = {
  id: string
  data: string
  horario: string
  descricao: string
  tipoIcone: string | null
  foto: string | null
}

// Estado persistido
{
  refeicoes: Refeicao[]
  registros: RegistroRefeicao[]
  coposBebidos: number
  metaDiaria: number
  ultimoRegistro: string | null
}
```

#### 🍳 Receitas Store (`receitas-storage`)
```typescript
type Receita = {
  id: string
  nome: string
  descricao: string
  categorias: string[]
  tags: string[]
  tempoPreparo: number
  porcoes: number
  calorias: string
  imagem: string
  ingredientes: Ingrediente[]
  passos: string[]
}

type Ingrediente = {
  nome: string
  quantidade: number
  unidade: string
}
```

### Componentes Dependentes
1. **PlanejadorRefeicoes** - CRUD de refeições planejadas
2. **RegistroRefeicoes** - Histórico com fotos e categorização
3. **LembreteHidratacao** - Controle de hidratação diária
4. **Página de Receitas** - Gestão de receitas favoritas

---

## 🗄️ 2. Esquema de Banco de Dados Unificado (SQL)

```sql
-- Tabela de usuários (comum para toda aplicação)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preferências do usuário
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_water_goal INTEGER DEFAULT 8,
    high_contrast BOOLEAN DEFAULT FALSE,
    reduced_stimuli BOOLEAN DEFAULT FALSE,
    large_text BOOLEAN DEFAULT FALSE,
    notifications_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refeições planejadas
CREATE TABLE planned_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_scheduled TIME NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registros de refeições realizadas
CREATE TABLE meal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    meal_time TIME NOT NULL,
    description TEXT NOT NULL,
    meal_type VARCHAR(50), -- cafe, fruta, salada, proteina, carboidrato, sobremesa, agua
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registros de hidratação
CREATE TABLE hydration_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    glasses_consumed INTEGER DEFAULT 0,
    last_intake_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, record_date)
);

-- Receitas
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prep_time_minutes INTEGER,
    servings INTEGER,
    calories VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredientes das receitas
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    sort_order INTEGER DEFAULT 0
);

-- Passos das receitas
CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Categorias de receitas
CREATE TABLE recipe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL
);

-- Tags de receitas
CREATE TABLE recipe_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

-- Receitas favoritas
CREATE TABLE favorite_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- Índices para performance
CREATE INDEX idx_planned_meals_user_id ON planned_meals(user_id);
CREATE INDEX idx_meal_records_user_date ON meal_records(user_id, meal_date);
CREATE INDEX idx_hydration_records_user_date ON hydration_records(user_id, record_date);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);
CREATE INDEX idx_favorite_recipes_user_id ON favorite_recipes(user_id);
```

---

## 🔌 3. Contrato de API (OpenAPI/Swagger Simplificado)

### Autenticação
```markdown
POST /auth/login
Request: { "email": "user@example.com", "password": "password123" }
Response: { "token": "jwt_token", "user": { "id": "uuid", "name": "Nome" } }
Status: 200 OK, 401 Unauthorized
```

### Refeições Planejadas
```markdown
GET /api/planned-meals
Headers: Authorization: Bearer {token}
Response: [{ "id": "uuid", "time_scheduled": "08:30", "description": "Café da manhã" }]
Status: 200 OK

POST /api/planned-meals
Headers: Authorization: Bearer {token}
Request: { "time_scheduled": "08:30", "description": "Café da manhã" }
Response: { "id": "uuid", "time_scheduled": "08:30", "description": "Café da manhã" }
Status: 201 Created, 400 Bad Request

PUT /api/planned-meals/{id}
Headers: Authorization: Bearer {token}
Request: { "time_scheduled": "09:00", "description": "Café da manhã tardio" }
Response: { "id": "uuid", "time_scheduled": "09:00", "description": "Café da manhã tardio" }
Status: 200 OK, 404 Not Found

DELETE /api/planned-meals/{id}
Headers: Authorization: Bearer {token}
Response: { "message": "Refeição removida com sucesso" }
Status: 200 OK, 404 Not Found
```

### Registros de Refeições
```markdown
GET /api/meal-records?date=2025-01-15
Headers: Authorization: Bearer {token}
Response: [{ "id": "uuid", "meal_date": "2025-01-15", "meal_time": "08:30", "description": "Café", "meal_type": "cafe", "photo_url": null }]
Status: 200 OK

POST /api/meal-records
Headers: Authorization: Bearer {token}
Request: { "meal_time": "08:30", "description": "Café da manhã", "meal_type": "cafe", "photo": "base64_string" }
Response: { "id": "uuid", "meal_date": "2025-01-15", "meal_time": "08:30", "description": "Café da manhã", "meal_type": "cafe", "photo_url": "https://..." }
Status: 201 Created

DELETE /api/meal-records/{id}
Headers: Authorization: Bearer {token}
Response: { "message": "Registro removido com sucesso" }
Status: 200 OK, 404 Not Found
```

### Hidratação
```markdown
GET /api/hydration?date=2025-01-15
Headers: Authorization: Bearer {token}
Response: { "record_date": "2025-01-15", "glasses_consumed": 5, "daily_goal": 8, "last_intake_time": "14:30" }
Status: 200 OK

POST /api/hydration/add-glass
Headers: Authorization: Bearer {token}
Response: { "glasses_consumed": 6, "last_intake_time": "15:30" }
Status: 200 OK

POST /api/hydration/remove-glass
Headers: Authorization: Bearer {token}
Response: { "glasses_consumed": 5 }
Status: 200 OK

PUT /api/hydration/goal
Headers: Authorization: Bearer {token}
Request: { "daily_goal": 10 }
Response: { "daily_goal": 10 }
Status: 200 OK
```

### Receitas
```markdown
GET /api/recipes
Headers: Authorization: Bearer {token}
Response: [{ "id": "uuid", "name": "Smoothie Verde", "description": "...", "prep_time_minutes": 15, "servings": 2, "is_favorite": true }]
Status: 200 OK

POST /api/recipes
Headers: Authorization: Bearer {token}
Request: { "name": "Smoothie Verde", "description": "...", "ingredients": [...], "steps": [...] }
Response: { "id": "uuid", "name": "Smoothie Verde", ... }
Status: 201 Created

POST /api/recipes/{id}/favorite
Headers: Authorization: Bearer {token}
Response: { "message": "Receita adicionada aos favoritos" }
Status: 200 OK

DELETE /api/recipes/{id}/favorite
Headers: Authorization: Bearer {token}
Response: { "message": "Receita removida dos favoritos" }
Status: 200 OK
```

---

## 🚀 4. Plano de Migração Dual-Track

### Fase 1: Preparação da Infraestrutura ⚙️
- [ ] Configurar Supabase (produção)
- [ ] Configurar PostgreSQL local (desenvolvimento)
- [ ] Implementar FastAPI local com SQLAlchemy
- [ ] Criar migrations/schemas em ambos ambientes
- [ ] Configurar autenticação (Supabase Auth + JWT local)

### Fase 2: Abstração da Camada de Dados 🔄
- [ ] Criar interface única para ambos backends:
```typescript
// services/api.ts
interface ApiService {
  auth: AuthService
  meals: MealsService
  hydration: HydrationService
  recipes: RecipesService
}

// Implementações
class SupabaseApiService implements ApiService { ... }
class FastApiService implements ApiService { ... }
```

### Fase 3: Migração dos Stores 📦
- [ ] Modificar `alimentacaoStore.ts` para usar API
- [ ] Implementar sincronização com backend
- [ ] Manter compatibilidade com localStorage como fallback
- [ ] Adicionar estados de loading/error

### Fase 4: Atualização dos Componentes 🧩
- [ ] Atualizar `PlanejadorRefeicoes` para novos endpoints
- [ ] Atualizar `RegistroRefeicoes` com upload de imagens
- [ ] Atualizar `LembreteHidratacao` com sincronização
- [ ] Implementar sincronização offline (opcional)

### Fase 5: Configuração de Ambiente 🏗️
- [ ] Criar variáveis de ambiente:
```env
NEXT_PUBLIC_API_MODE=supabase|fastapi
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

### Fase 6: Testes e Validação ✅
- [ ] Testes unitários para services
- [ ] Testes de integração com ambos backends
- [ ] Validação de migração de dados existentes
- [ ] Testes de performance

### Fase 7: Deploy e Monitoramento 📊
- [ ] Pipeline de deploy para Supabase
- [ ] Scripts de migração de dados
- [ ] Monitoramento de erros
- [ ] Rollback strategy

---

## 🎯 Considerações Técnicas

### Compatibilidade de Tipos
- UUID vs String IDs: Usar UUID em ambos ambientes
- Timestamps: ISO 8601 para consistência
- Fotos: URLs para Supabase Storage / Base64 para FastAPI

### Sincronização
- Implementar versionamento de dados
- Conflitos de merge para dados offline
- Timestamps para last_modified

### Performance
- Paginação para listas grandes
- Cache local para dados frequentes
- Lazy loading para imagens

### Segurança
- RLS (Row Level Security) no Supabase
- JWT validation no FastAPI
- Upload seguro de imagens

---

## 📋 Checklist Final

### Backend
- [ ] Supabase: Tabelas + RLS configuradas
- [ ] FastAPI: Endpoints implementados
- [ ] Testes de API completos
- [ ] Documentação OpenAPI

### Frontend
- [ ] Services abstraídos
- [ ] Stores migrados
- [ ] Componentes atualizados
- [ ] Estados de loading/error
- [ ] Testes unitários

### DevOps
- [ ] Variáveis de ambiente
- [ ] Scripts de migração
- [ ] Pipeline de deploy
- [ ] Monitoramento configurado

---

*Documento gerado para migração do módulo de alimentação - StayFocus App* 