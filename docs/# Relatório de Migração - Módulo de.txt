# Relatório de Migração - Módulo de Finanças
## Migração de localStorage para Arquitetura Dual (Supabase + FastAPI)

### 📋 CONTEXTO
Este relatório detalha a migração do módulo de finanças da aplicação StayFocus de uma arquitetura baseada em localStorage (Zustand persist) para uma solução dual-backend:
- **Produção**: Supabase (PostgreSQL com RLS)
- **Desenvolvimento**: FastAPI local (SQLAlchemy + PostgreSQL)

---

## 🔍 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE

### 1.1 Inventário de Chaves e Dados Armazenados

**Chave Principal**: `financas-storage`

**Estrutura de Dados Identificada**:

#### **Categorias** (5 categorias padrão)
```typescript
type Categoria = {
  id: string
  nome: string
  cor: string // hex color
  icone: string // nome do ícone
}

// Dados padrão:
[
  { id: '1', nome: 'Moradia', cor: '#FF5252', icone: 'home' },
  { id: '2', nome: 'Alimentação', cor: '#4CAF50', icone: 'utensils' },
  { id: '3', nome: 'Transporte', cor: '#2196F3', icone: 'car' },
  { id: '4', nome: 'Saúde', cor: '#FFC107', icone: 'heart' },
  { id: '5', nome: 'Lazer', cor: '#9C27B0', icone: 'music' }
]
```

#### **Transações**
```typescript
type Transacao = {
  id: string
  data: string // YYYY-MM-DD
  valor: number
  descricao: string
  categoriaId: string
  tipo: 'receita' | 'despesa'
}
```

#### **Envelopes Virtuais** (3 envelopes padrão)
```typescript
type Envelope = {
  id: string
  nome: string
  cor: string
  valorAlocado: number
  valorUtilizado: number
}

// Dados padrão:
[
  { id: '1', nome: 'Emergências', cor: '#FF5252', valorAlocado: 500, valorUtilizado: 0 },
  { id: '2', nome: 'Férias', cor: '#2196F3', valorAlocado: 300, valorUtilizado: 0 },
  { id: '3', nome: 'Presentes', cor: '#4CAF50', valorAlocado: 100, valorUtilizado: 0 }
]
```

#### **Pagamentos Recorrentes**
```typescript
type PagamentoRecorrente = {
  id: string
  descricao: string
  valor: number
  dataVencimento: string // dia do mês (1-31)
  categoriaId: string
  proximoPagamento: string | null // YYYY-MM-DD
  pago: boolean
}
```

### 1.2 Componentes Dependentes

1. **`AdicionarDespesa.tsx`** - Adiciona transações de despesa
2. **`RastreadorGastos.tsx`** - Exibe gráficos e análises de gastos
3. **`EnvelopesVirtuais.tsx`** - Gerencia orçamento por envelopes
4. **`CalendarioPagamentos.tsx`** - Controla pagamentos recorrentes
5. **`financasStore.ts`** - Store principal com todas as operações

### 1.3 Funcionalidades Críticas Identificadas

**Operações CRUD**:
- ✅ Categorias: Create, Read, Update, Delete (limitado a 5)
- ✅ Transações: Create, Read, Delete
- ✅ Envelopes: Create, Read, Update, Delete, Registrar Gasto
- ✅ Pagamentos: Create, Read, Update, Delete, Marcar como Pago

**Regras de Negócio**:
- Limite máximo de 5 categorias
- Cálculo automático de próximo pagamento
- Validação de valores monetários
- Relacionamentos entre entidades

---

## 🗄️ 2. ESQUEMA DE BANCO DE DADOS UNIFICADO

### 2.1 Schema SQL Completo

