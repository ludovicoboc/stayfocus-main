# 🎯 PLANO DE MIGRAÇÃO TDD - MÓDULO HIPERFOCOS

## 🎯 CONTEXTO

Migração do módulo de hiperfocos de uma arquitetura baseada em localStorage para uma arquitetura de dados dual com **foco em gestão de projetos e alternância de foco**, seguindo **metodologia TDD rigorosa** estabelecida na FASE 0:
- **Produção**: Supabase (PostgreSQL com RLS + Otimizações temporais)
- **Desenvolvimento/Testes**: Backend FastAPI local (SQLAlchemy + PostgreSQL local)
- **Metodologia**: Test-Driven Development (Red-Green-Refactor)
- **Infraestrutura**: Vitest + RTL + MSW + Quality Gates automáticos
- **Especialização**: Validação temporal + Análise de produtividade + Gestão de alternância de foco

## 🧪 PREPARAÇÃO TDD - INFRAESTRUTURA PRONTA

### ✅ FASE 0 Concluída - Base Sólida Estabelecida

#### **Ferramentas Configuradas**
- **Vitest** - Test runner com coverage V8 (target: 70%+)
- **React Testing Library** - Testes user-centric
- **MSW** - Mock Service Worker para APIs
- **GitHub Actions** - Pipeline CI/CD com 7 quality gates
- **Factories & Utilities** - Geração de dados e helpers

#### **Quality Gates Automáticos**
| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Coverage Lines | 70% | 85% |
| Coverage Functions | 70% | 85% |
| Test Performance | < 100ms | < 50ms |
| Suite Completa | < 30s | < 15s |

---

## 🔍 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE + TESTES

### Inventário de Chaves e Dados Armazenados

**Chave: `hiperfocos-storage`**
- **Dados**: Gestão de hiperfocos, tarefas hierárquicas e sessões de alternância
- **Estrutura**:
  ```json
  {
    "hiperfocos": [
      {
        "id": "string",
        "titulo": "string",
        "descricao": "string",
        "tarefas": "Tarefa[]",
        "subTarefas": "Record<string, Tarefa[]>",
        "cor": "string",
        "dataCriacao": "string (ISO 8601)",
        "tempoLimite": "number | undefined"
      }
    ],
    "sessoes": [
      {
        "id": "string",
        "titulo": "string",
        "hiperfocoAtual": "string | null",
        "hiperfocoAnterior": "string | null",
        "tempoInicio": "string (ISO 8601)",
        "duracaoEstimada": "number",
        "concluida": "boolean"
      }
    ]
  }
  ```

### 🧪 Factories TDD para Dados Existentes

```typescript
// __tests__/factories/hiperfocos.ts
export const createHiperfoco = (overrides = {}) => ({
  id: `hiperfoco-${counter++}`,
  titulo: 'Projeto de Desenvolvimento',
  descricao: 'Descrição do projeto',
  tarefas: [],
  subTarefas: {},
  cor: '#FF5252',
  dataCriacao: new Date().toISOString(),
  tempoLimite: 120,
  ...overrides
})

export const createTarefa = (overrides = {}) => ({
  id: `tarefa-${counter++}`,
  texto: 'Tarefa de exemplo',
  concluida: false,
  cor: '#2196F3',
  ...overrides
})

export const createSessaoAlternancia = (overrides = {}) => ({
  id: `sessao-${counter++}`,
  titulo: 'Sessão de Foco',
  hiperfocoAtual: null,
  hiperfocoAnterior: null,
  tempoInicio: new Date().toISOString(),
  duracaoEstimada: 25,
  concluida: false,
  ...overrides
})
```

### Componentes Dependentes + Estratégia de Testes

