# API Documentation - StayFocus Hiperfocos

## Visão Geral

Esta documentação descreve as APIs REST para o módulo de hiperfocos do StayFocus. Todas as APIs implementam Row Level Security (RLS) e requerem autenticação do usuário.

## Base URL
```
/api
```

## Autenticação

Todas as APIs requerem o `user_id` para identificar o usuário autenticado. Em produção, isso deve ser obtido do token JWT do Supabase.

---

## 📋 Hiperfocos

### GET /api/hiperfocos
Lista hiperfocos do usuário.

**Query Parameters:**
- `user_id` (required): ID do usuário
- `status` (optional): Filtrar por status (`ativo`, `pausado`, `concluido`, `arquivado`, `all`)
- `limit` (optional): Limite de resultados (default: 50)
- `offset` (optional): Offset para paginação (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Meu Hiperfoco",
      "descricao": "Descrição opcional",
      "cor": "#FF5252",
      "tempo_limite": 60,
      "status": "ativo",
      "data_criacao": "2024-01-01T00:00:00Z",
      "tarefas": [
        {
          "id": "uuid",
          "texto": "Tarefa principal",
          "concluida": false,
          "ordem": 0,
          "nivel": 0,
          "subtarefas": []
        }
      ]
    }
  ],
  "count": 1
}
```

### POST /api/hiperfocos
Cria novo hiperfoco.

**Body:**
```json
{
  "user_id": "uuid",
  "titulo": "Novo Hiperfoco",
  "descricao": "Descrição opcional",
  "cor": "#FF5252",
  "tempo_limite": 60
}
```

### GET /api/hiperfocos/[id]
Busca hiperfoco específico.

**Query Parameters:**
- `user_id` (required): ID do usuário

### PUT /api/hiperfocos/[id]
Atualiza hiperfoco.

**Body:**
```json
{
  "user_id": "uuid",
  "titulo": "Título atualizado",
  "status": "pausado"
}
```

### DELETE /api/hiperfocos/[id]
Deleta hiperfoco e todas suas tarefas.

**Body:**
```json
{
  "user_id": "uuid"
}
```

---

## ✅ Tarefas

### GET /api/tarefas
Lista tarefas de um hiperfoco.

**Query Parameters:**
- `hiperfoco_id` (required): ID do hiperfoco
- `user_id` (required): ID do usuário
- `parent_id` (optional): Filtrar por tarefa pai (`null` para principais)
- `nivel` (optional): Filtrar por nível hierárquico

### POST /api/tarefas
Cria nova tarefa.

**Body:**
```json
{
  "hiperfoco_id": "uuid",
  "user_id": "uuid",
  "texto": "Nova tarefa",
  "parent_id": "uuid",
  "cor": "#FF5252",
  "ordem": 0
}
```

### GET /api/tarefas/[id]
Busca tarefa específica com subtarefas.

**Query Parameters:**
- `user_id` (required): ID do usuário

### PUT /api/tarefas/[id]
Atualiza tarefa.

**Body:**
```json
{
  "user_id": "uuid",
  "texto": "Texto atualizado",
  "concluida": true,
  "parent_id": "uuid"
}
```

### DELETE /api/tarefas/[id]
Deleta tarefa e todas suas subtarefas.

**Body:**
```json
{
  "user_id": "uuid"
}
```

### PATCH /api/tarefas/[id]/toggle
Alterna status de conclusão da tarefa.

**Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "data": { /* tarefa atualizada */ },
  "message": "Tarefa concluída com sucesso"
}
```

---

## ⏱️ Sessões de Alternância

### GET /api/sessoes
Lista sessões do usuário.

**Query Parameters:**
- `user_id` (required): ID do usuário
- `concluida` (optional): Filtrar por status (`true`, `false`, `all`)
- `limit` (optional): Limite de resultados (default: 50)
- `offset` (optional): Offset para paginação (default: 0)
- `order_by` (optional): Campo para ordenação (`tempo_inicio`, `created_at`, `duracao_estimada`, `titulo`)
- `order_direction` (optional): Direção da ordenação (`asc`, `desc`)

### POST /api/sessoes
Cria nova sessão.

**Body:**
```json
{
  "user_id": "uuid",
  "titulo": "Sessão de Foco",
  "hiperfoco_atual": "uuid",
  "duracao_estimada": 25,
  "tempo_inicio": "2024-01-01T00:00:00Z"
}
```

### GET /api/sessoes/[id]
Busca sessão específica.

**Query Parameters:**
- `user_id` (required): ID do usuário

### PUT /api/sessoes/[id]
Atualiza sessão.

**Body:**
```json
{
  "user_id": "uuid",
  "titulo": "Título atualizado",
  "hiperfoco_atual": "uuid",
  "duracao_estimada": 30
}
```

### DELETE /api/sessoes/[id]
Deleta sessão.

**Body:**
```json
{
  "user_id": "uuid"
}
```

### PATCH /api/sessoes/[id]/finalizar
Finaliza sessão calculando duração real.

**Body:**
```json
{
  "user_id": "uuid",
  "duracao_real": 28
}
```

**Response:**
```json
{
  "data": { /* sessão atualizada */ },
  "estatisticas": {
    "duracao_estimada": 25,
    "duracao_real": 28,
    "diferenca": 3,
    "eficiencia": 89,
    "status": "excedeu"
  },
  "message": "Sessão finalizada com sucesso"
}
```

---

## 🔒 Segurança

### Row Level Security (RLS)
- Todas as tabelas implementam RLS
- Usuários só podem acessar seus próprios dados
- Políticas automáticas verificam `auth.uid() = user_id`

### Validações
- **Cores**: Formato hexadecimal `#RRGGBB`
- **Títulos**: Máximo 255 caracteres
- **Texto de tarefas**: Máximo 500 caracteres
- **Hierarquia**: Máximo 5 níveis de subtarefas
- **Durações**: Valores positivos em minutos

### Códigos de Status HTTP
- `200`: Sucesso
- `201`: Criado com sucesso
- `204`: Deletado com sucesso
- `400`: Erro de validação
- `403`: Acesso negado
- `404`: Recurso não encontrado
- `405`: Método não permitido
- `500`: Erro interno do servidor

---

## 📊 Estrutura do Banco

### Tabelas Principais
- `hiperfocos`: Hiperfocos dos usuários
- `tarefas`: Tarefas hierárquicas
- `sessoes_alternancia`: Sessões de foco

### Relacionamentos
- `tarefas.hiperfoco_id` → `hiperfocos.id` (CASCADE)
- `tarefas.parent_id` → `tarefas.id` (CASCADE)
- `sessoes_alternancia.hiperfoco_atual` → `hiperfocos.id` (SET NULL)
- `sessoes_alternancia.hiperfoco_anterior` → `hiperfocos.id` (SET NULL)

### Índices
- Otimizados para consultas por `user_id`
- Índices compostos para filtros comuns
- Índices para ordenação por `ordem` e `data_criacao`