```sql
-- =============================================
-- SCHEMA DE BANCO DE DADOS - MÓDULO FINANÇAS
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (base para RLS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias financeiras
CREATE TABLE finance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- formato hex (#FFFFFF)
    icon VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_category_name UNIQUE(user_id, name),
    CONSTRAINT max_categories_per_user CHECK (
        (SELECT COUNT(*) FROM finance_categories WHERE user_id = finance_categories.user_id) <= 5
    )
);

-- Tabela de transações financeiras
CREATE TABLE finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('receita', 'despesa')),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de envelopes virtuais
CREATE TABLE finance_envelopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- formato hex (#FFFFFF)
    allocated_amount DECIMAL(12,2) NOT NULL CHECK (allocated_amount >= 0),
    used_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (used_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_envelope_name UNIQUE(user_id, name),
    CONSTRAINT used_not_exceed_allocated CHECK (used_amount <= allocated_amount * 1.1) -- permite 10% de tolerância
);

-- Tabela de pagamentos recorrentes
CREATE TABLE finance_recurring_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES finance_categories(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    next_payment_date DATE,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Categorias
CREATE INDEX idx_finance_categories_user_id ON finance_categories(user_id);
CREATE INDEX idx_finance_categories_user_order ON finance_categories(user_id, display_order);

-- Transações
CREATE INDEX idx_finance_transactions_user_id ON finance_transactions(user_id);
CREATE INDEX idx_finance_transactions_category_id ON finance_transactions(category_id);
CREATE INDEX idx_finance_transactions_date ON finance_transactions(transaction_date DESC);
CREATE INDEX idx_finance_transactions_user_date ON finance_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_finance_transactions_type ON finance_transactions(user_id, transaction_type);

-- Envelopes
CREATE INDEX idx_finance_envelopes_user_id ON finance_envelopes(user_id);

-- Pagamentos Recorrentes
CREATE INDEX idx_finance_recurring_payments_user_id ON finance_recurring_payments(user_id);
CREATE INDEX idx_finance_recurring_payments_next_date ON finance_recurring_payments(next_payment_date);
CREATE INDEX idx_finance_recurring_payments_user_next ON finance_recurring_payments(user_id, next_payment_date);

-- =============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_finance_categories_updated_at 
    BEFORE UPDATE ON finance_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_transactions_updated_at 
    BEFORE UPDATE ON finance_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_envelopes_updated_at 
    BEFORE UPDATE ON finance_envelopes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_recurring_payments_updated_at 
    BEFORE UPDATE ON finance_recurring_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS (ROW LEVEL SECURITY) PARA SUPABASE
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_recurring_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (usuários só acessam seus próprios dados)
CREATE POLICY "Usuários podem gerenciar suas próprias categorias" ON finance_categories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar suas próprias transações" ON finance_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios envelopes" ON finance_envelopes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios pagamentos" ON finance_recurring_payments
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para calcular próximo pagamento
CREATE OR REPLACE FUNCTION calculate_next_payment_date(due_day INTEGER, from_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
DECLARE
    next_date DATE;
    current_month INTEGER := EXTRACT(MONTH FROM from_date);
    current_year INTEGER := EXTRACT(YEAR FROM from_date);
BEGIN
    -- Tentar o dia no mês atual
    next_date := DATE(current_year || '-' || current_month || '-' || due_day);
    
    -- Se a data já passou, avançar para o próximo mês
    IF next_date <= from_date THEN
        IF current_month = 12 THEN
            next_date := DATE((current_year + 1) || '-01-' || due_day);
        ELSE
            next_date := DATE(current_year || '-' || (current_month + 1) || '-' || due_day);
        END IF;
    END IF;
    
    RETURN next_date;
EXCEPTION
    WHEN OTHERS THEN
        -- Se o dia não existe no mês (ex: 31 em fevereiro), usar último dia do mês
        IF current_month = 12 THEN
            RETURN LAST_DAY(DATE((current_year + 1) || '-01-01'));
        ELSE
            RETURN LAST_DAY(DATE(current_year || '-' || (current_month + 1) || '-01'));
        END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS PARA CONSULTAS COMUNS
-- =============================================

-- View para gastos por categoria
CREATE VIEW finance_spending_by_category AS
SELECT 
    fc.id as category_id,
    fc.user_id,
    fc.name as category_name,
    fc.color as category_color,
    fc.icon as category_icon,
    COALESCE(SUM(CASE WHEN ft.transaction_type = 'despesa' THEN ft.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN ft.transaction_type = 'receita' THEN ft.amount ELSE 0 END), 0) as total_income,
    COUNT(ft.id) as transaction_count
FROM finance_categories fc
LEFT JOIN finance_transactions ft ON fc.id = ft.category_id
GROUP BY fc.id, fc.user_id, fc.name, fc.color, fc.icon;

-- View para próximos pagamentos
CREATE VIEW finance_upcoming_payments AS
SELECT 
    frp.*,
    fc.name as category_name,
    fc.color as category_color,
    fc.icon as category_icon,
    CASE 
        WHEN frp.next_payment_date = CURRENT_DATE THEN 'hoje'
        WHEN frp.next_payment_date < CURRENT_DATE THEN 'atrasado'
        WHEN frp.next_payment_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'proximo'
        ELSE 'futuro'
    END as payment_status
FROM finance_recurring_payments frp
JOIN finance_categories fc ON frp.category_id = fc.id
ORDER BY frp.next_payment_date ASC;
```