| Componente | Responsabilidade | Estratégia TDD |
|------------|------------------|----------------|
| **ConversorInteresses.tsx** | Criação de hiperfocos | ✅ Testes de Formulário + Validação |
| **VisualizadorProjetos.tsx** | Visualização hierárquica | ✅ Testes de Renderização + Interação |
| **SistemaAlternancia.tsx** | Gerenciamento de sessões | ✅ Testes de Estado + Temporal |
| **TemporizadorFoco.tsx** | Temporizador baseado em hiperfocos | ✅ Testes de Timer + Performance |

### 🎯 Cobertura de Testes Planejada

```typescript
// Estrutura de testes para o módulo
__tests__/
├── components/
│   ├── ConversorInteresses.test.tsx     # Formulário + Validação
│   ├── VisualizadorProjetos.test.tsx    # Renderização + Hierarquia
│   ├── SistemaAlternancia.test.tsx      # Estado + Temporal
│   └── TemporizadorFoco.test.tsx        # Timer + Performance
├── hooks/
│   ├── useHiperfocos.test.ts            # Store + Mutations
│   ├── useAlternancia.test.ts           # Session logic
│   └── useTemporizador.test.ts          # Timer logic
├── services/
│   ├── hiperfocosApi.test.ts            # API calls
│   └── alternanciaService.test.ts       # Session management
└── integration/
    └── hiperfocos-flow.test.tsx         # E2E scenarios
```

---

## 🗄️ 2. ESQUEMA DE BANCO UNIFICADO

### 2.1 Estrutura SQL (PostgreSQL)

```sql
-- Tabela principal de hiperfocos
CREATE TABLE hiperfocos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) NOT NULL DEFAULT '#FF5252',
  tempo_limite INTEGER, -- em minutos
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_cor CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_tempo_limite CHECK (tempo_limite > 0)
);

-- Tabela de tarefas principais
CREATE TABLE tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiperfoco_id UUID REFERENCES hiperfocos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluida BOOLEAN DEFAULT false,
  cor VARCHAR(7),
  ordem INTEGER NOT NULL DEFAULT 0,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_cor CHECK (cor IS NULL OR cor ~ '^#[0-9A-Fa-f]{6}$')
);

-- Tabela de subtarefas
CREATE TABLE subtarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_pai_id UUID REFERENCES tarefas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluida BOOLEAN DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE
);

-- Tabela de sessões de alternância
CREATE TABLE sessoes_alternancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  hiperfoco_atual_id UUID REFERENCES hiperfocos(id),
  hiperfoco_anterior_id UUID REFERENCES hiperfocos(id),
  tempo_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_estimada INTEGER NOT NULL, -- em minutos
  duracao_real INTEGER, -- em minutos
  concluida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_duracao_estimada CHECK (duracao_estimada > 0),
  CONSTRAINT valid_duracao_real CHECK (duracao_real IS NULL OR duracao_real > 0)
);
```

### 2.2 Índices para Performance

```sql
-- Índices para consultas frequentes
CREATE INDEX idx_hiperfocos_user_ativo ON hiperfocos(user_id, ativo);
CREATE INDEX idx_tarefas_hiperfoco ON tarefas(hiperfoco_id, ordem);
CREATE INDEX idx_subtarefas_tarefa ON subtarefas(tarefa_pai_id, ordem);
CREATE INDEX idx_sessoes_user_data ON sessoes_alternancia(user_id, data_criacao DESC);
CREATE INDEX idx_sessoes_hiperfoco_atual ON sessoes_alternancia(hiperfoco_atual_id);
```

### 2.3 RLS (Row Level Security)

```sql
-- Políticas de segurança
ALTER TABLE hiperfocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_alternancia ENABLE ROW LEVEL SECURITY;

-- Políticas para hiperfocos
CREATE POLICY "Users can view own hiperfocos" ON hiperfocos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hiperfocos" ON hiperfocos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hiperfocos" ON hiperfocos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hiperfocos" ON hiperfocos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas similares para outras tabelas...
```

---

## 🧪 3. FACTORIES TDD ESPECÍFICAS DO MÓDULO

