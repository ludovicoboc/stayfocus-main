# Plano de Migração - Módulo de Saúde
## Arquitetura Dual-Track: Supabase (Produção) + FastAPI (Desenvolvimento)

---

## 1. 📋 Relatório de Auditoria do localStorage

### 1.1 Inventário de Chaves Identificadas

#### Chave Principal: `painel-neurodivergentes-storage`
**Localização**: `app/store/index.ts` (linha 266)
**Dados armazenados relacionados à saúde**:

| **Campo** | **Tipo** | **Descrição** | **Componentes Dependentes** |
|-----------|----------|---------------|----------------------------|
| `medicamentos[]` | `Medicamento[]` | Lista de medicamentos do usuário | `RegistroMedicamentos.tsx`, `MedicamentosList.tsx` |
| `registrosHumor[]` | `RegistroHumor[]` | Registros diários de humor | `MonitoramentoHumor.tsx`, `HumorCalendar.tsx`, `FatoresHumor.tsx` |

#### Chave Secundária: `sono-storage`
**Localização**: `app/stores/sonoStore.ts` (linha 99)
**Dados armazenados**:

| **Campo** | **Tipo** | **Descrição** | **Componentes Dependentes** |
|-----------|----------|---------------|----------------------------|
| `registros[]` | `RegistroSono[]` | Histórico de registros de sono | Módulo de sono (relacionado) |
| `lembretes[]` | `ConfiguracaoLembrete[]` | Configurações de lembretes | Módulo de sono (relacionado) |

### 1.2 Estruturas de Dados Atuais

#### Tipo `Medicamento`
```typescript
{
  id: string
  nome: string
  dosagem: string
  frequencia: string
  horarios: string[]
  observacoes: string
  dataInicio: string
  ultimaTomada: string | null
  intervalo?: number // em minutos
}
```

#### Tipo `RegistroHumor`
```typescript
{
  id: string
  data: string // formato YYYY-MM-DD
  nivel: number // 1-5
  fatores: string[]
  notas: string
}
```

### 1.3 Componentes Dependentes

| **Componente** | **Localização** | **Dados Consumidos** | **Operações** |
|---------------|-----------------|----------------------|--------------|
| `RegistroMedicamentos` | `app/components/saude/RegistroMedicamentos.tsx` | `medicamentos[]` | CRUD completo |
| `MedicamentosList` | `app/components/saude/MedicamentosList.tsx` | `medicamentos[]` | Leitura, tomada |
| `MonitoramentoHumor` | `app/components/saude/MonitoramentoHumor.tsx` | `registrosHumor[]` | CRUD completo |
| `HumorCalendar` | `app/components/saude/HumorCalendar.tsx` | `registrosHumor[]` | Leitura |
| `FatoresHumor` | `app/components/saude/FatoresHumor.tsx` | `registrosHumor[]` | Análise estatística |
| `StatCard` | `app/components/saude/StatCard.tsx` | Dados processados | Exibição |

---

## 2. 🗄️ Esquema de Banco de Dados Unificado (SQL)

### 2.1 Tabelas Principais

```sql
-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências do usuário
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tempo_foco INTEGER DEFAULT 25,
    tempo_pausa INTEGER DEFAULT 5,
    tema_escuro BOOLEAN DEFAULT false,
    reducao_estimulos BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de medicamentos
CREATE TABLE medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    dosagem VARCHAR(100),
    frequencia VARCHAR(100),
    horarios TEXT[], -- Array de strings no formato HH:MM
    observacoes TEXT,
    data_inicio DATE NOT NULL,
    ultima_tomada TIMESTAMP WITH TIME ZONE,
    intervalo_minutos INTEGER DEFAULT 240,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de tomada de medicamentos
CREATE TABLE tomadas_medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicamento_id UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_hora_tomada TIMESTAMP WITH TIME ZONE NOT NULL,
    horario_previsto TIME, -- Horário que deveria ser tomado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de humor
CREATE TABLE registros_humor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    nivel INTEGER NOT NULL CHECK (nivel >= 1 AND nivel <= 5),
    fatores TEXT[], -- Array de strings
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data) -- Apenas um registro por dia por usuário
);

-- Tabela de fatores de humor (para análise)
CREATE TABLE fatores_humor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cor VARCHAR(7), -- Código hexadecimal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, nome)
);
```

