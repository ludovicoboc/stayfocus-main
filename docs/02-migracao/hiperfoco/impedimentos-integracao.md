# 🚧 Impedimentos de Integração - Módulo Hiperfocos

**Data**: 20 de Janeiro de 2025  
**Status**: ⚠️ **IMPEDIMENTO CRÍTICO IDENTIFICADO**  
**Impacto**: Dados não persistem no Supabase

---

## 🚨 **IMPEDIMENTO PRINCIPAL: Integração Frontend-Backend**

### **Resumo do Problema**
O módulo de hiperfocos foi **completamente implementado** (frontend + backend + PWA), mas há uma **desconexão** entre as camadas que impede a persistência no banco de dados.

### **Evidências**
- ✅ **APIs funcionam**: Testadas manualmente com sucesso
- ✅ **Frontend funciona**: Interface responsiva e validações
- ✅ **Banco configurado**: Schema aplicado com RLS
- ❌ **Sem integração**: Frontend usa localStorage, não APIs

---

## 🔍 **ANÁLISE DETALHADA DO PROBLEMA**

### **1. Configuração de Ambiente Incorreta**

#### **Problema Atual**
```env
# ❌ .env.local - Aponta para FastAPI inexistente
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY=false
```

#### **Solução**
```env
# ✅ Deveria apontar para APIs Next.js
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY=false
```

### **2. Frontend Usa Store Local**

#### **Problema Atual**
```typescript
// ❌ ConversorInteresses.tsx - Usa Zustand + localStorage
import { useHiperfocosStore } from '@/app/stores/hiperfocosStore'

const ConversorInteresses = () => {
  const { adicionarHiperfoco } = useHiperfocosStore()
  
  const handleSubmit = (data) => {
    adicionarHiperfoco(data) // Salva no localStorage
  }
}
```

#### **Solução Necessária**
```typescript
// ✅ Deveria usar React Query + APIs
import { useCreateHiperfoco } from '@/app/hooks/useHiperfocos'

const ConversorInteresses = () => {
  const { mutate: createHiperfoco } = useCreateHiperfoco()
  
  const handleSubmit = (data) => {
    createHiperfoco(data) // Chama API REST
  }
}
```

### **3. Hooks de API Não Implementados**

#### **Problema**
Os hooks para consumir as APIs REST não foram criados.

#### **Hooks Necessários**
```typescript
// ❌ Não existem ainda
useGetHiperfocos()     // GET /api/hiperfocos
useCreateHiperfoco()   // POST /api/hiperfocos
useUpdateHiperfoco()   // PUT /api/hiperfocos/[id]
useDeleteHiperfoco()   // DELETE /api/hiperfocos/[id]

useGetTarefas()        // GET /api/tarefas
useCreateTarefa()      // POST /api/tarefas
useToggleTarefa()      // PATCH /api/tarefas/[id]/toggle

useGetSessoes()        // GET /api/sessoes
useCreateSessao()      // POST /api/sessoes
useFinalizarSessao()   // PATCH /api/sessoes/[id]/finalizar
```

---

## 🛠️ **PLANO DE RESOLUÇÃO**

### **Fase 1: Configuração (30 min)**

#### **1.1 Atualizar Variáveis de Ambiente**
```bash
# Editar .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

#### **1.2 Verificar APIs**
```bash
# Testar endpoints
curl http://localhost:3000/api/hiperfocos?user_id=test
```

### **Fase 2: Implementar Hooks React Query (2 horas)**

#### **2.1 Criar Hook Base**
```typescript
// app/hooks/useHiperfocos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useGetHiperfocos = (userId: string) => {
  return useQuery({
    queryKey: ['hiperfocos', userId],
    queryFn: () => fetch(`/api/hiperfocos?user_id=${userId}`).then(res => res.json())
  })
}

export const useCreateHiperfoco = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => fetch('/api/hiperfocos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hiperfocos'] })
    }
  })
}
```

#### **2.2 Implementar Todos os Hooks**
- `useGetHiperfocos` - Listar hiperfocos
- `useCreateHiperfoco` - Criar hiperfoco
- `useUpdateHiperfoco` - Atualizar hiperfoco
- `useDeleteHiperfoco` - Deletar hiperfoco
- `useGetTarefas` - Listar tarefas
- `useCreateTarefa` - Criar tarefa
- `useToggleTarefa` - Toggle conclusão
- `useGetSessoes` - Listar sessões
- `useCreateSessao` - Criar sessão

### **Fase 3: Migrar Componentes (3 horas)**

#### **3.1 Atualizar ConversorInteresses**
```typescript
// Antes (localStorage)
const { adicionarHiperfoco } = useHiperfocosStore()

// Depois (API)
const { mutate: createHiperfoco, isPending } = useCreateHiperfoco()
const { data: hiperfocos } = useGetHiperfocos(userId)
```

#### **3.2 Atualizar VisualizadorTarefas**
```typescript
// Antes (localStorage)
const { tarefas, adicionarTarefa, toggleTarefa } = useHiperfocosStore()

