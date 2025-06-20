# 📋 PLANO DE MIGRAÇÃO - MÓDULO ALIMENTAÇÃO

## 🎯 CONTEXTO

Migração do módulo de alimentação de uma arquitetura baseada em localStorage para uma arquitetura de dados dual:
- **Produção**: Supabase (PostgreSQL com RLS)
- **Desenvolvimento/Testes**: Backend FastAPI local (SQLAlchemy + PostgreSQL local)

---

## 🔍 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE

### Inventário de Chaves e Dados Armazenados

**Chave: `alimentacao-storage`**
- **Dados**: Planejador de refeições, registro de refeições e controle de hidratação
- **Estrutura**: 
  ```json
  {
    "refeicoes": [
      {
        "id": "string",
        "horario": "string (HH:MM)",
        "descricao": "string"
      }
    ],
    "registros": [
      {
        "id": "string",
        "data": "string (YYYY-MM-DD)",
        "horario": "string (HH:MM)",
        "descricao": "string",
        "tipoIcone": "string | null",
        "foto": "string | null (base64 ou URL)"
      }
    ],
    "coposBebidos": "number",
    "metaDiaria": "number",
    "ultimoRegistro": "string | null (HH:MM)"
  }
  ```

**Chave: `receitas-storage`** (Relacionada)
- **Dados**: Receitas culinárias e favoritos
- **Estrutura**:
  ```json
  {
    "receitas": [
      {
        "id": "string",
        "nome": "string",
        "descricao": "string",
        "categorias": "string[]",
        "tags": "string[]",
        "tempoPreparo": "number",
        "porcoes": "number",
        "calorias": "string",
        "imagem": "string",
        "ingredientes": [
          {
            "nome": "string",
            "quantidade": "number",
            "unidade": "string"
          }
        ],
        "passos": "string[]"
      }
    ],
    "favoritos": "string[]"
  }
  ```

### Componentes Dependentes

1. **PlanejadorRefeicoes.tsx** - Gerencia horários e descrições de refeições
2. **RegistroRefeicoes.tsx** - Registra refeições consumidas com fotos e categorização
3. **LembreteHidratacao.tsx** - Controla intake de água diário
4. **Módulo de Receitas** - Sistema completo de receitas (integrado via link)

---

## 🗄️ 2. ESQUEMA DE BANCO DE DADOS UNIFICADO (SQL)

```sql
-- Tabela de usuários (base para todo o sistema)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de refeições planejadas
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time VARCHAR(5) NOT NULL, -- HH:MM format
    description VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de registros de refeições
CREATE TABLE meal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time VARCHAR(5) NOT NULL, -- HH:MM format
    description VARCHAR(500) NOT NULL,
    meal_type VARCHAR(50), -- 'cafe', 'fruta', 'salada', etc.
    photo_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de controle de hidratação
CREATE TABLE hydration_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    glasses_consumed INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 8,
    last_record_time VARCHAR(5), -- HH:MM format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Tabela de categorias de receitas
CREATE TABLE recipe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de receitas
CREATE TABLE recipes (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ingredientes de receitas
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tags de receitas
CREATE TABLE recipe_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorização de receitas
CREATE TABLE recipe_category_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES recipe_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, category_id)
);

-- Tabela de receitas favoritas
CREATE TABLE favorite_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

-- Índices para performance
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_records_user_date ON meal_records(user_id, date);
CREATE INDEX idx_hydration_user_date ON hydration_tracking(user_id, date);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_favorite_recipes_user_id ON favorite_recipes(user_id);
```

---

## 🌐 3. CONTRATO DE API (OpenAPI/Swagger Simplificado)

### Autenticação
```markdown
POST /auth/login
- Payload Request: { "email": "string", "password": "string" }
- Payload Response: { "token": "string", "user": { "id": "uuid", "name": "string", "email": "string" } }
- Status Codes: 200 (Success), 401 (Unauthorized), 400 (Bad Request)

GET /auth/me
- Headers: Authorization: Bearer {token}
- Payload Response: { "id": "uuid", "name": "string", "email": "string" }
- Status Codes: 200 (Success), 401 (Unauthorized)
```

