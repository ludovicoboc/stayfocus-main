# Plano de Migração - Módulo Lazer
## Aplicação StayFocus - localStorage para Arquitetura Dual (Supabase + FastAPI)

### 📋 Relatório de Auditoria do localStorage

#### Inventário de Chaves e Dados Armazenados

**1. Store: `atividades-storage`**
- **Chave localStorage**: `atividades-storage`
- **Estrutura de dados**:
```typescript
type Atividade = {
  id: string
  nome: string
  categoria: string
  duracao: number // em minutos
  observacoes: string
  data: string // formato YYYY-MM-DD
  concluida: boolean
}

interface AtividadesState {
  atividades: Atividade[]
}
```
- **Funcionalidades**:
  - CRUD completo de atividades de lazer
  - Marcação de conclusão
  - Estatísticas calculadas (total concluído, tempo acumulado, categoria favorita)
  - Categorias: Criativa, Física, Social, Relaxante, Intelectual, Outra

**2. Store: `sugestoes-storage`**
- **Chave localStorage**: `sugestoes-storage`
- **Estrutura de dados**:
```typescript
interface SugestoesState {
  sugestoesFavoritas: string[]
}
```
- **Funcionalidades**:
  - Sistema de favoritos para sugestões de descanso
  - Adição/remoção de sugestões favoritas
  - Prevenção de duplicatas

**3. Temporizador de Lazer**
- **Dados não persistidos**: O temporizador mantém estado apenas em memória
- **Configurações voláteis**: duração, presets, som ativado

#### Componentes Dependentes

1. **AtividadesLazer.tsx** - Depende de `useAtividadesStore`
2. **SugestoesDescanso.tsx** - Depende de `useSugestoesStore`
3. **TemporizadorLazer.tsx** - Estado local apenas (não depende de localStorage)

---

### 🗄️ Esquema de Banco de Dados Unificado (SQL)

```sql
-- Tabela de usuários (referência para outras tabelas)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atividades de lazer
CREATE TABLE leisure_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Criativa', 'Física', 'Social', 'Relaxante', 'Intelectual', 'Outra')),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    notes TEXT,
    activity_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sugestões favoritas de descanso
CREATE TABLE favorite_rest_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências do temporizador (opcional para futura expansão)
CREATE TABLE leisure_timer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_duration_minutes INTEGER DEFAULT 30,
    sound_enabled BOOLEAN DEFAULT TRUE,
    preferred_preset VARCHAR(20) DEFAULT 'personalizado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX idx_leisure_activities_user_id ON leisure_activities(user_id);
CREATE INDEX idx_leisure_activities_date ON leisure_activities(activity_date);
CREATE INDEX idx_leisure_activities_category ON leisure_activities(category);
CREATE INDEX idx_leisure_activities_completed ON leisure_activities(completed);
CREATE INDEX idx_favorite_suggestions_user_id ON favorite_rest_suggestions(user_id);
CREATE INDEX idx_timer_preferences_user_id ON leisure_timer_preferences(user_id);

-- Constraint para evitar sugestões duplicadas por usuário
ALTER TABLE favorite_rest_suggestions 
ADD CONSTRAINT unique_user_suggestion 
UNIQUE(user_id, suggestion_text);
```

---

### 🔌 Contrato de API (Formato OpenAPI Simplificado)

#### Endpoints de Atividades de Lazer

**GET /api/leisure/activities**
- **Método**: GET
- **Descrição**: Buscar atividades de lazer do usuário
- **Query Parameters**:
  - `completed` (boolean, opcional): Filtrar por status de conclusão
  - `category` (string, opcional): Filtrar por categoria
  - `date_from` (string, opcional): Data inicial (YYYY-MM-DD)
  - `date_to` (string, opcional): Data final (YYYY-MM-DD)
