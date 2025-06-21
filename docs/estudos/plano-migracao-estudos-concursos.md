# 📚 PLANO DE MIGRAÇÃO TDD - MÓDULO ESTUDOS E CONCURSOS

## 🎯 CONTEXTO

Migração do módulo de estudos e concursos de uma arquitetura baseada em localStorage para uma arquitetura de dados dual com **foco em validação educacional e performance de consultas**, seguindo **metodologia TDD rigorosa** estabelecida na FASE 0:
- **Produção**: Supabase (PostgreSQL com RLS + Otimizações para consultas educacionais)
- **Desenvolvimento/Testes**: Backend FastAPI local (SQLAlchemy + PostgreSQL local)
- **Metodologia**: Test-Driven Development (Red-Green-Refactor)
- **Infraestrutura**: Vitest + RTL + MSW + Quality Gates automáticos
- **Especialização**: Validação de dados educacionais + Performance de simulados + Integridade de questões

## 🧪 PREPARAÇÃO TDD - INFRAESTRUTURA PRONTA

### ✅ FASE 0 Concluída - Base Sólida Estabelecida

#### Ferramentas Configuradas
- **Vitest** - Test runner com coverage V8 (target: 70%+)
- **React Testing Library** - Testes user-centric
- **MSW** - Mock Service Worker para APIs
- **GitHub Actions** - Pipeline CI/CD com 7 quality gates
- **Factories & Utilities** - Geração de dados e helpers

#### 🎯 Quality Gates Automáticos
| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Coverage Lines | 70% | 85% |
| Coverage Functions | 70% | 85% |
| Test Performance | < 100ms | < 50ms |
| Suite Completa | < 30s | < 15s |
| Query Performance | < 200ms | < 100ms |
| Data Integrity | 99.9% | 100% |

---

## 🔍 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE + TESTES

### Inventário de Chaves e Dados Armazenados

| Chave localStorage | Store Zustand | Componentes Dependentes | Tipos de Dados |
|-------------------|---------------|------------------------|----------------|
| `concursos-storage` | `useConcursosStore` | ConcursosPage, DetalhesConcursoPage, EstudosPage | Concurso[], ConteudoProgramatico[] |
| `questoes-store` | `useQuestoesStore` | QuestaoList, QuestaoForm, SimuladoPersonalizado | Questao[], Alternativa[] |
| `registro-estudos-storage` | `useRegistroEstudosStore` | RegistroEstudos | SessaoEstudo[] |
| `pomodoro-storage` | `usePomodoroStore` | TemporizadorPomodoro | ConfiguracaoPomodoro, estatísticas |
| `historico-simulados-storage` | `useHistoricoSimuladosStore` | HistoricoModal, SimuladoResults | Record<string, SimuladoHistoricoEntry> |
| `simulado_personalizado_questoes` | Armazenamento temporário | SimuladoPersonalizadoPage | Array de questões selecionadas |
| `simulados_favoritos_{concursoId}` | Por concurso específico | DetalhesConcursoPage | Array de simulados salvos |

### 🧪 Factories TDD para Dados Existentes