### 2.2 Índices para Performance

```sql
-- Índices para medicamentos
CREATE INDEX idx_medicamentos_user_id ON medicamentos(user_id);
CREATE INDEX idx_medicamentos_ativo ON medicamentos(user_id, ativo);
CREATE INDEX idx_medicamentos_data_inicio ON medicamentos(data_inicio);

-- Índices para tomadas de medicamentos
CREATE INDEX idx_tomadas_medicamento_id ON tomadas_medicamentos(medicamento_id);
CREATE INDEX idx_tomadas_user_data ON tomadas_medicamentos(user_id, data_hora_tomada);
CREATE INDEX idx_tomadas_data_hora ON tomadas_medicamentos(data_hora_tomada);

-- Índices para registros de humor
CREATE INDEX idx_humor_user_id ON registros_humor(user_id);
CREATE INDEX idx_humor_data ON registros_humor(user_id, data);
CREATE INDEX idx_humor_nivel ON registros_humor(user_id, nivel);

-- Índices para fatores de humor
CREATE INDEX idx_fatores_user_id ON fatores_humor(user_id);
CREATE INDEX idx_fatores_nome ON fatores_humor(user_id, nome);
```

### 2.3 Views para Consultas Otimizadas

```sql
-- View para medicamentos com estatísticas de tomada
CREATE VIEW medicamentos_with_stats AS
SELECT 
    m.*,
    COUNT(tm.id) as total_tomadas,
    MAX(tm.data_hora_tomada) as ultima_tomada_real,
    COUNT(CASE WHEN DATE(tm.data_hora_tomada) = CURRENT_DATE THEN 1 END) as tomadas_hoje
FROM medicamentos m
LEFT JOIN tomadas_medicamentos tm ON m.id = tm.medicamento_id
WHERE m.ativo = true
GROUP BY m.id;

-- View para análise de humor mensal
CREATE VIEW humor_mensal AS
SELECT 
    user_id,
    DATE_TRUNC('month', data) as mes,
    AVG(nivel) as humor_medio,
    COUNT(*) as registros_total,
    COUNT(CASE WHEN nivel >= 4 THEN 1 END) as dias_positivos,
    COUNT(CASE WHEN nivel <= 2 THEN 1 END) as dias_negativos
FROM registros_humor
GROUP BY user_id, DATE_TRUNC('month', data);
```

---

## 3. 🔌 Contrato de API (OpenAPI/Swagger Simplificado)

### 3.1 Autenticação

#### POST `/auth/login`
**Descrição**: Autentica usuário
**Payload da Requisição**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```
**Payload da Resposta** (200):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário"
  }
}
```
**Códigos de Status**: 200, 401, 422

#### POST `/auth/register`
**Descrição**: Registra novo usuário
**Payload da Requisição**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "nome": "Nome do Usuário"
}
```
**Payload da Resposta** (201):
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "nome": "Nome do Usuário"
  }
}
```
**Códigos de Status**: 201, 400, 422

### 3.2 Medicamentos