---

## 🔌 3. CONTRATO DE API (OpenAPI/Swagger Simplificado)

### 3.1 Base URL e Autenticação

```yaml
# Base URLs
Production: https://[projeto].supabase.co/rest/v1
Development: http://localhost:8000/api/v1

# Autenticação
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 3.2 Endpoints - Categorias Financeiras

#### **GET /finance/categories**
```json
# Resposta de Sucesso (200)
{
  "data": [
    {
      "id": "uuid",
      "name": "Moradia",
      "color": "#FF5252",
      "icon": "home",
      "display_order": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5
}

# Erro (401, 500)
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token inválido"
  }
}
```

#### **POST /finance/categories**
```json
# Payload da Requisição
{
  "name": "Nova Categoria",
  "color": "#FF5252",
  "icon": "home"
}

# Resposta de Sucesso (201)
{
  "data": {
    "id": "uuid",
    "name": "Nova Categoria",
    "color": "#FF5252",
    "icon": "home",
    "display_order": 5,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}

# Erro (400) - Limite Excedido
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Máximo de 5 categorias permitidas"
  }
}
```

#### **PUT /finance/categories/{id}**
```json
# Payload da Requisição
{
  "name": "Categoria Atualizada",
  "color": "#4CAF50",
  "icon": "utensils"
}