// Depois (API)
const { data: tarefas } = useGetTarefas(hiperfocoId, userId)
const { mutate: createTarefa } = useCreateTarefa()
const { mutate: toggleTarefa } = useToggleTarefa()
```

#### **3.3 Atualizar GerenciadorSessoes**
```typescript
// Antes (localStorage)
const { sessoes, adicionarSessao } = useHiperfocosStore()

// Depois (API)
const { data: sessoes } = useGetSessoes(userId)
const { mutate: createSessao } = useCreateSessao()
const { mutate: finalizarSessao } = useFinalizarSessao()
```

### **Fase 4: Testes e Validação (1 hora)**

#### **4.1 Testar Integração**
- Criar hiperfoco via interface
- Verificar se aparece no Supabase
- Testar CRUD completo

#### **4.2 Corrigir Testes**
- Atualizar mocks para React Query
- Corrigir timeouts em validações
- Verificar cobertura de testes

---

## 🔧 **SOLUÇÕES PARA PROBLEMAS ESPECÍFICOS**

### **Problema: Testes com Timeout**

#### **Causa**
```typescript
// ❌ Validação só executa se há tarefas válidas
const tarefasValidas = formData.novasTarefas.filter(t => t.trim() !== '')
// Se não há tarefas, validação não roda
```

#### **Solução**
```typescript
// ✅ Validar tarefas vazias primeiro
if (formData.novasTarefas.length === 0 || 
    formData.novasTarefas.every(t => t.trim() === '')) {
  throw new ValidationError('Adicione pelo menos uma tarefa')
}
```

### **Problema: Múltiplos Elementos com Mesmo Role**

#### **Causa**
```jsx
{/* ❌ Múltiplas listas com mesmo role */}
<ul role="list">Tarefas principais</ul>
<ul role="list">Subtarefas</ul>
```

#### **Solução**
```jsx
{/* ✅ Roles específicos */}
<ul role="list" aria-label="Tarefas principais">
<ul role="list" aria-label="Subtarefas">
```

### **Problema: Queue Offline Não Persiste**

#### **Causa**
```typescript
// ❌ Queue não está sendo salvo no localStorage
const queue = []
```

#### **Solução**
```typescript
// ✅ Persistir queue no localStorage
const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]')
```

---

## 📊 **IMPACTO DO IMPEDIMENTO**

### **Funcionalidades Afetadas**
- ❌ **Persistência**: Dados não salvam no Supabase
- ❌ **Sincronização**: Não há sync entre dispositivos
- ❌ **Backup**: Dados podem ser perdidos
- ❌ **Colaboração**: Não há dados compartilhados

### **Funcionalidades Não Afetadas**
- ✅ **Interface**: Funciona perfeitamente
- ✅ **Validações**: Todas funcionando
- ✅ **Performance**: Otimizada
- ✅ **PWA**: Cache offline funciona

---

## ⏱️ **ESTIMATIVA DE RESOLUÇÃO**

### **Tempo Total: 6-8 horas**
- **Configuração**: 30 minutos
- **Hooks React Query**: 2 horas
- **Migração de componentes**: 3 horas
- **Testes e validação**: 1 hora
- **Correção de bugs**: 1-2 horas

### **Complexidade: Média**
- ✅ **APIs prontas**: Não precisa implementar backend
- ✅ **Componentes prontos**: Só precisa trocar hooks
- ⚠️ **Testes**: Precisam ser atualizados para React Query

---

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS**

### **1. Configuração (Hoje)**
```bash
# 1. Atualizar .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 2. Reiniciar servidor
npm run dev

# 3. Testar API
curl http://localhost:3000/api/hiperfocos?user_id=test
```

### **2. Implementação (Amanhã)**
1. **Criar hooks React Query** para todas as APIs
2. **Migrar ConversorInteresses** para usar APIs
3. **Testar integração** completa
4. **Corrigir testes** falhantes

### **3. Validação (Depois de amanhã)**
1. **Testar CRUD completo** via interface
2. **Verificar persistência** no Supabase
3. **Validar sincronização** entre abas
4. **Documentar solução** final

---

## 📝 **CONCLUSÃO**

O impedimento é **puramente de integração**, não de implementação. Todas as peças estão prontas:

- ✅ **Backend**: APIs REST completas e testadas
- ✅ **Frontend**: Interface funcional e validada
- ✅ **Banco**: Schema aplicado com segurança
- ✅ **PWA**: Cache offline implementado

**Falta apenas**: Conectar frontend às APIs REST em vez do localStorage.

**Estimativa**: 1-2 dias de desenvolvimento para resolução completa.

---

**Status**: ⚠️ **IMPEDIMENTO IDENTIFICADO E MAPEADO**  
**Prioridade**: 🔥 **CRÍTICA** (bloqueia persistência)  
**Solução**: 📋 **PLANO DETALHADO CRIADO**
