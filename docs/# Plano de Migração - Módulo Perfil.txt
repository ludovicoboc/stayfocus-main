# Plano de Migração - Módulo Perfil

## 📋 Relatório de Auditoria do localStorage

### Inventário de Chaves e Dados Armazenados

#### 1. `perfil-storage` (perfilStore.ts)
**Componentes dependentes:**
- `InformacoesPessoais.tsx`
- `MetasDiarias.tsx`
- `PreferenciasVisuais.tsx`
- `PerfilPage.tsx`

**Estrutura de dados:**
```typescript
{
  nome: string,                    // Nome do usuário (padrão: "Usuário")
  preferenciasVisuais: {
    altoContraste: boolean,        // Modo alto contraste
    reducaoEstimulos: boolean,     // Redução de estímulos visuais
    textoGrande: boolean          // Texto aumentado
  },
  metasDiarias: {
    horasSono: number,            // Horas ideais de sono (padrão: 8)
    tarefasPrioritarias: number,  // Tarefas prioritárias/dia (padrão: 3)
    coposAgua: number,            // Copos de água/dia (padrão: 8)
    pausasProgramadas: number     // Pausas programadas/dia (padrão: 4)
  },
  notificacoesAtivas: boolean,    // Status dos lembretes (padrão: true)
  pausasAtivas: boolean          // Status das pausas programadas (padrão: true)
}
```

#### 2. `data-transfer-storage` (dataTransferStore.ts)
**Componentes dependentes:**
- `ExportarImportarDados.tsx`

**Estrutura de dados:**
```typescript
{
  status: 'idle' | 'exporting' | 'importing' | 'success' | 'error',
  mensagem: string,
  ultimaExportacao: string | null,   // ISO timestamp da última exportação
  ultimaImportacao: string | null    // ISO timestamp da última importação
}
```

### Dependências Críticas
- **Zustand**: Biblioteca de gerenciamento de estado
- **Zustand/middleware/persist**: Middleware para persistência no localStorage
- **Sincronização DOM**: Preferências visuais aplicam classes CSS ao `document.documentElement`

---

## 🗃️ Esquema de Banco de Dados Unificado (SQL)