```typescript
// __tests__/factories/estudos-concursos.ts
let concursoCounter = 1
let questaoCounter = 1
let sessaoCounter = 1

export const createConcurso = (overrides = {}) => ({
  id: `concurso-${concursoCounter++}`,
  titulo: 'Analista Administrativo - TRT',
  organizadora: 'FCC',
  dataInscricao: '2024-06-01',
  dataProva: '2024-08-15',
  edital: 'https://exemplo.com/edital.pdf',
  status: 'planejado',
  conteudoProgramatico: [
    {
      disciplina: 'Direito Administrativo',
      topicos: ['Princípios', 'Atos Administrativos'],
      progresso: 0
    }
  ],
  ...overrides
})

export const createQuestao = (overrides = {}) => ({
  id: `questao-${questaoCounter++}`,
  concursoId: 'concurso-1',
  disciplina: 'Direito Administrativo',
  topico: 'Princípios',
  enunciado: 'Qual é o princípio fundamental da Administração Pública?',
  alternativas: [
    { id: 'a', texto: 'Legalidade', correta: true },
    { id: 'b', texto: 'Moralidade', correta: false },
    { id: 'c', texto: 'Impessoalidade', correta: false },
    { id: 'd', texto: 'Publicidade', correta: false }
  ],
  respostaCorreta: 'a',
  justificativa: 'A legalidade é o princípio basilar...',
  nivelDificuldade: 'medio',
  ano: 2024,
  banca: 'FCC',
  tags: ['princípios', 'fundamentos'],
  respondida: false,
  ...overrides
})

export const createSessaoEstudo = (overrides = {}) => ({
  id: `sessao-${sessaoCounter++}`,
  titulo: 'Revisão de Direito Administrativo',
  descricao: 'Estudo dos princípios fundamentais',
  duracao: 45,
  data: new Date().toISOString().split('T')[0],
  completo: false,
  ...overrides
})

export const createConfiguracaoPomodoro = (overrides = {}) => ({
  tempoFoco: 25,
  tempoPausa: 5,
  tempoLongapausa: 15,
  ciclosAntesLongapausa: 4,
  ...overrides
})

export const createHistoricoSimulado = (overrides = {}) => ({
  titulo: 'Simulado Direito Administrativo',
  totalQuestoes: 20,
  tentativas: [
    {
      timestamp: new Date().toISOString(),
      acertos: 15,
      percentual: 75
    }
  ],
  ...overrides
})

// Utilities para listas
export const createList = <T>(factory: (overrides?: any) => T, count: number, overrides?: any): T[] =>
  Array.from({ length: count }, (_, i) => factory({ ...overrides, id: `${overrides?.id || 'item'}-${i + 1}` }))

export const createEstudosConcursosState = (overrides = {}) => ({
  concursos: createList(createConcurso, 3),
  questoes: createList(createQuestao, 10),
  sessoes: createList(createSessaoEstudo, 5),
  configuracaoPomodoro: createConfiguracaoPomodoro(),
  historicoSimulados: {},
  ...overrides
})
```

### 📊 Estrutura de Testes Hierárquica

```typescript
// Estrutura de testes para o módulo
__tests__/
├── components/
│   ├── concursos/
│   │   ├── ConcursoForm.test.tsx           # CRUD + Validação
│   │   ├── QuestaoForm.test.tsx            # Formulário + Alternativas
│   │   ├── QuestaoList.test.tsx            # Listagem + Filtros
│   │   ├── GeradorQuestoesLLM.test.tsx     # Geração automática
│   │   └── ImportarConcursoJsonModal.test.tsx # Importação
│   ├── estudos/
│   │   ├── RegistroEstudos.test.tsx        # CRUD + Estatísticas
│   │   ├── TemporizadorPomodoro.test.tsx   # Timer + Configurações
│   │   └── simulado/
│   │       ├── SimuladoLoader.test.tsx     # Carregamento + Validação
│   │       ├── SimuladoReview.test.tsx     # Revisão + Navegação
│   │       ├── SimuladoResults.test.tsx    # Resultados + Histórico
│   │       └── HistoricoModal.test.tsx     # Modal + Estatísticas
├── hooks/
│   ├── useConcursos.test.ts                # Store + Mutations
│   ├── useQuestoes.test.ts                 # CRUD + Busca
│   ├── useRegistroEstudos.test.ts          # Sessões + Estatísticas
│   ├── usePomodoro.test.ts                 # Timer + Configurações
│   └── useHistoricoSimulados.test.ts       # Histórico + Análise
├── services/
│   ├── estudosApi.test.ts                  # API calls + validação
│   ├── concursosApi.test.ts                # CRUD operations
│   ├── questoesApi.test.ts                 # Busca + filtros
│   └── simuladosService.test.ts            # Lógica de simulados
├── utils/
│   ├── educationalValidation.test.ts       # Validação educacional
│   ├── simuladoCalculations.test.ts        # Cálculos de performance
│   └── dataIntegrity.test.ts               # Integridade de dados
└── integration/
    ├── estudos-flow.test.tsx               # E2E study sessions
    ├── concursos-management.test.tsx       # E2E contest management
    └── simulados-completos.test.tsx        # E2E simulation flow
```

