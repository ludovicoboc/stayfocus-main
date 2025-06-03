# Store-Specific Refactoring Prompts

## Overview

This document provides detailed, store-specific prompt templates for migrating each Zustand store in the StayFocus project to Supabase integration. Each prompt is tailored to the specific data model and requirements of individual stores.

---

## PROMPT 4A: Profile Store Migration

### Role Definition
You are a user profile and preferences specialist with expertise in migrating user data to Supabase while maintaining privacy, security, and seamless user experience.

### Task Context
Migrate the `perfilStore` to Supabase integration, ensuring user preferences, visual settings, and daily goals are synchronized across devices while maintaining the existing API for components.

### Current Profile Store Implementation
```typescript
// app/stores/perfilStore.ts
export type PreferenciasVisuais = {
  altoContraste: boolean
  reducaoEstimulos: boolean
  textoGrande: boolean
}

export type MetasDiarias = {
  horasSono: number
  tarefasPrioritarias: number
  coposAgua: number
  pausasProgramadas: number
}

export type PerfilState = {
  nome: string
  preferenciasVisuais: PreferenciasVisuais
  metasDiarias: MetasDiarias
  notificacoesAtivas: boolean
  pausasAtivas: boolean
  // Actions...
}
```

### Migration Requirements
1. Maintain exact same API for components using the store
2. Add user authentication integration
3. Implement real-time preference sync across devices
4. Handle guest mode with local storage fallback
5. Add profile picture and additional user metadata support

### Supabase Schema Design
```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT 'Usuário',
  preferencias_visuais JSONB NOT NULL DEFAULT '{"altoContraste": false, "reducaoEstimulos": false, "textoGrande": false}',
  metas_diarias JSONB NOT NULL DEFAULT '{"horasSono": 8, "tarefasPrioritarias": 3, "coposAgua": 8, "pausasProgramadas": 4}',
  notificacoes_ativas BOOLEAN NOT NULL DEFAULT true,
  pausas_ativas BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Implementation Template
```typescript
// stores/perfilStore.ts
interface PerfilState extends BaseStoreState {
  // Existing properties
  nome: string
  preferenciasVisuais: PreferenciasVisuais
  metasDiarias: MetasDiarias
  notificacoesAtivas: boolean
  pausasAtivas: boolean
  
  // New Supabase-related properties
  userId: string | null
  avatarUrl: string | null
  isGuest: boolean
  
  // Enhanced actions
  atualizarNome: (nome: string) => Promise<void>
  atualizarPreferenciasVisuais: (preferencias: Partial<PreferenciasVisuais>) => Promise<void>
  atualizarMetasDiarias: (metas: Partial<MetasDiarias>) => Promise<void>
  alternarNotificacoes: () => Promise<void>
  alternarPausas: () => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  syncProfile: () => Promise<void>
  resetarPerfil: () => Promise<void>
}
```

### Deliverables
1. Migrated profile store with Supabase integration
2. Real-time profile synchronization
3. Avatar upload functionality
4. Guest mode support with local fallback
5. Backward compatibility with existing components

---

## PROMPT 4B: Priorities Store Migration

### Role Definition
You are a task management and productivity specialist with expertise in migrating priority/task systems to real-time collaborative environments while maintaining performance and user experience.

### Task Context
Migrate the `prioridadesStore` to Supabase integration, enabling real-time task synchronization across devices while maintaining the existing daily priority management functionality.

### Current Priorities Store Implementation
```typescript
// app/stores/prioridadesStore.ts
export type Prioridade = {
  id: string;
  texto: string;
  concluida: boolean;
  data: string; // formato ISO: YYYY-MM-DD
  tipo?: 'geral' | 'concurso';
  origemId?: string;
}
```

### Migration Requirements
1. Real-time task synchronization across devices
2. Maintain daily priority filtering and management
3. Support for task categories and origins (concurso-related tasks)
4. Optimistic updates for immediate UI feedback
5. Conflict resolution for simultaneous edits

### Supabase Schema Design
```sql
CREATE TABLE prioridades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  data DATE NOT NULL,
  tipo TEXT CHECK (tipo IN ('geral', 'concurso')) DEFAULT 'geral',
  origem_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  sync_status TEXT DEFAULT 'synced',
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_prioridades_user_data ON prioridades(user_id, data);
CREATE INDEX idx_prioridades_tipo ON prioridades(user_id, tipo);