#### GET `/medicamentos`
**Descrição**: Lista medicamentos do usuário
**Headers**: `Authorization: Bearer {token}`
**Payload da Resposta** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Ritalina",
      "dosagem": "10mg",
      "frequencia": "Diária",
      "horarios": ["08:00", "14:00"],
      "observacoes": "Tomar com alimentos",
      "data_inicio": "2024-01-15",
      "ultima_tomada": "2024-01-20T08:00:00Z",
      "intervalo_minutos": 360,
      "ativo": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T08:00:00Z",
      "estatisticas": {
        "total_tomadas": 15,
        "tomadas_hoje": 1,
        "pode_tomar_agora": false,
        "proximo_horario": "14:00"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20
}
```
**Códigos de Status**: 200, 401

#### POST `/medicamentos`
**Descrição**: Cria novo medicamento
**Headers**: `Authorization: Bearer {token}`
**Payload da Requisição**:
```json
{
  "nome": "Fluoxetina",
  "dosagem": "20mg",
  "frequencia": "Diária",
  "horarios": ["08:00"],
  "observacoes": "Tomar pela manhã",
  "data_inicio": "2024-01-20",
  "intervalo_minutos": 1440
}
```
**Payload da Resposta** (201):
```json
{
  "data": {
    "id": "uuid",
    "nome": "Fluoxetina",
    "dosagem": "20mg",
    "frequencia": "Diária",
    "horarios": ["08:00"],
    "observacoes": "Tomar pela manhã",
    "data_inicio": "2024-01-20",
    "ultima_tomada": null,
    "intervalo_minutos": 1440,
    "ativo": true,
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z"
  }
}
```
**Códigos de Status**: 201, 400, 401, 422

#### PUT `/medicamentos/{id}`
**Descrição**: Atualiza medicamento
**Headers**: `Authorization: Bearer {token}`
**Payload da Requisição**:
```json
{
  "dosagem": "30mg",
  "horarios": ["08:00", "20:00"],
  "observacoes": "Aumentar dosagem conforme orientação médica"
}
```
**Payload da Resposta** (200):
```json
{
  "data": {
    "id": "uuid",
    "nome": "Fluoxetina",
    "dosagem": "30mg",
    "frequencia": "Diária",
    "horarios": ["08:00", "20:00"],
    "observacoes": "Aumentar dosagem conforme orientação médica",
    "data_inicio": "2024-01-20",
    "ultima_tomada": null,
    "intervalo_minutos": 1440,
    "ativo": true,
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T14:00:00Z"
  }
}
```
**Códigos de Status**: 200, 400, 401, 404, 422

#### DELETE `/medicamentos/{id}`
**Descrição**: Remove medicamento (soft delete)
**Headers**: `Authorization: Bearer {token}`
**Payload da Resposta** (200):
```json
{
  "message": "Medicamento removido com sucesso"
}
```
**Códigos de Status**: 200, 401, 404

#### POST `/medicamentos/{id}/tomada`
**Descrição**: Registra tomada de medicamento
**Headers**: `Authorization: Bearer {token}`
**Payload da Requisição**:
```json
{
  "data_hora": "2024-01-20T08:00:00Z",
  "horario_previsto": "08:00"
}
```
**Payload da Resposta** (201):
```json
{
  "data": {
    "id": "uuid",
    "medicamento_id": "uuid",
    "data_hora_tomada": "2024-01-20T08:00:00Z",
    "horario_previsto": "08:00",
    "created_at": "2024-01-20T08:00:00Z"
  }
}
```
**Códigos de Status**: 201, 400, 401, 404

### 3.3 Registros de Humor

#### GET `/humor`
**Descrição**: Lista registros de humor
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?data_inicio=2024-01-01&data_fim=2024-01-31&page=1&per_page=20`
**Payload da Resposta** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "data": "2024-01-20",
      "nivel": 4,
      "fatores": ["trabalho", "exercício"],
      "notas": "Dia produtivo após exercício matinal",
      "created_at": "2024-01-20T20:00:00Z",
      "updated_at": "2024-01-20T20:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "estatisticas": {
    "humor_medio": 3.8,
    "dias_registrados": 20,
    "tendencia": {
      "valor": 15,
      "positivo": true,
      "periodo": "últimos 7 dias"
    },
    "fatores_comuns": [
      {
        "fator": "trabalho",
        "ocorrencias": 15,
        "percentual": 75
      }
    ]
  }
}
```
**Códigos de Status**: 200, 401

#### POST `/humor`
**Descrição**: Cria registro de humor
**Headers**: `Authorization: Bearer {token}`
**Payload da Requisição**:
```json
{
  "data": "2024-01-20",
  "nivel": 4,
  "fatores": ["trabalho", "exercício"],
  "notas": "Dia produtivo após exercício matinal"
}
```
**Payload da Resposta** (201):
```json
{
  "data": {
    "id": "uuid",
    "data": "2024-01-20",
    "nivel": 4,
    "fatores": ["trabalho", "exercício"],
    "notas": "Dia produtivo após exercício matinal",
    "created_at": "2024-01-20T20:00:00Z",
    "updated_at": "2024-01-20T20:00:00Z"
  }
}
```
**Códigos de Status**: 201, 400, 401, 422

#### PUT `/humor/{id}`
**Descrição**: Atualiza registro de humor
**Headers**: `Authorization: Bearer {token}`
**Payload da Requisição**:
```json
{
  "nivel": 5,
  "fatores": ["trabalho", "exercício", "família"],
  "notas": "Dia excelente - jantar em família"
}
```
**Payload da Resposta** (200):
```json
{
  "data": {
    "id": "uuid",
    "data": "2024-01-20",
    "nivel": 5,
    "fatores": ["trabalho", "exercício", "família"],
    "notas": "Dia excelente - jantar em família",
    "created_at": "2024-01-20T20:00:00Z",
    "updated_at": "2024-01-20T21:30:00Z"
  }
}
```
**Códigos de Status**: 200, 400, 401, 404, 422

#### DELETE `/humor/{id}`
**Descrição**: Remove registro de humor
**Headers**: `Authorization: Bearer {token}`
**Payload da Resposta** (200):
```json
{
  "message": "Registro de humor removido com sucesso"
}
```
**Códigos de Status**: 200, 401, 404

#### GET `/humor/calendario/{ano}/{mes}`
**Descrição**: Dados do calendário de humor para um mês específico
**Headers**: `Authorization: Bearer {token}`
**Payload da Resposta** (200):
```json
{
  "data": {
    "2024-01-15": { "nivel": 3, "fatores": ["trabalho"] },
    "2024-01-16": { "nivel": 4, "fatores": ["exercício"] },
    "2024-01-17": { "nivel": 2, "fatores": ["estresse"] }
  },
  "estatisticas_mes": {
    "humor_medio": 3.2,
    "dias_registrados": 15,
    "melhor_dia": "2024-01-16",
    "pior_dia": "2024-01-17"
  }
}
```
**Códigos de Status**: 200, 401, 404

### 3.4 Análises e Relatórios

#### GET `/relatorios/humor`
**Descrição**: Relatório detalhado de humor
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?periodo=30d&incluir_fatores=true`
**Payload da Resposta** (200):
```json
{
  "periodo": {
    "inicio": "2023-12-21",
    "fim": "2024-01-20",
    "dias": 30
  },
  "resumo": {
    "humor_medio": 3.7,
    "dias_registrados": 28,
    "percentual_cobertura": 93.3,
    "tendencia": "estável"
  },
  "distribuicao": {
    "1": 2,
    "2": 5,
    "3": 8,
    "4": 10,
    "5": 3
  },
  "fatores_impacto": [
    {
      "fator": "exercício",
      "humor_medio_com": 4.2,
      "humor_medio_sem": 3.1,
      "impacto": 1.1
    }
  ]
}
```
**Códigos de Status**: 200, 401

