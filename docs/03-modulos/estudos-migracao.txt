# 📋 Plano de Migração - Módulos Estudos e Concursos
**Migração do localStorage para Arquitetura Dual Backend**

**Produção**: Supabase (PostgreSQL + RLS)  
**Desenvolvimento**: FastAPI + SQLAlchemy + PostgreSQL Local

---

## 🔍 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE

### 1.1 Inventário de Chaves e Dados Armazenados

| Chave localStorage | Store Responsável | Estrutura de Dados | Tamanho Estimado | Componentes Dependentes |
|---|---|---|---|---|
| `concursos-storage` | `concursosStore.ts` | Array de objetos Concurso | ~50KB | `ConcursosPage`, `DetalhesConcursoPage`, `EstudosPage` |
| `questoes-store` | `questoesStore.ts` | Array de objetos Questao | ~100KB | `QuestaoList`, `QuestaoForm`, `SimuladoPersonalizado` |
| `registro-estudos-storage` | `registroEstudosStore.ts` | Array de objetos SessaoEstudo | ~20KB | `RegistroEstudos` |
| `historico-simulados-storage` | `historicoSimuladosStore.ts` | Objeto com histórico de tentativas | ~30KB | `HistoricoModal`, `SimuladoResults` |
| `pomodoro-storage` | `pomodoroStore.ts` | Configurações e estatísticas | ~5KB | `TemporizadorPomodoro` |
| `simulado_personalizado_questoes` | Armazenamento temporário | Array de questões selecionadas | ~50KB | `SimuladoPersonalizadoPage` |
| `simulados_favoritos_{concursoId}` | Por concurso específico | Array de simulados salvos | ~10KB | `DetalhesConcursoPage` |

### 1.2 Estruturas de Dados Detalhadas

#### Concurso
```typescript
interface Concurso {
  id: string;
  titulo: string;
  organizadora: string;
  dataInscricao: string;
  dataProva: string;
  edital?: string;
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudoProgramatico: ConteudoProgramatico[];
}

interface ConteudoProgramatico {
  disciplina: string;
  topicos: string[];
  progresso: number;
}
```

#### Questão
```typescript
interface Questao {
  id: string;
  concursoId?: string;
  disciplina: string;
  topico: string;
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorreta: string;
  justificativa?: string;
  nivelDificuldade?: 'facil' | 'medio' | 'dificil';
  ano?: number;
  banca?: string;
  tags?: string[];
}

interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}
```

#### Sessão de Estudo
```typescript
interface SessaoEstudo {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number; // em minutos
  data: string;
  completo: boolean;
}
```

---

## 🗄️ 2. ESQUEMA DE BANCO DE DADOS UNIFICADO

### 2.1 Tabelas Principais

```sql
-- Tabela de usuários (já existente no Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concursos
CREATE TABLE concursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(500) NOT NULL,
    organizadora VARCHAR(255) NOT NULL,
    data_inscricao DATE NOT NULL,
    data_prova DATE NOT NULL,
    edital TEXT,
    status VARCHAR(50) DEFAULT 'planejado' CHECK (status IN ('planejado', 'inscrito', 'estudando', 'realizado', 'aguardando_resultado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conteúdo programático dos concursos
CREATE TABLE conteudo_programatico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
    disciplina VARCHAR(255) NOT NULL,
    topicos TEXT[] DEFAULT '{}',
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questões
CREATE TABLE questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concurso_id UUID REFERENCES concursos(id) ON DELETE SET NULL,
    disciplina VARCHAR(255) NOT NULL,
    topico VARCHAR(255),
    enunciado TEXT NOT NULL,
    resposta_correta UUID,
    justificativa TEXT,
    nivel_dificuldade VARCHAR(20) CHECK (nivel_dificuldade IN ('facil', 'medio', 'dificil')),
    ano INTEGER,
    banca VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternativas das questões
CREATE TABLE alternativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    ordem INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessões de estudo
CREATE TABLE sessoes_estudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    duracao INTEGER NOT NULL, -- em minutos
    data DATE NOT NULL,
    completo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações do Pomodoro
CREATE TABLE configuracoes_pomodoro (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tempo_foco INTEGER DEFAULT 25,
    tempo_pausa INTEGER DEFAULT 5,
    tempo_longa_pausa INTEGER DEFAULT 15,
    ciclos_antes_longa_pausa INTEGER DEFAULT 4,
    ciclos_completos INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de simulados
CREATE TABLE historico_simulados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo_simulado VARCHAR(500) NOT NULL,
    total_questoes INTEGER NOT NULL,
    acertos INTEGER NOT NULL,
    percentual DECIMAL(5,2) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Simulados favoritos
CREATE TABLE simulados_favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concurso_id UUID REFERENCES concursos(id) ON DELETE CASCADE,
    nome VARCHAR(500) NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Índices para Performance

```sql
-- Índices para concursos
CREATE INDEX idx_concursos_user_id ON concursos(user_id);
CREATE INDEX idx_concursos_status ON concursos(status);
CREATE INDEX idx_concursos_data_prova ON concursos(data_prova);

