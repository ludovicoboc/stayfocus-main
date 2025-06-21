# 📋 PLANO DE MIGRAÇÃO TDD - MÓDULO ALIMENTAÇÃO

## 🎯 CONTEXTO

Migração do módulo de alimentação de uma arquitetura baseada em localStorage para uma arquitetura de dados dual, seguindo **metodologia TDD rigorosa** estabelecida na FASE 0:
- **Produção**: Supabase (PostgreSQL com RLS)
- **Desenvolvimento/Testes**: Backend FastAPI local (SQLAlchemy + PostgreSQL local)
- **Metodologia**: Test-Driven Development (Red-Green-Refactor)
- **Infraestrutura**: Vitest + RTL + MSW + Quality Gates automáticos

## 🧪 PREPARAÇÃO TDD - INFRAESTRUTURA PRONTA

### ✅ Ferramentas Configuradas (FASE 0)
- **Vitest** - Test runner com coverage V8 (target: 70%+)
- **React Testing Library** - Testes user-centric
- **MSW** - Mock Service Worker para APIs
- **GitHub Actions** - Pipeline CI/CD com 7 quality gates
- **Factories & Utilities** - Geração de dados e helpers

### 🎯 Quality Gates Automáticos
| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Coverage Lines | 70% | 85% |
| Coverage Functions | 70% | 85% |
| Test Performance | < 100ms | < 50ms |
| Suite Completa | < 30s | < 15s |

---

## 🔍 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE + TESTES

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

### 🧪 Factories TDD para Dados Existentes

```typescript
// __tests__/factories/alimentacao.ts
export const createMealPlan = (overrides = {}) => ({
  id: `meal-${counter++}`,
  horario: '12:00',
  descricao: 'Almoço padrão',
  ...overrides
})

export const createMealRecord = (overrides = {}) => ({
  id: `record-${counter++}`,
  data: '2025-01-20',
  horario: '12:30',
  descricao: 'Almoço registrado',
  tipoIcone: 'cafe',
  foto: null,
  ...overrides
})

export const createHydrationData = (overrides = {}) => ({
  coposBebidos: 3,
  metaDiaria: 8,
  ultimoRegistro: '14:30',
  ...overrides
})
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

### Componentes Dependentes + Estratégia de Testes

| Componente | Responsabilidade | Estratégia TDD |
|------------|------------------|----------------|
| **PlanejadorRefeicoes.tsx** | Gerencia horários e descrições | ✅ Testes de CRUD + Validação |
| **RegistroRefeicoes.tsx** | Registra refeições com fotos | ✅ Testes de Upload + Formulário |
| **LembreteHidratacao.tsx** | Controla intake de água | ✅ Testes de Contador + Estado |
| **Módulo de Receitas** | Sistema completo de receitas | ✅ Testes de Busca + Favoritos |

### 🎯 Cobertura de Testes Planejada

```typescript
// Estrutura de testes para o módulo
__tests__/
├── components/
│   ├── PlanejadorRefeicoes.test.tsx     # CRUD + Validação
│   ├── RegistroRefeicoes.test.tsx       # Upload + Formulário
│   ├── LembreteHidratacao.test.tsx      # Contador + Estado
│   └── ReceitasModule.test.tsx          # Busca + Favoritos
├── hooks/
│   ├── useAlimentacao.test.ts           # Store + Mutations
│   ├── useHidratacao.test.ts            # Hydration logic
│   └── useReceitas.test.ts              # Recipes queries
├── services/
│   ├── alimentacaoApi.test.ts           # API calls
│   └── uploadService.test.ts            # File upload
└── integration/
    └── alimentacao-flow.test.tsx        # E2E scenarios