#### GET `/relatorios/medicamentos`
**Descrição**: Relatório de aderência a medicamentos
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: `?periodo=30d`
**Payload da Resposta** (200):
```json
{
  "periodo": {
    "inicio": "2023-12-21",
    "fim": "2024-01-20",
    "dias": 30
  },
  "resumo": {
    "aderencia_geral": 85.5,
    "medicamentos_ativos": 3,
    "doses_programadas": 180,
    "doses_tomadas": 154
  },
  "por_medicamento": [
    {
      "id": "uuid",
      "nome": "Ritalina",
      "aderencia": 90.0,
      "doses_programadas": 60,
      "doses_tomadas": 54,
      "horarios_perdidos": ["08:00", "14:00"]
    }
  ]
}
```
**Códigos de Status**: 200, 401

---

## 4. 🔄 Plano de Migração Dual-Track

### 4.1 Estratégia de Implementação

#### Fase 1: Preparação da Infraestrutura (Semana 1)
- [ ] **Supabase (Produção)**
  - [ ] Criar projeto no Supabase
  - [ ] Executar scripts de criação de tabelas
  - [ ] Configurar Row Level Security (RLS)
  - [ ] Configurar autenticação (email/password)
  - [ ] Testar conexões e permissões

- [ ] **FastAPI (Desenvolvimento)**
  - [ ] Configurar ambiente local com Docker
  - [ ] Instalar PostgreSQL local
  - [ ] Configurar SQLAlchemy com modelos
  - [ ] Implementar autenticação JWT
  - [ ] Criar endpoints básicos de saúde

