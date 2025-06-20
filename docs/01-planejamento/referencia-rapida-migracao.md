# ⚡ Referência Rápida - Migração Supabase

**Guia de consulta rápida para a migração do StayFocus**

---

## 🚀 **COMANDOS ESSENCIAIS**

### **Setup Inicial**
```bash
# Instalar dependências Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Instalar dependências TDD
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D jest jest-environment-jsdom
npm install react-query @tanstack/react-query-devtools

# Executar em desenvolvimento
npm run dev

# Executar testes (TDD)
npm run test
npm run test:watch

# Build para produção
npm run build
```

### **Variáveis de Ambiente (.env.local)**
```bash
# Supabase (Produção)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]

# FastAPI (TDD/Desenvolvimento)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
FASTAPI_SECRET_KEY=your-secret-key

# Configuração
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY=false
AUTH_PROVIDER=fastapi  # ou supabase
TDD_MODE=true  # Ativa mocks para testes
```

---

## 📁 **ESTRUTURA DE ARQUIVOS**

### **Novos Diretórios**
```
lib/
├── dataProviders/
│   ├── types.ts          # Interface DataProvider
│   ├── supabase.ts       # Implementação Supabase
│   ├── fastapi.ts        # Implementação FastAPI
│   └── index.ts          # Factory de providers
├── services/
│   ├── alimentacao.ts    # Service layer alimentação
│   ├── hiperfocos.ts     # Service layer hiperfocos
│   └── auth.ts           # Service layer autenticação
└── utils/
    ├── supabase.ts       # Cliente Supabase
    └── migration.ts      # Utilitários de migração
```

---

## 🧪 **TDD COM FASTAPI**

### **Configurar Mock Server (FastAPI)**
```python
# mock_server.py
from fastapi import FastAPI, HTTPException
import uvicorn

app = FastAPI()

# Mock endpoints para TDD
@app.get("/api/meal-plans")
async def get_meal_plans(scenario: str = "success"):
    if scenario == "error":
        raise HTTPException(500, "Server error")
    return [{"id": "1", "time": "08:00", "description": "Café"}]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### **Executar Mock Server**
```bash
# Instalar FastAPI
pip install fastapi uvicorn

# Executar mock server
python mock_server.py

# Ou usar docker
docker run -p 8000:8000 -v $(pwd):/app python:3.9 sh -c "cd /app && pip install fastapi uvicorn && python mock_server.py"
```

### **Testes com React Testing Library**
```typescript
// __tests__/useMealPlans.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useMealPlans } from '@/hooks/useMealPlans'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('should load meal plans', async () => {
  const { result } = renderHook(() => useMealPlans(), {
    wrapper: createWrapper()
  })

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data).toHaveLength(1)
  })
})
```

### **Ciclo TDD Rápido**
```bash
# 1. Escrever teste (Red)
npm run test:watch

# 2. Implementar código (Green)
# Editar arquivo até teste passar

# 3. Refatorar (Refactor)
# Melhorar código mantendo testes passando

# 4. Repetir para próxima feature
```

---

## 🔧 **SNIPPETS DE CÓDIGO**

### **Cliente Supabase Básico**
```typescript
// lib/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### **Interface DataProvider**
```typescript
// lib/dataProviders/types.ts
export interface DataProvider {
  // Auth
  login(email: string, password: string): Promise<AuthResponse>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  
  // Meal Plans
  getMealPlans(): Promise<MealPlan[]>
  createMealPlan(data: CreateMealPlanDto): Promise<MealPlan>
  updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan>
  deleteMealPlan(id: string): Promise<void>
}
```

### **Factory de Providers**
```typescript
// lib/dataProviders/index.ts
import { SupabaseProvider } from './supabase'
import { FastAPIProvider } from './fastapi'

export const getDataProvider = () => {
  if (process.env.NODE_ENV === 'production') {
    return new SupabaseProvider()
  }
  return new FastAPIProvider()
}
```