### Planejador de Refeições
```markdown
GET /api/meal-plans
- Headers: Authorization: Bearer {token}
- Payload Response: [{ "id": "uuid", "time": "07:30", "description": "Café da manhã", "isActive": true }]
- Status Codes: 200 (Success), 401 (Unauthorized)

POST /api/meal-plans
- Headers: Authorization: Bearer {token}
- Payload Request: { "time": "19:30", "description": "Jantar" }
- Payload Response: { "id": "uuid", "time": "19:30", "description": "Jantar", "isActive": true }
- Status Codes: 201 (Created), 400 (Bad Request), 401 (Unauthorized)

PUT /api/meal-plans/{id}
- Headers: Authorization: Bearer {token}
- Payload Request: { "time": "20:00", "description": "Jantar tardio" }
- Payload Response: { "id": "uuid", "time": "20:00", "description": "Jantar tardio", "isActive": true }
- Status Codes: 200 (Success), 404 (Not Found), 401 (Unauthorized)

DELETE /api/meal-plans/{id}
- Headers: Authorization: Bearer {token}
- Status Codes: 204 (No Content), 404 (Not Found), 401 (Unauthorized)
```

### Registro de Refeições
```markdown
GET /api/meal-records
- Headers: Authorization: Bearer {token}
- Query Params: ?date=YYYY-MM-DD (opcional)
- Payload Response: [{ "id": "uuid", "date": "2025-03-03", "time": "08:30", "description": "Café da manhã", "mealType": "cafe", "photoUrl": "https://..." }]
- Status Codes: 200 (Success), 401 (Unauthorized)

POST /api/meal-records
- Headers: Authorization: Bearer {token}
- Payload Request: { "time": "08:30", "description": "Café da manhã", "mealType": "cafe", "photoUrl": "data:image/..." }
- Payload Response: { "id": "uuid", "date": "2025-03-03", "time": "08:30", "description": "Café da manhã", "mealType": "cafe", "photoUrl": "https://..." }
- Status Codes: 201 (Created), 400 (Bad Request), 401 (Unauthorized)

DELETE /api/meal-records/{id}
- Headers: Authorization: Bearer {token}
- Status Codes: 204 (No Content), 404 (Not Found), 401 (Unauthorized)
```

### Controle de Hidratação
```markdown
GET /api/hydration/today
- Headers: Authorization: Bearer {token}
- Payload Response: { "date": "2025-03-03", "glassesConsumed": 3, "dailyGoal": 8, "lastRecordTime": "14:30" }
- Status Codes: 200 (Success), 401 (Unauthorized)

POST /api/hydration/add-glass
- Headers: Authorization: Bearer {token}
- Payload Response: { "date": "2025-03-03", "glassesConsumed": 4, "dailyGoal": 8, "lastRecordTime": "15:45" }
- Status Codes: 200 (Success), 400 (Goal Reached), 401 (Unauthorized)

POST /api/hydration/remove-glass
- Headers: Authorization: Bearer {token}
- Payload Response: { "date": "2025-03-03", "glassesConsumed": 2, "dailyGoal": 8, "lastRecordTime": "14:30" }
- Status Codes: 200 (Success), 400 (No Glasses), 401 (Unauthorized)

PUT /api/hydration/goal
- Headers: Authorization: Bearer {token}
- Payload Request: { "dailyGoal": 10 }
- Payload Response: { "date": "2025-03-03", "glassesConsumed": 3, "dailyGoal": 10, "lastRecordTime": "14:30" }
- Status Codes: 200 (Success), 400 (Invalid Goal), 401 (Unauthorized)
```

### Receitas
```markdown
GET /api/recipes
- Headers: Authorization: Bearer {token}
- Query Params: ?category=string&tag=string&favorite=boolean
- Payload Response: [{ "id": "uuid", "name": "Receita Exemplo", "description": "...", "prepTime": 30, "servings": 4, "calories": "250", "imageUrl": "https://...", "isFavorite": true }]
- Status Codes: 200 (Success), 401 (Unauthorized)

POST /api/recipes
- Headers: Authorization: Bearer {token}
- Payload Request: { "name": "Nova Receita", "description": "...", "prepTime": 45, "servings": 2, "calories": "300", "imageUrl": "...", "ingredients": [...], "instructions": [...], "categories": [...], "tags": [...] }
- Payload Response: { "id": "uuid", "name": "Nova Receita", ... }
- Status Codes: 201 (Created), 400 (Bad Request), 401 (Unauthorized)

GET /api/recipes/{id}
- Headers: Authorization: Bearer {token}
- Payload Response: { "id": "uuid", "name": "Receita Completa", "ingredients": [...], "instructions": [...], "categories": [...], "tags": [...] }
- Status Codes: 200 (Success), 404 (Not Found), 401 (Unauthorized)

POST /api/recipes/{id}/favorite
- Headers: Authorization: Bearer {token}
- Status Codes: 200 (Success), 404 (Not Found), 401 (Unauthorized)

DELETE /api/recipes/{id}/favorite
- Headers: Authorization: Bearer {token}
- Status Codes: 204 (No Content), 404 (Not Found), 401 (Unauthorized)
```