#### Fase 2: Criação da Camada de Abstração (Semana 2)
- [ ] **Criar Service Layer Abstrato**
  ```typescript
  // app/services/HealthService.ts
  interface IHealthService {
    // Medicamentos
    getMedicamentos(): Promise<Medicamento[]>
    createMedicamento(data: CreateMedicamentoDTO): Promise<Medicamento>
    updateMedicamento(id: string, data: UpdateMedicamentoDTO): Promise<Medicamento>
    deleteMedicamento(id: string): Promise<void>
    registrarTomada(id: string, dataHora: string): Promise<TomadaMedicamento>
    
    // Humor
    getRegistrosHumor(filters: HumorFilters): Promise<RegistroHumor[]>
    createRegistroHumor(data: CreateHumorDTO): Promise<RegistroHumor>
    updateRegistroHumor(id: string, data: UpdateHumorDTO): Promise<RegistroHumor>
    deleteRegistroHumor(id: string): Promise<void>
    getHumorCalendario(ano: number, mes: number): Promise<HumorCalendario>
  }
  ```

- [ ] **Implementar Adaptadores**
  ```typescript
  // app/services/adapters/SupabaseHealthService.ts
  class SupabaseHealthService implements IHealthService {
    // Implementação usando Supabase SDK
  }
  
  // app/services/adapters/RestApiHealthService.ts  
  class RestApiHealthService implements IHealthService {
    // Implementação usando fetch/axios para FastAPI
  }
  ```

- [ ] **Factory Pattern para Seleção de Serviço**
  ```typescript
  // app/services/HealthServiceFactory.ts
  export const createHealthService = (): IHealthService => {
    const env = process.env.NODE_ENV
    return env === 'production' 
      ? new SupabaseHealthService()
      : new RestApiHealthService()
  }
  ```

#### Fase 3: Migração de Dados (Semana 3)
- [ ] **Script de Migração de localStorage**
  ```typescript
  // app/migrations/migrateSaudeData.ts
  export async function migrateSaudeData() {
    const localData = localStorage.getItem('painel-neurodivergentes-storage')
    if (!localData) return
    
    const parsed = JSON.parse(localData)
    const { medicamentos, registrosHumor } = parsed
    
    const healthService = createHealthService()
    
    // Migrar medicamentos
    for (const med of medicamentos) {
      await healthService.createMedicamento({
        nome: med.nome,
        dosagem: med.dosagem,
        frequencia: med.frequencia,
        horarios: med.horarios,
        observacoes: med.observacoes,
        dataInicio: med.dataInicio,
        intervaloMinutos: med.intervalo
      })
    }
    
    // Migrar registros de humor
    for (const humor of registrosHumor) {
      await healthService.createRegistroHumor({
        data: humor.data,
        nivel: humor.nivel,
        fatores: humor.fatores,
        notas: humor.notas
      })
    }
    
    // Backup do localStorage antes de limpar
    localStorage.setItem('backup-saude-data', localData)
    
    // Limpar dados migrados do localStorage
    const updatedData = { ...parsed }
    delete updatedData.medicamentos
    delete updatedData.registrosHumor
    localStorage.setItem('painel-neurodivergentes-storage', JSON.stringify(updatedData))
  }
  ```

