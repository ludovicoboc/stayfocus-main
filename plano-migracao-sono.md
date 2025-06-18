# Plano de Migração - Módulo Sono
**Aplicação:** StayFocus  
**Escopo:** `/app/sono` e componentes relacionados  
**Data:** $(date)  
**Arquiteto:** IA Assistant  

## 📋 Relatório de Auditoria do localStorage

### Inventário de Chaves e Dados

| Chave localStorage | Store Zustand | Componentes Dependentes | Tipos de Dados |
|-------------------|---------------|------------------------|----------------|
| `sono-storage` | `useSonoStore` | RegistroSono, VisualizadorSemanal, ConfiguracaoLembretes | RegistroSono[], ConfiguracaoLembrete[] |

### Estruturas de Dados Identificadas

#### 1. RegistroSono
```typescript
{
  id: string            // ID único (timestamp)
  inicio: string        // ISO date string - quando dormiu
  fim: string | null    // ISO date string - quando acordou (null se ainda dormindo)
  qualidade: number | null  // 1-5 (5 = melhor qualidade)
  notas: string         // Observações do usuário
}
```

#### 2. ConfiguracaoLembrete
```typescript
{
  id: string               // ID único (timestamp)
  tipo: 'dormir' | 'acordar'  // Tipo do lembrete
  horario: string          // Formato HH:MM
  diasSemana: number[]     // Array [0-6] onde 0=domingo
  ativo: boolean           // Se o lembrete está ativo
}
```

### Componentes Dependentes

1. **`app/sono/page.tsx`** - Página principal com navegação por abas
2. **`app/components/sono/RegistroSono.tsx`** - CRUD de registros de sono
3. **`app/components/sono/VisualizadorSemanal.tsx`** - Visualização gráfica semanal
4. **`app/components/sono/ConfiguracaoLembretes.tsx`** - CRUD de lembretes
5. **`app/stores/sonoStore.ts`** - Store Zustand com persistência
6. **`app/lib/dataService.ts`** - Sistema de export/import (já integrado)

### Operações CRUD Identificadas

#### Registros de Sono:
- ✅ Create: `adicionarRegistroSono()`
- ✅ Read: `registros` state
- ✅ Update: `atualizarRegistroSono()`
- ✅ Delete: `removerRegistroSono()`

#### Lembretes:
- ✅ Create: `adicionarLembrete()`
- ✅ Read: `lembretes` state
- ✅ Update: `atualizarLembrete()`, `alternarAtivoLembrete()`
- ✅ Delete: `removerLembrete()`

---

## 🗄️ Esquema de Banco de Dados Unificado (SQL)

### Estrutura Geral
```sql
-- =====================================================
-- SCHEMA: Módulo Sono - StayFocus
-- Compatível com PostgreSQL e SQLite
-- =====================================================

-- Tabela de usuários (assumindo multi-tenant)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de registros de sono
CREATE TABLE IF NOT EXISTS sleep_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    sleep_start TIMESTAMP WITH TIME ZONE NOT NULL,
    sleep_end TIMESTAMP WITH TIME ZONE NULL,
    quality_rating INTEGER NULL,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_sleep_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_quality_rating CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)),
    CONSTRAINT chk_sleep_order CHECK (sleep_end IS NULL OR sleep_end > sleep_start)
);

-- Tabela de lembretes de sono
CREATE TABLE IF NOT EXISTS sleep_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    reminder_type VARCHAR(10) NOT NULL,
    reminder_time TIME NOT NULL,
    weekdays INTEGER[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_sleep_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_reminder_type CHECK (reminder_type IN ('dormir', 'acordar'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_date ON sleep_records(user_id, sleep_start DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_active ON sleep_records(user_id) WHERE sleep_end IS NULL;
CREATE INDEX IF NOT EXISTS idx_sleep_reminders_user_active ON sleep_reminders(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Função para atualizar updated_at automaticamente (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_sleep_records_updated_at 
    BEFORE UPDATE ON sleep_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sleep_reminders_updated_at 
    BEFORE UPDATE ON sleep_reminders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View para relatórios de sono
CREATE VIEW sleep_summary AS
SELECT 
    user_id,
    DATE(sleep_start) as sleep_date,
    COUNT(*) as total_records,
    AVG(quality_rating) as avg_quality,
    AVG(EXTRACT(EPOCH FROM (sleep_end - sleep_start))/3600) as avg_duration_hours
FROM sleep_records 
WHERE sleep_end IS NOT NULL
GROUP BY user_id, DATE(sleep_start);
```

---

## 🔌 Contrato de API (OpenAPI/Swagger Simplificado)