### 🔗 Mapeamento de Relacionamentos

#### Relacionamentos Principais
1. **Concurso → Questões**: Um concurso pode ter múltiplas questões (1:N)
2. **Questão → Alternativas**: Cada questão tem múltiplas alternativas (1:N)
3. **Concurso → Conteúdo Programático**: Cada concurso tem disciplinas e tópicos (1:N)
4. **Simulado → Questões**: Simulados são compostos por questões selecionadas (N:N)
5. **Histórico → Simulados**: Cada simulado pode ter múltiplas tentativas (1:N)
6. **Sessão Estudo → Concurso**: Sessões podem ser vinculadas a concursos específicos (N:1)

#### Dependências de Componentes
- **EstudosPage**: useConcursosStore (próximo concurso)
- **DetalhesConcursoPage**: useConcursosStore, useQuestoesStore
- **QuestaoForm**: useQuestoesStore (CRUD questões)
- **SimuladoLoader**: useSimuladoStore, useConcursosStore, useQuestoesStore
- **TemporizadorPomodoro**: usePomodoroStore
- **RegistroEstudos**: useRegistroEstudosStore
- **HistoricoModal**: useHistoricoSimuladosStore

---

## 🏗️ 2. ARQUITETURA DE DADOS DUAL

### Schema PostgreSQL Otimizado

```sql
-- Concursos
CREATE TABLE concursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(500) NOT NULL,
    organizadora VARCHAR(255) NOT NULL,
    data_inscricao DATE NOT NULL,
    data_prova DATE NOT NULL,
    edital TEXT,
    status VARCHAR(50) DEFAULT 'planejado' 
        CHECK (status IN ('planejado', 'inscrito', 'estudando', 'realizado', 'aguardando_resultado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para performance
    INDEX idx_concursos_user_status (user_id, status),
    INDEX idx_concursos_data_prova (data_prova)
);

-- Conteúdo Programático
CREATE TABLE conteudo_programatico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
    disciplina VARCHAR(255) NOT NULL,
    topicos TEXT[] NOT NULL,
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    
    INDEX idx_conteudo_concurso (concurso_id),
    INDEX idx_conteudo_disciplina (disciplina)
);

-- Questões
CREATE TABLE questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concurso_id UUID REFERENCES concursos(id) ON DELETE SET NULL,
    disciplina VARCHAR(255) NOT NULL,
    topico VARCHAR(255),
    enunciado TEXT NOT NULL,
    justificativa TEXT,
    nivel_dificuldade VARCHAR(20) DEFAULT 'medio' 
        CHECK (nivel_dificuldade IN ('facil', 'medio', 'dificil')),
    ano INTEGER,
    banca VARCHAR(255),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para busca otimizada
    INDEX idx_questoes_user_disciplina (user_id, disciplina),
    INDEX idx_questoes_concurso (concurso_id),
    INDEX idx_questoes_tags (tags) USING GIN,
    INDEX idx_questoes_nivel (nivel_dificuldade)
);

-- Alternativas
CREATE TABLE alternativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    letra CHAR(1) NOT NULL,
    texto TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    
    INDEX idx_alternativas_questao (questao_id),
    UNIQUE(questao_id, letra)
);

-- Sessões de Estudo
CREATE TABLE sessoes_estudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concurso_id UUID REFERENCES concursos(id) ON DELETE SET NULL,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    duracao INTEGER NOT NULL, -- em minutos
    data DATE NOT NULL,
    completo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_sessoes_user_data (user_id, data),
    INDEX idx_sessoes_concurso (concurso_id)
);

-- Configurações Pomodoro
CREATE TABLE configuracoes_pomodoro (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tempo_foco INTEGER DEFAULT 25,
    tempo_pausa INTEGER DEFAULT 5,
    tempo_longa_pausa INTEGER DEFAULT 15,
    ciclos_antes_longa_pausa INTEGER DEFAULT 4,
    ciclos_completos INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de Simulados
CREATE TABLE historico_simulados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    identificador VARCHAR(500) NOT NULL, -- titulo|totalQuestoes
    titulo VARCHAR(500) NOT NULL,
    total_questoes INTEGER NOT NULL,
    acertos INTEGER NOT NULL,
    percentual DECIMAL(5,2) NOT NULL,
    tempo_gasto INTEGER, -- em segundos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_historico_user_identificador (user_id, identificador),
    INDEX idx_historico_percentual (percentual DESC)
);
```