```typescript
// __tests__/factories/hiperfocos.ts
import { faker } from '@faker-js/faker'

let hiperfocoCounter = 1
let tarefaCounter = 1
let sessaoCounter = 1

export const createHiperfoco = (overrides = {}) => ({
  id: `hiperfoco-${hiperfocoCounter++}`,
  titulo: faker.company.buzzPhrase(),
  descricao: faker.lorem.paragraph(),
  tarefas: [],
  subTarefas: {},
  cor: faker.helpers.arrayElement(['#FF5252', '#2196F3', '#4CAF50', '#FF9800']),
  dataCriacao: faker.date.recent().toISOString(),
  tempoLimite: faker.helpers.arrayElement([25, 45, 60, 90, 120]),
  ...overrides
})

export const createTarefa = (overrides = {}) => ({
  id: `tarefa-${tarefaCounter++}`,
  texto: faker.lorem.sentence(),
  concluida: faker.datatype.boolean(),
  cor: faker.helpers.arrayElement(['#FF5252', '#2196F3', '#4CAF50']),
  ...overrides
})

export const createSessaoAlternancia = (overrides = {}) => ({
  id: `sessao-${sessaoCounter++}`,
  titulo: `Sessão ${faker.lorem.words(2)}`,
  hiperfocoAtual: faker.helpers.maybe(() => `hiperfoco-${faker.number.int({min: 1, max: 5})}`),
  hiperfocoAnterior: faker.helpers.maybe(() => `hiperfoco-${faker.number.int({min: 1, max: 5})}`),
  tempoInicio: faker.date.recent().toISOString(),
  duracaoEstimada: faker.helpers.arrayElement([15, 25, 30, 45, 60]),
  concluida: faker.datatype.boolean(),
  ...overrides
})

// Utilities
export const createHiperfocosState = (overrides = {}) => ({
  hiperfocos: Array.from({ length: 3 }, () => createHiperfoco()),
  sessoes: Array.from({ length: 5 }, () => createSessaoAlternancia()),
  ...overrides
})

export const createHiperfocoComTarefas = (numTarefas = 3, overrides = {}) => {
  const hiperfoco = createHiperfoco(overrides)
  hiperfoco.tarefas = Array.from({ length: numTarefas }, () => createTarefa())
  return hiperfoco
}
```

---

## 🧪 4. TEMPLATES DE TESTE TDD

### Template: ConversorInteresses Component

```typescript
// __tests__/components/ConversorInteresses.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ConversorInteresses } from '@/components/hiperfocos/ConversorInteresses'
import { useHiperfocosStore } from '@/stores/hiperfocosStore'
import { createHiperfoco } from '@/factories/hiperfocos'

// Mock do store
vi.mock('@/stores/hiperfocosStore')

describe('ConversorInteresses', () => {
  const mockAdicionarHiperfoco = vi.fn()
  const mockAdicionarTarefa = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useHiperfocosStore.mockReturnValue({
      adicionarHiperfoco: mockAdicionarHiperfoco,
      adicionarTarefa: mockAdicionarTarefa
    })
  })

  describe('🔴 RED: Component Rendering & Basic Validation', () => {
    it('deve renderizar formulário de criação de hiperfoco', () => {
      render(<ConversorInteresses />)

      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
      expect(screen.getByText(/criar hiperfoco/i)).toBeInTheDocument()
    })

    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(<ConversorInteresses />)

      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)

      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    })
  })

  describe('🟢 GREEN: Form Submission & Data Handling', () => {
    it('deve criar hiperfoco com dados válidos', async () => {
      const user = userEvent.setup()
      mockAdicionarHiperfoco.mockReturnValue('hiperfoco-123')

      render(<ConversorInteresses />)

      await user.type(screen.getByLabelText(/título/i), 'Novo Projeto')
      await user.type(screen.getByLabelText(/descrição/i), 'Descrição do projeto')
      await user.type(screen.getByLabelText(/tempo limite/i), '60')

      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)

      expect(mockAdicionarHiperfoco).toHaveBeenCalledWith(
        'Novo Projeto',
        'Descrição do projeto',
        expect.any(String), // cor
        60
      )
    })
  })

  describe('🔵 REFACTOR: Advanced Features & Performance', () => {
    it('deve adicionar múltiplas tarefas ao hiperfoco', async () => {
      const user = userEvent.setup()
      mockAdicionarHiperfoco.mockReturnValue('hiperfoco-123')

      render(<ConversorInteresses />)

      // Adicionar campos de tarefa
      const addTaskButton = screen.getByRole('button', { name: /adicionar tarefa/i })
      await user.click(addTaskButton)
      await user.click(addTaskButton)

      // Preencher tarefas
      const taskInputs = screen.getAllByLabelText(/tarefa/i)
      await user.type(taskInputs[0], 'Primeira tarefa')
      await user.type(taskInputs[1], 'Segunda tarefa')

      // Submeter formulário
      await user.type(screen.getByLabelText(/título/i), 'Projeto com Tarefas')
      const submitButton = screen.getByRole('button', { name: /criar hiperfoco/i })
      await user.click(submitButton)

      expect(mockAdicionarTarefa).toHaveBeenCalledTimes(2)
    })
  })
})
```