### Autenticação
- **Método:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer <token>`

### Endpoints

#### 1. Registros de Sono

##### `GET /api/sleep/records`
**Descrição:** Listar registros de sono do usuário  
**Parâmetros Query:**
- `limit` (opcional): Número de registros (padrão: 50)
- `offset` (opcional): Offset para paginação (padrão: 0)
- `start_date` (opcional): Data início filtro (YYYY-MM-DD)
- `end_date` (opcional): Data fim filtro (YYYY-MM-DD)

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sleep_start": "2024-01-15T22:30:00Z",
      "sleep_end": "2024-01-16T06:30:00Z",
      "quality_rating": 4,
      "notes": "Dormi bem, sem interrupções",
      "created_at": "2024-01-15T22:30:00Z",
      "updated_at": "2024-01-16T06:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 50
}
```

##### `POST /api/sleep/records`
**Descrição:** Criar novo registro de sono  
**Payload:**
```json
{
  "sleep_start": "2024-01-15T22:30:00Z",
  "sleep_end": "2024-01-16T06:30:00Z", // opcional
  "quality_rating": 4, // opcional (1-5)
  "notes": "Observações..." // opcional
}
```

**Resposta 201:**
```json
{
  "data": {
    "id": "uuid",
    "sleep_start": "2024-01-15T22:30:00Z",
    "sleep_end": "2024-01-16T06:30:00Z",
    "quality_rating": 4,
    "notes": "Observações...",
    "created_at": "2024-01-15T22:30:00Z",
    "updated_at": "2024-01-15T22:30:00Z"
  }
}
```

##### `PUT /api/sleep/records/{id}`
**Descrição:** Atualizar registro de sono  
**Payload:** (mesmo formato do POST, todos campos opcionais)

**Resposta 200:** (mesmo formato da criação)

##### `DELETE /api/sleep/records/{id}`
**Descrição:** Remover registro de sono  
**Resposta 204:** (sem conteúdo)

#### 2. Lembretes de Sono

##### `GET /api/sleep/reminders`
**Descrição:** Listar lembretes do usuário  

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "reminder_type": "dormir",
      "reminder_time": "22:00",
      "weekdays": [1, 2, 3, 4, 5],
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

##### `POST /api/sleep/reminders`
**Descrição:** Criar novo lembrete  
**Payload:**
```json
{
  "reminder_type": "dormir", // "dormir" | "acordar"
  "reminder_time": "22:00", // HH:MM
  "weekdays": [1, 2, 3, 4, 5], // Array [0-6], 0=domingo
  "is_active": true // opcional, padrão true
}
```

##### `PUT /api/sleep/reminders/{id}`
**Descrição:** Atualizar lembrete  

##### `DELETE /api/sleep/reminders/{id}`
**Descrição:** Remover lembrete  

#### 3. Relatórios e Analytics

##### `GET /api/sleep/analytics/weekly`
**Descrição:** Estatísticas semanais de sono  
**Parâmetros Query:**
- `week_start`: Data início da semana (YYYY-MM-DD)

**Resposta 200:**
```json
{
  "data": {
    "week_start": "2024-01-15",
    "average_duration_hours": 7.5,
    "average_quality": 3.8,
    "total_records": 6,
    "daily_breakdown": [
      {
        "date": "2024-01-15",
        "duration_hours": 8.0,
        "quality_rating": 4,
        "sleep_start": "22:30",
        "sleep_end": "06:30"
      }
    ]
  }
}
```

### Códigos de Status de Erro

- **400 Bad Request:** Dados inválidos no payload
- **401 Unauthorized:** Token de autenticação inválido
- **403 Forbidden:** Usuário não tem permissão
- **404 Not Found:** Recurso não encontrado
- **422 Unprocessable Entity:** Validação de negócio falhou
- **500 Internal Server Error:** Erro interno do servidor

---

## 🚀 Plano de Migração Dual-Track

### Fase 1: Preparação da Infraestrutura (1-2 semanas)

#### Backend Supabase (Produção)
- [ ] **1.1** Executar schema SQL no Supabase
- [ ] **1.2** Configurar Row Level Security (RLS)
- [ ] **1.3** Criar políticas de acesso por usuário
- [ ] **1.4** Configurar triggers e functions necessárias
- [ ] **1.5** Testar conexão e operações básicas

#### Backend FastAPI (Desenvolvimento)
- [ ] **1.6** Configurar ambiente FastAPI local
- [ ] **1.7** Configurar PostgreSQL local
- [ ] **1.8** Executar mesmo schema SQL
- [ ] **1.9** Implementar endpoints da API
- [ ] **1.10** Configurar autenticação JWT
- [ ] **1.11** Implementar testes unitários