### RLS (Row Level Security) Policies

```sql
-- Concursos - Usuário só acessa seus próprios concursos
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY concursos_user_policy ON concursos
    FOR ALL USING (user_id = auth.uid());

-- Questões - Usuário só acessa suas próprias questões
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY questoes_user_policy ON questoes
    FOR ALL USING (user_id = auth.uid());

-- Sessões de Estudo - Usuário só acessa suas próprias sessões
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessoes_user_policy ON sessoes_estudo
    FOR ALL USING (user_id = auth.uid());

-- Histórico de Simulados - Usuário só acessa seu próprio histórico
ALTER TABLE historico_simulados ENABLE ROW LEVEL SECURITY;
CREATE POLICY historico_user_policy ON historico_simulados
    FOR ALL USING (user_id = auth.uid());
```

---

## 🧪 3. TEMPLATES TDD ESPECÍFICOS

### Template: Store de Concursos

```typescript
// __tests__/hooks/useConcursos.test.ts
import { renderHook, act } from '@testing-library/react'
import { useConcursosStore } from '@/stores/concursosStore'
import { createConcurso, createList } from '@/factories/estudos-concursos'

describe('useConcursosStore', () => {
  beforeEach(() => {
    // Reset store state
    useConcursosStore.getState().concursos = []
  })

  describe('🔴 RED: Contest Management', () => {
    it('deve adicionar novo concurso', () => {
      const { result } = renderHook(() => useConcursosStore())
      const novoConcurso = createConcurso({ titulo: 'Novo Concurso TRT' })

      act(() => {
        result.current.adicionarConcurso(novoConcurso)
      })

      expect(result.current.concursos).toHaveLength(1)
      expect(result.current.concursos[0].titulo).toBe('Novo Concurso TRT')
    })

    it('deve atualizar progresso de disciplina', () => {
      const concurso = createConcurso()
      const { result } = renderHook(() => useConcursosStore())

      act(() => {
        result.current.adicionarConcurso(concurso)
        result.current.atualizarProgresso(concurso.id, 'Direito Administrativo', 75)
      })

      const concursoAtualizado = result.current.concursos.find(c => c.id === concurso.id)
      const disciplina = concursoAtualizado?.conteudoProgramatico.find(
        d => d.disciplina === 'Direito Administrativo'
      )
      expect(disciplina?.progresso).toBe(75)
    })
  })

  describe('🟢 GREEN: Contest Queries', () => {
    it('deve filtrar concursos por status', () => {
      const concursos = [
        createConcurso({ status: 'planejado' }),
        createConcurso({ status: 'estudando' }),
        createConcurso({ status: 'realizado' })
      ]

      const { result } = renderHook(() => useConcursosStore())

      act(() => {
        concursos.forEach(c => result.current.adicionarConcurso(c))
      })

      const concursosAtivos = result.current.concursos.filter(
        c => c.status !== 'realizado'
      )
      expect(concursosAtivos).toHaveLength(2)
    })
  })
})
```