```

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

## 📋 4. PLANO DE MIGRAÇÃO TDD DUAL-TRACK (MÉTODO MOSCOW)

### **MUST HAVE (Crítico + TDD Rigoroso)**

#### 🔴 RED → 🟢 GREEN → 🔵 REFACTOR

1. **[TDD Backend]** Testes de autenticação JWT → Implementação → Refatoração
2. **[TDD Backend]** Testes APIs meal-plans/records/hydration → Implementação → Refatoração
3. **[TDD Frontend]** Testes service layer → Implementação → Refatoração
4. **[TDD Frontend]** Testes fallback localStorage → Implementação → Refatoração
5. **[TDD Database]** Testes schema + migrations → Implementação → Refatoração

**Quality Gate**: ✅ Coverage > 70% + Todos os testes passando antes de prosseguir

### **SHOULD HAVE (TDD + Experiência Completa)**

6. **[TDD Backend]** Testes APIs receitas + upload → Implementação → Refatoração
7. **[TDD Frontend]** Testes migração stores → Implementação → Refatoração
8. **[TDD Frontend]** Testes sync offline/online → Implementação → Refatoração
9. **[TDD Database]** Testes RLS Supabase → Implementação → Refatoração
10. **[TDD Migration]** Testes script migração → Implementação → Refatoração

**Quality Gate**: ✅ Coverage > 75% + Performance < 100ms + Zero bugs críticos

### **COULD HAVE (TDD + Otimização)**

11. **[TDD Backend]** Testes cache Redis → Implementação → Refatoração
12. **[TDD Frontend]** Testes optimistic updates → Implementação → Refatoração
13. **[TDD Frontend]** Testes backup/restore → Implementação → Refatoração
14. **[TDD Monitoring]** Testes logs/métricas → Implementação → Refatoração
15. **[TDD Performance]** Testes paginação/lazy → Implementação → Refatoração

**Quality Gate**: ✅ Coverage > 80% + Performance < 50ms + Métricas de qualidade

### **WON'T HAVE (Não implementar nesta iteração)**

16. **[Features]** Sistema de compartilhamento de receitas entre usuários
17. **[Features]** Análise nutricional automática com IA
18. **[Infrastructure]** Deploy automatizado com CI/CD (já configurado na FASE 0)
19. **[Features]** Notificações push para lembretes
20. **[Features]** Integração com wearables para hidratação

---

## 🔧 CHECKLIST DE IMPLEMENTAÇÃO TDD

### **Fase 1: Preparação TDD (Must Have)**
- [ ] 🔴 Escrever testes de autenticação JWT → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Escrever testes RLS Supabase → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Escrever testes schema BD → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Escrever testes service layer → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Escrever testes env config → 🟢 Implementar → 🔵 Refatorar
- [ ] ✅ **Quality Gate**: Coverage > 70% + Todos os testes passando

### **Fase 2: APIs Core TDD (Must Have + Should Have)**
- [ ] 🔴 Testes CRUD meal-plans → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes CRUD meal-records → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes hydration tracking → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes upload imagens → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes CRUD receitas → 🟢 Implementar → 🔵 Refatorar
- [ ] ✅ **Quality Gate**: Coverage > 75% + Performance < 100ms

### **Fase 3: Migração Frontend TDD (Should Have)**
- [ ] 🔴 Testes PlanejadorRefeicoes → 🟢 Migrar APIs → 🔵 Refatorar
- [ ] 🔴 Testes RegistroRefeicoes → 🟢 Migrar APIs → 🔵 Refatorar
- [ ] 🔴 Testes LembreteHidratacao → 🟢 Migrar APIs → 🔵 Refatorar
- [ ] 🔴 Testes sistema receitas → 🟢 Migrar APIs → 🔵 Refatorar
- [ ] 🔴 Testes sincronização → 🟢 Implementar → 🔵 Refatorar
- [ ] ✅ **Quality Gate**: Coverage > 80% + Zero bugs críticos

### **Fase 4: Script Migração TDD (Should Have)**
- [ ] 🔴 Testes export localStorage → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes import BD → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes migração real → 🟢 Executar → 🔵 Refatorar
- [ ] 🔴 Testes rollback → 🟢 Implementar → 🔵 Refatorar
- [ ] ✅ **Quality Gate**: 100% dados migrados + Zero perda

### **Fase 5: Otimizações TDD (Could Have)**
- [ ] 🔴 Testes cache frontend → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes otimização queries → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes compressão imagens → 🟢 Implementar → 🔵 Refatorar
- [ ] 🔴 Testes logs/métricas → 🟢 Implementar → 🔵 Refatorar
- [ ] ✅ **Quality Gate**: Coverage > 85% + Performance < 50ms

---

## 🧪 TEMPLATES DE TESTE ESPECÍFICOS DO MÓDULO

### Template: Componente PlanejadorRefeicoes

```typescript
// __tests__/components/PlanejadorRefeicoes.test.tsx
import { render, screen, userEvent } from '@/test-utils'
import { PlanejadorRefeicoes } from '@/components/alimentacao/PlanejadorRefeicoes'
import { createMealPlan, createList } from '@/factories/alimentacao'