### Fase 2: Adaptação do Frontend (2-3 semanas)

#### Criação da Camada de Abstração
- [ ] **2.1** Criar `lib/api/sleepApi.ts` - Client API abstrato
- [ ] **2.2** Implementar `lib/supabase/sleepService.ts` - Cliente Supabase
- [ ] **2.3** Implementar `lib/fastapi/sleepService.ts` - Cliente FastAPI
- [ ] **2.4** Criar factory pattern para selecionar cliente baseado em env

#### Atualização do Store Zustand
- [ ] **2.5** Modificar `sonoStore.ts` para usar API ao invés de localStorage
- [ ] **2.6** Implementar cache local para offline-first
- [ ] **2.7** Adicionar estados de loading/error
- [ ] **2.8** Manter compatibilidade com dados existentes

#### Componentes React
- [ ] **2.9** Atualizar componentes para lidar com async operations
- [ ] **2.10** Adicionar loading states nos componentes
- [ ] **2.11** Implementar error handling e retry logic
- [ ] **2.12** Adicionar feedback visual para operações

### Fase 3: Migração de Dados (1 semana)

#### Script de Migração
- [ ] **3.1** Criar script para ler dados do localStorage
- [ ] **3.2** Transformar dados para formato da API
- [ ] **3.3** Implementar upload via API
- [ ] **3.4** Adicionar validação e rollback
- [ ] **3.5** Testar migração com dados reais

#### Processo de Migração
- [ ] **3.6** Backup automático dos dados localStorage
- [ ] **3.7** Migração incremental com verificação
- [ ] **3.8** Validação da integridade dos dados
- [ ] **3.9** Limpeza do localStorage após confirmação

### Fase 4: Testes e Deploy (1-2 semanas)

#### Testes Integrados
- [ ] **4.1** Testes E2E para todos os fluxos
- [ ] **4.2** Testes de compatibilidade entre ambientes
- [ ] **4.3** Testes de performance com dados reais
- [ ] **4.4** Testes de fallback para offline

#### Deploy e Monitoramento
- [ ] **4.5** Deploy gradual com feature flag
- [ ] **4.6** Monitoramento de APIs e errors
- [ ] **4.7** Backup e disaster recovery
- [ ] **4.8** Documentação para desenvolvedores

### Configuração por Ambiente

```typescript
// lib/config/api.ts
const API_CONFIG = {
  development: {
    type: 'fastapi',
    baseURL: 'http://localhost:8000',
    auth: 'jwt'
  },
  production: {
    type: 'supabase', 
    baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    auth: 'supabase'
  }
}
```

### Checklist de Validação Final

#### Funcionalidades Críticas
- [ ] ✅ Criar registro de sono
- [ ] ✅ Editar registro existente  
- [ ] ✅ Marcar "acordar agora"
- [ ] ✅ Visualizar gráfico semanal
- [ ] ✅ Configurar lembretes
- [ ] ✅ Ativar/desativar lembretes
- [ ] ✅ Export/import de dados
- [ ] ✅ Funcionamento offline (cache)

#### Compatibilidade
- [ ] ✅ Supabase + Next.js (produção)
- [ ] ✅ FastAPI + Next.js (desenvolvimento)
- [ ] ✅ Migração de dados localStorage
- [ ] ✅ Rollback para localStorage se necessário

#### Performance
- [ ] ✅ Tempo de carregamento < 2s
- [ ] ✅ Operações CRUD < 500ms
- [ ] ✅ Sincronização de dados
- [ ] ✅ Cache otimizado

---

## 📊 Cronograma Estimado

| Fase | Duração | Recursos | Prioridade |
|------|---------|----------|------------|
| Fase 1 | 1-2 semanas | 1 Backend Dev | Alta |
| Fase 2 | 2-3 semanas | 1 Frontend Dev | Alta |
| Fase 3 | 1 semana | 1 Fullstack Dev | Crítica |
| Fase 4 | 1-2 semanas | Time completo | Alta |

**Total Estimado:** 5-8 semanas

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados durante migração | Baixa | Alto | Backup obrigatório + validação |
| Incompatibilidade entre ambientes | Média | Médio | Testes cruzados contínuos |
| Performance degradada | Média | Médio | Cache + otimização SQL |
| Regressão de funcionalidades | Alta | Médio | Testes E2E + rollback plan |

---

**Última atualização:** $(date)  
**Status:** 📋 Planejamento Completo  
**Próximo passo:** Aprovação e início da Fase 1