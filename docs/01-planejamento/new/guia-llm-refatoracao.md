# 🤖 Guia de Melhores Práticas para LLMs - Refatoração StayFocus

## 📋 Visão Geral

Este documento fornece instruções detalhadas para LLMs continuarem o processo de refatoração e depuração dos módulos do projeto StayFocus, baseado na experiência bem-sucedida da migração do sistema de hiperfocos.

## 🎯 Contexto do Projeto

### Status Atual (Junho 2025)
- ✅ **Módulo Hiperfocos**: Refatoração completa e integração frontend-backend concluída
- ✅ **Arquitetura Base**: Next.js 14 + React Query + Supabase + TypeScript
- ✅ **Padrões Estabelecidos**: TDD, validação robusta, hooks customizados
- 🔄 **Próximos Módulos**: Sessões, Estatísticas, PWA, Autenticação

### Documentação de Referência
Consulte sempre a pasta `/docs/02-migracao/hiperfoco/` que contém:
- `arquitetura-completa.md` - Padrões arquiteturais
- `guia-implementacao.md` - Guia detalhado (1078 linhas)
- `api-reference-implementada.md` - APIs funcionais
- `status-implementacao-completa.md` - Métricas e próximos passos

## 🏗️ Padrões Arquiteturais Estabelecidos

### 1. Estrutura de Pastas
```
app/
├── components/[modulo]/          # Componentes React
├── hooks/                        # Hooks React Query
├── lib/services/                 # Validações e utilitários
├── stores/                       # Zustand (legacy, migrar para React Query)
pages/api/[modulo]/              # APIs Next.js
```

### 2. Stack Tecnológica
- **Frontend**: React 18 + Next.js 14 + TypeScript
- **Estado**: React Query (TanStack Query) + Zustand (legacy)
- **Backend**: Next.js API Routes
- **Banco**: Supabase PostgreSQL + Row Level Security
- **Testes**: Jest + React Testing Library
- **Validação**: Zod + sanitização XSS

## 🔄 Processo de Refatoração por Módulo

### Fase 1: Análise e Planejamento (30 min)

#### 1.1 Análise do Estado Atual
```bash
# Comandos essenciais para análise
codebase-retrieval "componentes e hooks do módulo [NOME_MODULO]"
view app/components/[modulo]/
view app/stores/[modulo]Store.ts
diagnostics ["caminho/para/arquivos"]
```

#### 1.2 Identificação de Dependências
- **Stores Zustand**: Identificar quais precisam migrar para React Query
- **APIs Existentes**: Verificar se estão implementadas em `pages/api/`
- **Componentes**: Mapear dependências entre componentes
- **Testes**: Verificar cobertura atual

#### 1.3 Planejamento de Tarefas
Use as ferramentas de task management para organizar:
```markdown
- [ ] Análise do módulo atual
- [ ] Criação de hooks React Query
- [ ] Migração de componentes
- [ ] Implementação/correção de APIs
- [ ] Atualização de testes
- [ ] Validação da integração
```

### Fase 2: Implementação de APIs (1-2 horas)

#### 2.1 Padrão de APIs Next.js
Siga o padrão estabelecido em `pages/api/hiperfocos/`:

```typescript
// pages/api/[modulo]/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error(`Error in ${req.method} /api/[modulo]:`, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

#### 2.2 Validação e Segurança
- **Sempre validar** `user_id` como UUID
- **Implementar RLS** no Supabase
- **Sanitizar inputs** contra XSS
- **Logs detalhados** para debugging

#### 2.3 Testes de API
```bash
# Testar APIs manualmente
curl -X GET "http://localhost:3000/api/[modulo]?user_id=550e8400-e29b-41d4-a716-446655440000"
curl -X POST "http://localhost:3000/api/[modulo]" -H "Content-Type: application/json" -d '{...}'
```

### Fase 3: Hooks React Query (1 hora)

#### 3.1 Padrão de Hooks
Siga o padrão estabelecido em `app/hooks/useHiperfocos.ts`:

```typescript
// app/hooks/use[Modulo].ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Tipos TypeScript
interface [Entidade] {
  id: string
  user_id: string
  // ... outros campos
}