### Template: TemporizadorFoco Component

```typescript
// __tests__/components/TemporizadorFoco.test.tsx
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TemporizadorFoco } from '@/components/hiperfocos/TemporizadorFoco'
import { useHiperfocosStore } from '@/stores/hiperfocosStore'
import { createHiperfoco } from '@/factories/hiperfocos'

describe('TemporizadorFoco', () => {
  const mockHiperfocos = [
    createHiperfoco({ id: '1', titulo: 'Projeto A', tempoLimite: 25 }),
    createHiperfoco({ id: '2', titulo: 'Projeto B', tempoLimite: 45 })
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    useHiperfocosStore.mockReturnValue({
      hiperfocos: mockHiperfocos
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('🔴 RED: Timer Functionality', () => {
    it('deve inicializar com tempo correto do hiperfoco selecionado', () => {
      render(<TemporizadorFoco />)

      expect(screen.getByText('25:00')).toBeInTheDocument()
    })

    it('deve decrementar tempo quando iniciado', async () => {
      const user = userEvent.setup()
      render(<TemporizadorFoco />)

      const startButton = screen.getByRole('button', { name: /iniciar/i })
      await user.click(startButton)

      act(() => {
        vi.advanceTimersByTime(60000) // 1 minuto
      })

      expect(screen.getByText('24:00')).toBeInTheDocument()
    })
  })

  describe('🟢 GREEN: Timer Controls', () => {
    it('deve pausar e retomar temporizador', async () => {
      const user = userEvent.setup()
      render(<TemporizadorFoco />)

      // Iniciar
      await user.click(screen.getByRole('button', { name: /iniciar/i }))

      // Pausar
      await user.click(screen.getByRole('button', { name: /pausar/i }))

      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Tempo não deve ter mudado
      expect(screen.getByText('25:00')).toBeInTheDocument()
    })
  })
})
```

---

## 🎯 5. MSW HANDLERS PARA APIS

