# 🎯 Plano de Migração - Módulo Hiperfocos
## StayFocus: Do localStorage para Arquitetura Dual (Supabase + FastAPI)

---

## 📋 1. RELATÓRIO DE AUDITORIA DO LOCALSTORAGE

### 🔍 Inventário de Dados Armazenados

**Chave localStorage:** `hiperfocos-storage`

#### 1.1 Estruturas de Dados Identificadas

##### **Hiperfoco**
```typescript
{
  id: string              // Gerado por Date.now().toString()
  titulo: string          // Nome do hiperfoco
  descricao: string       // Descrição opcional
  tarefas: Tarefa[]       // Array de tarefas principais
  subTarefas: Record<string, Tarefa[]>  // Map: tarefaId -> subtarefas
  cor: string             // Cor hexadecimal (#FF5252, etc.)
  dataCriacao: string     // ISO 8601 timestamp
  tempoLimite?: number    // Minutos (opcional)
}
```

##### **Tarefa**
```typescript
{
  id: string              // Gerado por Date.now().toString()
  texto: string           // Conteúdo da tarefa
  concluida: boolean      // Status de conclusão
  cor?: string            // Cor opcional (herdada)
}
```

##### **SessaoAlternancia**
```typescript
{
  id: string              // Gerado por Date.now().toString()
  titulo: string          // Nome da sessão
  hiperfocoAtual: string | null     // ID do hiperfoco ativo
  hiperfocoAnterior: string | null  // ID do hiperfoco anterior
  tempoInicio: string     // ISO 8601 timestamp
  duracaoEstimada: number // Minutos
  concluida: boolean      // Status da sessão
}
```

#### 1.2 Componentes Dependentes

1. **`/app/hiperfocos/page.tsx`** - Página principal com tabs
2. **`ConversorInteresses.tsx`** - Criação de hiperfocos
3. **`VisualizadorProjetos.tsx`** - Visualização hierárquica 
4. **`SistemaAlternancia.tsx`** - Gerenciamento de sessões
5. **`TemporizadorFoco.tsx`** - Temporizador baseado em hiperfocos
6. **`useHiperfocosStore.ts`** - Store Zustand com persistência

#### 1.3 Operações CRUD Identificadas

- **Create:** Hiperfoco, Tarefa, SubTarefa, Sessão
- **Read:** Listagens, visualizações, filtros
- **Update:** Edição de textos, toggle conclusão, alternância
- **Delete:** Remoção de todos os tipos

---

## 🗄️ 2. ESQUEMA DE BANCO DE DADOS UNIFICADO