// Funções de API
const [modulo]Api = {
  get[Entidades]: async (userId: string) => { /* ... */ },
  create[Entidade]: async (data: Create[Entidade]Data) => { /* ... */ },
  // ... outras operações
}

// Hooks React Query
export const useGet[Entidades] = (userId: string) => {
  return useQuery({
    queryKey: ['[modulo]', userId],
    queryFn: () => [modulo]Api.get[Entidades](userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useCreate[Entidade] = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: [modulo]Api.create[Entidade],
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['[modulo]', variables.user_id] })
    },
  })
}
```

#### 3.2 Estratégias de Cache
- **staleTime**: 5 min para dados estáticos, 2 min para dados dinâmicos
- **Invalidação**: Sempre invalidar queries relacionadas após mutations
- **Optimistic Updates**: Para melhor UX em operações rápidas

### Fase 4: Migração de Componentes (2-3 horas)

#### 4.1 Substituição de Stores
```typescript
// ❌ ANTES (Zustand)
import { use[Modulo]Store } from '../../stores/[modulo]Store'
const { adicionar[Entidade], atualizar[Entidade] } = use[Modulo]Store()

// ✅ DEPOIS (React Query)
import { useCreate[Entidade], useUpdate[Entidade], useUserId } from '../../hooks/use[Modulo]'
const userId = useUserId()
const create[Entidade]Mutation = useCreate[Entidade]()
const update[Entidade]Mutation = useUpdate[Entidade]()
```

#### 4.2 Estados de Loading e Erro
```typescript
// Estados combinados
const isLoading = create[Entidade]Mutation.isPending || update[Entidade]Mutation.isPending

// UI com loading
{isLoading ? (
  <Loader2 className="h-5 w-5 animate-spin" />
) : (
  <Save className="h-5 w-5" />
)}
```

#### 4.3 Tratamento de Erros
```typescript
try {
  await create[Entidade]Mutation.mutateAsync(data)
  setFeedback({ tipo: 'sucesso', mensagem: '[Entidade] criada com sucesso!' })
} catch (error) {
  console.error('Erro ao criar [entidade]:', error)
  setFeedback({ tipo: 'erro', mensagem: 'Erro ao criar [entidade]. Tente novamente.' })
}
```

### Fase 5: Testes e Validação (1 hora)

#### 5.1 Execução de Testes
```bash
npm test -- --testPathPattern=[modulo]
npm run test:coverage
```

#### 5.2 Validação Manual
1. **Servidor funcionando**: `npm run dev`
2. **APIs respondendo**: Testes curl
3. **Interface carregando**: Navegador sem erros
4. **Dados persistindo**: Verificar no Supabase

## 🚨 Problemas Comuns e Soluções

### 1. Erro de UUID Inválido
```
Error: invalid input syntax for type uuid: "dev-user-123"
```
**Solução**: Usar UUID válido no `useUserId()`:
```typescript
return '550e8400-e29b-41d4-a716-446655440000'
```

### 2. Foreign Key Constraint
```
Error: violates foreign key constraint
```
**Solução**: Criar usuário no Supabase:
```sql
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'teste@exemplo.com', 'dummy', NOW(), NOW(), NOW()) 
ON CONFLICT (id) DO NOTHING;
```

### 3. QueryProvider Não Configurado
**Solução**: Verificar se está em `app/providers.tsx`:
```typescript
<QueryProvider>
  <NextThemesProvider>
    {children}
  </NextThemesProvider>
</QueryProvider>
```

### 4. Variáveis de Ambiente
**Verificar**: `.env.local` deve ter:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 📊 Métricas de Sucesso

### Por Módulo Refatorado
- ✅ **APIs funcionando**: Todas as operações CRUD testadas
- ✅ **Frontend integrado**: Componentes usando React Query
- ✅ **Testes passando**: Mínimo 80% de cobertura
- ✅ **Performance**: Redução de re-renders
- ✅ **TypeScript**: 100% type safety

### Validação Final
```bash
# Compilação sem erros
npm run build