-- RLS Policies
ALTER TABLE prioridades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own priorities" ON prioridades FOR ALL USING (auth.uid() = user_id);
```

### Implementation Template
```typescript
// stores/prioridadesStore.ts
interface PrioridadesState extends BaseStoreState {
  prioridades: Prioridade[]
  
  // Enhanced actions with real-time sync
  adicionarPrioridade: (prioridade: Omit<Prioridade, 'id'>) => Promise<void>
  atualizarPrioridade: (id: string, updates: Partial<Prioridade>) => Promise<void>
  removerPrioridade: (id: string) => Promise<void>
  toggleConcluida: (id: string) => Promise<void>
  
  // Real-time and sync methods
  subscribeToRealtime: () => () => void
  syncPrioridades: () => Promise<void>
  getPrioridadesPorData: (data: string) => Prioridade[]
  getHistoricoPorData: (data: string) => Prioridade[]
}
```

### Deliverables
1. Migrated priorities store with real-time sync
2. Optimistic update implementation
3. Daily priority filtering maintained
4. Task completion tracking with timestamps
5. Integration with concurso-related priorities

---

## PROMPT 4C: Recipes Store Migration

### Role Definition
You are a recipe management and meal planning specialist with expertise in migrating complex data structures involving ingredients, instructions, and media to cloud-based solutions.

### Task Context
Migrate the `receitasStore` to Supabase integration, enabling recipe sharing, ingredient list synchronization, and meal planning across devices.

### Current Recipes Store Implementation
```typescript
// stores/receitasStore.ts
interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: string;
}

export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  categorias: string[];
  tags: string[];
  tempoPreparo: number;
  porcoes: number;
  calorias: string;
  imagem: string;
  ingredientes: Ingrediente[];
  passos: string[];
}
```

### Migration Requirements
1. Recipe image storage in Supabase Storage
2. Ingredient database normalization for better search
3. Recipe sharing capabilities (optional)
4. Shopping list generation from multiple recipes
5. Nutritional information enhancement

### Supabase Schema Design
```sql
-- Main recipes table
CREATE TABLE receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tempo_preparo INTEGER NOT NULL,
  porcoes INTEGER NOT NULL,
  calorias TEXT,
  imagem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

-- Ingredients table for normalization
CREATE TABLE ingredientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade DECIMAL NOT NULL,
  unidade TEXT NOT NULL,
  ordem INTEGER NOT NULL
);

-- Recipe steps
CREATE TABLE receita_passos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
  passo TEXT NOT NULL,
  ordem INTEGER NOT NULL
);

-- Categories and tags
CREATE TABLE receita_categorias (
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  PRIMARY KEY (receita_id, categoria)
);

CREATE TABLE receita_tags (
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (receita_id, tag)
);
```

### Implementation Template
```typescript
// stores/receitasStore.ts
interface ReceitasState extends BaseStoreState {
  receitas: Receita[]
  favoritos: string[]
  
  // Enhanced actions
  adicionarReceita: (receita: Omit<Receita, 'id'>) => Promise<void>
  atualizarReceita: (receita: Receita) => Promise<void>
  removerReceita: (id: string) => Promise<void>
  uploadImagemReceita: (file: File, receitaId: string) => Promise<string>
  
  // New functionality
  buscarReceitas: (termo: string) => Promise<Receita[]>
  gerarListaCompras: (receitaIds: string[]) => Promise<Ingrediente[]>
  duplicarReceita: (id: string) => Promise<void>
  