### **Hook de Autenticação**
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { getDataProvider } from '@/lib/dataProviders'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const dataProvider = getDataProvider()
  
  useEffect(() => {
    dataProvider.getCurrentUser().then(setUser).finally(() => setLoading(false))
  }, [])
  
  const login = async (email: string, password: string) => {
    const response = await dataProvider.login(email, password)
    setUser(response.user)
    return response
  }
  
  const logout = async () => {
    await dataProvider.logout()
    setUser(null)
  }
  
  return { user, loading, login, logout }
}
```

---

## 🗄️ **QUERIES SQL ÚTEIS**

### **Verificar Tabelas Criadas**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **Verificar RLS Habilitado**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### **Testar Políticas RLS**
```sql
-- Como usuário autenticado
SELECT * FROM meal_plans WHERE user_id = auth.uid();
```

### **Verificar Dados de Teste**
```sql
-- Contar registros por tabela
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'meal_plans', COUNT(*) FROM meal_plans
UNION ALL
SELECT 'meal_records', COUNT(*) FROM meal_records;
```

---

## 🧪 **TESTES RÁPIDOS**

### **Teste de Conexão**
```typescript
// Executar no console do navegador
import { supabase } from '@/lib/utils/supabase'

// Testar conexão
const { data, error } = await supabase.from('users').select('count')
console.log('Connection test:', { data, error })
```

### **Teste de Autenticação**
```typescript
// Testar login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
})
console.log('Auth test:', { data, error })
```

### **Teste de CRUD**
```typescript
// Testar inserção
const { data, error } = await supabase
  .from('meal_plans')
  .insert({ time: '08:00', description: 'Café da manhã teste' })
console.log('Insert test:', { data, error })
```

---

## 🔍 **DEBUGGING**

### **Logs Úteis**
```typescript
// Habilitar logs detalhados do Supabase
localStorage.setItem('supabase.auth.debug', 'true')

// Log de todas as requisições
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

### **Verificar Estado da Aplicação**
```typescript
// No console do navegador
console.log('Environment:', process.env.NODE_ENV)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Auth Provider:', process.env.AUTH_PROVIDER)
console.log('LocalStorage Only:', process.env.NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY)
```

### **Verificar LocalStorage**
```typescript
// Verificar dados existentes
Object.keys(localStorage).filter(key => 
  key.includes('storage') || key.includes('supabase')
).forEach(key => {
  console.log(key, JSON.parse(localStorage.getItem(key) || '{}'))
})
```

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **Erro: "Invalid API key"**
- ✅ Verificar se as variáveis de ambiente estão corretas
- ✅ Reiniciar o servidor de desenvolvimento
- ✅ Verificar se o projeto Supabase está ativo

#### **Erro: "Row Level Security policy violation"**
- ✅ Verificar se o usuário está autenticado
- ✅ Verificar se as políticas RLS estão corretas
- ✅ Testar com service role key (apenas desenvolvimento)

#### **Erro: "Network request failed"**
- ✅ Verificar conexão com internet
- ✅ Verificar se o Supabase está online
- ✅ Ativar fallback para localStorage

#### **Dados não aparecem após migração**
- ✅ Verificar se a migração foi executada
- ✅ Verificar se o usuário está logado
- ✅ Verificar logs de erro no console

### **Comandos de Emergência**
```typescript
// Limpar cache e reiniciar
localStorage.clear()
sessionStorage.clear()
window.location.reload()

// Forçar uso do localStorage
localStorage.setItem('FORCE_LOCALSTORAGE', 'true')

// Verificar status do Supabase
fetch('https://[project-id].supabase.co/rest/v1/')
  .then(r => console.log('Supabase status:', r.status))
```

---

## 📊 **CHECKLIST DE VALIDAÇÃO**

### **Antes de Cada Deploy**
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Testes passando
- [ ] Backup dos dados realizado
- [ ] Rollback plan definido

### **Após Cada Migração**
- [ ] Dados migrados corretamente
- [ ] Funcionalidades testadas
- [ ] Performance validada
- [ ] Logs verificados

### **Critérios de Sucesso**
- [ ] Zero perda de dados
- [ ] Performance mantida ou melhorada
- [ ] Todas as funcionalidades operacionais
- [ ] Usuários conseguem fazer login

---

## 📞 **CONTATOS DE EMERGÊNCIA**

### **Suporte Técnico**
- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Documentação**: [supabase.com/docs](https://supabase.com/docs)

### **Recursos de Ajuda**
- **Stack Overflow**: Tag `supabase`
- **GitHub Issues**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Community Forum**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

## 🎯 **PRÓXIMOS PASSOS RÁPIDOS**

1. **Agora**: Criar projeto no Supabase
2. **Hoje**: Configurar variáveis de ambiente
3. **Amanhã**: Executar schema SQL
4. **Esta semana**: Implementar DataProvider
5. **Próxima semana**: Migrar módulo alimentação

---

**⚡ Mantenha este arquivo aberto durante a migração para consulta rápida!**