# Testes passando
npm test

# Servidor funcionando
npm run dev
```

## 🎯 Próximos Módulos Prioritários

### 1. Sessões de Alternância (Alta Prioridade)
- **Localização**: `app/components/sessoes/`
- **APIs**: Implementar em `pages/api/sessoes/`
- **Funcionalidades**: Timer, pausar/retomar, histórico

### 2. Estatísticas (Média Prioridade)
- **Localização**: `app/components/estatisticas/`
- **APIs**: Agregações e relatórios
- **Funcionalidades**: Gráficos, métricas, exportação

### 3. PWA Avançado (Média Prioridade)
- **Service Worker**: Cache inteligente
- **Sincronização**: Background sync
- **Notificações**: Push notifications

### 4. Autenticação Real (Alta Prioridade)
- **Supabase Auth**: Substituir user_id fixo
- **RLS**: Row Level Security
- **Proteção**: Rotas protegidas

## 🔧 Ferramentas Essenciais

### Comandos de Análise
```bash
codebase-retrieval "informações sobre [módulo]"
view app/components/[modulo]/
diagnostics ["caminho/arquivo"]
```

### Comandos de Desenvolvimento
```bash
npm run dev          # Servidor desenvolvimento
npm test            # Executar testes
npm run build       # Build produção
```

### Comandos de Depuração
```bash
curl -X GET "http://localhost:3000/api/[endpoint]"
read-process [terminal_id]  # Ver logs do servidor
```

## 📝 Checklist de Refatoração

### Para Cada Módulo
- [ ] Análise do estado atual
- [ ] Criação/correção de APIs
- [ ] Implementação de hooks React Query
- [ ] Migração de componentes
- [ ] Atualização de testes
- [ ] Validação manual
- [ ] Documentação atualizada

### Validação Final
- [ ] Servidor compila sem erros
- [ ] APIs respondem corretamente
- [ ] Frontend carrega sem erros
- [ ] Dados persistem no banco
- [ ] Testes passam (>80%)
- [ ] Performance mantida/melhorada

## 🧪 Estratégias de Debugging

### 1. Debugging de APIs
```typescript
// Adicionar logs detalhados
console.log(`[API] ${req.method} ${req.url}`, { body: req.body, query: req.query })

// Verificar resposta do Supabase
const { data, error } = await supabase.from('tabela').select('*')
console.log('Supabase response:', { data, error })

// Logs de erro estruturados
console.error(`Error in ${req.method} /api/endpoint:`, {
  error: error.message,
  stack: error.stack,
  request: { body: req.body, query: req.query }
})
```

### 2. Debugging de React Query
```typescript
// DevTools do React Query (desenvolvimento)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Logs de mutations
const mutation = useMutation({
  mutationFn: api.create,
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
  onSettled: () => console.log('Mutation settled')
})

// Verificar estado do cache
const queryClient = useQueryClient()
console.log('Cache state:', queryClient.getQueryData(['key']))
```

### 3. Debugging de Componentes
```typescript
// React DevTools + logs estruturados
useEffect(() => {
  console.log('[Component] State changed:', {
    isLoading,
    data: data?.length,
    error: error?.message
  })
}, [isLoading, data, error])

// Debugging de re-renders
import { useWhyDidYouUpdate } from 'use-why-did-you-update'
useWhyDidYouUpdate('ComponentName', props)
```

## 🔄 Padrões de Migração Específicos

### 1. Migração de Stores Zustand
```typescript
// ANTES: Zustand Store
interface StoreState {
  items: Item[]
  addItem: (item: Item) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
}

// DEPOIS: React Query Hooks
const useItems = (userId: string) => useQuery({...})
const useCreateItem = () => useMutation({...})
const useUpdateItem = () => useMutation({...})
const useDeleteItem = () => useMutation({...})
```

### 2. Migração de Estados Locais
```typescript
// ANTES: useState para dados do servidor
const [items, setItems] = useState<Item[]>([])
const [loading, setLoading] = useState(false)