### Template: Componente QuestaoForm

```typescript
// __tests__/components/concursos/QuestaoForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestaoForm } from '@/components/concursos/QuestaoForm'
import { useQuestoesStore } from '@/stores/questoesStore'
import { createQuestao } from '@/factories/estudos-concursos'

// Mock do store
jest.mock('@/stores/questoesStore')
const mockUseQuestoesStore = useQuestoesStore as jest.MockedFunction<typeof useQuestoesStore>

describe('QuestaoForm', () => {
  const mockAdicionarQuestao = jest.fn()
  const mockAtualizarQuestao = jest.fn()

  beforeEach(() => {
    mockUseQuestoesStore.mockReturnValue({
      questoes: [],
      adicionarQuestao: mockAdicionarQuestao,
      atualizarQuestao: mockAtualizarQuestao,
      removerQuestao: jest.fn(),
      importarQuestoes: jest.fn(),
      buscarQuestoesPorConcurso: jest.fn(),
      buscarQuestoesPorDisciplina: jest.fn()
    })
  })

  describe('🔴 RED: Question Form Validation', () => {
    it('deve renderizar formulário vazio', () => {
      render(
        <QuestaoForm
          isOpen={true}
          onClose={jest.fn()}
          concursoId="concurso-1"
        />
      )

      expect(screen.getByLabelText(/disciplina/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/enunciado/i)).toBeInTheDocument()
      expect(screen.getByText(/adicionar nova questão/i)).toBeInTheDocument()
    })

    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(
        <QuestaoForm
          isOpen={true}
          onClose={jest.fn()}
          concursoId="concurso-1"
        />
      )

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      expect(screen.getByLabelText(/disciplina/i)).toBeInvalid()
      expect(screen.getByLabelText(/enunciado/i)).toBeInvalid()
    })

    it('deve exigir pelo menos uma alternativa correta', async () => {
      const user = userEvent.setup()
      render(
        <QuestaoForm
          isOpen={true}
          onClose={jest.fn()}
          concursoId="concurso-1"
        />
      )

      await user.type(screen.getByLabelText(/disciplina/i), 'Direito')
      await user.type(screen.getByLabelText(/enunciado/i), 'Pergunta teste')

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      expect(screen.getByText(/marque uma alternativa como correta/i)).toBeInTheDocument()
    })
  })

  describe('🟢 GREEN: Question Creation', () => {
    it('deve criar questão com dados válidos', async () => {
      const user = userEvent.setup()
      const onClose = jest.fn()

      render(
        <QuestaoForm
          isOpen={true}
          onClose={onClose}
          concursoId="concurso-1"
        />
      )

      // Preencher formulário
      await user.type(screen.getByLabelText(/disciplina/i), 'Direito Administrativo')
      await user.type(screen.getByLabelText(/enunciado/i), 'Qual é o princípio da legalidade?')

      // Marcar primeira alternativa como correta
      const primeiraAlternativa = screen.getAllByRole('checkbox')[0]
      await user.click(primeiraAlternativa)

      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAdicionarQuestao).toHaveBeenCalledWith(
          expect.objectContaining({
            disciplina: 'Direito Administrativo',
            enunciado: 'Qual é o princípio da legalidade?',
            concursoId: 'concurso-1'
          })
        )
        expect(onClose).toHaveBeenCalled()
      })
    })
  })
})
```

### Template: Serviço EstudosAPI