### 2.1 Estrutura SQL (PostgreSQL)

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (base para multi-tenant)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de hiperfocos
CREATE TABLE hiperfocos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) NOT NULL,  -- Hexadecimal: #FFFFFF
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tempo_limite INTEGER,  -- Minutos (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas principais
CREATE TABLE tarefas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hiperfoco_id UUID NOT NULL REFERENCES hiperfocos(id) ON DELETE CASCADE,
    tarefa_pai_id UUID REFERENCES tarefas(id) ON DELETE CASCADE,  -- Para subtarefas
    texto TEXT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,  -- Para ordenação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de alternância
CREATE TABLE sessoes_alternancia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    hiperfoco_atual_id UUID REFERENCES hiperfocos(id) ON DELETE SET NULL,
    hiperfoco_anterior_id UUID REFERENCES hiperfocos(id) ON DELETE SET NULL,
    tempo_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duracao_estimada INTEGER NOT NULL,  -- Minutos
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registro de timing (para analytics futuras)
CREATE TABLE registros_timing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hiperfoco_id UUID NOT NULL REFERENCES hiperfocos(id) ON DELETE CASCADE,
    sessao_id UUID REFERENCES sessoes_alternancia(id) ON DELETE SET NULL,
    tempo_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    tempo_fim TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,  -- Calculado
    tipo_sessao VARCHAR(50) DEFAULT 'foco',  -- 'foco', 'pausa', 'alternancia'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Índices para Performance

```sql
-- Índices principais para queries frequentes
CREATE INDEX idx_hiperfocos_user_id ON hiperfocos(user_id);
CREATE INDEX idx_hiperfocos_data_criacao ON hiperfocos(data_criacao DESC);

CREATE INDEX idx_tarefas_hiperfoco_id ON tarefas(hiperfoco_id);
CREATE INDEX idx_tarefas_pai_id ON tarefas(tarefa_pai_id);
CREATE INDEX idx_tarefas_concluida ON tarefas(concluida);

CREATE INDEX idx_sessoes_user_id ON sessoes_alternancia(user_id);
CREATE INDEX idx_sessoes_concluida ON sessoes_alternancia(concluida);
CREATE INDEX idx_sessoes_tempo_inicio ON sessoes_alternancia(tempo_inicio DESC);

CREATE INDEX idx_registros_user_id ON registros_timing(user_id);
CREATE INDEX idx_registros_hiperfoco_id ON registros_timing(hiperfoco_id);
CREATE INDEX idx_registros_tempo_inicio ON registros_timing(tempo_inicio DESC);
```

### 2.3 Views para Consultas Otimizadas

```sql
-- View para hiperfocos com estatísticas de tarefas
CREATE VIEW hiperfocos_stats AS
SELECT 
    h.*,
    COALESCE(t.total_tarefas, 0) as total_tarefas,
    COALESCE(t.tarefas_concluidas, 0) as tarefas_concluidas,
    CASE 
        WHEN COALESCE(t.total_tarefas, 0) = 0 THEN 0
        ELSE ROUND((t.tarefas_concluidas::DECIMAL / t.total_tarefas) * 100, 2)
    END as percentual_conclusao
FROM hiperfocos h
LEFT JOIN (
    SELECT 
        hiperfoco_id,
        COUNT(*) as total_tarefas,
        COUNT(*) FILTER (WHERE concluida = true) as tarefas_concluidas
    FROM tarefas 
    WHERE tarefa_pai_id IS NULL  -- Apenas tarefas principais
    GROUP BY hiperfoco_id
) t ON h.id = t.hiperfoco_id;
```

---

## 🔗 3. CONTRATO DE API (OpenAPI/Swagger Simplificado)

### 3.1 Autenticação

#### `POST /auth/login`
**Descrição:** Autenticação de usuário

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome Usuario"
  }
}
```

**Status:** `200 OK`, `401 Unauthorized`, `422 Validation Error`

---

### 3.2 Endpoints de Hiperfocos

#### `GET /hiperfocos`
**Descrição:** Listar hiperfocos do usuário autenticado

**Query Params:**
- `limit`: number (default: 50)
- `offset`: number (default: 0)
- `include_stats`: boolean (default: false)

**Response 200:**
```json
{
  "hiperfocos": [
    {
      "id": "uuid",
      "titulo": "Aprender React",
      "descricao": "Projeto de estudo focado em React e NextJS",
      "cor": "#2196F3",
      "data_criacao": "2024-01-15T10:30:00Z",
      "tempo_limite": 120,
      "total_tarefas": 5,
      "tarefas_concluidas": 2,
      "percentual_conclusao": 40.0
    }
  ],
  "total": 1,
  "has_more": false
}
```

#### `POST /hiperfocos`
**Descrição:** Criar novo hiperfoco

**Request:**
```json
{
  "titulo": "Novo Hiperfoco",
  "descricao": "Descrição opcional",
  "cor": "#FF5252",
  "tempo_limite": 90
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "titulo": "Novo Hiperfoco",
  "descricao": "Descrição opcional",
  "cor": "#FF5252",
  "data_criacao": "2024-01-15T10:30:00Z",
  "tempo_limite": 90
}
```

**Status:** `201 Created`, `400 Bad Request`, `422 Validation Error`

#### `PUT /hiperfocos/{id}`
**Descrição:** Atualizar hiperfoco existente

#### `DELETE /hiperfocos/{id}`
**Descrição:** Remover hiperfoco e todas as tarefas relacionadas

---

### 3.3 Endpoints de Tarefas

#### `GET /hiperfocos/{hiperfoco_id}/tarefas`
**Descrição:** Listar tarefas de um hiperfoco (incluindo subtarefas)

**Response 200:**
```json
{
  "tarefas": [
    {
      "id": "uuid",
      "texto": "Estudar hooks",
      "concluida": false,
      "ordem": 1,
      "subtarefas": [
        {
          "id": "uuid",
          "texto": "useState e useEffect",
          "concluida": true,
          "ordem": 1
        }
      ]
    }
  ]
}
```

#### `POST /hiperfocos/{hiperfoco_id}/tarefas`
**Descrição:** Criar nova tarefa

**Request:**
```json
{
  "texto": "Nova tarefa",
  "tarefa_pai_id": null,  // null para tarefa principal
  "ordem": 1
}
```

#### `PATCH /tarefas/{id}/toggle`
**Descrição:** Alternar status de conclusão da tarefa

**Response 200:**
```json
{
  "id": "uuid",
  "concluida": true
}
```

---

### 3.4 Endpoints de Sessões de Alternância

#### `GET /sessoes-alternancia`
**Descrição:** Listar sessões do usuário

**Query Params:**
- `ativa`: boolean (filtrar apenas ativas)
- `limit`: number
- `offset`: number

#### `POST /sessoes-alternancia`
**Descrição:** Criar nova sessão de alternância

**Request:**
```json
{
  "titulo": "Sessão de Estudo",
  "hiperfoco_atual_id": "uuid",
  "duracao_estimada": 60
}
```

#### `POST /sessoes-alternancia/{id}/alternar`
**Descrição:** Alternar para outro hiperfoco na sessão

**Request:**
```json
{
  "novo_hiperfoco_id": "uuid"
}
```

#### `POST /sessoes-alternancia/{id}/concluir`
**Descrição:** Marcar sessão como concluída

---

### 3.5 Endpoints de Timing/Analytics

#### `POST /registros-timing`
**Descrição:** Registrar tempo de foco

**Request:**
```json
{
  "hiperfoco_id": "uuid",
  "sessao_id": "uuid",
  "tempo_inicio": "2024-01-15T10:30:00Z",
  "tempo_fim": "2024-01-15T11:00:00Z",
  "tipo_sessao": "foco"
}
```

#### `GET /analytics/dashboard`
**Descrição:** Obter estatísticas do dashboard

**Response 200:**
```json
{
  "tempo_total_hoje": 180,
  "hiperfocos_ativos": 3,
  "sessoes_concluidas": 2,
  "percentual_conclusao_medio": 67.5
}
```

---

## 🚀 4. PLANO DE MIGRAÇÃO DUAL-TRACK

### 4.1 Análise MosCoW

#### **MUST HAVE (Essencial)**
- ✅ Migração de hiperfocos básicos (CRUD)
- ✅ Migração de tarefas e subtarefas
- ✅ Sistema de autenticação
- ✅ Sincronização offline-first
- ✅ Migração de dados existentes do localStorage

#### **SHOULD HAVE (Importante)**
- ✅ Sessões de alternância
- ✅ Sistema de timing/temporizador
- ✅ Analytics básicas
- ✅ Backup automático

#### **COULD HAVE (Desejável)**
- ⭐ Colaboração em hiperfocos
- ⭐ Relatórios avançados
- ⭐ Integração com calendário
- ⭐ Notificações push

#### **WON'T HAVE (Não será implementado)**
- ❌ Sistema de gamificação complexo
- ❌ IA para sugestões automáticas
- ❌ Integração com redes sociais

### 4.2 Fases de Implementação

#### **Fase 1: Fundação (2-3 semanas)**

1. **Setup da Infraestrutura**
   - [ ] Configurar Supabase (produção)
   - [ ] Configurar FastAPI local (desenvolvimento)
   - [ ] Implementar esquema de banco unificado
   - [ ] Configurar autenticação (Supabase Auth + JWT para FastAPI)

2. **Abstração de Dados**
   - [ ] Criar `DataProvider` interface
   - [ ] Implementar `SupabaseProvider` 
   - [ ] Implementar `FastAPIProvider`
   - [ ] Configurar switching automático por ambiente

#### **Fase 2: Migração Core (3-4 semanas)**

1. **Hiperfocos Module**
   - [ ] Migrar store para usar DataProvider
   - [ ] Implementar endpoints de hiperfocos
   - [ ] Testar CRUD completo
   - [ ] Implementar cache local (React Query/SWR)

2. **Tarefas Module**
   - [ ] Migrar tarefas e subtarefas
   - [ ] Implementar hierarquia correta
   - [ ] Testar operações em lote

3. **Migração de Dados**
   - [ ] Script de migração localStorage → API
   - [ ] Interface de migração para usuários
   - [ ] Backup de segurança

#### **Fase 3: Features Avançadas (2-3 semanas)**

1. **Sessões de Alternância**
   - [ ] Migrar sistema de alternância
   - [ ] Implementar timing tracking
   - [ ] Analytics básicas

2. **Offline Support**
   - [ ] Implementar PWA capabilities
   - [ ] Sistema de sync offline-online
   - [ ] Conflict resolution

#### **Fase 4: Otimização (1-2 semanas)**

1. **Performance**
   - [ ] Otimizar queries
   - [ ] Implementar paginação
   - [ ] Cache strategies

2. **UX/UI**
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Feedback visual

### 4.3 Arquitetura de Código

#### **DataProvider Interface**
```typescript
// lib/dataProviders/types.ts
export interface DataProvider {
  // Hiperfocos
  getHiperfocos(params: GetHiperfocosParams): Promise<HiperfocosResponse>
  createHiperfoco(data: CreateHiperfocoData): Promise<Hiperfoco>
  updateHiperfoco(id: string, data: UpdateHiperfocoData): Promise<Hiperfoco>
  deleteHiperfoco(id: string): Promise<void>
  