---

## 📋 4. PLANO DE MIGRAÇÃO DUAL-TRACK (MÉTODO MOSCOW)

### **MUST HAVE (Crítico para funcionamento básico)**

1. **[Backend]** Implementar autenticação JWT em ambos os ambientes
2. **[Backend]** Criar APIs básicas para meal-plans, meal-records e hydration
3. **[Frontend]** Criar service layer abstrato para comunicação com APIs
4. **[Frontend]** Implementar fallback para localStorage durante migração
5. **[Database]** Executar scripts de criação das tabelas core

### **SHOULD HAVE (Importante para experiência completa)**

6. **[Backend]** Implementar APIs completas de receitas com upload de imagens
7. **[Frontend]** Migrar stores para usar APIs ao invés de localStorage
8. **[Frontend]** Implementar sincronização offline/online
9. **[Database]** Implementar RLS (Row Level Security) no Supabase
10. **[Migration]** Script de migração de dados do localStorage para BD

### **COULD HAVE (Desejável para otimização)**

11. **[Backend]** Implementar cache Redis para APIs frequentes
12. **[Frontend]** Implementar optimistic updates
13. **[Frontend]** Sistema de backup/restore de dados
14. **[Monitoring]** Logs e métricas de uso das APIs
15. **[Performance]** Implementar paginação e lazy loading

### **WON'T HAVE (Não implementar nesta iteração)**

16. **[Features]** Sistema de compartilhamento de receitas entre usuários
17. **[Features]** Análise nutricional automática com IA
18. **[Infrastructure]** Deploy automatizado com CI/CD
19. **[Features]** Notificações push para lembretes
20. **[Features]** Integração com wearables para hidratação

---

## 🔧 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Preparação (Must Have)**
- [ ] Configurar autenticação JWT no FastAPI
- [ ] Configurar RLS no Supabase
- [ ] Criar tabelas de banco de dados
- [ ] Implementar service layer abstrato no frontend
- [ ] Criar variáveis de ambiente para endpoints

### **Fase 2: APIs Core (Must Have + Should Have)**
- [ ] Implementar CRUD para meal-plans
- [ ] Implementar CRUD para meal-records  
- [ ] Implementar APIs de hydration tracking
- [ ] Implementar upload de imagens para meal-records
- [ ] Implementar CRUD completo para receitas

### **Fase 3: Migração Frontend (Should Have)**
- [ ] Migrar PlanejadorRefeicoes para usar APIs
- [ ] Migrar RegistroRefeicoes para usar APIs
- [ ] Migrar LembreteHidratacao para usar APIs
- [ ] Migrar sistema de receitas para usar APIs
- [ ] Implementar sistema de sincronização

### **Fase 4: Script de Migração (Should Have)**
- [ ] Criar script para exportar dados do localStorage
- [ ] Criar script para importar dados no banco
- [ ] Testar migração com dados reais
- [ ] Implementar rollback em caso de erro

### **Fase 5: Otimizações (Could Have)**
- [ ] Implementar cache de dados no frontend
- [ ] Otimizar queries com índices
- [ ] Implementar compressão de imagens
- [ ] Adicionar logs e métricas

---

## 🚀 CONSIDERAÇÕES TÉCNICAS

### Arquitetura do Service Layer
```typescript
// Exemplo de service abstrato para dual-track
interface IAlimentacaoService {
  getMealPlans(): Promise<MealPlan[]>
  addMealPlan(plan: CreateMealPlanDto): Promise<MealPlan>
  updateMealPlan(id: string, plan: UpdateMealPlanDto): Promise<MealPlan>
  deleteMealPlan(id: string): Promise<void>
}

// Implementação para FastAPI
class FastAPIAlimentacaoService implements IAlimentacaoService {
  // implementação específica
}

// Implementação para Supabase
class SupabaseAlimentacaoService implements IAlimentacaoService {
  // implementação específica
}
```

### Estratégia de Migração de Dados
1. **Backup automático** dos dados do localStorage antes da migração
2. **Migração gradual** por funcionalidade (meal-plans → meal-records → hydration)
3. **Modo híbrido** temporário durante a transição
4. **Rollback automático** em caso de falha na migração

---

Este plano garante uma migração consistente e segura do módulo de alimentação, mantendo a funcionalidade atual enquanto introduz a nova arquitetura de dados dual-track. 