```typescript
// __tests__/mocks/handlers/hiperfocos.ts
import { http, HttpResponse } from 'msw'
import { createHiperfoco, createTarefa, createSessaoAlternancia } from '@/factories/hiperfocos'

export const hiperfocosHandlers = [
  // GET /api/hiperfocos
  http.get('/api/hiperfocos', () => {
    return HttpResponse.json([
      createHiperfoco({ id: '1', titulo: 'Projeto Mock A' }),
      createHiperfoco({ id: '2', titulo: 'Projeto Mock B' })
    ])
  }),

  // POST /api/hiperfocos
  http.post('/api/hiperfocos', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json(createHiperfoco(data))
  }),

  // PUT /api/hiperfocos/:id
  http.put('/api/hiperfocos/:id', async ({ params, request }) => {
    const data = await request.json()
    return HttpResponse.json(createHiperfoco({ id: params.id, ...data }))
  }),

  // DELETE /api/hiperfocos/:id
  http.delete('/api/hiperfocos/:id', ({ params }) => {
    return HttpResponse.json({ success: true })
  }),

  // GET /api/hiperfocos/:id/tarefas
  http.get('/api/hiperfocos/:id/tarefas', ({ params }) => {
    return HttpResponse.json([
      createTarefa({ hiperfocoId: params.id }),
      createTarefa({ hiperfocoId: params.id })
    ])
  }),

  // POST /api/sessoes-alternancia
  http.post('/api/sessoes-alternancia', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json(createSessaoAlternancia(data))
  })
]
```

---

## 📊 6. QUALITY GATES ESPECÍFICOS

### 6.1 Métricas de Qualidade Temporal

```typescript
// __tests__/utils/temporalValidation.ts
export const validateTemporalData = {
  // Validar consistência de timestamps
  validateTimestamps: (sessao: SessaoAlternancia) => {
    const inicio = new Date(sessao.tempoInicio)
    const agora = new Date()

    return {
      isValid: inicio <= agora,
      message: inicio > agora ? 'Tempo de início não pode ser futuro' : 'OK'
    }
  },

  // Validar duração de sessões
  validateDuracao: (duracao: number) => {
    return {
      isValid: duracao > 0 && duracao <= 480, // máximo 8 horas
      message: duracao <= 0 ? 'Duração deve ser positiva' :
               duracao > 480 ? 'Duração muito longa' : 'OK'
    }
  },

  // Validar alternância de foco
  validateAlternancia: (sessoes: SessaoAlternancia[]) => {
    const sessoesSorted = sessoes.sort((a, b) =>
      new Date(a.tempoInicio).getTime() - new Date(b.tempoInicio).getTime()
    )

    let isValid = true
    for (let i = 1; i < sessoesSorted.length; i++) {
      const anterior = sessoesSorted[i - 1]
      const atual = sessoesSorted[i]

      if (atual.hiperfocoAnterior !== anterior.hiperfocoAtual) {
        isValid = false
        break
      }
    }

    return {
      isValid,
      message: isValid ? 'Alternância consistente' : 'Inconsistência na alternância'
    }
  }
}
```

### 6.2 Performance Benchmarks

```typescript
// __tests__/performance/hiperfocos.bench.ts
import { bench, describe } from 'vitest'
import { createHiperfocosState } from '@/factories/hiperfocos'
import { useHiperfocosStore } from '@/stores/hiperfocosStore'

describe('Hiperfocos Performance', () => {
  bench('criar 100 hiperfocos', () => {
    const state = createHiperfocosState({
      hiperfocos: Array.from({ length: 100 }, () => createHiperfoco())
    })
    expect(state.hiperfocos).toHaveLength(100)
  })

  bench('filtrar hiperfocos por cor', () => {
    const state = createHiperfocosState({
      hiperfocos: Array.from({ length: 1000 }, () => createHiperfoco())
    })
    const filtered = state.hiperfocos.filter(h => h.cor === '#FF5252')
    expect(filtered.length).toBeGreaterThan(0)
  })

  bench('calcular progresso de tarefas', () => {
    const hiperfoco = createHiperfocoComTarefas(50)
    const concluidas = hiperfoco.tarefas.filter(t => t.concluida).length
    const progresso = (concluidas / hiperfoco.tarefas.length) * 100
    expect(progresso).toBeGreaterThanOrEqual(0)
  })
})
```

---

## 🚀 7. PIPELINE CI/CD ESPECÍFICO

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/hiperfocos-tdd.yml
name: 🎯 Hiperfocos TDD Pipeline