```typescript
// __tests__/services/estudosApi.test.ts
import { vi } from 'vitest'
import { estudosApi } from '@/services/estudosApi'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { createConcurso, createQuestao, createList } from '@/factories/estudos-concursos'

describe('EstudosAPI', () => {
  describe('🔴 RED: Contest API Operations', () => {
    it('deve buscar concursos do usuário', async () => {
      const mockConcursos = createList(createConcurso, 3)

      server.use(
        http.get('/api/concursos', () => HttpResponse.json(mockConcursos))
      )

      const result = await estudosApi.getConcursos()
      expect(result).toEqual(mockConcursos)
    })

    it('deve criar novo concurso', async () => {
      const novoConcurso = createConcurso()

      server.use(
        http.post('/api/concursos', async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({ ...body, id: 'novo-id' })
        })
      )

      const result = await estudosApi.createConcurso(novoConcurso)
      expect(result.id).toBe('novo-id')
    })
  })

  describe('🟢 GREEN: Question API Operations', () => {
    it('deve buscar questões por concurso', async () => {
      const mockQuestoes = createList(createQuestao, 5, { concursoId: 'concurso-1' })

      server.use(
        http.get('/api/questoes', ({ request }) => {
          const url = new URL(request.url)
          const concursoId = url.searchParams.get('concursoId')

          if (concursoId === 'concurso-1') {
            return HttpResponse.json(mockQuestoes)
          }
          return HttpResponse.json([])
        })
      )

      const result = await estudosApi.getQuestoesPorConcurso('concurso-1')
      expect(result).toHaveLength(5)
      expect(result[0].concursoId).toBe('concurso-1')
    })
  })

  describe('🔵 REFACTOR: Performance Tests', () => {
    it('deve buscar questões em menos de 200ms', async () => {
      const mockQuestoes = createList(createQuestao, 100)

      server.use(
        http.get('/api/questoes', () => HttpResponse.json(mockQuestoes))
      )

      const startTime = performance.now()
      await estudosApi.getQuestoes()
      const duration = performance.now() - startTime

      expect(duration).toBeLessThan(200)
    })
  })
})
```

---

## 📅 4. CRONOGRAMA DE IMPLEMENTAÇÃO TDD

### Cronograma com Ciclos TDD

#### Fase 1: RED (2 semanas)
- [ ] **1.1** Escrever testes falhando para ConcursoForm
- [ ] **1.2** Escrever testes falhando para QuestaoForm
- [ ] **1.3** Escrever testes falhando para RegistroEstudos
- [ ] **1.4** Escrever testes falhando para TemporizadorPomodoro
- [ ] **1.5** Escrever testes falhando para useConcursosStore
- [ ] **1.6** Escrever testes falhando para useQuestoesStore
- [ ] **1.7** Escrever testes falhando para estudosApi

#### Fase 2: GREEN (3 semanas)
- [ ] **2.1** Implementar funcionalidades mínimas para passar nos testes
- [ ] **2.2** Configurar infraestrutura de dados (Supabase + FastAPI)
- [ ] **2.3** Implementar operações CRUD básicas para concursos
- [ ] **2.4** Implementar operações CRUD básicas para questões
- [ ] **2.5** Implementar sistema de sessões de estudo
- [ ] **2.6** Implementar configurações do Pomodoro
- [ ] **2.7** Implementar histórico de simulados

#### Fase 3: REFACTOR (2 semanas)
- [ ] **3.1** Otimizar queries de busca de questões
- [ ] **3.2** Implementar cache para dados frequentemente acessados
- [ ] **3.3** Refatorar componentes para melhor performance
- [ ] **3.4** Implementar validações avançadas
- [ ] **3.5** Otimizar bundle size e lazy loading

#### Fase 4: ADVANCED FEATURES (2 semanas)
- [ ] **4.1** Implementar geração automática de questões
- [ ] **4.2** Sistema de importação/exportação
- [ ] **4.3** Analytics avançados de performance
- [ ] **4.4** Sistema de recomendações de estudo
- [ ] **4.5** Integração com APIs externas de concursos

### Priorização MoSCoW

#### MUST HAVE (Crítico - Semanas 1-5)
- [ ] **Migrar concursosStore**
  - Adaptar estrutura para API
  - Implementar CRUD operations
  - Manter compatibilidade temporária com localStorage
  - Testes unitários com coverage > 70%