#### Fase 4: Refatoração dos Componentes (Semana 4)
- [ ] **Substituir Zustand por React Query + Service Layer**
  ```typescript
  // app/hooks/useMedicamentos.ts
  export const useMedicamentos = () => {
    const healthService = createHealthService()
    
    return useQuery({
      queryKey: ['medicamentos'],
      queryFn: () => healthService.getMedicamentos()
    })
  }
  
  export const useCreateMedicamento = () => {
    const healthService = createHealthService()
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: (data: CreateMedicamentoDTO) => 
        healthService.createMedicamento(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['medicamentos'] })
      }
    })
  }
  ```

- [ ] **Atualizar Componentes**
  - [ ] `RegistroMedicamentos.tsx`: Substituir `useAppStore` por `useMedicamentos`
  - [ ] `MedicamentosList.tsx`: Implementar otimistic updates
  - [ ] `MonitoramentoHumor.tsx`: Substituir store por hooks de API
  - [ ] `HumorCalendar.tsx`: Implementar cache de calendário
  - [ ] `FatoresHumor.tsx`: Usar dados de API para análises

#### Fase 5: Implementação de Funcionalidades Avançadas (Semana 5)
- [ ] **Cache Offline com React Query**
  ```typescript
  // app/lib/queryClient.ts
  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
      }
    }
  })
  ```

- [ ] **Sincronização em Background**
  ```typescript
  // app/hooks/useOfflineSync.ts
  export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    
    useEffect(() => {
      const handleOnline = () => {
        setIsOnline(true)
        // Sincronizar dados pendentes
        queryClient.refetchQueries()
      }
      
      const handleOffline = () => setIsOnline(false)
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }, [])
    
    return { isOnline }
  }
  ```

### 4.2 Checklist de Migração Frontend

#### ✅ Preparação
- [ ] Instalar dependências necessárias
  ```bash
  npm install @tanstack/react-query @supabase/supabase-js axios
  npm install --save-dev @types/node
  ```

- [ ] Configurar variáveis de ambiente
  ```bash
  # .env.local
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  NEXT_PUBLIC_API_URL=http://localhost:8000  # FastAPI local
  NODE_ENV=development|production
  ```

#### ✅ Implementação da Camada de Serviços
- [ ] Criar interfaces e DTOs em `app/types/api.ts`
- [ ] Implementar `SupabaseHealthService`
- [ ] Implementar `RestApiHealthService`
- [ ] Criar `HealthServiceFactory`
- [ ] Adicionar tratamento de erros e retry logic

#### ✅ Migração de Estado
- [ ] Criar hooks personalizados com React Query
- [ ] Substituir `useAppStore` nos componentes
- [ ] Implementar loading states e error handling
- [ ] Adicionar feedback visual para operações

#### ✅ Funcionalidades de Sincronização
- [ ] Implementar detecção de status online/offline
- [ ] Criar sistema de queue para operações offline
- [ ] Implementar retry automático de operações falhas
- [ ] Adicionar indicadores visuais de sincronização

#### ✅ Migração de Dados
- [ ] Criar página/modal de migração
- [ ] Implementar script de migração com progress
- [ ] Criar backup automático dos dados locais
- [ ] Testar migração com dados reais