-- Índices para questões
CREATE INDEX idx_questoes_user_id ON questoes(user_id);
CREATE INDEX idx_questoes_concurso_id ON questoes(concurso_id);
CREATE INDEX idx_questoes_disciplina ON questoes(disciplina);
CREATE INDEX idx_questoes_nivel_dificuldade ON questoes(nivel_dificuldade);

-- Índices para sessões de estudo
CREATE INDEX idx_sessoes_estudo_user_id ON sessoes_estudo(user_id);
CREATE INDEX idx_sessoes_estudo_data ON sessoes_estudo(data);

-- Índices para histórico de simulados
CREATE INDEX idx_historico_simulados_user_id ON historico_simulados(user_id);
CREATE INDEX idx_historico_simulados_timestamp ON historico_simulados(timestamp);
```

### 2.3 Row Level Security (RLS) para Supabase

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteudo_programatico ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alternativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_pomodoro ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados_favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para concursos
CREATE POLICY "Users can view their own concursos" ON concursos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own concursos" ON concursos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own concursos" ON concursos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own concursos" ON concursos FOR DELETE USING (auth.uid() = user_id);

-- Políticas similares para outras tabelas...
-- (Repetir padrão para cada tabela com user_id)
```

---

## 🔌 3. CONTRATO DE API

### 3.1 Autenticação

#### POST /auth/login
**Payload da Requisição:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Payload da Resposta:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### 3.2 Endpoints de Concursos

#### GET /api/concursos
**Headers:** `Authorization: Bearer {token}`

