# 📋 Plano de Migração: Módulo de Autoconhecimento
## Do localStorage para Arquitetura Dual (Supabase + FastAPI)

---

## 🔍 1. Relatório de Auditoria do localStorage

### 1.1 Inventário de Chaves e Dados

**Chave Principal:** `autoconhecimento-storage`

**Estrutura de Dados Armazenados:**
```json
{
  "state": {
    "notas": [
      {
        "id": "string",
        "titulo": "string",
        "conteudo": "string", 
        "secao": "quem-sou" | "meus-porques" | "meus-padroes",
        "tags": ["string"],
        "dataCriacao": "ISO-8601",
        "dataAtualizacao": "ISO-8601",
        "imagemUrl": "string" // opcional
      }
    ],
    "modoRefugio": "boolean"
  },
  "version": 0
}
```

### 1.2 Componentes Dependentes

| Componente | Arquivo | Dependências |
|------------|---------|--------------|
| **AutoconhecimentoPage** | `/app/autoconhecimento/page.tsx` | `useAutoconhecimentoStore` |
| **EditorNotas** | `/app/components/autoconhecimento/EditorNotas.tsx` | Store completo |
| **ListaNotas** | `/app/components/autoconhecimento/ListaNotas.tsx` | Store (leitura/busca) |
| **ModoRefugio** | `/app/components/autoconhecimento/ModoRefugio.tsx` | Store (modoRefugio) |
| **DataService** | `/app/lib/dataService.ts` | Exportação/Importação |

### 1.3 Operações Identificadas

- ✅ **CRUD Notas:** Criar, Ler, Atualizar, Excluir
- ✅ **Busca:** Por título, conteúdo, tags
- ✅ **Filtragem:** Por seção
- ✅ **Tags:** Adicionar/Remover tags dinâmicas
- ✅ **Imagens:** Upload/Remoção de URLs de imagem
- ✅ **Configuração:** Toggle de modo refúgio

---

## 🗄️ 2. Esquema de Banco de Dados Unificado (SQL)

### 2.1 Tabelas Principais

```sql
-- Tabela de usuários (base para ambos os ambientes)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de preferências do usuário
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module, preference_key)
);

-- Tabela de notas de autoconhecimento
CREATE TABLE autoconhecimento_notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    secao VARCHAR(20) NOT NULL CHECK (secao IN ('quem-sou', 'meus-porques', 'meus-padroes')),
    imagem_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tags para notas
CREATE TABLE autoconhecimento_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_id UUID NOT NULL REFERENCES autoconhecimento_notas(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(nota_id, tag)
);
```

### 2.2 Índices para Performance

```sql
-- Índices para busca eficiente
CREATE INDEX idx_autoconhecimento_notas_user_id ON autoconhecimento_notas(user_id);
CREATE INDEX idx_autoconhecimento_notas_secao ON autoconhecimento_notas(user_id, secao);
CREATE INDEX idx_autoconhecimento_notas_titulo ON autoconhecimento_notas USING gin(to_tsvector('portuguese', titulo));
CREATE INDEX idx_autoconhecimento_notas_conteudo ON autoconhecimento_notas USING gin(to_tsvector('portuguese', conteudo));
CREATE INDEX idx_autoconhecimento_tags_nota_id ON autoconhecimento_tags(nota_id);
CREATE INDEX idx_autoconhecimento_tags_tag ON autoconhecimento_tags(tag);
CREATE INDEX idx_user_preferences_lookup ON user_preferences(user_id, module, preference_key);
```

### 2.3 Triggers e Funções

```sql
-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autoconhecimento_notas_updated_at BEFORE UPDATE ON autoconhecimento_notas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 3. Contrato de API

### 3.1 Autenticação

#### `POST /auth/login`
```json
// Request
{
    "email": "usuario@exemplo.com",
    "password": "senha123"
}

// Response 200
{
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "user": {
        "id": "uuid",
        "email": "usuario@exemplo.com"
    }
}

// Response 401
{
    "error": "Credenciais inválidas",
    "code": "INVALID_CREDENTIALS"
}
```

#### `POST /auth/refresh`
```json
// Request
{
    "refresh_token": "refresh_token_here"
}