  // Real-time and sync
  subscribeToRealtime: () => () => void
  syncReceitas: () => Promise<void>
}
```

### Deliverables
1. Migrated recipes store with normalized schema
2. Image upload to Supabase Storage
3. Enhanced search and filtering capabilities
4. Shopping list generation functionality
5. Recipe duplication and sharing features

---

## PROMPT 4D: Study/Concursos Store Migration

### Role Definition
You are an educational technology specialist with expertise in migrating complex study management systems, exam preparation tools, and progress tracking to cloud-based platforms.

### Task Context
Migrate the `concursosStore` and related study stores to Supabase integration, enabling study progress synchronization, exam scheduling, and performance analytics across devices.

### Current Concursos Store Implementation
```typescript
// stores/concursosStore.ts
export interface Concurso {
  id: string
  titulo: string
  organizadora: string
  dataProva: string
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'resultado'
  conteudoProgramatico: ConteudoItem[]
  observacoes: string
  linkEdital: string
  taxaInscricao: number
  localProva: string
}

export interface ConteudoItem {
  id: string
  titulo: string
  concluido: boolean
  progresso: number
  subItens: ConteudoItem[]
}
```

### Migration Requirements
1. Study progress synchronization across devices
2. Exam scheduling and reminder system
3. Performance analytics and progress tracking
4. Study material organization and access
5. Collaborative study features (future)

### Supabase Schema Design
```sql
-- Main concursos table
CREATE TABLE concursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  organizadora TEXT NOT NULL,
  data_prova DATE,
  status TEXT CHECK (status IN ('planejado', 'inscrito', 'estudando', 'realizado', 'resultado')) DEFAULT 'planejado',
  observacoes TEXT,
  link_edital TEXT,
  taxa_inscricao DECIMAL,
  local_prova TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