#### ✅ Testes e Validação
- [ ] Testar todos os fluxos CRUD
- [ ] Validar comportamento offline/online
- [ ] Testar performance com grandes volumes de dados
- [ ] Validar integridade dos dados migrados

### 4.3 Configuração de Ambientes

#### Supabase (Produção)
```sql
-- Políticas RLS para tabelas de saúde
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_humor ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomadas_medicamentos ENABLE ROW LEVEL SECURITY;

-- Política para medicamentos
CREATE POLICY "Usuários podem gerenciar próprios medicamentos"
ON medicamentos FOR ALL
USING (auth.uid() = user_id);

-- Política para registros de humor  
CREATE POLICY "Usuários podem gerenciar próprios registros de humor"
ON registros_humor FOR ALL
USING (auth.uid() = user_id);

-- Política para tomadas de medicamentos
CREATE POLICY "Usuários podem gerenciar próprias tomadas"
ON tomadas_medicamentos FOR ALL
USING (auth.uid() = user_id);
```

#### FastAPI (Desenvolvimento)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stayfocus_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://dev_user:dev_password@postgres:5432/stayfocus_dev
      SECRET_KEY: development_secret_key
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 4.4 Monitoramento e Métricas

#### Métricas de Sucesso da Migração
- [ ] **Taxa de Migração**: % de usuários que migraram com sucesso
- [ ] **Integridade de Dados**: % de dados migrados sem perdas
- [ ] **Performance**: Tempo de resposta médio < 200ms
- [ ] **Disponibilidade**: Uptime > 99.5%
- [ ] **Satisfação do Usuário**: Feedback positivo > 85%

#### Plano de Rollback
- [ ] Manter backup completo dos dados localStorage
- [ ] Implementar flag de feature para reverter para localStorage
- [ ] Script de restauração de dados em caso de falha crítica
- [ ] Monitoramento em tempo real durante a migração

---

## 5. 🎯 Considerações Técnicas Adicionais

### 5.1 Segurança
- Implementar validação rigorosa de dados de entrada
- Usar prepared statements para prevenir SQL injection
- Implementar rate limiting nos endpoints
- Criptografar dados sensíveis em repouso
- Auditoria de acesso aos dados de saúde

### 5.2 Performance
- Implementar paginação em todas as listagens
- Usar indexação estratégica no banco de dados
- Cache de consultas frequentes (React Query)
- Lazy loading de componentes pesados
- Otimização de queries N+1

### 5.3 Acessibilidade
- Manter compatibilidade com leitores de tela
- Implementar navegação por teclado
- Contraste adequado para todos os elementos
- Labels descritivos para todos os inputs
- Feedback audível para ações importantes

### 5.4 Conformidade LGPD
- Consentimento explícito para coleta de dados de saúde
- Opção de exportação de dados pessoais
- Funcionalidade de exclusão completa de dados
- Anonimização de dados para análises agregadas
- Log de auditoria para acesso aos dados

---

## 6. 📅 Cronograma de Implementação

| **Semana** | **Foco** | **Entregas** | **Responsável** |
|------------|----------|--------------|-----------------|
| **1** | Infraestrutura | Supabase configurado, FastAPI funcionando | DevOps/Backend |
| **2** | Arquitetura | Service Layer, Adapters, Factory Pattern | Frontend/Backend |
| **3** | Migração | Script de migração, backup de dados | Frontend |
| **4** | Refatoração | Componentes usando nova arquitetura | Frontend |
| **5** | Funcionalidades | Cache offline, sincronização | Frontend |
| **6** | Testes | Testes E2E, validação de performance | QA/Frontend |

---

**Total estimado**: 6 semanas de desenvolvimento
**Riscos identificados**: Complexidade da sincronização offline, tempo de migração de dados, compatibilidade entre ambientes
**Mitigações**: Testes extensivos, rollback automático, migração gradual por usuário