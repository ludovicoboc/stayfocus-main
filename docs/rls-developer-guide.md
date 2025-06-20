# Guia do Desenvolvedor - Row Level Security (RLS)

Este guia prático ajuda desenvolvedores a trabalhar com RLS no projeto StayFocus de forma eficiente e segura.

## 🚀 Quick Start

### 1. Verificar se RLS está funcionando

```typescript
// Em qualquer componente React
import { useSupabase } from '@/hooks/useSupabase'

const { supabase } = useSupabase()

// Esta query deve retornar apenas dados do usuário logado
const { data, error } = await supabase
  .from('hiperfocos')
  .select('*')

// Se retornar dados de outros usuários = PROBLEMA!
```

### 2. Padrão para novas queries

```typescript
// ✅ CORRETO - RLS aplicará automaticamente
const { data } = await supabase
  .from('hiperfocos')
  .select('*')
  .eq('status', 'ativo') // Filtros adicionais são OK

// ❌ DESNECESSÁRIO - Não precisa filtrar por user_id manualmente
const { data } = await supabase
  .from('hiperfocos')
  .select('*')
  .eq('user_id', user.id) // RLS já faz isso!
```

### 3. Inserindo novos dados

```typescript
// ✅ CORRETO - Incluir user_id explicitamente
const { data, error } = await supabase
  .from('hiperfocos')
  .insert({
    titulo: 'Novo Hiperfoco',
    descricao: 'Descrição...',
    user_id: user.id, // Sempre necessário
  })

// ❌ ERRO - Sem user_id será rejeitado
const { data, error } = await supabase
  .from('hiperfocos')
  .insert({
    titulo: 'Novo Hiperfoco',
    // user_id faltando!
  })
```

## 🔍 Debugging RLS

### Verificar se usuário está autenticado

```typescript
const checkAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('❌ Usuário não autenticado')
    return false
  }
  
  console.log('✅ Usuário autenticado:', user.id)
  return true
}
```

### Testar isolamento de dados

```typescript
const testDataIsolation = async () => {
  // Buscar todos os hiperfocos (deve retornar apenas do usuário atual)
  const { data: myData } = await supabase
    .from('hiperfocos')
    .select('*')
  
  console.log('Meus hiperfocos:', myData?.length)
  
  // Verificar se todos têm o mesmo user_id
  const userIds = [...new Set(myData?.map(item => item.user_id))]
  
  if (userIds.length === 1) {
    console.log('✅ Isolamento funcionando')
  } else {
    console.error('❌ VAZAMENTO DE DADOS!', userIds)
  }
}
```

### Verificar erros de RLS

```typescript
const handleRLSError = (error: any) => {
  if (error?.message?.includes('row-level security')) {
    console.log('✅ RLS bloqueou operação não autorizada')
    // Isso é esperado e correto!
    return
  }
  
  if (error?.message?.includes('violates row-level security policy')) {
    console.log('✅ RLS impediu inserção/atualização inválida')
    // Verificar se user_id está correto
    return
  }
  
  // Outros erros precisam ser investigados
  console.error('❌ Erro inesperado:', error)
}
```

## 📝 Padrões de Código

### Hook personalizado para dados do usuário

```typescript
// hooks/useUserData.ts
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'

export const useUserHiperfocos = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  
  const fetchHiperfocos = async () => {
    if (!user) return []
    
    const { data, error } = await supabase
      .from('hiperfocos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar hiperfocos:', error)
      return []
    }
    
    return data || []
  }
  
  const createHiperfoco = async (hiperfoco: Omit<Hiperfoco, 'id' | 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado')
    
    const { data, error } = await supabase
      .from('hiperfocos')
      .insert({
        ...hiperfoco,
        user_id: user.id,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  return { fetchHiperfocos, createHiperfoco }
}
```

### Componente com tratamento de RLS

```typescript
// components/HiperfocosList.tsx
import { useEffect, useState } from 'react'
import { useUserHiperfocos } from '@/hooks/useUserData'

export const HiperfocosList = () => {
  const [hiperfocos, setHiperfocos] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchHiperfocos } = useUserHiperfocos()
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchHiperfocos()
        setHiperfocos(data)
      } catch (error) {
        console.error('Erro ao carregar hiperfocos:', error)
        // RLS errors são esperados e não devem quebrar a UI
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  if (loading) return <div>Carregando...</div>
  
  return (
    <div>
      {hiperfocos.map(hiperfoco => (
        <div key={hiperfoco.id}>
          {hiperfoco.titulo}
        </div>
      ))}
    </div>
  )
}
```

## 🧪 Testando com RLS

### Teste de componente com RLS