- **Resposta de Sucesso (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ler um livro",
      "category": "Intelectual",
      "duration_minutes": 45,
      "notes": "Livro sobre desenvolvimento pessoal",
      "activity_date": "2024-01-15",
      "completed": false,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "statistics": {
    "completed_count": 5,
    "total_minutes": 240,
    "favorite_category": "Relaxante"
  }
}
```
- **Códigos de Erro**: 401 (Não autorizado), 500 (Erro interno)

**POST /api/leisure/activities**
- **Método**: POST
- **Descrição**: Criar nova atividade de lazer
- **Payload da Requisição**:
```json
{
  "name": "Pintar aquarela",
  "category": "Criativa",
  "duration_minutes": 60,
  "notes": "Primeira tentativa com aquarela",
  "activity_date": "2024-01-15"
}
```
- **Resposta de Sucesso (201)**:
```json
{
  "data": {
    "id": "uuid",
    "name": "Pintar aquarela",
    "category": "Criativa",
    "duration_minutes": 60,
    "notes": "Primeira tentativa com aquarela",
    "activity_date": "2024-01-15",
    "completed": false,
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```
- **Códigos de Erro**: 400 (Dados inválidos), 401 (Não autorizado), 500 (Erro interno)

**PATCH /api/leisure/activities/{id}**
- **Método**: PATCH
- **Descrição**: Atualizar atividade de lazer
- **Payload da Requisição**:
```json
{
  "completed": true
}
```
- **Resposta de Sucesso (200)**: Mesma estrutura do POST
- **Códigos de Erro**: 400 (Dados inválidos), 401 (Não autorizado), 404 (Não encontrado), 500 (Erro interno)

**DELETE /api/leisure/activities/{id}**
- **Método**: DELETE
- **Descrição**: Excluir atividade de lazer
- **Resposta de Sucesso (204)**: Sem conteúdo
- **Códigos de Erro**: 401 (Não autorizado), 404 (Não encontrado), 500 (Erro interno)

#### Endpoints de Sugestões Favoritas

**GET /api/leisure/favorite-suggestions**
- **Método**: GET
- **Descrição**: Buscar sugestões favoritas do usuário
- **Resposta de Sucesso (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "suggestion_text": "Faça uma pausa para respirar profundamente por 2 minutos",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```
- **Códigos de Erro**: 401 (Não autorizado), 500 (Erro interno)

**POST /api/leisure/favorite-suggestions**
- **Método**: POST
- **Descrição**: Adicionar sugestão aos favoritos
- **Payload da Requisição**:
```json
{
  "suggestion_text": "Praticar meditação guiada de 5 minutos"
}
```
- **Resposta de Sucesso (201)**:
```json
{
  "data": {
    "id": "uuid",
    "suggestion_text": "Praticar meditação guiada de 5 minutos",
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```
- **Códigos de Erro**: 400 (Dados inválidos), 401 (Não autorizado), 409 (Já existe), 500 (Erro interno)

**DELETE /api/leisure/favorite-suggestions/{id}**
- **Método**: DELETE
- **Descrição**: Remover sugestão dos favoritos
- **Resposta de Sucesso (204)**: Sem conteúdo
- **Códigos de Erro**: 401 (Não autorizado), 404 (Não encontrado), 500 (Erro interno)

#### Endpoints de Preferências do Temporizador (Opcional)

**GET /api/leisure/timer-preferences**
- **Método**: GET
- **Descrição**: Buscar preferências do temporizador
- **Resposta de Sucesso (200)**:
```json
{
  "data": {
    "default_duration_minutes": 30,
    "sound_enabled": true,
    "preferred_preset": "medio"
  }
}
```

**PUT /api/leisure/timer-preferences**
- **Método**: PUT
- **Descrição**: Atualizar preferências do temporizador
- **Payload da Requisição**:
```json
{
  "default_duration_minutes": 45,
  "sound_enabled": false,
  "preferred_preset": "longo"
}
```

---

### 🚀 Plano de Migração Dual-Track

#### Fase 1: Preparação da Infraestrutura (1-2 dias)

**Supabase (Produção)**
- [ ] Configurar projeto Supabase
- [ ] Executar scripts de criação das tabelas
- [ ] Configurar Row Level Security (RLS)
- [ ] Testar autenticação e autorização

**FastAPI Local (Desenvolvimento)**
- [ ] Configurar ambiente FastAPI + SQLAlchemy
- [ ] Configurar PostgreSQL local
- [ ] Executar migrations das tabelas
- [ ] Implementar endpoints da API
- [ ] Configurar CORS para desenvolvimento

#### Fase 2: Criação de Camada de Abstração (2-3 dias)

**Service Layer**
- [ ] Criar `LeisureService` para abstrair calls da API
- [ ] Implementar interface comum para ambos os ambientes
- [ ] Configurar detecção automática de ambiente (dev vs prod)
- [ ] Implementar fallback para localStorage durante migração

**Exemplo de estrutura**:
```typescript
// services/leisureService.ts
interface LeisureServiceInterface {
  getActivities(filters?: ActivityFilters): Promise<Activity[]>
  createActivity(activity: CreateActivityDTO): Promise<Activity>
  updateActivity(id: string, updates: UpdateActivityDTO): Promise<Activity>
  deleteActivity(id: string): Promise<void>
  getFavoriteSuggestions(): Promise<string[]>
  addFavoriteSuggestion(suggestion: string): Promise<void>
  removeFavoriteSuggestion(id: string): Promise<void>
}

// Para Supabase
class SupabaseLeisureService implements LeisureServiceInterface { ... }

// Para FastAPI
class ApiLeisureService implements LeisureServiceInterface { ... }

// Factory para escolher implementação
export const createLeisureService = (): LeisureServiceInterface => {
  return process.env.NODE_ENV === 'development' 
    ? new ApiLeisureService()
    : new SupabaseLeisureService()
}
```

#### Fase 3: Migração dos Stores (2-3 dias)

**Refatoração dos Zustand Stores**
- [ ] Substituir localStorage por calls para service layer
- [ ] Manter interface dos stores inalterada (compatibilidade)
- [ ] Implementar cache local para otimização
- [ ] Adicionar estados de loading e error

**Exemplo de migração**:
```typescript
// stores/atividadesStore.ts (refatorado)
export const useAtividadesStore = create<AtividadesState>()((set, get) => ({
  atividades: [],
  loading: false,
  error: null,
  
  loadAtividades: async () => {
    set({ loading: true, error: null })
    try {
      const service = createLeisureService()
      const atividades = await service.getActivities()
      set({ atividades, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  adicionarAtividade: async (atividade) => {
    set({ loading: true })
    try {
      const service = createLeisureService()
      const newAtividade = await service.createActivity(atividade)
      set(state => ({ 
        atividades: [...state.atividades, newAtividade],
        loading: false 
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  // ... outros métodos
}))
```

#### Fase 4: Migração de Dados Existentes (1 dia)

**Script de Migração**
- [ ] Criar utilitário para exportar dados do localStorage
- [ ] Implementar importação via API para novos backends
- [ ] Validar integridade dos dados migrados
- [ ] Backup dos dados originais

```typescript
// utils/dataMigration.ts
export const migrateLeisureData = async () => {
  // Exportar dados do localStorage
  const atividadesData = localStorage.getItem('atividades-storage')
  const sugestoesData = localStorage.getItem('sugestoes-storage')
  
  if (atividadesData) {
    const { state } = JSON.parse(atividadesData)
    const service = createLeisureService()
    
    for (const atividade of state.atividades) {
      await service.createActivity(atividade)
    }
  }
  
  // Migrar sugestões...
}
```

#### Fase 5: Atualização dos Componentes (1-2 dias)

**Componentes React**
- [ ] Adicionar tratamento de estados assíncronos (loading, error)
- [ ] Implementar refresh automático após operações
- [ ] Melhorar UX com feedback visual
- [ ] Testar todos os fluxos de usuário

**Exemplo de atualização**:
```typescript
// components/lazer/AtividadesLazer.tsx
export function AtividadesLazer() {
  const { 
    atividades, 
    loading, 
    error, 
    loadAtividades,
    adicionarAtividade 
  } = useAtividadesStore()
  
  useEffect(() => {
    loadAtividades()
  }, [])
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  // ... resto do componente
}
```

#### Fase 6: Testes e Validação (2-3 dias)

**Testes de Integração**
- [ ] Testar fluxos completos em ambos os ambientes
- [ ] Validar sincronização de dados
- [ ] Testar cenários de erro e reconexão
- [ ] Verificar performance e responsividade

**Rollback Plan**
- [ ] Manter versão antiga como fallback
- [ ] Implementar feature flag para alternar entre versões
- [ ] Documentar procedimento de rollback

#### Fase 7: Deploy e Monitoramento (1 dia)

**Deploy**
- [ ] Deploy da versão com Supabase em produção
- [ ] Configurar monitoramento de erros
- [ ] Implementar logs para debugging
- [ ] Validar funcionamento em produção

**Monitoramento**
- [ ] Configurar alertas para erros críticos
- [ ] Monitorar performance das APIs
- [ ] Acompanhar métricas de uso

---

### 📊 Estimativa de Esforço

**Total**: 10-15 dias de desenvolvimento

**Distribuição**:
- Backend (FastAPI + Supabase): 40%
- Frontend (Migração + Refatoração): 35%
- Testes e Validação: 15%
- Deploy e Documentação: 10%

**Recursos Necessários**:
- 1 Desenvolvedor Full-Stack sênior
- Acesso aos ambientes Supabase e desenvolvimento
- Tempo para testes com usuários reais

---

### ⚠️ Considerações e Riscos

**Riscos Identificados**:
1. **Perda de dados durante migração**: Mitigado com backups e validação
2. **Problemas de conectividade**: Implementar cache local e retry logic
3. **Diferenças entre ambientes**: Manter contratos de API idênticos
4. **Impacto na UX**: Implementar loading states e feedback adequado

**Pontos de Atenção**:
- Manter backward compatibility durante transição
- Testar thoroughly ambos os ambientes
- Documentar diferenças de configuração
- Preparar rollback plan detalhado