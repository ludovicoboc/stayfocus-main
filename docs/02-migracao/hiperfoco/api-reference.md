# 📚 API Reference - Sistema de Hiperfocos

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints de Hiperfocos](#endpoints-de-hiperfocos)
4. [Endpoints de Tarefas](#endpoints-de-tarefas)
5. [Sincronização Offline](#sincronização-offline)
6. [WebSocket Events](#websocket-events)
7. [Tipos TypeScript](#tipos-typescript)
8. [Códigos de Erro](#códigos-de-erro)

## 🌐 Visão Geral

A API do sistema de hiperfocos segue os padrões REST e utiliza JSON para comunicação. Todas as rotas requerem autenticação via JWT token do Supabase.

### Base URL
```
Desenvolvimento: http://localhost:3000/api
Produção: https://your-domain.com/api
```

### Headers Padrão
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

## 🔐 Autenticação

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1640995200
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}
```

## 🎯 Endpoints de Hiperfocos

### Listar Hiperfocos
```http
GET /hiperfocos?page=1&limit=10&status=ativo&search=react
```

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)
- `status` (opcional): Filtrar por status (`ativo`, `pausado`, `concluido`, `arquivado`)
- `search` (opcional): Buscar por título ou descrição
- `sort` (opcional): Ordenação (`created_at`, `updated_at`, `titulo`)
- `order` (opcional): Direção (`asc`, `desc`)

**Resposta:**
```json
{
  "hiperfocos": [
    {
      "id": "uuid",
      "userId": "uuid",
      "titulo": "Estudar React",
      "descricao": "Aprender hooks avançados",
      "tempoLimite": 120,
      "cor": "#FF5252",
      "status": "ativo",
      "tarefas": [
        {
          "id": "uuid",
          "hiperfocoId": "uuid",
          "parentId": null,
          "texto": "Ler documentação",
          "concluida": false,
          "ordem": 0,
          "createdAt": "2025-06-19T10:00:00Z",
          "updatedAt": "2025-06-19T10:00:00Z"
        }
      ],
      "createdAt": "2025-06-19T10:00:00Z",
      "updatedAt": "2025-06-19T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Obter Hiperfoco por ID
```http
GET /hiperfocos/{id}
```

**Resposta:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "titulo": "Estudar React",
  "descricao": "Aprender hooks avançados",
  "tempoLimite": 120,
  "cor": "#FF5252",
  "status": "ativo",
  "tarefas": [...],
  "estatisticas": {
    "totalTarefas": 5,
    "tarefasConcluidas": 2,
    "progresso": 40,
    "tempoGasto": 45
  },
  "createdAt": "2025-06-19T10:00:00Z",
  "updatedAt": "2025-06-19T10:00:00Z"
}
```

### Criar Hiperfoco
```http
POST /hiperfocos
Content-Type: application/json

{
  "titulo": "Estudar React",
  "descricao": "Aprender hooks avançados",
  "tempoLimite": 120,
  "cor": "#FF5252",
  "tarefas": [
    {
      "texto": "Ler documentação",
      "parentId": null
    },
    {
      "texto": "Fazer exercícios",
      "parentId": null
    }
  ]
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "titulo": "Estudar React",
  "descricao": "Aprender hooks avançados",
  "tempoLimite": 120,
  "cor": "#FF5252",
  "status": "ativo",
  "tarefas": [...],
  "createdAt": "2025-06-19T10:00:00Z",
  "updatedAt": "2025-06-19T10:00:00Z"
}
```

### Atualizar Hiperfoco
```http
PUT /hiperfocos/{id}
Content-Type: application/json

{
  "titulo": "Estudar React Avançado",
  "descricao": "Aprender hooks avançados e patterns",
  "tempoLimite": 180,
  "cor": "#E91E63",
  "status": "ativo"
}
```

### Atualizar Status do Hiperfoco
```http
PATCH /hiperfocos/{id}/status
Content-Type: application/json

{
  "status": "pausado"
}
```

### Deletar Hiperfoco
```http
DELETE /hiperfocos/{id}
```

**Resposta:**
```json
{
  "message": "Hiperfoco deletado com sucesso",
  "deletedId": "uuid"
}
```

## ✅ Endpoints de Tarefas

### Listar Tarefas de um Hiperfoco
```http
GET /hiperfocos/{hiperfocoId}/tarefas
```

### Criar Tarefa
```http
POST /hiperfocos/{hiperfocoId}/tarefas
Content-Type: application/json

{
  "texto": "Nova tarefa",
  "parentId": "uuid_opcional",
  "ordem": 0
}
```

### Atualizar Tarefa
```http
PUT /tarefas/{id}
Content-Type: application/json

{
  "texto": "Tarefa atualizada",
  "concluida": true,
  "ordem": 1
}
```

### Marcar Tarefa como Concluída
```http
PATCH /tarefas/{id}/toggle
```

### Reordenar Tarefas
```http
PATCH /hiperfocos/{hiperfocoId}/tarefas/reorder
Content-Type: application/json

{
  "tarefas": [
    {
      "id": "uuid1",
      "ordem": 0,
      "parentId": null
    },
    {
      "id": "uuid2",
      "ordem": 1,
      "parentId": "uuid1"
    }
  ]
}
```

### Deletar Tarefa
```http
DELETE /tarefas/{id}
```

## 🔄 Sincronização Offline

### Enviar Operações Offline
```http
POST /sync
Content-Type: application/json

{
  "operations": [
    {
      "id": "op_123",
      "type": "CREATE",
      "entity": "hiperfoco",
      "data": {
        "titulo": "Novo hiperfoco",
        "cor": "#FF5252"
      },
      "timestamp": "2025-06-19T10:00:00Z"
    },
    {
      "id": "op_124",
      "type": "UPDATE",
      "entity": "tarefa",
      "entityId": "uuid",
      "data": {
        "concluida": true
      },
      "timestamp": "2025-06-19T10:01:00Z"
    }
  ],
  "lastSync": "2025-06-19T09:00:00Z"
}
```

**Resposta:**
```json
{
  "conflicts": [
    {
      "operationId": "op_124",
      "type": "UPDATE_CONFLICT",
      "local": {
        "concluida": true,
        "updatedAt": "2025-06-19T10:01:00Z"
      },
      "server": {
        "concluida": false,
        "updatedAt": "2025-06-19T10:02:00Z"
      }
    }
  ],
  "resolved": [
    {
      "operationId": "op_123",
      "result": {
        "id": "uuid_novo",
        "titulo": "Novo hiperfoco",
        "cor": "#FF5252"
      }
    }
  ],
  "serverChanges": [
    {
      "type": "UPDATE",
      "entity": "hiperfoco",
      "entityId": "uuid",
      "data": {
        "titulo": "Título atualizado no servidor"
      },
      "timestamp": "2025-06-19T10:03:00Z"
    }
  ],
  "lastSync": "2025-06-19T10:05:00Z"
}
```

### Resolver Conflitos
```http
POST /sync/resolve
Content-Type: application/json

{
  "resolutions": [
    {
      "operationId": "op_124",
      "resolution": "USE_SERVER", // ou "USE_LOCAL" ou "MERGE"
      "mergedData": {
        "concluida": true,
        "texto": "Texto do servidor"
      }
    }
  ]
}
```

## 🔌 WebSocket Events

### Conectar
```javascript
const ws = new WebSocket('ws://localhost:3000/ws')

// Autenticar
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token'
}))
```

### Eventos Recebidos

#### Hiperfoco Criado
```json
{
  "type": "hiperfoco:created",
  "data": {
    "id": "uuid",
    "titulo": "Novo hiperfoco",
    "userId": "uuid"
  }
}
```

#### Hiperfoco Atualizado
```json
{
  "type": "hiperfoco:updated",
  "data": {
    "id": "uuid",
    "changes": {
      "titulo": "Título atualizado"
    }
  }
}
```

#### Tarefa Concluída
```json
{
  "type": "tarefa:completed",
  "data": {
    "id": "uuid",
    "hiperfocoId": "uuid",
    "concluida": true
  }
}
```

### Eventos Enviados

#### Entrar em Sala do Hiperfoco
```json
{
  "type": "join_room",
  "hiperfocoId": "uuid"
}
```

#### Sair da Sala
```json
{
  "type": "leave_room",
  "hiperfocoId": "uuid"
}
```

## 📝 Tipos TypeScript

### Interfaces Principais

```typescript
interface Hiperfoco {
  id: string
  userId: string
  titulo: string
  descricao?: string
  tempoLimite?: number
  cor: string
  status: 'ativo' | 'pausado' | 'concluido' | 'arquivado'
  tarefas: Tarefa[]
  createdAt: string
  updatedAt: string
}

interface Tarefa {
  id: string
  hiperfocoId: string
  parentId?: string
  texto: string
  concluida: boolean
  ordem: number
  createdAt: string
  updatedAt: string
}

interface CreateHiperfocoRequest {
  titulo: string
  descricao?: string
  tempoLimite?: number
  cor: string
  tarefas: CreateTarefaRequest[]
}

interface CreateTarefaRequest {
  texto: string
  parentId?: string
}

interface UpdateHiperfocoRequest {
  titulo?: string
  descricao?: string
  tempoLimite?: number
  cor?: string
  status?: HiperfocoStatus
}

interface PaginationParams {
  page?: number
  limit?: number
}

interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

interface OfflineOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: 'hiperfoco' | 'tarefa'
  entityId?: string
  data: any
  timestamp: string
}

interface SyncConflict {
  operationId: string
  type: 'UPDATE_CONFLICT' | 'DELETE_CONFLICT'
  local: any
  server: any
}
```

## ❌ Códigos de Erro

### Códigos HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token de autenticação inválido |
| 403 | Forbidden | Sem permissão para acessar recurso |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito de dados (ex: título duplicado) |
| 422 | Unprocessable Entity | Dados válidos mas não processáveis |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro interno do servidor |

### Códigos de Erro Customizados

```typescript
enum ErrorCodes {
  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MAX_LENGTH_EXCEEDED = 'MAX_LENGTH_EXCEEDED',
  
  // Autenticação
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Recursos
  HIPERFOCO_NOT_FOUND = 'HIPERFOCO_NOT_FOUND',
  TAREFA_NOT_FOUND = 'TAREFA_NOT_FOUND',
  DUPLICATE_TITLE = 'DUPLICATE_TITLE',
  
  // Sincronização
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  INVALID_OPERATION = 'INVALID_OPERATION',
  OPERATION_NOT_FOUND = 'OPERATION_NOT_FOUND',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Sistema
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

### Exemplos de Respostas de Erro

#### Erro de Validação
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "titulo",
        "code": "REQUIRED_FIELD",
        "message": "Título é obrigatório"
      },
      {
        "field": "cor",
        "code": "INVALID_FORMAT",
        "message": "Cor deve estar no formato hexadecimal"
      }
    ]
  }
}
```

#### Erro de Autorização
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Você não tem permissão para acessar este hiperfoco"
  }
}
```

#### Erro de Conflito
```json
{
  "error": {
    "code": "SYNC_CONFLICT",
    "message": "Conflito detectado durante sincronização",
    "details": {
      "conflicts": [
        {
          "operationId": "op_123",
          "type": "UPDATE_CONFLICT",
          "local": {...},
          "server": {...}
        }
      ]
    }
  }
}
```

---

**Nota**: Esta API está em desenvolvimento ativo. Consulte sempre a versão mais recente da documentação e utilize versionamento adequado em produção.