```sql
-- Tabela de usuários (base para autenticação)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabela de perfis de usuário
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL DEFAULT 'Usuário',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Tabela de preferências visuais
CREATE TABLE user_visual_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alto_contraste BOOLEAN NOT NULL DEFAULT FALSE,
    reducao_estimulos BOOLEAN NOT NULL DEFAULT FALSE,
    texto_grande BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Tabela de metas diárias
CREATE TABLE user_daily_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    horas_sono INTEGER NOT NULL DEFAULT 8 CHECK (horas_sono >= 4 AND horas_sono <= 12),
    tarefas_prioritarias INTEGER NOT NULL DEFAULT 3 CHECK (tarefas_prioritarias >= 1 AND tarefas_prioritarias <= 7),
    copos_agua INTEGER NOT NULL DEFAULT 8 CHECK (copos_agua >= 2 AND copos_agua <= 15),
    pausas_programadas INTEGER NOT NULL DEFAULT 4 CHECK (pausas_programadas >= 2 AND pausas_programadas <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Tabela de configurações gerais
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notificacoes_ativas BOOLEAN NOT NULL DEFAULT TRUE,
    pausas_ativas BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Tabela de log de transferência de dados
CREATE TABLE user_data_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('exportacao', 'importacao')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('idle', 'exporting', 'importing', 'success', 'error')),
    mensagem TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_visual_preferences_user_id ON user_visual_preferences(user_id);
CREATE INDEX idx_daily_goals_user_id ON user_daily_goals(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_data_transfers_user_id ON user_data_transfers(user_id);
CREATE INDEX idx_data_transfers_created_at ON user_data_transfers(created_at DESC);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visual_preferences_updated_at BEFORE UPDATE ON user_visual_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON user_daily_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🌐 Contrato de API (OpenAPI/Swagger Simplificado)

### Autenticação
```markdown
POST /auth/login
POST /auth/logout
GET /auth/profile
```

### Endpoints do Perfil

#### **GET /api/v1/profile**
**Descrição:** Obter perfil completo do usuário

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "nome": "João Silva",
    "preferenciasVisuais": {
      "altoContraste": false,
      "reducaoEstimulos": true,
      "textoGrande": false
    },
    "metasDiarias": {
      "horasSono": 8,
      "tarefasPrioritarias": 3,
      "coposAgua": 8,
      "pausasProgramadas": 4
    },
    "configuracoes": {
      "notificacoesAtivas": true,
      "pausasAtivas": true
    },
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Códigos de Erro:**
- `401`: Não autorizado
- `404`: Perfil não encontrado
- `500`: Erro interno do servidor

---

#### **PUT /api/v1/profile/basic-info**
**Descrição:** Atualizar informações básicas do perfil

**Payload da Requisição:**
```json
{
  "nome": "João Silva Atualizado"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Informações básicas atualizadas com sucesso",
  "data": {
    "nome": "João Silva Atualizado",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Códigos de Erro:**
- `400`: Dados inválidos (nome muito longo, etc.)
- `401`: Não autorizado
- `422`: Validação falhou

---

#### **PUT /api/v1/profile/visual-preferences**
**Descrição:** Atualizar preferências visuais

**Payload da Requisição:**
```json
{
  "altoContraste": true,
  "reducaoEstimulos": false,
  "textoGrande": true
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Preferências visuais atualizadas com sucesso",
  "data": {
    "preferenciasVisuais": {
      "altoContraste": true,
      "reducaoEstimulos": false,
      "textoGrande": true
    },
    "updatedAt": "2024-01-15T10:40:00Z"
  }
}
```

---

#### **PUT /api/v1/profile/daily-goals**
**Descrição:** Atualizar metas diárias

**Payload da Requisição:**
```json
{
  "horasSono": 9,
  "tarefasPrioritarias": 4,
  "coposAgua": 10,
  "pausasProgramadas": 5
}
```

**Validações:**
- `horasSono`: 4-12
- `tarefasPrioritarias`: 1-7
- `coposAgua`: 2-15
- `pausasProgramadas`: 2-10

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Metas diárias atualizadas com sucesso",
  "data": {
    "metasDiarias": {
      "horasSono": 9,
      "tarefasPrioritarias": 4,
      "coposAgua": 10,
      "pausasProgramadas": 5
    },
    "updatedAt": "2024-01-15T10:45:00Z"
  }
}
```

---

#### **PUT /api/v1/profile/settings**
**Descrição:** Atualizar configurações gerais

**Payload da Requisição:**
```json
{
  "notificacoesAtivas": false,
  "pausasAtivas": true
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Configurações atualizadas com sucesso",
  "data": {
    "configuracoes": {
      "notificacoesAtivas": false,
      "pausasAtivas": true
    },
    "updatedAt": "2024-01-15T10:50:00Z"
  }
}
```

---

#### **POST /api/v1/profile/reset**
**Descrição:** Resetar perfil para valores padrão

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Perfil resetado para valores padrão",
  "data": {
    "nome": "Usuário",
    "preferenciasVisuais": {
      "altoContraste": false,
      "reducaoEstimulos": false,
      "textoGrande": false
    },
    "metasDiarias": {
      "horasSono": 8,
      "tarefasPrioritarias": 3,
      "coposAgua": 8,
      "pausasProgramadas": 4
    },
    "configuracoes": {
      "notificacoesAtivas": true,
      "pausasAtivas": true
    },
    "updatedAt": "2024-01-15T10:55:00Z"
  }
}
```

---

### Endpoints de Transferência de Dados

#### **GET /api/v1/data-transfer/history**
**Descrição:** Obter histórico de transferências

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "ultimaExportacao": "2024-01-15T09:30:00Z",
    "ultimaImportacao": "2024-01-14T15:20:00Z",
    "historico": [
      {
        "tipo": "exportacao",
        "status": "success",
        "mensagem": "Dados exportados com sucesso",
        "createdAt": "2024-01-15T09:30:00Z"
      }
    ]
  }
}
```

#### **POST /api/v1/data-transfer/log**
**Descrição:** Registrar evento de transferência

**Payload da Requisição:**
```json
{
  "tipo": "exportacao",
  "status": "success",
  "mensagem": "Dados exportados com sucesso"
}
```

---

## 🚀 Plano de Migração Dual-Track

### Fase 1: Preparação (1-2 dias)

#### ✅ Checklist Frontend
- [ ] **Criar tipos TypeScript para API**
  - Definir interfaces para requests/responses
  - Tipagem para estados de loading/error
  
- [ ] **Implementar cliente HTTP**
  - Configurar Axios ou fetch personalizado
  - Interceptors para autenticação
  - Tratamento de erros padronizado

- [ ] **Criar hooks personalizados**
  - `useProfile()` - gerenciamento do perfil
  - `useApiProfile()` - chamadas API
  - `useLocalProfile()` - fallback localStorage

#### ✅ Checklist Backend
- [ ] **Supabase (Produção)**
  - Executar migrations do esquema SQL
  - Configurar Row Level Security (RLS)
  - Testes de conectividade

- [ ] **FastAPI (Desenvolvimento)**
  - Setup inicial do projeto
  - Configurar SQLAlchemy + Alembic
  - Implementar endpoints da API
  - Configurar PostgreSQL local

### Fase 2: Implementação Dual-Store (2-3 dias)

#### ✅ Modificações nos Stores Zustand
- [ ] **Adaptar perfilStore.ts**
  ```typescript
  export const usePerfilStore = create<PerfilState>()(
    persist(
      (set, get) => ({
        // ... estado atual
        
        // Novos métodos para sincronização
        syncWithAPI: async () => {
          if (isOnline && isAuthenticated) {
            const profile = await fetchProfile();
            set(profile);
          }
        },
        
        // Wrapper para ações que sincronizam
        atualizarNomeSync: async (nome) => {
          set({ nome }); // Atualização local imediata
          if (isOnline && isAuthenticated) {
            await updateProfileBasicInfo({ nome });
          }
        }
      }),
      {
        name: 'perfil-storage',
        // Manter persistência local como fallback
      }
    )
  );
  ```

- [ ] **Implementar lógica de sincronização**
  - Detectar conectividade online/offline
  - Queue de operações pendentes
  - Resolução de conflitos (last-write-wins)

#### ✅ Componentes - Transição Gradual
- [ ] **InformacoesPessoais.tsx**
  ```typescript
  const { nome, atualizarNomeSync, isLoading } = usePerfilStore();
  
  const handleSave = async () => {
    setLoading(true);
    try {
      await atualizarNomeSync(novoNome);
      // Feedback de sucesso
    } catch (error) {
      // Fallback para localStorage, mostrar aviso
    } finally {
      setLoading(false);
    }
  };
  ```

- [ ] **Implementar estados de loading/error**
- [ ] **Feedback visual para sincronização**

### Fase 3: Configuração de Ambiente (1 dia)

#### ✅ Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_ENVIRONMENT=development # ou production
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Para desenvolvimento local
DATABASE_URL=postgresql://user:pass@localhost:5432/stayfocus_dev
```