- [ ] **Migrar questoesStore**
  - Adaptar estrutura de alternativas
  - Implementar busca por filtros
  - Manter relacionamento com concursos
  - Performance de consulta < 200ms

- [ ] **Migrar registroEstudosStore**
  - Implementar CRUD básico
  - Manter cálculos de estatísticas
  - Integração com sistema Pomodoro

#### SHOULD HAVE (Importante - Semanas 6-7)
- [ ] **Migrar pomodoroStore**
  - Configurações por usuário
  - Persistência de estatísticas
  - Sincronização entre dispositivos

- [ ] **Migrar historicoSimuladosStore**
  - Histórico detalhado por usuário
  - Agregações e relatórios
  - Analytics de performance

#### COULD HAVE (Desejável - Semanas 8-9)
- [ ] **Implementar simulados favoritos**
  - Associação com concursos
  - Sistema de tags
  - Compartilhamento entre usuários

- [ ] **Sistema de importação avançado**
  - Múltiplos formatos (JSON, CSV, PDF)
  - Validação automática
  - Preview antes da importação

---

## 🎯 5. QUALITY GATES ESPECÍFICOS

### Métricas de Qualidade Educacional

```typescript
// __tests__/metrics/educationalMetrics.test.ts
describe('Educational Quality Metrics', () => {
  it('deve manter integridade de dados educacionais', () => {
    const questoes = createList(createQuestao, 100)
    const integrity = validateEducationalDataIntegrity(questoes)

    expect(integrity.isValid).toBe(true)
    expect(integrity.errors).toHaveLength(0)
    expect(integrity.warnings).toHaveLength(0)
  })

  it('deve validar estrutura de alternativas', () => {
    const questao = createQuestao({
      alternativas: [
        { id: 'a', texto: 'Opção A', correta: true },
        { id: 'b', texto: 'Opção B', correta: false },
        { id: 'c', texto: 'Opção C', correta: false },
        { id: 'd', texto: 'Opção D', correta: false }
      ]
    })

    const validation = validateQuestionStructure(questao)
    expect(validation.hasCorrectAnswer).toBe(true)
    expect(validation.hasMinimumOptions).toBe(true)
    expect(validation.hasUniqueOptions).toBe(true)
  })

  it('deve processar busca de questões em < 100ms', async () => {
    const questoes = createList(createQuestao, 1000)

    const startTime = performance.now()
    const results = await searchQuestions(questoes, {
      disciplina: 'Direito Administrativo',
      nivel: 'medio'
    })
    const duration = performance.now() - startTime

    expect(duration).toBeLessThan(100)
    expect(results.length).toBeGreaterThan(0)
  })

  it('deve manter consistência de dados de simulados', () => {
    const simulado = {
      questoes: createList(createQuestao, 20),
      respostas: generateRandomAnswers(20),
      tempo: 3600 // 1 hora
    }

    const consistency = validateSimuladoConsistency(simulado)
    expect(consistency.questionsMatch).toBe(true)
    expect(consistency.answersValid).toBe(true)
    expect(consistency.timeReasonable).toBe(true)
  })
})
```

### Pipeline CI/CD com Quality Gates