  // Tarefas
  getTarefas(hiperfocoId: string): Promise<Tarefa[]>
  createTarefa(data: CreateTarefaData): Promise<Tarefa>
  toggleTarefa(id: string): Promise<Tarefa>
  
  // Sessões
  getSessoes(params: GetSessoesParams): Promise<SessaoAlternancia[]>
  createSessao(data: CreateSessaoData): Promise<SessaoAlternancia>
  // ... outros métodos
}
```

#### **Environment Detection**
```typescript
// lib/dataProviders/index.ts
import { SupabaseProvider } from './supabase'
import { FastAPIProvider } from './fastapi'

export const getDataProvider = (): DataProvider => {
  if (process.env.NODE_ENV === 'development') {
    return new FastAPIProvider({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    })
  }
  
  return new SupabaseProvider({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  })
}
```

#### **Store Migration**
```typescript
// stores/hiperfocosStore.ts (migrado)
import { create } from 'zustand'
import { getDataProvider } from '../lib/dataProviders'

const dataProvider = getDataProvider()

export const useHiperfocosStore = create<HiperfocosState>((set, get) => ({
  hiperfocos: [],
  loading: false,
  
  // Ações migradas para usar API
  adicionarHiperfoco: async (data) => {
    set({ loading: true })
    try {
      const hiperfoco = await dataProvider.createHiperfoco(data)
      set(state => ({ 
        hiperfocos: [...state.hiperfocos, hiperfoco],
        loading: false 
      }))
      return hiperfoco.id
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  
  // ... outras ações migradas
}))
```

### 4.4 Script de Migração de Dados

```typescript
// scripts/migrateLocalStorageData.ts
export const migrateHiperfocosData = async () => {
  // 1. Ler dados do localStorage
  const localData = localStorage.getItem('hiperfocos-storage')
  if (!localData) return
  
  const { state } = JSON.parse(localData)
  
  // 2. Migrar hiperfocos
  for (const hiperfoco of state.hiperfocos) {
    const migratedHiperfoco = await dataProvider.createHiperfoco({
      titulo: hiperfoco.titulo,
      descricao: hiperfoco.descricao,
      cor: hiperfoco.cor,
      tempo_limite: hiperfoco.tempoLimite
    })
    
    // 3. Migrar tarefas
    for (const tarefa of hiperfoco.tarefas) {
      await dataProvider.createTarefa({
        hiperfoco_id: migratedHiperfoco.id,
        texto: tarefa.texto,
        concluida: tarefa.concluida
      })
    }
  }
  
  // 4. Backup e limpeza
  localStorage.setItem('hiperfocos-storage-backup', localData)
  localStorage.removeItem('hiperfocos-storage')
}
```

### 4.5 Checklist de Validação

#### **Desenvolvimento (FastAPI)**
- [ ] ✅ Servidor FastAPI rodando localmente
- [ ] ✅ PostgreSQL local configurado
- [ ] ✅ Autenticação JWT funcionando
- [ ] ✅ Todos os endpoints implementados
- [ ] ✅ Testes automatizados (pytest)

#### **Produção (Supabase)**
- [ ] ✅ Projeto Supabase configurado
- [ ] ✅ RLS (Row Level Security) implementado
- [ ] ✅ Backup automático configurado
- [ ] ✅ Monitoramento de performance
- [ ] ✅ Rate limiting configurado

#### **Frontend**
- [ ] ✅ DataProvider funcionando nos dois ambientes
- [ ] ✅ Migração de dados testada
- [ ] ✅ Offline-first implementado
- [ ] ✅ Loading states e error handling
- [ ] ✅ Testes E2E (Playwright/Cypress)

#### **Deploy**
- [ ] ✅ CI/CD pipeline configurado
- [ ] ✅ Environment variables configuradas
- [ ] ✅ Rollback strategy definida
- [ ] ✅ Monitoring e alertas ativos

---

## 📊 5. ESTIMATIVAS E RISCOS

### 5.1 Cronograma Estimado
- **Total:** 8-12 semanas
- **Equipe:** 1-2 desenvolvedores
- **Buffer:** 20% para imprevistos

### 5.2 Principais Riscos
1. **Alto:** Complexidade da migração de dados existentes
2. **Médio:** Diferenças entre Supabase e FastAPI
3. **Baixo:** Performance de queries complexas

### 5.3 Mitigações
- Testes extensivos em ambiente de desenvolvimento
- Migração gradual com rollback
- Monitoring detalhado em produção

---

**🎯 Resultado Final:** Arquitetura robusta e escalável que suporta desenvolvimento local (FastAPI) e produção cloud (Supabase) com experiência de usuário consistente e dados sincronizados.