#### ✅ Configuração Condicional
```typescript
// lib/config.ts
export const apiConfig = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL 
    : process.env.NEXT_PUBLIC_API_BASE_URL,
    
  client: process.env.NODE_ENV === 'production'
    ? 'supabase'
    : 'fastapi'
};
```

### Fase 4: Migração de Dados (1 dia)

#### ✅ Script de Migração Inicial
- [ ] **Ler dados do localStorage**
- [ ] **Criar usuário no backend (se não existir)**
- [ ] **Transferir dados via API**
- [ ] **Validar integridade**
- [ ] **Backup dos dados originais**

```typescript
// scripts/migrate-profile-data.ts
export const migrateProfileData = async () => {
  const localProfile = localStorage.getItem('perfil-storage');
  if (!localProfile) return;
  
  const profileData = JSON.parse(localProfile);
  
  try {
    // Migrar nome
    await updateProfileBasicInfo({ nome: profileData.nome });
    
    // Migrar preferências
    await updateVisualPreferences(profileData.preferenciasVisuais);
    
    // Migrar metas
    await updateDailyGoals(profileData.metasDiarias);
    
    // Migrar configurações
    await updateSettings({
      notificacoesAtivas: profileData.notificacoesAtivas,
      pausasAtivas: profileData.pausasAtivas
    });
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
    // Manter dados locais como fallback
  }
};
```

### Fase 5: Testes e Validação (1 dia)

#### ✅ Cenários de Teste
- [ ] **Conectividade**
  - Online → Offline → Online
  - Sincronização após reconexão
  
- [ ] **Fallbacks**
  - Falha da API → usar localStorage
  - Dados inconsistentes → priorizar servidor
  
- [ ] **Performance**
  - Tempo de resposta das APIs
  - Cache local eficiente
  
- [ ] **UX**
  - Loading states apropriados
  - Mensagens de erro claras
  - Feedback de sincronização

### Fase 6: Deploy e Monitoramento (1 dia)

#### ✅ Checklist de Deploy
- [ ] **Configurar ambiente de produção**
- [ ] **Executar migrations no Supabase**
- [ ] **Configurar monitoring/alertas**
- [ ] **Deploy gradual (feature flags)**
- [ ] **Documentação para usuários**

---

## 📊 Estimativa de Esforço

| Fase | Duração | Responsabilidade |
|------|---------|------------------|
| Preparação | 1-2 dias | Frontend + Backend |
| Implementação Dual-Store | 2-3 dias | Frontend |
| Configuração Ambiente | 1 dia | DevOps + Backend |
| Migração de Dados | 1 dia | Frontend + Backend |
| Testes e Validação | 1 dia | QA + Frontend |
| Deploy e Monitoramento | 1 dia | DevOps |
| **Total** | **7-9 dias** | **Equipe Completa** |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados durante migração | Baixa | Alto | Backup obrigatório + rollback |
| Inconsistência entre ambientes | Média | Médio | Testes automatizados + validação |
| Performance degradada | Média | Médio | Cache local + lazy loading |
| Problemas de conectividade | Alta | Baixo | Fallback para localStorage |

---

## 🎯 Critérios de Sucesso

- [ ] **Funcionalidade**: Todos os recursos do perfil funcionam identicamente
- [ ] **Performance**: Tempo de resposta < 500ms para operações locais
- [ ] **Confiabilidade**: 99.9% uptime com fallbacks funcionais
- [ ] **UX**: Transições imperceptíveis para o usuário final
- [ ] **Data Integrity**: Zero perda de dados durante a migração