// Response 200
{
    "access_token": "new_jwt_token_here"
}
```

### 3.2 Notas de Autoconhecimento

#### `GET /autoconhecimento/notas`
```json
// Query Parameters: ?secao=quem-sou&search=termo&limit=50&offset=0

// Response 200
{
    "notas": [
        {
            "id": "uuid",
            "titulo": "Minha personalidade",
            "conteudo": "Sou uma pessoa...",
            "secao": "quem-sou",
            "tags": ["introspectivo", "analítico"],
            "imagem_url": "https://exemplo.com/imagem.jpg",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-16T14:20:00Z"
        }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
}
```

#### `POST /autoconhecimento/notas`
```json
// Request
{
    "titulo": "Nova nota",
    "conteudo": "Conteúdo da nota...",
    "secao": "meus-porques",
    "tags": ["motivação", "valores"],
    "imagem_url": "https://exemplo.com/imagem.jpg" // opcional
}

// Response 201
{
    "id": "uuid",
    "titulo": "Nova nota",
    "conteudo": "Conteúdo da nota...",
    "secao": "meus-porques",
    "tags": ["motivação", "valores"],
    "imagem_url": "https://exemplo.com/imagem.jpg",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}

// Response 400
{
    "error": "Dados inválidos",
    "details": {
        "titulo": ["Campo obrigatório"],
        "secao": ["Valor deve ser: quem-sou, meus-porques ou meus-padroes"]
    }
}
```

#### `PUT /autoconhecimento/notas/{id}`
```json
// Request
{
    "titulo": "Título atualizado",
    "conteudo": "Conteúdo atualizado...",
    "tags": ["nova-tag"],
    "imagem_url": null
}

// Response 200
{
    "id": "uuid",
    "titulo": "Título atualizado",
    "conteudo": "Conteúdo atualizado...",
    "secao": "quem-sou",
    "tags": ["nova-tag"],
    "imagem_url": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z"
}

// Response 404
{
    "error": "Nota não encontrada",
    "code": "NOTE_NOT_FOUND"
}
```

#### `DELETE /autoconhecimento/notas/{id}`
```json
// Response 204 (sem corpo)

// Response 404
{
    "error": "Nota não encontrada",
    "code": "NOTE_NOT_FOUND"
}
```

### 3.3 Preferências do Usuário

#### `GET /user/preferences/{module}`
```json
// Response 200
{
    "autoconhecimento": {
        "modo_refugio": false,
        "exibir_datas": true,
        "cards_por_pagina": 10
    }
}
```

#### `PUT /user/preferences/{module}`
```json
// Request
{
    "modo_refugio": true,
    "exibir_datas": false
}

// Response 200
{
    "autoconhecimento": {
        "modo_refugio": true,
        "exibir_datas": false,
        "cards_por_pagina": 10
    }
}
```

### 3.4 Códigos de Status Padronizados

| Código | Descrição | Uso |
|--------|-----------|-----|
| `200` | OK | Operações de leitura e atualização bem-sucedidas |
| `201` | Created | Criação de recursos |
| `204` | No Content | Deleção bem-sucedida |
| `400` | Bad Request | Dados inválidos na requisição |
| `401` | Unauthorized | Token inválido/expirado |
| `403` | Forbidden | Usuário sem permissão |
| `404` | Not Found | Recurso não encontrado |
| `422` | Unprocessable Entity | Validação de dados falhou |
| `429` | Too Many Requests | Rate limiting |
| `500` | Internal Server Error | Erro interno do servidor |

---

## 🚀 4. Plano de Migração Dual-Track

### 4.1 Priorização MoSCoW

#### **MUST HAVE (Essencial)**
- ✅ Migração completa das notas existentes
- ✅ CRUD de notas com autenticação
- ✅ Sistema de tags funcional
- ✅ Busca por título/conteúdo
- ✅ Filtro por seção
- ✅ Preservação de datas de criação/atualização

#### **SHOULD HAVE (Importante)**
- ✅ Sync bidirecional entre ambientes
- ✅ Modo refúgio persistente
- ✅ Upload de imagens para Supabase Storage
- ✅ Backup/restore automático
- ✅ Validação robusta de dados

#### **COULD HAVE (Desejável)**
- ⚠️ Busca avançada com PostgreSQL Full-Text Search
- ⚠️ Versionamento de notas
- ⚠️ Colaboração entre usuários
- ⚠️ Exportação para outros formatos (PDF, Markdown)

#### **WON'T HAVE (Não implementar agora)**
- ❌ Integração com IA para análise de padrões
- ❌ Sistema de comentários em notas
- ❌ Notificações push

### 4.2 Etapas de Migração

#### **Fase 1: Preparação (Semana 1)**

**Backend FastAPI Local:**
```bash
# 1.1 Setup do ambiente
mkdir stayfocus-api && cd stayfocus-api
python -m venv venv
source venv/bin/activate
pip install fastapi sqlalchemy alembic psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart

# 1.2 Estrutura de diretórios
mkdir -p {app,app/models,app/routers,app/core,app/crud,app/schemas,migrations}
```

**Frontend Next.js:**
```typescript
// 1.3 Criar abstração de dados
// app/lib/api-client.ts
interface ApiClient {
  autoconhecimento: {
    getNotas: (filters?) => Promise<Nota[]>
    createNota: (data) => Promise<Nota>
    updateNota: (id, data) => Promise<Nota>
    deleteNota: (id) => Promise<void>
  }
}

// 1.4 Implementações específicas
class SupabaseApiClient implements ApiClient { }
class FastApiClient implements ApiClient { }
```

#### **Fase 2: Implementação Backend (Semana 2-3)**

**FastAPI Models:**
```python
# app/models/autoconhecimento.py
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

class AutoconhecimentoNota(Base):
    __tablename__ = "autoconhecimento_notas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    conteudo = Column(Text, nullable=False)
    secao = Column(String(20), nullable=False)
    imagem_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    tags = relationship("AutoconhecimentoTag", back_populates="nota")
```

**FastAPI Routes:**
```python
# app/routers/autoconhecimento.py
@router.get("/notas", response_model=NotasResponse)
async def get_notas(
    secao: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    return await crud.get_notas_by_user(
        db, user_id=current_user.id, 
        secao=secao, search=search, 
        limit=limit, offset=offset
    )
```

#### **Fase 3: Supabase Setup (Semana 3)**

**Schema SQL:**
```sql
-- Execute no Supabase SQL Editor
-- (Usar o schema definido na seção 2)

-- RLS Policies
ALTER TABLE autoconhecimento_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notas" ON autoconhecimento_notas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notas" ON autoconhecimento_notas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notas" ON autoconhecimento_notas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notas" ON autoconhecimento_notas
    FOR DELETE USING (auth.uid() = user_id);
```

#### **Fase 4: Migração de Dados (Semana 4)**

**Script de Migração:**
```typescript
// app/lib/migration.ts
export async function migrateAutoconhecimentoData() {
  const localData = localStorage.getItem('autoconhecimento-storage')
  if (!localData) return { success: true, message: 'Nenhum dado local encontrado' }
  
  const parsed = JSON.parse(localData)
  const { notas, modoRefugio } = parsed.state
  
  try {
    // Migrar notas
    for (const nota of notas) {
      await apiClient.autoconhecimento.createNota({
        titulo: nota.titulo,
        conteudo: nota.conteudo,
        secao: nota.secao,
        tags: nota.tags,
        imagem_url: nota.imagemUrl,
        // Preservar timestamps originais se possível
        created_at: nota.dataCriacao,
        updated_at: nota.dataAtualizacao
      })
    }
    
    // Migrar preferências
    await apiClient.user.updatePreferences('autoconhecimento', {
      modo_refugio: modoRefugio
    })
    
    // Criar backup antes de limpar
    await createLocalBackup()
    
    // Limpar localStorage apenas após confirmação
    localStorage.removeItem('autoconhecimento-storage')
    
    return { success: true, message: `${notas.length} notas migradas com sucesso` }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

#### **Fase 5: Adaptação Frontend (Semana 5)**

**Store Refatorado:**
```typescript
// app/stores/autoconhecimentoStore.ts
export const useAutoconhecimentoStore = create<AutoconhecimentoState>((set, get) => ({
  notas: [],
  modoRefugio: false,
  loading: false,
  
  // Carregar dados do backend
  loadNotas: async (secao?: string, search?: string) => {
    set({ loading: true })
    try {
      const notas = await apiClient.autoconhecimento.getNotas({ secao, search })
      set({ notas, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  
  // Criar nota no backend
  adicionarNota: async (titulo, conteudo, secao, tags, imagemUrl) => {
    const nota = await apiClient.autoconhecimento.createNota({
      titulo, conteudo, secao, tags, imagem_url: imagemUrl
    })
    
    set((state) => ({
      notas: [...state.notas, nota]
    }))
    
    return nota.id
  },
  
  // Outros métodos adaptados...
}))
```

### 4.3 Configuração de Ambiente

**Environment Variables:**
```bash
# .env.local
# Desenvolvimento
DATABASE_URL="postgresql://user:pass@localhost:5432/stayfocus"
API_BASE_URL="http://localhost:8000"
AUTH_PROVIDER="local"

# Produção
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
AUTH_PROVIDER="supabase"
```

**Client Selector:**
```typescript
// app/lib/api-factory.ts
export const createApiClient = (): ApiClient => {
  const provider = process.env.AUTH_PROVIDER || 'local'
  
  switch (provider) {
    case 'supabase':
      return new SupabaseApiClient()
    case 'local':
      return new FastApiClient()
    default:
      throw new Error(`Provedor desconhecido: ${provider}`)
  }
}
```

### 4.4 Checklist de Migração

#### **Pré-Migração**
- [ ] ✅ Backup completo dos dados do localStorage
- [ ] ✅ Configuração do ambiente de desenvolvimento
- [ ] ✅ Testes de conectividade com ambos os backends
- [ ] ✅ Validação do schema do banco de dados

#### **Durante a Migração**
- [ ] ✅ Execução do script de migração de dados
- [ ] ✅ Verificação da integridade dos dados migrados
- [ ] ✅ Testes de funcionalidade CRUD
- [ ] ✅ Validação de busca e filtros
- [ ] ✅ Teste de autenticação e autorização

#### **Pós-Migração**
- [ ] ✅ Remoção segura dos dados do localStorage
- [ ] ✅ Configuração de backup automático
- [ ] ✅ Monitoramento de performance
- [ ] ✅ Documentação para usuários finais
- [ ] ✅ Plano de rollback (se necessário)

### 4.5 Considerações de Segurança

**Autenticação:**
- ✅ JWT tokens com expiração adequada
- ✅ Refresh tokens seguros
- ✅ Rate limiting nos endpoints de autenticação

**Autorização:**
- ✅ RLS (Row Level Security) no Supabase
- ✅ Middleware de autorização no FastAPI
- ✅ Validação de propriedade de recursos

**Dados:**
- ✅ Validação de entrada rigorosa
- ✅ Sanitização de dados de texto
- ✅ Validação de URLs de imagem
- ✅ Backup criptografado

---

## 📊 5. Métricas de Sucesso

### 5.1 Indicadores Técnicos
- **Migração de Dados:** 100% das notas migradas sem perda
- **Performance:** Tempo de resposta < 200ms para operações CRUD
- **Disponibilidade:** 99.9% uptime em produção
- **Sincronização:** Consistência entre ambientes de dev/prod

### 5.2 Indicadores de Usuário
- **Zero Perda de Dados:** Todas as notas preservadas
- **Funcionalidade Mantida:** Todos os recursos funcionando
- **Performance Percebida:** Interface responsiva
- **Experiência:** Transição transparente para o usuário

---

**📅 Cronograma Total Estimado:** 5-6 semanas
**🔧 Esforço Técnico:** Médio-Alto
**⚠️ Risco:** Baixo (com backup adequado)
**👥 Recursos Necessários:** 1 desenvolvedor full-stack

---

*Este plano serve como base para a migração completa do módulo de autoconhecimento, garantindo uma transição segura e eficiente do localStorage para uma arquitetura de dados moderna e escalável.*