```typescript
// __tests__/components/HiperfocosList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { HiperfocosList } from '@/components/HiperfocosList'

// Mock do Supabase com RLS simulado
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => ({
        data: [
          { id: '1', titulo: 'Hiperfoco 1', user_id: 'current-user' },
          { id: '2', titulo: 'Hiperfoco 2', user_id: 'current-user' },
        ],
        error: null,
      })),
    })),
  })),
}

describe('HiperfocosList', () => {
  it('deve mostrar apenas hiperfocos do usuário atual', async () => {
    render(<HiperfocosList />)
    
    await waitFor(() => {
      expect(screen.getByText('Hiperfoco 1')).toBeInTheDocument()
      expect(screen.getByText('Hiperfoco 2')).toBeInTheDocument()
    })
    
    // Verificar que a query não filtrou manualmente por user_id
    expect(mockSupabase.from).toHaveBeenCalledWith('hiperfocos')
    // RLS deve fazer o filtro automaticamente
  })
})
```

### Teste de isolamento

```typescript
// __tests__/integration/rls-isolation.test.ts
describe('RLS Isolation', () => {
  it('deve isolar dados entre usuários', async () => {
    // Simular usuário 1
    const user1Client = createSupabaseClient(user1Token)
    const { data: user1Data } = await user1Client
      .from('hiperfocos')
      .select('*')
    
    // Simular usuário 2
    const user2Client = createSupabaseClient(user2Token)
    const { data: user2Data } = await user2Client
      .from('hiperfocos')
      .select('*')
    
    // Verificar que não há sobreposição
    const user1Ids = user1Data?.map(item => item.id) || []
    const user2Ids = user2Data?.map(item => item.id) || []
    const intersection = user1Ids.filter(id => user2Ids.includes(id))
    
    expect(intersection).toHaveLength(0)
  })
})
```

## 🚨 Problemas Comuns e Soluções

### 1. "Não consigo ver meus próprios dados"

```typescript
// Verificar autenticação
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirecionar para login
  router.push('/login')
  return
}

// Verificar se user_id está correto nos dados
const { data } = await supabase
  .from('hiperfocos')
  .select('user_id')
  .limit(1)

console.log('User ID nos dados:', data?.[0]?.user_id)
console.log('User ID atual:', user.id)
```

### 2. "Erro ao inserir dados"

```typescript
const createHiperfoco = async (data) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }
  
  // SEMPRE incluir user_id
  const { data: result, error } = await supabase
    .from('hiperfocos')
    .insert({
      ...data,
      user_id: user.id, // Essencial!
    })
  
  if (error) {
    console.error('Erro ao inserir:', error)
    throw error
  }
  
  return result
}
```

### 3. "Queries muito lentas"

```typescript
// ✅ OTIMIZADO - Usar índices compostos
const { data } = await supabase
  .from('hiperfocos')
  .select('*')
  .eq('status', 'ativo') // Índice: (user_id, status)
  .order('created_at', { ascending: false }) // Índice: (user_id, created_at)
  .limit(20)

// ❌ LENTO - Evitar queries complexas desnecessárias
const { data } = await supabase
  .from('hiperfocos')
  .select(`
    *,
    tarefas(*),
    sessoes(*)
  `) // Muitos JOINs podem ser lentos
```

## 📊 Monitoramento em Desenvolvimento

### Console helper para debug

```typescript
// utils/rlsDebug.ts
export const rlsDebug = {
  async checkCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user?.id)
    return user
  },
  
  async testTableAccess(tableName: string) {
    const { data, error } = await supabase
      .from(tableName)
      .select('user_id')
      .limit(5)
    
    if (error) {
      console.error(`❌ Erro ao acessar ${tableName}:`, error)
      return
    }
    
    const userIds = [...new Set(data?.map(item => item.user_id))]
    console.log(`✅ ${tableName} - User IDs encontrados:`, userIds)
  },
  
  async testAllTables() {
    const tables = ['hiperfocos', 'tarefas', 'sessoes_alternancia']
    for (const table of tables) {
      await this.testTableAccess(table)
    }
  }
}

// No console do browser:
// rlsDebug.testAllTables()
```

### Performance monitoring

```typescript
// utils/performanceMonitor.ts
export const measureQuery = async (queryFn: () => Promise<any>, label: string) => {
  const start = performance.now()
  const result = await queryFn()
  const end = performance.now()
  
  console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`)
  
  if (end - start > 100) {
    console.warn(`🐌 Query lenta detectada: ${label}`)
  }
  
  return result
}

// Uso:
const data = await measureQuery(
  () => supabase.from('hiperfocos').select('*'),
  'Buscar hiperfocos'
)
```

## 🔧 Ferramentas Úteis

### 1. Extensão do VS Code
- PostgreSQL syntax highlighting
- Supabase snippets

### 2. Scripts de desenvolvimento
```bash
# Verificar status RLS
npm run rls:check

# Testar políticas
npm run rls:test

# Aplicar otimizações
npm run rls:optimize
```

### 3. Bookmarklets para debug
```javascript
// Verificar RLS no browser
javascript:(function(){
  console.log('Testando RLS...');
  // Código de debug aqui
})();
```

---

**Dica**: Mantenha sempre o console do browser aberto durante desenvolvimento para detectar problemas de RLS rapidamente!