// DEPOIS: React Query
const { data: items = [], isLoading } = useItems(userId)
```

### 3. Migração de useEffect para Fetch
```typescript
// ANTES: useEffect manual
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/items')
      const data = await response.json()
      setItems(data)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])

// DEPOIS: React Query (automático)
const { data: items, isLoading, error } = useItems(userId)
```

## 📋 Templates de Código

### 1. Template de API Route
```typescript
// pages/api/[modulo]/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Schemas de validação
const CreateSchema = z.object({
  user_id: z.string().uuid(),
  // ... outros campos
})

const QuerySchema = z.object({
  user_id: z.string().uuid(),
  // ... filtros opcionais
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error(`Error in ${req.method} /api/[modulo]:`, error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const query = QuerySchema.parse(req.query)

  const { data, error, count } = await supabase
    .from('[tabela]')
    .select('*', { count: 'exact' })
    .eq('user_id', query.user_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching [entidades]:', error)
    return res.status(500).json({ error: 'Failed to fetch [entidades]' })
  }

  return res.status(200).json({ data, count })
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const body = CreateSchema.parse(req.body)

  const { data, error } = await supabase
    .from('[tabela]')
    .insert([{
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating [entidade]:', error)
    return res.status(500).json({ error: 'Failed to create [entidade]' })
  }

  return res.status(201).json({ data })
}
```

### 2. Template de Hook React Query
```typescript
// app/hooks/use[Modulo].ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Tipos
interface [Entidade] {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  // ... campos específicos
}

interface Create[Entidade]Data {
  user_id: string
  // ... campos obrigatórios
}

interface Update[Entidade]Data {
  // ... campos opcionais
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Funções de API
const [modulo]Api = {
  get[Entidades]: async (userId: string, filters?: any): Promise<{ data: [Entidade][], count: number }> => {
    const params = new URLSearchParams({ user_id: userId, ...filters })
    const response = await fetch(`${API_BASE_URL}/api/[modulo]?${params}`)
    if (!response.ok) throw new Error(`Failed to fetch [entidades]: ${response.statusText}`)
    return response.json()
  },

  get[Entidade]: async (id: string, userId: string): Promise<{ data: [Entidade] }> => {
    const response = await fetch(`${API_BASE_URL}/api/[modulo]/${id}?user_id=${userId}`)
    if (!response.ok) throw new Error(`Failed to fetch [entidade]: ${response.statusText}`)
    return response.json()
  },

  create[Entidade]: async (data: Create[Entidade]Data): Promise<{ data: [Entidade] }> => {
    const response = await fetch(`${API_BASE_URL}/api/[modulo]`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Failed to create [entidade]: ${response.statusText}`)
    return response.json()
  },

  update[Entidade]: async (id: string, data: Update[Entidade]Data & { user_id: string }): Promise<{ data: [Entidade] }> => {
    const response = await fetch(`${API_BASE_URL}/api/[modulo]/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`Failed to update [entidade]: ${response.statusText}`)
    return response.json()
  },

  delete[Entidade]: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/[modulo]/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) throw new Error(`Failed to delete [entidade]: ${response.statusText}`)
  },
}

// Hooks React Query
export const useGet[Entidades] = (userId: string, filters?: any) => {
  return useQuery({
    queryKey: ['[modulo]', userId, filters],
    queryFn: () => [modulo]Api.get[Entidades](userId, filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useGet[Entidade] = (id: string, userId: string) => {
  return useQuery({
    queryKey: ['[modulo]', id, userId],
    queryFn: () => [modulo]Api.get[Entidade](id, userId),
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreate[Entidade] = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: [modulo]Api.create[Entidade],
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['[modulo]', variables.user_id] })
      queryClient.setQueryData(['[modulo]', data.data.id, variables.user_id], { data: data.data })
    },
  })
}

export const useUpdate[Entidade] = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Update[Entidade]Data & { user_id: string } }) =>
      [modulo]Api.update[Entidade](id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['[modulo]', variables.data.user_id] })
      queryClient.setQueryData(['[modulo]', variables.id, variables.data.user_id], { data: result.data })
    },
  })
}