# Resposta de Sucesso (200)
{
  "data": {
    "id": "uuid",
    "name": "Categoria Atualizada",
    "color": "#4CAF50",
    "icon": "utensils",
    "display_order": 0,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### **DELETE /finance/categories/{id}**
```json
# Resposta de Sucesso (204) - Sem conteúdo

# Erro (409) - Conflito
{
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "message": "Categoria possui transações vinculadas"
  }
}
```

### 3.3 Endpoints - Transações

#### **GET /finance/transactions**
```json
# Query Parameters: ?page=1&limit=50&start_date=2024-01-01&end_date=2024-01-31&type=despesa&category_id=uuid

# Resposta de Sucesso (200)
{
  "data": [
    {
      "id": "uuid",
      "amount": 150.50,
      "description": "Mercado",
      "transaction_type": "despesa",
      "transaction_date": "2024-01-15",
      "category": {
        "id": "uuid",
        "name": "Alimentação",
        "color": "#4CAF50",
        "icon": "utensils"
      },
      "created_at": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

#### **POST /finance/transactions**
```json
# Payload da Requisição
{
  "amount": 150.50,
  "description": "Mercado",
  "transaction_type": "despesa",
  "transaction_date": "2024-01-15",
  "category_id": "uuid"
}

# Resposta de Sucesso (201)
{
  "data": {
    "id": "uuid",
    "amount": 150.50,
    "description": "Mercado",
    "transaction_type": "despesa",
    "transaction_date": "2024-01-15",
    "category_id": "uuid",
    "created_at": "2024-01-15T00:00:00Z"
  }
}
```

#### **DELETE /finance/transactions/{id}**
```json
# Resposta de Sucesso (204) - Sem conteúdo
```

### 3.4 Endpoints - Envelopes Virtuais

#### **GET /finance/envelopes**
```json
# Resposta de Sucesso (200)
{
  "data": [
    {
      "id": "uuid",
      "name": "Emergências",
      "color": "#FF5252",
      "allocated_amount": 500.00,
      "used_amount": 125.50,
      "remaining_amount": 374.50,
      "usage_percentage": 25.1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### **POST /finance/envelopes**
```json
# Payload da Requisição
{
  "name": "Férias",
  "color": "#2196F3",
  "allocated_amount": 1000.00
}

# Resposta de Sucesso (201)
{
  "data": {
    "id": "uuid",
    "name": "Férias",
    "color": "#2196F3",
    "allocated_amount": 1000.00,
    "used_amount": 0.00,
    "remaining_amount": 1000.00,
    "usage_percentage": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### **PUT /finance/envelopes/{id}**
```json
# Payload da Requisição
{
  "name": "Emergências",
  "color": "#FF5252",
  "allocated_amount": 750.00
}
```

#### **POST /finance/envelopes/{id}/spend**
```json
# Payload da Requisição
{
  "amount": 50.00,
  "description": "Gasto emergencial"
}

# Resposta de Sucesso (200)
{
  "data": {
    "id": "uuid",
    "used_amount": 175.50,
    "remaining_amount": 324.50,
    "usage_percentage": 35.1
  }
}
```

### 3.5 Endpoints - Pagamentos Recorrentes

#### **GET /finance/recurring-payments**
```json
# Query Parameters: ?month=2024-01&status=pending

# Resposta de Sucesso (200)
{
  "data": [
    {
      "id": "uuid",
      "description": "Aluguel",
      "amount": 1200.00,
      "due_day": 5,
      "next_payment_date": "2024-01-05",
      "is_paid": false,
      "payment_status": "hoje",
      "category": {
        "id": "uuid",
        "name": "Moradia",
        "color": "#FF5252",
        "icon": "home"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /finance/recurring-payments**
```json
# Payload da Requisição
{
  "description": "Internet",
  "amount": 89.90,
  "due_day": 15,
  "category_id": "uuid"
}

# Resposta de Sucesso (201)
{
  "data": {
    "id": "uuid",
    "description": "Internet",
    "amount": 89.90,
    "due_day": 15,
    "next_payment_date": "2024-01-15",
    "is_paid": false,
    "category_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### **PUT /finance/recurring-payments/{id}/mark-paid**
```json
# Payload da Requisição
{
  "is_paid": true,
  "payment_date": "2024-01-05"
}

# Resposta de Sucesso (200)
{
  "data": {
    "id": "uuid",
    "is_paid": true,
    "next_payment_date": "2024-02-05"
  }
}
```

### 3.6 Endpoints - Analytics

#### **GET /finance/analytics/spending**
```json
# Query Parameters: ?period=month&start_date=2024-01-01&end_date=2024-01-31

# Resposta de Sucesso (200)
{
  "data": {
    "total_income": 3500.00,
    "total_expenses": 2750.50,
    "net_income": 749.50,
    "spending_by_category": [
      {
        "category_id": "uuid",
        "category_name": "Alimentação",
        "category_color": "#4CAF50",
        "total_amount": 450.00,
        "percentage": 16.36,
        "transaction_count": 12
      }
    ],
    "daily_spending": [
      {
        "date": "2024-01-01",
        "total_expenses": 125.50,
        "total_income": 0.00
      }
    ]
  }
}
```

### 3.7 Códigos de Status HTTP

- **200** - Sucesso
- **201** - Criado com sucesso
- **204** - Deletado com sucesso (sem conteúdo)
- **400** - Dados inválidos
- **401** - Não autenticado
- **403** - Não autorizado
- **404** - Recurso não encontrado
- **409** - Conflito (ex: violação de constraint)
- **422** - Dados não processáveis
- **500** - Erro interno do servidor

---

## 🚀 4. PLANO DE MIGRAÇÃO DUAL-TRACK

### 4.1 Fase 1: Preparação da Infraestrutura (Semana 1-2)

#### **Supabase Setup**
- [ ] Criar projeto no Supabase
- [ ] Configurar autenticação (Google, Email/Password)
- [ ] Executar script SQL de criação das tabelas
- [ ] Configurar RLS policies
- [ ] Testar políticas de segurança
- [ ] Configurar variáveis de ambiente

#### **FastAPI Setup**
- [ ] Criar estrutura do projeto FastAPI
- [ ] Configurar SQLAlchemy e Alembic
- [ ] Criar modelos SQLAlchemy baseados no schema
- [ ] Implementar autenticação JWT
- [ ] Configurar CORS para desenvolvimento
- [ ] Criar migrations iniciais

#### **Frontend Preparation**
- [ ] Instalar dependências necessárias (@supabase/supabase-js, axios)
- [ ] Criar service layer abstrato
- [ ] Configurar variáveis de ambiente para diferentes backends

### 4.2 Fase 2: Implementação da API Layer (Semana 3-4)

#### **Abstração de Serviços**
```typescript
// app/services/financeService.ts
interface IFinanceService {
  // Categorias
  getCategories(): Promise<Category[]>
  createCategory(data: CreateCategoryDto): Promise<Category>
  updateCategory(id: string, data: UpdateCategoryDto): Promise<Category>
  deleteCategory(id: string): Promise<void>
  
  // Transações
  getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>>
  createTransaction(data: CreateTransactionDto): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>
  
  // Envelopes
  getEnvelopes(): Promise<Envelope[]>
  createEnvelope(data: CreateEnvelopeDto): Promise<Envelope>
  updateEnvelope(id: string, data: UpdateEnvelopeDto): Promise<Envelope>
  deleteEnvelope(id: string): Promise<void>
  registerEnvelopeExpense(id: string, amount: number): Promise<Envelope>
  
  // Pagamentos Recorrentes
  getRecurringPayments(filters?: PaymentFilters): Promise<RecurringPayment[]>
  createRecurringPayment(data: CreatePaymentDto): Promise<RecurringPayment>
  updateRecurringPayment(id: string, data: UpdatePaymentDto): Promise<RecurringPayment>
  deleteRecurringPayment(id: string): Promise<void>
  markPaymentAsPaid(id: string, paid: boolean): Promise<RecurringPayment>
  
  // Analytics
  getSpendingAnalytics(period: AnalyticsPeriod): Promise<SpendingAnalytics>
}

// Implementações específicas
class SupabaseFinanceService implements IFinanceService { ... }
class FastAPIFinanceService implements IFinanceService { ... }

// Factory para escolher implementação
export const createFinanceService = (): IFinanceService => {
  return process.env.NODE_ENV === 'production' 
    ? new SupabaseFinanceService()
    : new FastAPIFinanceService()
}
```

#### **Checklist de Implementação**
- [ ] Implementar SupabaseFinanceService
- [ ] Implementar FastAPIFinanceService
- [ ] Criar DTOs e types TypeScript
- [ ] Implementar tratamento de erros consistente
- [ ] Adicionar validação de dados
- [ ] Implementar retry logic para falhas de rede

### 4.3 Fase 3: Migração Gradual dos Stores (Semana 5-6)

#### **Atualização do FinancasStore**
```typescript
// app/stores/financasStore.ts (nova versão)
import { createFinanceService } from '@/app/services/financeService'

const financeService = createFinanceService()

export const useFinancasStore = create<FinancasState>()(
  (set, get) => ({
    // Estado
    categorias: [],
    transacoes: [],
    envelopes: [],
    pagamentosRecorrentes: [],
    loading: false,
    error: null,
    
    // Ações assíncronas
    carregarCategorias: async () => {
      set({ loading: true, error: null })
      try {
        const categorias = await financeService.getCategories()
        set({ categorias, loading: false })
      } catch (error) {
        set({ error: error.message, loading: false })
      }
    },
    
    adicionarTransacao: async (data) => {
      set({ loading: true, error: null })
      try {
        const novaTransacao = await financeService.createTransaction(data)
        set(state => ({
          transacoes: [...state.transacoes, novaTransacao],
          loading: false
        }))
      } catch (error) {
        set({ error: error.message, loading: false })
      }
    },
    
    // ... outras ações
  })
)
```

#### **Checklist de Migração**
- [ ] Remover persist middleware do Zustand
- [ ] Implementar loading states
- [ ] Adicionar error handling
- [ ] Implementar cache local temporário
- [ ] Atualizar todos os componentes para usar async actions
- [ ] Adicionar otimistic updates onde apropriado

### 4.4 Fase 4: Migration Tool e Sync (Semana 7)

#### **Ferramenta de Migração de Dados**
```typescript
// app/utils/dataMigration.ts
export class FinanceDataMigrator {
  async migrateFromLocalStorage(): Promise<MigrationResult> {
    const localData = this.extractLocalStorageData()
    const migrationPlan = this.createMigrationPlan(localData)
    
    try {
      await this.executeCategories(migrationPlan.categorias)
      await this.executeEnvelopes(migrationPlan.envelopes)
      await this.executeTransactions(migrationPlan.transacoes)
      await this.executeRecurringPayments(migrationPlan.pagamentos)
      
      this.clearLocalStorage()
      return { success: true, migratedItems: migrationPlan.totalItems }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  private extractLocalStorageData() {
    const data = localStorage.getItem('financas-storage')
    return data ? JSON.parse(data) : null
  }
}
```

#### **Checklist de Migração de Dados**
- [ ] Criar ferramenta de extração de dados do localStorage
- [ ] Implementar mapeamento de IDs (localStorage → UUID)
- [ ] Criar validação de dados antes da migração
- [ ] Implementar rollback em caso de falha
- [ ] Adicionar logs detalhados do processo
- [ ] Criar UI para acompanhar progresso da migração

### 4.5 Fase 5: Testing e Optimization (Semana 8)

#### **Testes Automatizados**
- [ ] Testes unitários para services
- [ ] Testes de integração com APIs
- [ ] Testes de migração de dados
- [ ] Testes de performance
- [ ] Testes de fallback (quando API está offline)

#### **Otimizações**
- [ ] Implementar cache inteligente
- [ ] Adicionar sincronização automática
- [ ] Otimizar queries do banco
- [ ] Implementar paginação eficiente
- [ ] Adicionar prefetching de dados

#### **Monitoramento**
- [ ] Adicionar métricas de performance
- [ ] Implementar error tracking
- [ ] Configurar alertas de sistema
- [ ] Criar dashboard de saúde da aplicação

### 4.6 Fase 6: Deploy e Rollout (Semana 9-10)

#### **Deploy Production**
- [ ] Deploy do schema no Supabase
- [ ] Configurar CI/CD pipeline
- [ ] Testes de carga
- [ ] Deploy gradual (feature flags)
- [ ] Monitoramento em tempo real

#### **Rollout Strategy**
1. **Alpha (5% usuários)**: Testar estabilidade básica
2. **Beta (25% usuários)**: Validar performance e UX
3. **General Release (100%)**: Rollout completo

#### **Contingency Plan**
- [ ] Rollback plan para localStorage
- [ ] Script de recuperação de dados
- [ ] Comunicação com usuários
- [ ] Monitoramento de métricas críticas

---

## 📊 5. CONSIDERAÇÕES TÉCNICAS

### 5.1 Compatibilidade de Tipos
- **Supabase**: Usa tipos PostgreSQL nativos
- **FastAPI**: SQLAlchemy mapeia para tipos Python
- **Frontend**: TypeScript interfaces unificadas

### 5.2 Tratamento de Conflitos
- UUIDs evitam conflitos de ID
- Timestamps para resolução de conflitos
- Validação no frontend e backend

### 5.3 Performance
- Índices otimizados para queries comuns
- Paginação para listas grandes
- Cache local para dados frequentes

### 5.4 Security
- RLS no Supabase
- JWT authentication no FastAPI
- Validação de input em ambos backends

---

## 🎯 6. MÉTRICAS DE SUCESSO

### 6.1 KPIs Técnicos
- **Tempo de carregamento**: < 2s para primeira carga
- **Tempo de resposta API**: < 500ms para 95% das requests
- **Taxa de erro**: < 0.1%
- **Uptime**: > 99.9%

### 6.2 KPIs de Usuário
- **Tempo de migração**: < 30s para usuário médio
- **Perda de dados**: 0%
- **Satisfação do usuário**: > 90% (pesquisa pós-migração)

---

## ⚠️ 7. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados durante migração | Baixa | Alto | Backup automático antes da migração |
| Performance degradada | Média | Médio | Testes de carga extensivos |
| Incompatibilidade entre backends | Baixa | Alto | Abstração de service layer |
| Falha na autenticação | Baixa | Alto | Fallback para localStorage temporário |

---

## 📝 8. CONCLUSÃO

Este plano de migração garante uma transição suave do localStorage para uma arquitetura de backend dual, mantendo a funcionalidade existente enquanto adiciona escalabilidade e robustez. A abordagem gradual e o service layer abstrato permitem rollback rápido em caso de problemas, minimizando riscos para os usuários finais.

**Próximos Passos Recomendados:**
1. Aprovação do plano técnico
2. Setup inicial da infraestrutura
3. Implementação do MVP dos services
4. Testes piloto com dados sintéticos
5. Rollout gradual conforme cronograma

**Estimativa Total**: 10 semanas para migração completa
**Esforço**: ~2 desenvolvedores full-time
**Custo Estimado**: Supabase (~$25/mês) + Infrastructure (~$50/mês)