on:
  push:
    paths:
      - 'app/components/hiperfocos/**'
      - 'app/stores/hiperfocosStore.ts'
      - '__tests__/components/hiperfocos/**'
      - '__tests__/factories/hiperfocos.ts'
  pull_request:
    paths:
      - 'app/components/hiperfocos/**'
      - 'app/stores/hiperfocosStore.ts'

jobs:
  hiperfocos-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-group: [components, hooks, services, integration]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Executar testes - ${{ matrix.test-group }}
        run: |
          case "${{ matrix.test-group }}" in
            components)
              npm run test -- __tests__/components/hiperfocos/ --coverage
              ;;
            hooks)
              npm run test -- __tests__/hooks/useHiperfocos.test.ts --coverage
              ;;
            services)
              npm run test -- __tests__/services/hiperfocosApi.test.ts --coverage
              ;;
            integration)
              npm run test -- __tests__/integration/hiperfocos-flow.test.tsx --coverage
              ;;
          esac

      - name: Quality Gates - Hiperfocos
        run: |
          # Coverage mínimo 70%
          npm run test:coverage -- --reporter=json > coverage.json
          COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage.json')).total.lines.pct)")
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "❌ Coverage insuficiente: $COVERAGE% (mínimo: 70%)"
            exit 1
          fi
          echo "✅ Coverage OK: $COVERAGE%"

      - name: Performance Tests
        run: |
          npm run test:bench -- __tests__/performance/hiperfocos.bench.ts

      - name: Temporal Validation Tests
        run: |
          npm run test -- __tests__/utils/temporalValidation.test.ts

  hiperfocos-e2e:
    runs-on: ubuntu-latest
    needs: hiperfocos-tests

    steps:
      - uses: actions/checkout@v4
      - name: E2E Tests - Hiperfocos Flow
        run: |
          npm run test:e2e -- --grep "hiperfocos"