export const useDelete[Entidade] = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string, userId: string }) =>
      [modulo]Api.delete[Entidade](id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['[modulo]', variables.userId] })
      queryClient.removeQueries({ queryKey: ['[modulo]', variables.id, variables.userId] })
    },
  })
}

// Hook para user_id (temporário para desenvolvimento)
export const useUserId = () => {
  return '550e8400-e29b-41d4-a716-446655440000'
}

// Exportar tipos
export type { [Entidade], Create[Entidade]Data, Update[Entidade]Data }
```

## 🎯 Exemplos Práticos de Refatoração

### Exemplo 1: Módulo Sessões
```typescript
// 1. API Route (pages/api/sessoes/index.ts)
const SessaoSchema = z.object({
  user_id: z.string().uuid(),
  hiperfoco_id: z.string().uuid(),
  duracao_planejada: z.number().min(1).max(480), // 1-480 minutos
  tipo: z.enum(['foco', 'pausa'])
})

// 2. Hook (app/hooks/useSessoes.ts)
export const useCreateSessao = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessoesApi.createSessao,
    onSuccess: (data, variables) => {
      // Invalidar sessões do usuário
      queryClient.invalidateQueries({ queryKey: ['sessoes', variables.user_id] })
      // Invalidar estatísticas relacionadas
      queryClient.invalidateQueries({ queryKey: ['estatisticas', variables.user_id] })
    },
  })
}

// 3. Componente (app/components/sessoes/TimerSessao.tsx)
export function TimerSessao({ hiperfocoId }: { hiperfocoId: string }) {
  const userId = useUserId()
  const createSessaoMutation = useCreateSessao()
  const [duracao, setDuracao] = useState(25) // Pomodoro padrão

  const iniciarSessao = async () => {
    try {
      await createSessaoMutation.mutateAsync({
        user_id: userId,
        hiperfoco_id: hiperfocoId,
        duracao_planejada: duracao,
        tipo: 'foco'
      })
      // Iniciar timer...
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error)
    }
  }

  return (
    <button
      onClick={iniciarSessao}
      disabled={createSessaoMutation.isPending}
    >
      {createSessaoMutation.isPending ? 'Iniciando...' : 'Iniciar Sessão'}
    </button>
  )
}
```

### Exemplo 2: Módulo Estatísticas
```typescript
// 1. API com agregações (pages/api/estatisticas/resumo.ts)
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, periodo = '7d' } = QuerySchema.parse(req.query)

  // Agregação de sessões por período
  const { data: sessoes, error } = await supabase
    .from('sessoes')
    .select(`
      id,
      duracao_real,
      tipo,
      created_at,
      hiperfocos!inner(titulo, cor)
    `)
    .eq('user_id', user_id)
    .gte('created_at', getDataInicio(periodo))
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching estatísticas:', error)
    return res.status(500).json({ error: 'Failed to fetch estatísticas' })
  }

  // Processar dados para estatísticas
  const estatisticas = processarEstatisticas(sessoes)

  return res.status(200).json({ data: estatisticas })
}

// 2. Hook com cache otimizado
export const useEstatisticasResumo = (userId: string, periodo: string = '7d') => {
  return useQuery({
    queryKey: ['estatisticas', 'resumo', userId, periodo],
    queryFn: () => estatisticasApi.getResumo(userId, periodo),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos (dados menos voláteis)
    cacheTime: 30 * 60 * 1000, // 30 minutos
  })
}
```

## 🔧 Troubleshooting Avançado

### 1. Performance Issues
```typescript
// Problema: Muitas re-renderizações
// Solução: Memoização e otimização de queries

// ❌ Problema
const { data: items } = useItems(userId)
const filteredItems = items?.filter(item => item.status === 'ativo') // Re-calcula sempre

// ✅ Solução
const { data: items } = useItems(userId)
const filteredItems = useMemo(
  () => items?.filter(item => item.status === 'ativo') ?? [],
  [items]
)

// ❌ Problema: Query desnecessária
const { data } = useQuery({
  queryKey: ['items', userId, filter],
  queryFn: () => api.getItems(userId, filter),
  // Re-executa sempre que filter muda
})