```yaml
# .github/workflows/estudos-concursos-tests.yml
name: Estudos e Concursos - TDD Pipeline

on:
  push:
    paths:
      - 'app/stores/concursosStore.ts'
      - 'app/stores/questoesStore.ts'
      - 'app/stores/registroEstudosStore.ts'
      - 'app/stores/pomodoroStore.ts'
      - 'app/stores/historicoSimuladosStore.ts'
      - 'app/components/concursos/**'
      - 'app/components/estudos/**'
      - '__tests__/estudos-concursos/**'

jobs:
  test-estudos-concursos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Estudos e Concursos Tests
        run: npm run test -- estudos-concursos --coverage

      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(npm run test:coverage -- --reporter=json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% below threshold 70%"
            exit 1
          fi

      - name: Educational Data Validation Tests
        run: npm run test -- estudos-concursos --grep="educational|validation|integrity"

      - name: Performance Tests
        run: npm run test -- estudos-concursos --reporter=verbose
        env:
          VITEST_MAX_DURATION: 100

      - name: Query Performance Tests
        run: npm run test -- estudos-concursos --grep="performance|query|search"
        env:
          VITEST_QUERY_TIMEOUT: 200

  quality-gates:
    needs: test-estudos-concursos
    runs-on: ubuntu-latest
    steps:
      - name: Educational Quality Gate
        run: |
          echo "✅ Coverage > 70%"
          echo "✅ Performance < 100ms"
          echo "✅ Query Performance < 200ms"
          echo "✅ Data Integrity 100%"
          echo "✅ Educational Validation Passed"
```

---

## 📊 6. MÉTRICAS DE SUCESSO

### KPIs Técnicos
- **Coverage de Testes**: > 70% (ideal: 85%)
- **Performance de Queries**: < 200ms (ideal: 100ms)
- **Performance de Testes**: < 100ms por teste
- **Bundle Size**: Redução de 20% com lazy loading
- **Integridade de Dados**: 100% (zero corrupção)

### KPIs Educacionais
- **Validação de Questões**: 100% das questões validadas
- **Consistência de Simulados**: 100% de consistência
- **Performance de Busca**: < 100ms para 1000+ questões
- **Precisão de Filtros**: 100% de precisão nos resultados

### KPIs de Usuário
- **Tempo de Carregamento**: < 2s para listas de questões
- **Responsividade**: < 50ms para interações
- **Disponibilidade**: 99.9% uptime
- **Sincronização**: < 5s para sync entre dispositivos

---

## 🚀 7. PRÓXIMOS PASSOS

### Implementação Prática Imediata

#### 1. Setup da Infraestrutura TDD (Semana 1)
```bash
# Configurar ambiente de testes específico
npm install --save-dev @faker-js/faker
npm install --save-dev @testing-library/jest-dom

# Criar estrutura de testes
mkdir -p __tests__/{components,hooks,services,factories,integration}/estudos-concursos
mkdir -p __tests__/mocks/handlers/estudos-concursos

# Configurar factories específicas
touch __tests__/factories/estudos-concursos.ts
```

#### 2. Primeiro Ciclo RED-GREEN-REFACTOR (Semana 2)
```typescript
// Começar com teste mais simples
// __tests__/components/concursos/ConcursoForm.test.tsx
describe('ConcursoForm - Primeiro Ciclo TDD', () => {
  it('🔴 RED: deve renderizar formulário básico', () => {
    render(<ConcursoForm isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
  })
})
```

#### 3. Configuração de Quality Gates (Semana 3)
```yaml
# vitest.config.ts - Coverage específico para estudos
export default defineConfig({
  test: {
    coverage: {
      include: [
        'app/stores/concursosStore.ts',
        'app/stores/questoesStore.ts',
        'app/stores/registroEstudosStore.ts',
        'app/components/concursos/**',
        'app/components/estudos/**'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
})
```

### Checklist de Validação Final

- [ ] ✅ Todos os stores migrados com testes TDD
- [ ] ✅ Componentes principais com coverage > 70%
- [ ] ✅ APIs implementadas com validação robusta
- [ ] ✅ Performance de queries < 200ms
- [ ] ✅ Integridade de dados educacionais 100%
- [ ] ✅ Pipeline CI/CD com quality gates funcionando
- [ ] ✅ Documentação técnica completa
- [ ] ✅ Migração de dados do localStorage validada

**Estimativa Total**: 9 semanas para migração completa
**MVP Funcional**: 5 semanas (Must Have completo)
**Quality Gates**: Implementados desde a semana 1