**Payload da Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Analista Administrativo - TRT",
      "organizadora": "CESPE",
      "data_inscricao": "2024-07-01",
      "data_prova": "2024-09-15",
      "edital": "https://...",
      "status": "estudando",
      "conteudo_programatico": [
        {
          "id": "uuid",
          "disciplina": "Direito Administrativo",
          "topicos": ["Atos Administrativos", "Licitações"],
          "progresso": 75
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/concursos
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:**
```json
{
  "titulo": "Concurso Example",
  "organizadora": "Banca X",
  "data_inscricao": "2024-07-01",
  "data_prova": "2024-09-15",
  "edital": "https://...",
  "status": "planejado",
  "conteudo_programatico": [
    {
      "disciplina": "Matemática",
      "topicos": ["Álgebra", "Geometria"],
      "progresso": 0
    }
  ]
}
```

#### PUT /api/concursos/{id}
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:** (mesma estrutura do POST)

#### DELETE /api/concursos/{id}
**Headers:** `Authorization: Bearer {token}`

**Códigos de Status:**
- 204: Sucesso (sem conteúdo)
- 404: Concurso não encontrado
- 403: Sem permissão

#### PATCH /api/concursos/{id}/progresso
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:**
```json
{
  "disciplina": "Matemática",
  "progresso": 85
}
```

### 3.3 Endpoints de Questões

#### GET /api/questoes
**Headers:** `Authorization: Bearer {token}`
**Query Parameters:**
- `concurso_id` (optional): Filtrar por concurso
- `disciplina` (optional): Filtrar por disciplina
- `nivel_dificuldade` (optional): Filtrar por dificuldade

**Payload da Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "concurso_id": "uuid",
      "disciplina": "Matemática",
      "topico": "Álgebra",
      "enunciado": "Qual é o valor de x?",
      "alternativas": [
        {
          "id": "uuid",
          "texto": "x = 5",
          "correta": true,
          "ordem": 1
        }
      ],
      "resposta_correta": "uuid",
      "justificativa": "Explicação...",
      "nivel_dificuldade": "medio",
      "ano": 2023,
      "banca": "CESPE",
      "tags": ["equações", "álgebra"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/questoes
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:**
```json
{
  "concurso_id": "uuid",
  "disciplina": "Matemática",
  "topico": "Álgebra",
  "enunciado": "Qual é o valor de x?",
  "alternativas": [
    {
      "texto": "x = 5",
      "correta": true,
      "ordem": 1
    },
    {
      "texto": "x = 3",
      "correta": false,
      "ordem": 2
    }
  ],
  "justificativa": "Explicação...",
  "nivel_dificuldade": "medio",
  "ano": 2023,
  "banca": "CESPE",
  "tags": ["equações"]
}
```

### 3.4 Endpoints de Sessões de Estudo

#### GET /api/sessoes-estudo
**Headers:** `Authorization: Bearer {token}`
**Query Parameters:**
- `data_inicio` (optional): Filtrar por data de início
- `data_fim` (optional): Filtrar por data de fim

#### POST /api/sessoes-estudo
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:**
```json
{
  "titulo": "Matemática - Álgebra Linear",
  "descricao": "Revisão de matrizes",
  "duracao": 45,
  "data": "2024-03-03",
  "completo": false
}
```

#### PATCH /api/sessoes-estudo/{id}/toggle-completo
**Headers:** `Authorization: Bearer {token}`

### 3.5 Endpoints de Configurações Pomodoro

#### GET /api/pomodoro/configuracoes
**Headers:** `Authorization: Bearer {token}`

**Payload da Resposta:**
```json
{
  "tempo_foco": 25,
  "tempo_pausa": 5,
  "tempo_longa_pausa": 15,
  "ciclos_antes_longa_pausa": 4,
  "ciclos_completos": 12
}
```

#### PUT /api/pomodoro/configuracoes
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:**
```json
{
  "tempo_foco": 30,
  "tempo_pausa": 5,
  "tempo_longa_pausa": 20,
  "ciclos_antes_longa_pausa": 4
}
```

#### POST /api/pomodoro/incrementar-ciclo
**Headers:** `Authorization: Bearer {token}`

### 3.6 Endpoints de Histórico de Simulados

#### GET /api/historico-simulados
**Headers:** `Authorization: Bearer {token}`

#### POST /api/historico-simulados
**Headers:** `Authorization: Bearer {token}`

**Payload da Requisição:**
```json
{
  "titulo_simulado": "Simulado de Matemática",
  "total_questoes": 20,
  "acertos": 15,
  "percentual": 75.0
}
```

### 3.7 Códigos de Status de Erro Padrão

- **400**: Bad Request - Dados inválidos
- **401**: Unauthorized - Token inválido ou expirado
- **403**: Forbidden - Sem permissão para o recurso
- **404**: Not Found - Recurso não encontrado
- **422**: Unprocessable Entity - Erro de validação
- **500**: Internal Server Error - Erro interno do servidor

---

## 🚀 4. PLANO DE MIGRAÇÃO DUAL-TRACK (MÉTODO MOSCOW)

### 4.1 MUST HAVE (Essencial - Prioridade 1)

#### Fase 1: Infraestrutura Base (Semana 1-2)
- [ ] **Configurar Supabase em produção**
  - Criar projeto Supabase
  - Configurar autenticação
  - Executar migrations do schema base
  - Configurar RLS policies

- [ ] **Configurar ambiente FastAPI local**
  - Setup Docker Compose com PostgreSQL
  - Configurar SQLAlchemy models
  - Implementar autenticação JWT
  - Setup Alembic para migrations

- [ ] **Criar abstração de data service**
  - Interface abstrata para operações CRUD
  - Implementação Supabase SDK
  - Implementação HTTP client para FastAPI
  - Context provider para escolher implementação

#### Fase 2: Migração dos Stores Principais (Semana 3-4)
- [ ] **Migrar concursosStore**
  - Adaptar estrutura para API
  - Implementar CRUD operations
  - Manter compatibilidade temporária com localStorage
  - Testes unitários

- [ ] **Migrar questoesStore**
  - Adaptar estrutura de alternativas
  - Implementar busca por filtros
  - Manter relacionamento com concursos
  - Testes unitários

- [ ] **Migrar registroEstudosStore**
  - Implementar CRUD básico
  - Manter cálculos de estatísticas
  - Testes unitários

### 4.2 SHOULD HAVE (Importante - Prioridade 2)

#### Fase 3: Stores Avançados (Semana 5-6)
- [ ] **Migrar pomodoroStore**
  - Configurações por usuário
  - Persistência de estatísticas
  - Testes unitários

- [ ] **Migrar historicoSimuladosStore**
  - Histórico detalhado por usuário
  - Agregações e relatórios
  - Testes unitários

- [ ] **Implementar simulados favoritos**
  - Associação com concursos
  - CRUD operations
  - Testes unitários

#### Fase 4: Otimizações (Semana 7-8)
- [ ] **Cache e Performance**
  - Implementar cache no client
  - Otimizar queries SQL
  - Implementar paginação

- [ ] **Sync e Offline**
  - Estratégia de sincronização
  - Resolução de conflitos
  - Fallback para localStorage

### 4.3 COULD HAVE (Desejável - Prioridade 3)

#### Fase 5: Features Avançadas (Semana 9-10)
- [ ] **Importação de dados**
  - Migração automática do localStorage
  - Validação e limpeza de dados
  - Rollback em caso de erro

- [ ] **Analytics e Relatórios**
  - Dashboard de progresso
  - Estatísticas avançadas
  - Exportação de dados

- [ ] **Colaboração**
  - Compartilhamento de questões
  - Grupos de estudo
  - Rankings

### 4.4 WON'T HAVE (Não será implementado inicialmente)

- Integração com APIs externas de concursos
- Gamificação avançada
- Notificações push
- Integração com calendário
- IA para geração de questões

---

## 📋 5. CHECKLIST DE MIGRAÇÃO FRONTEND

### 5.1 Preparação do Ambiente
- [ ] Instalar dependências para Supabase (`@supabase/supabase-js`)
- [ ] Configurar variáveis de ambiente
- [ ] Criar types TypeScript atualizados
- [ ] Setup do cliente HTTP (axios/fetch)

### 5.2 Abstração de Data Layer
- [ ] Criar interface `IDataService`
- [ ] Implementar `SupabaseDataService`
- [ ] Implementar `FastAPIDataService`
- [ ] Criar `DataServiceProvider` context
- [ ] Implementar hook `useDataService`

### 5.3 Migração por Store

#### ConcursosStore
- [ ] Refatorar actions para usar API
- [ ] Implementar loading states
- [ ] Implementar error handling
- [ ] Manter interface pública inalterada
- [ ] Testes de integração

#### QuestoesStore
- [ ] Adaptar estrutura de alternativas
- [ ] Implementar busca otimizada
- [ ] Implementar cache local
- [ ] Testes de integração

#### RegistroEstudosStore
- [ ] Migrar CRUD operations
- [ ] Manter cálculos locais
- [ ] Implementar sync
- [ ] Testes de integração

#### PomodoroStore
- [ ] Separar configurações de estado local
- [ ] Sync apenas configurações
- [ ] Manter timer local
- [ ] Testes de integração

#### HistoricoSimuladosStore
- [ ] Implementar agregações server-side
- [ ] Otimizar queries de histórico
- [ ] Implementar cache
- [ ] Testes de integração

### 5.4 Componentes UI
- [ ] Implementar loading states
- [ ] Implementar error boundaries
- [ ] Adicionar feedback visual
- [ ] Implementar retry mechanisms
- [ ] Testes E2E

### 5.5 Validação e Testes
- [ ] Testes unitários para services
- [ ] Testes de integração com API
- [ ] Testes E2E dos fluxos principais
- [ ] Performance testing
- [ ] Testes de compatibilidade

### 5.6 Deploy e Monitoramento
- [ ] Configurar CI/CD pipeline
- [ ] Setup monitoring (errors, performance)
- [ ] Configurar backup automático
- [ ] Documentação de deploy
- [ ] Rollback strategy

---

## 🔧 6. CONSIDERAÇÕES TÉCNICAS

### 6.1 Estratégia de Migração Gradual
1. **Dual Write**: Escrever tanto no localStorage quanto na API durante transição
2. **Feature Flags**: Controlar migração por funcionalidade
3. **Fallback**: Sempre manter localStorage como backup durante migração
4. **Validation**: Comparar dados entre localStorage e API

### 6.2 Tratamento de Dados Existentes
- Script de migração automática do localStorage para API
- Validação de integridade dos dados migrados
- Backup completo antes da migração
- Estratégia de rollback

### 6.3 Performance e UX
- Loading states otimizados
- Cache inteligente (React Query ou SWR)
- Optimistic updates onde apropriado
- Error boundaries para isolamento de falhas

### 6.4 Segurança
- Validação client-side e server-side
- Rate limiting nas APIs
- Sanitização de dados
- Logs de auditoria

---

## 📊 7. CRONOGRAMA RESUMIDO

| Semana | Fase | Entregáveis |
|--------|------|-------------|
| 1-2 | Infraestrutura | Supabase + FastAPI configurados |
| 3-4 | Stores Core | concursos, questoes, sessoes migrados |
| 5-6 | Stores Avançados | pomodoro, historico, favoritos |
| 7-8 | Otimizações | Cache, performance, sync |
| 9-10 | Features Extra | Analytics, importação, relatórios |

**Estimativa Total**: 10 semanas para migração completa  
**MVP Funcional**: 4 semanas (Must Have completo)

---

## 🎯 8. MÉTRICAS DE SUCESSO

- **Performance**: API response time < 300ms (95th percentile)
- **Confiabilidade**: 99.9% uptime
- **UX**: Loading states implementados em 100% das operações
- **Data Integrity**: 0 perda de dados durante migração
- **Test Coverage**: > 90% nos stores migrados
- **User Satisfaction**: Manter funcionalidade existente sem regressões