// ✅ Solução: Debounce
const debouncedFilter = useDebounce(filter, 300)
const { data } = useQuery({
  queryKey: ['items', userId, debouncedFilter],
  queryFn: () => api.getItems(userId, debouncedFilter),
})
```

### 2. Problemas de Sincronização
```typescript
// Problema: Dados desatualizados após mutation
// Solução: Invalidação estratégica

export const useUpdateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateItem,
    onSuccess: (data, variables) => {
      // ✅ Invalidar queries específicas
      queryClient.invalidateQueries({
        queryKey: ['items', variables.data.user_id],
        exact: false // Invalida todas as variações
      })

      // ✅ Atualizar cache específico
      queryClient.setQueryData(
        ['items', variables.id, variables.data.user_id],
        { data: data.data }
      )

      // ✅ Invalidar queries relacionadas
      if (data.data.status === 'concluido') {
        queryClient.invalidateQueries({ queryKey: ['estatisticas'] })
      }
    },
    // ✅ Optimistic update para melhor UX
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['items', variables.id] })

      const previousData = queryClient.getQueryData(['items', variables.id])

      queryClient.setQueryData(['items', variables.id], (old: any) => ({
        ...old,
        data: { ...old.data, ...variables.data }
      }))

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(['items', variables.id], context.previousData)
      }
    }
  })
}
```

### 3. Problemas de Autenticação
```typescript
// Problema: user_id hardcoded
// Solução: Hook de autenticação real

// ✅ Hook de autenticação (app/hooks/useAuth.ts)
import { useUser } from '@supabase/auth-helpers-react'

export const useAuth = () => {
  const user = useUser()

  return {
    userId: user?.id,
    isAuthenticated: !!user,
    isLoading: false, // Implementar loading state
  }
}

// ✅ Uso nos hooks
export const useGetItems = () => {
  const { userId, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['items', userId],
    queryFn: () => api.getItems(userId!),
    enabled: isAuthenticated && !!userId,
  })
}

// ✅ Proteção de rotas
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <LoginForm />

  return <>{children}</>
}
```

## 📚 Recursos de Referência

### Documentação Essencial
- **React Query**: https://tanstack.com/query/latest/docs/react/overview
- **Supabase**: https://supabase.com/docs/reference/javascript/introduction
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Zod Validation**: https://zod.dev/

### Ferramentas de Debug
- **React Query DevTools**: Visualizar cache e queries
- **Supabase Dashboard**: Monitorar banco de dados
- **Next.js DevTools**: Performance e debugging
- **Browser DevTools**: Network, Console, Performance

### Comandos Úteis
```bash
# Análise de bundle
npm run build && npm run analyze

# Testes com coverage
npm run test:coverage

# Lint e type check
npm run lint && npm run type-check

# Logs do servidor
tail -f .next/server.log
```

## 🎯 Checklist Final por Módulo

### ✅ Pré-Refatoração
- [ ] Análise completa do módulo atual
- [ ] Identificação de dependências
- [ ] Planejamento de tarefas
- [ ] Backup do código atual

### ✅ Durante Refatoração
- [ ] APIs implementadas e testadas
- [ ] Hooks React Query criados
- [ ] Componentes migrados
- [ ] Estados de loading/erro implementados
- [ ] Validações robustas
- [ ] Logs de debugging

### ✅ Pós-Refatoração
- [ ] Testes unitários atualizados
- [ ] Testes de integração passando
- [ ] Performance validada
- [ ] Documentação atualizada
- [ ] Code review interno
- [ ] Deploy em ambiente de teste

### ✅ Validação Final
- [ ] Funcionalidades principais testadas
- [ ] Edge cases cobertos
- [ ] Performance aceitável
- [ ] Logs limpos (sem erros)
- [ ] Métricas de sucesso atingidas
- [ ] Feedback do usuário positivo

---

**Última atualização**: Junho 2025
**Versão**: 1.1
**Status**: Guia completo baseado na refatoração bem-sucedida do módulo Hiperfocos
**Próxima revisão**: Após refatoração de 2-3 módulos adicionais