-- Study content structure
CREATE TABLE conteudo_programatico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concurso_id UUID REFERENCES concursos(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES conteudo_programatico(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  concluido BOOLEAN DEFAULT false,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study sessions tracking
CREATE TABLE sessoes_estudo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id UUID REFERENCES concursos(id) ON DELETE CASCADE,
  conteudo_id UUID REFERENCES conteudo_programatico(id) ON DELETE SET NULL,
  duracao_minutos INTEGER NOT NULL,
  data_sessao DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Implementation Template
```typescript
// stores/concursosStore.ts
interface ConcursosState extends BaseStoreState {
  concursos: Concurso[]
  concursoAtivo: string | null
  
  // Enhanced actions
  adicionarConcurso: (concurso: Omit<Concurso, 'id'>) => Promise<void>
  atualizarConcurso: (id: string, updates: Partial<Concurso>) => Promise<void>
  removerConcurso: (id: string) => Promise<void>
  atualizarProgresso: (concursoId: string, conteudoId: string, progresso: number) => Promise<void>
  
  // New study tracking features
  registrarSessaoEstudo: (sessao: SessaoEstudo) => Promise<void>
  obterEstatisticasEstudo: (concursoId: string) => Promise<EstatisticasEstudo>
  obterProximoConcurso: () => Concurso | null
  
  // Real-time and sync
  subscribeToRealtime: () => () => void
  syncConcursos: () => Promise<void>
}
```

### Deliverables
1. Migrated concursos store with hierarchical content structure
2. Study session tracking and analytics
3. Progress synchronization across devices
4. Performance metrics and insights
5. Exam scheduling and reminder integration

---

## PROMPT 4E: Health/Medication Store Migration

### Role Definition
You are a healthcare technology specialist with expertise in migrating sensitive health data, medication tracking, and wellness monitoring systems to secure cloud platforms.

### Task Context
Migrate health-related stores (`medicamentos`, `humor`, `sono`) to Supabase integration while ensuring HIPAA-like privacy standards and enabling health data synchronization across devices.

### Current Health Store Implementation
```typescript
// stores/medicamentosStore.ts (from main store)
export type Medicamento = {
  id: string
  nome: string
  dosagem: string
  frequencia: string
  horarios: string[]
  observacoes: string
  dataInicio: string
  ultimaTomada: string | null
  intervalo?: number
}

export type RegistroHumor = {
  id: string
  data: string
  nivel: number
  fatores: string[]
  notas: string
}
```

### Migration Requirements
1. Enhanced privacy and security for health data
2. Medication reminder system with cross-device sync
3. Mood tracking with analytics and insights
4. Sleep pattern monitoring and analysis
5. Health data export for medical professionals

### Supabase Schema Design
```sql
-- Medications table
CREATE TABLE medicamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  frequencia TEXT NOT NULL,
  horarios JSONB NOT NULL,
  observacoes TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

-- Medication intake tracking
CREATE TABLE tomadas_medicamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medicamento_id UUID REFERENCES medicamentos(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  tomado BOOLEAN NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood tracking
CREATE TABLE registros_humor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel >= 1 AND nivel <= 10),
  fatores JSONB,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep tracking
CREATE TABLE registros_sono (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_dormir TIME,
  hora_acordar TIME,
  qualidade INTEGER CHECK (qualidade >= 1 AND qualidade <= 5),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Implementation Template
```typescript
// stores/saudeStore.ts (consolidated health store)
interface SaudeState extends BaseStoreState {
  medicamentos: Medicamento[]
  registrosHumor: RegistroHumor[]
  registrosSono: RegistroSono[]
  
  // Medication management
  adicionarMedicamento: (medicamento: Omit<Medicamento, 'id'>) => Promise<void>
  registrarTomada: (medicamentoId: string, tomado: boolean, observacoes?: string) => Promise<void>
  obterProximasTomadas: () => Promise<ProximaTomada[]>
  
  // Mood tracking
  registrarHumor: (registro: Omit<RegistroHumor, 'id'>) => Promise<void>
  obterTendenciasHumor: (periodo: number) => Promise<TendenciaHumor>
  
  // Sleep tracking
  registrarSono: (registro: Omit<RegistroSono, 'id'>) => Promise<void>
  obterPadroesSono: (periodo: number) => Promise<PadraoSono>
  
  // Analytics and insights
  gerarRelatorioSaude: (periodo: DateRange) => Promise<RelatorioSaude>
  exportarDadosSaude: (formato: 'pdf' | 'csv') => Promise<Blob>
  
  // Real-time and sync
  subscribeToRealtime: () => () => void
  syncDadosSaude: () => Promise<void>
}
```

### Deliverables
1. Consolidated health store with enhanced privacy
2. Medication reminder system with cross-device sync
3. Mood and sleep analytics with insights
4. Health data export functionality
5. Privacy-compliant data handling

---

## Usage Instructions for Store-Specific Prompts

### Sequential Migration Process:

1. **Start with Profile Store** (4A) - Foundation for user data
2. **Migrate Core Functionality** (4B - Priorities) - Daily task management
3. **Add Content Stores** (4C - Recipes, 4D - Concursos) - Feature-specific data
4. **Implement Health Data** (4E) - Sensitive data with enhanced security

### For Each Store Migration:

1. Review current store implementation
2. Adapt the schema design to specific needs
3. Implement the enhanced store with Supabase integration
4. Test backward compatibility with existing components
5. Add real-time subscriptions and sync functionality
6. Implement conflict resolution for the specific data type
7. Add any store-specific features (analytics, exports, etc.)

### Dependencies and Considerations:

- **Profile Store** must be migrated first (authentication foundation)
- **Health stores** require additional privacy considerations
- **Study stores** need complex hierarchical data handling
- **Recipe stores** require file storage integration
- All stores should follow the same base patterns for consistency

This systematic approach ensures each store is properly migrated while maintaining the specific requirements and functionality of each domain area.