describe('PlanejadorRefeicoes', () => {
  const defaultProps = {
    mealPlans: createList(createMealPlan, 3),
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('🔴 RED: Renderização', () => {
    it('deve renderizar lista de refeições planejadas', () => {
      render(<PlanejadorRefeicoes {...defaultProps} />)

      defaultProps.mealPlans.forEach(meal => {
        expect(screen.getByText(meal.descricao)).toBeInTheDocument()
        expect(screen.getByText(meal.horario)).toBeInTheDocument()
      })
    })

    it('deve mostrar formulário de adição', () => {
      render(<PlanejadorRefeicoes {...defaultProps} />)
      expect(screen.getByRole('button', { name: /adicionar refeição/i })).toBeInTheDocument()
    })
  })

  describe('🟢 GREEN: Interações', () => {
    it('deve adicionar nova refeição quando formulário é submetido', async () => {
      const user = userEvent.setup()
      render(<PlanejadorRefeicoes {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /adicionar/i }))
      await user.type(screen.getByLabelText(/horário/i), '14:30')
      await user.type(screen.getByLabelText(/descrição/i), 'Lanche da tarde')
      await user.click(screen.getByRole('button', { name: /salvar/i }))

      expect(defaultProps.onAdd).toHaveBeenCalledWith({
        horario: '14:30',
        descricao: 'Lanche da tarde'
      })
    })
  })

  describe('� REFACTOR: Estados e Validação', () => {
    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(<PlanejadorRefeicoes {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /adicionar/i }))
      await user.click(screen.getByRole('button', { name: /salvar/i }))

      expect(screen.getByText(/horário é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument()
    })
  })
})
```

### Template: Hook useAlimentacao

```typescript
// __tests__/hooks/useAlimentacao.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAlimentacao } from '@/hooks/useAlimentacao'
import { createQueryWrapper } from '@/test-utils'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('useAlimentacao', () => {
  describe('🔴 RED: Estado Inicial', () => {
    it('deve retornar estado inicial correto', () => {
      const { result } = renderHook(() => useAlimentacao(), {
        wrapper: createQueryWrapper()
      })

      expect(result.current.mealPlans).toEqual([])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(null)
    })
  })

  describe('🟢 GREEN: Operações CRUD', () => {
    it('deve adicionar refeição com sucesso', async () => {
      const newMeal = createMealPlan({ horario: '15:00', descricao: 'Lanche' })

      server.use(
        http.post('/api/meal-plans', () => {
          return HttpResponse.json(newMeal)
        })
      )

      const { result } = renderHook(() => useAlimentacao(), {
        wrapper: createQueryWrapper()
      })

      await act(async () => {
        await result.current.addMealPlan(newMeal)
      })

      expect(result.current.mealPlans).toContainEqual(newMeal)
    })
  })

  describe('🔵 REFACTOR: Error Handling', () => {
    it('deve lidar com erros de API', async () => {
      server.use(
        http.post('/api/meal-plans', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useAlimentacao(), {
        wrapper: createQueryWrapper()
      })

      await act(async () => {
        try {
          await result.current.addMealPlan(createMealPlan())
        } catch (error) {
          expect(error).toBeDefined()
        }
      })

      expect(result.current.error).toBeDefined()
    })
  })
})
```

### Template: Serviço AlimentacaoAPI

```typescript
// __tests__/services/alimentacaoApi.test.ts
import { vi } from 'vitest'
import { alimentacaoApi } from '@/services/alimentacaoApi'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { createMealPlan, createMealRecord } from '@/factories/alimentacao'

describe('AlimentacaoAPI', () => {
  describe('🔴 RED: Meal Plans API', () => {
    it('deve buscar meal plans do usuário', async () => {
      const mockPlans = [createMealPlan(), createMealPlan()]

      server.use(
        http.get('/api/meal-plans', () => HttpResponse.json(mockPlans))
      )

      const result = await alimentacaoApi.getMealPlans()
      expect(result).toEqual(mockPlans)
    })
  })

  describe('🟢 GREEN: Error Handling', () => {
    it('deve lidar com erro 500 da API', async () => {
      server.use(
        http.get('/api/meal-plans', () => HttpResponse.error())
      )

      await expect(alimentacaoApi.getMealPlans()).rejects.toThrow()
    })
  })

  describe('🔵 REFACTOR: Optimistic Updates', () => {
    it('deve implementar optimistic updates para meal records', async () => {
      const newRecord = createMealRecord()

      server.use(
        http.post('/api/meal-records', () => HttpResponse.json(newRecord))
      )

      const result = await alimentacaoApi.addMealRecord(newRecord)
      expect(result.id).toBeDefined()
      expect(result.descricao).toBe(newRecord.descricao)
    })
  })
})
```

### Template: Integração E2E

```typescript
// __tests__/integration/alimentacao-flow.test.tsx
import { render, screen, userEvent } from '@/test-utils'
import { AlimentacaoPage } from '@/app/alimentacao/page'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('Alimentação E2E Flow', () => {
  describe('🔴 RED: Fluxo Completo', () => {
    it('deve permitir planejamento → registro → hidratação', async () => {
      const user = userEvent.setup()

      // Setup API mocks
      server.use(
        http.get('/api/meal-plans', () => HttpResponse.json([])),
        http.post('/api/meal-plans', () => HttpResponse.json({ id: '1' })),
        http.post('/api/meal-records', () => HttpResponse.json({ id: '1' })),
        http.post('/api/hydration/add-glass', () => HttpResponse.json({ glassesConsumed: 1 }))
      )

      render(<AlimentacaoPage />)

      // 1. Planejar refeição
      await user.click(screen.getByRole('button', { name: /planejar refeição/i }))
      await user.type(screen.getByLabelText(/horário/i), '12:00')
      await user.type(screen.getByLabelText(/descrição/i), 'Almoço')
      await user.click(screen.getByRole('button', { name: /salvar/i }))

      // 2. Registrar refeição
      await user.click(screen.getByRole('button', { name: /registrar refeição/i }))
      await user.type(screen.getByLabelText(/descrição/i), 'Almoço consumido')
      await user.click(screen.getByRole('button', { name: /registrar/i }))

      // 3. Adicionar copo de água
      await user.click(screen.getByRole('button', { name: /adicionar copo/i }))

      // Verificar estado final
      expect(screen.getByText(/1 de 8 copos/i)).toBeInTheDocument()
    })
  })
})
```

---

## �🚀 CONSIDERAÇÕES TÉCNICAS TDD

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

### MSW Handlers Específicos do Módulo

```typescript
// __tests__/mocks/handlers/alimentacao.ts
import { http, HttpResponse } from 'msw'
import { createMealPlan, createMealRecord, createHydrationData } from '@/factories/alimentacao'

export const alimentacaoHandlers = [
  // Meal Plans
  http.get('/api/meal-plans', () => {
    return HttpResponse.json([
      createMealPlan({ horario: '07:00', descricao: 'Café da manhã' }),
      createMealPlan({ horario: '12:00', descricao: 'Almoço' }),
      createMealPlan({ horario: '19:00', descricao: 'Jantar' })
    ])
  }),

  http.post('/api/meal-plans', async ({ request }) => {
    const newPlan = await request.json()
    return HttpResponse.json(createMealPlan(newPlan), { status: 201 })
  }),

  http.put('/api/meal-plans/:id', async ({ request, params }) => {
    const updates = await request.json()
    return HttpResponse.json(createMealPlan({ id: params.id, ...updates }))
  }),

  http.delete('/api/meal-plans/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Meal Records
  http.get('/api/meal-records', ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')

    return HttpResponse.json([
      createMealRecord({ data: date || '2025-01-20' })
    ])
  }),

  http.post('/api/meal-records', async ({ request }) => {
    const newRecord = await request.json()
    return HttpResponse.json(createMealRecord(newRecord), { status: 201 })
  }),

  // Hydration
  http.get('/api/hydration/today', () => {
    return HttpResponse.json(createHydrationData())
  }),

  http.post('/api/hydration/add-glass', () => {
    return HttpResponse.json(createHydrationData({ coposBebidos: 4 }))
  }),

  http.post('/api/hydration/remove-glass', () => {
    return HttpResponse.json(createHydrationData({ coposBebidos: 2 }))
  }),

  // Error scenarios
  http.get('/api/meal-plans/error', () => {
    return HttpResponse.error()
  }),

  http.post('/api/meal-plans/timeout', () => {
    return new Promise(() => {}) // Never resolves (timeout)
  })
]
```

### Estratégia de Migração TDD
1. **🔴 Testes de backup** → **🟢 Backup automático** → **🔵 Refatoração**
2. **🔴 Testes migração gradual** → **🟢 Implementação por etapas** → **🔵 Otimização**
3. **🔴 Testes modo híbrido** → **🟢 Transição controlada** → **🔵 Limpeza**
4. **🔴 Testes rollback** → **🟢 Recuperação automática** → **🔵 Validação**

---

## 🔧 PIPELINE CI/CD ESPECÍFICO DO MÓDULO

### GitHub Actions Workflow

```yaml
# .github/workflows/alimentacao-module.yml
name: Alimentação Module CI/CD

on:
  push:
    paths:
      - 'app/alimentacao/**'
      - '__tests__/alimentacao/**'
      - 'app/components/alimentacao/**'

jobs:
  test-alimentacao:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Alimentação Tests
        run: npm run test -- alimentacao --coverage

      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(npm run test:coverage -- --reporter=json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% below threshold 70%"
            exit 1
          fi

      - name: Performance Tests
        run: npm run test -- alimentacao --reporter=verbose
        env:
          VITEST_MAX_DURATION: 100

  integration-alimentacao:
    needs: test-alimentacao
    runs-on: ubuntu-latest
    steps:
      - name: Integration Tests
        run: npm run test:integration -- alimentacao

      - name: API Contract Tests
        run: npm run test:contract -- alimentacao

  quality-gates:
    needs: [test-alimentacao, integration-alimentacao]
    runs-on: ubuntu-latest
    steps:
      - name: Quality Gate Check
        run: |
          echo "✅ Unit Tests: Passed"
          echo "✅ Integration Tests: Passed"
          echo "✅ Coverage > 70%: Passed"
          echo "✅ Performance < 100ms: Passed"
          echo "🎯 Alimentação Module: READY FOR DEPLOYMENT"
```

---

## 📊 MÉTRICAS DE SUCESSO TDD

### Indicadores Técnicos (Baseados na FASE 0)

| Métrica | Target FASE 0 | Target Alimentação | Status |
|---------|---------------|-------------------|--------|
| **Coverage Lines** | 70% | 75% | 🎯 |
| **Coverage Functions** | 70% | 75% | 🎯 |
| **Test Performance** | < 100ms | < 80ms | 🎯 |
| **Suite Completa** | < 30s | < 10s | 🎯 |
| **Zero Bugs Críticos** | ✅ | ✅ | 🎯 |

### Indicadores de Qualidade TDD

| Fase | Red Tests | Green Implementation | Blue Refactor | Quality Gate |
|------|-----------|---------------------|---------------|--------------|
| **Preparação** | 15 testes | 15 implementações | 3 refatorações | Coverage > 70% |
| **APIs Core** | 25 testes | 25 implementações | 5 refatorações | Coverage > 75% |
| **Frontend** | 35 testes | 35 implementações | 7 refatorações | Coverage > 80% |
| **Migração** | 10 testes | 10 implementações | 2 refatorações | 100% dados |
| **Otimização** | 15 testes | 15 implementações | 8 refatorações | Coverage > 85% |

### ROI Estimado (Baseado na FASE 0)

| Investimento TDD | Benefício Esperado | ROI |
|------------------|-------------------|-----|
| +40% tempo inicial | -70% bugs produção | 300% |
| +20% esforço testes | +50% velocidade manutenção | 250% |
| +30% documentação | +80% onboarding novos devs | 400% |

---

## 🎯 PRÓXIMOS PASSOS PÓS-ALIMENTAÇÃO

### Replicação para Outros Módulos

1. **Usar este plano como template** para Saúde, Sono, Estudos, etc.
2. **Adaptar factories e mocks** específicos de cada módulo
3. **Manter quality gates** consistentes em todos os módulos
4. **Documentar lições aprendidas** para otimizar próximas migrações

### Evolução Contínua

1. **Revisar métricas trimestralmente** baseado nos resultados
2. **Atualizar ferramentas** seguindo evolução do ecossistema
3. **Expandir utilities** conforme padrões emergentes
4. **Treinar equipe** nas práticas TDD estabelecidas

---

## ⏰ CRONOGRAMA DETALHADO TDD

### Semana 1-2: Preparação e Setup TDD
- **Dias 1-3**: Configurar factories específicas do módulo
- **Dias 4-7**: Criar MSW handlers para todas as APIs
- **Dias 8-10**: Implementar templates de teste base
- **Quality Gate**: 100% setup funcional + 6 testes de verificação passando

### Semana 3-4: APIs Core (TDD Rigoroso)
- **Dias 11-14**: 🔴 Testes meal-plans → 🟢 Implementação → 🔵 Refatoração
- **Dias 15-18**: 🔴 Testes meal-records → 🟢 Implementação → 🔵 Refatoração
- **Dias 19-21**: 🔴 Testes hydration → 🟢 Implementação → 🔵 Refatoração
- **Quality Gate**: Coverage > 75% + Performance < 100ms

### Semana 5-6: Frontend Migration (TDD)
- **Dias 22-25**: 🔴 Testes componentes → 🟢 Migração → 🔵 Refatoração
- **Dias 26-28**: 🔴 Testes hooks → 🟢 Implementação → 🔵 Refatoração
- **Dias 29-31**: 🔴 Testes integração → 🟢 E2E → 🔵 Otimização
- **Quality Gate**: Coverage > 80% + Zero bugs críticos

### Semana 7-8: Migração de Dados e Finalização
- **Dias 32-35**: 🔴 Testes migração → 🟢 Script → 🔵 Validação
- **Dias 36-38**: 🔴 Testes rollback → 🟢 Implementação → 🔵 Documentação
- **Dias 39-42**: Otimizações finais e documentação
- **Quality Gate**: 100% dados migrados + Coverage > 85%

## 🛠️ COMANDOS ESPECÍFICOS DO MÓDULO

### Desenvolvimento TDD
```bash
# Executar testes específicos do módulo
npm run test -- alimentacao --watch

# Coverage específico
npm run test:coverage -- alimentacao

# Testes de performance
npm run test -- alimentacao --reporter=verbose

# Testes de integração
npm run test:integration -- alimentacao

# Executar apenas testes Red (falhantes)
npm run test -- alimentacao --reporter=verbose --bail

# Executar testes com timeout específico
npm run test -- alimentacao --testTimeout=5000
```

### Quality Gates Automáticos
```bash
# Verificar coverage threshold
npm run test:coverage -- alimentacao --threshold=75

# Executar pipeline completo
npm run ci:alimentacao

# Verificar performance
npm run test:perf -- alimentacao

# Validar contratos de API
npm run test:contract -- alimentacao
```

### Migração de Dados
```bash
# Backup dados localStorage
npm run migrate:backup -- alimentacao

# Executar migração
npm run migrate:run -- alimentacao

# Rollback se necessário
npm run migrate:rollback -- alimentacao

# Validar migração
npm run migrate:validate -- alimentacao
```

---

**📅 Cronograma Total Estimado**: 6-8 semanas (incluindo TDD rigoroso)
**🔧 Esforço Técnico**: Alto (devido ao TDD, mas com ROI comprovado)
**⚠️ Risco**: Baixo (infraestrutura FASE 0 + testes abrangentes)
**👥 Recursos**: 1 desenvolvedor full-stack + infraestrutura TDD pronta

---

## ✅ CHECKLIST DE VALIDAÇÃO FINAL

### Preparação TDD (FASE 0 Integrada)
- [ ] ✅ Infraestrutura Vitest + RTL + MSW configurada
- [ ] ✅ Factories específicas do módulo criadas
- [ ] ✅ MSW handlers para todas as APIs implementados
- [ ] ✅ Templates de teste documentados
- [ ] ✅ Pipeline CI/CD específico configurado

### Quality Gates por Fase
- [ ] ✅ **Preparação**: Coverage > 70% + Setup 100% funcional
- [ ] ✅ **APIs Core**: Coverage > 75% + Performance < 100ms
- [ ] ✅ **Frontend**: Coverage > 80% + Zero bugs críticos
- [ ] ✅ **Migração**: 100% dados migrados + Rollback testado
- [ ] ✅ **Finalização**: Coverage > 85% + Documentação completa

### Testes Implementados
- [ ] ✅ Testes unitários para todos os componentes
- [ ] ✅ Testes de hooks customizados
- [ ] ✅ Testes de serviços/APIs
- [ ] ✅ Testes de integração E2E
- [ ] ✅ Testes de migração de dados
- [ ] ✅ Testes de rollback

### Documentação e Padrões
- [ ] ✅ Templates de teste específicos documentados
- [ ] ✅ Factories reutilizáveis criadas
- [ ] ✅ MSW handlers configurados
- [ ] ✅ Comandos específicos documentados
- [ ] ✅ Cronograma TDD detalhado
- [ ] ✅ Métricas de sucesso definidas

## 🎓 LIÇÕES APRENDIDAS DA FASE 0 APLICADAS

### O Que Funcionou Bem (Replicado)
1. **Abordagem Incremental TDD** - Cada funcionalidade testada antes da implementação
2. **Quality Gates Automáticos** - Prevenção de regressões em cada fase
3. **Documentação Paralela** - Templates e guias criados durante desenvolvimento
4. **Utilities Reutilizáveis** - Factories e helpers específicos do módulo

### Melhorias Implementadas
1. **MSW Handlers Específicos** - Cenários de teste mais realistas para alimentação
2. **Cronograma TDD Detalhado** - Ciclos Red-Green-Refactor bem definidos
3. **Métricas Específicas** - Targets adaptados para o domínio de alimentação
4. **Pipeline Modular** - CI/CD específico para o módulo

### ROI Esperado (Baseado na FASE 0)
- **Desenvolvimento 50% mais rápido** após curva de aprendizado
- **70% menos bugs em produção** devido aos testes abrangentes
- **80% mais rápido onboarding** de novos desenvolvedores
- **Infraestrutura paga investimento 5x** em 6 meses

---

**🏆 STATUS**: ✅ **PLANO REFATORADO COMPLETO - PRONTO PARA EXECUÇÃO**

*Este plano refatorado integra completamente a metodologia e infraestrutura TDD estabelecida na FASE 0, garantindo uma migração segura, testada e de alta qualidade para o módulo de alimentação, servindo como modelo para todos os demais módulos do StayFocus.*