```

### 7.2 Quality Gates Automáticos

```typescript
// scripts/quality-gates-hiperfocos.ts
export const hiperfocosQualityGates = {
  coverage: {
    minimum: 70,
    ideal: 85,
    check: (coverage: number) => coverage >= 70
  },

  performance: {
    maxTestTime: 100, // ms
    maxSuiteTime: 30000, // ms
    check: (time: number) => time <= 100
  },

  temporal: {
    maxSessionDuration: 480, // 8 horas
    minSessionDuration: 1, // 1 minuto
    check: (duration: number) => duration >= 1 && duration <= 480
  },

  productivity: {
    maxHiperfocosPerUser: 50,
    maxTarefasPorHiperfoco: 100,
    check: (count: number, type: 'hiperfocos' | 'tarefas') => {
      return type === 'hiperfocos' ? count <= 50 : count <= 100
    }
  }
}
```

---

## 📅 8. CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Fundação TDD (1-2 semanas)**

1. **Setup da Infraestrutura**
   - [x] Configurar Vitest com coverage específico
   - [x] Configurar MSW para APIs de hiperfocos
   - [ ] Implementar factories completas
   - [ ] Configurar quality gates temporais

2. **Esquema de Banco**
   - [ ] Implementar tabelas PostgreSQL
   - [ ] Configurar RLS policies
   - [ ] Criar índices de performance
   - [ ] Testar migrações

### **Fase 2: Migração Core TDD (2-3 semanas)**

1. **Componentes Principais**
   - [ ] ConversorInteresses.test.tsx (RED-GREEN-REFACTOR)
   - [ ] VisualizadorProjetos.test.tsx (RED-GREEN-REFACTOR)
   - [ ] SistemaAlternancia.test.tsx (RED-GREEN-REFACTOR)
   - [ ] TemporizadorFoco.test.tsx (RED-GREEN-REFACTOR)

2. **Store e Hooks**
   - [ ] useHiperfocos.test.ts (Hook customizado)
   - [ ] useAlternancia.test.ts (Session management)
   - [ ] useTemporizador.test.ts (Timer logic)

### **Fase 3: Integração e APIs (1-2 semanas)**

1. **Services Layer**
   - [ ] hiperfocosApi.test.ts (CRUD operations)
   - [ ] alternanciaService.test.ts (Session management)
   - [ ] Implementar DataProvider interface

2. **Testes de Integração**
   - [ ] hiperfocos-flow.test.tsx (E2E completo)
   - [ ] Validação temporal end-to-end
   - [ ] Performance com dados reais

### **Fase 4: Validação e Deploy (1 semana)**

1. **Quality Gates Finais**
   - [ ] Coverage ≥ 70% (ideal 85%)
   - [ ] Performance < 100ms por teste
   - [ ] Validação temporal completa
   - [ ] Testes de produtividade

2. **Migração de Dados**
   - [ ] Script de migração localStorage → PostgreSQL
   - [ ] Validação de integridade
   - [ ] Rollback strategy

---

## 🎯 9. MÉTRICAS DE SUCESSO

### 9.1 Métricas Técnicas

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| Coverage Lines | ≥ 70% | - | 🔄 |
| Coverage Functions | ≥ 70% | - | 🔄 |
| Test Performance | < 100ms | - | 🔄 |
| Suite Completa | < 30s | - | 🔄 |
| Temporal Validation | 100% | - | 🔄 |

### 9.2 Métricas de Produtividade

| Métrica | Meta | Descrição |
|---------|------|-----------|
| Alternância Eficiente | < 2min | Tempo para alternar entre hiperfocos |
| Precisão Temporal | ± 5s | Precisão do temporizador |
| Gestão de Tarefas | < 1s | Tempo para CRUD de tarefas |
| Sincronização | < 3s | Sync entre localStorage e backend |

### 9.3 Métricas de Qualidade

```typescript
// Validações automáticas
export const qualityMetrics = {
  dataIntegrity: {
    hiperfocosConsistency: 100, // % de hiperfocos válidos
    tarefasHierarchy: 100, // % de hierarquia correta
    sessionsFlow: 100 // % de fluxo de sessões válido
  },

  performance: {
    renderTime: 50, // ms para renderizar lista
    searchTime: 100, // ms para busca
    filterTime: 50 // ms para filtros
  },

  usability: {
    accessibilityScore: 95, // % WCAG compliance
    mobileResponsive: 100, // % responsividade
    keyboardNavigation: 100 // % navegação por teclado
  }
}
```

---

## 🔄 10. PRÓXIMOS PASSOS

### Imediatos (Esta Sprint)
1. ✅ Completar factories de hiperfocos
2. ✅ Implementar templates de teste base
3. ✅ Configurar MSW handlers
4. ✅ Setup quality gates temporais

### Próxima Sprint
1. 🔄 Implementar testes RED-GREEN-REFACTOR para ConversorInteresses
2. 🔄 Migrar VisualizadorProjetos para arquitetura dual
3. 🔄 Implementar validação temporal completa
4. 🔄 Configurar pipeline CI/CD específico

### Médio Prazo
1. 📋 Integração completa com Supabase
2. 📋 Otimizações de performance
3. 📋 Migração de dados de produção
4. 📋 Monitoramento e métricas em tempo real

---

## 📚 REFERÊNCIAS E TEMPLATES

- **Módulo Alimentação**: `docs/plano-migracao-alimentacao.md`
- **Módulo Saúde**: `docs/plano-migracao-saude.md`
- **Factories Base**: `__tests__/factories/estudos-concursos.ts`
- **Templates TDD**: `__tests__/templates/estudos-concursos-templates.ts`
- **MSW Handlers**: `__tests__/mocks/handlers/estudos-concursos.ts`
- **Quality Gates**: `.github/workflows/estudos-concursos-tdd.yml`
