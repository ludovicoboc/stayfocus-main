# 📋 Lista de Tarefas - Migração StayFocus para Supabase

**Data de Criação**: 19 de Janeiro de 2025  
**Versão**: 1.0  
**Objetivo**: Roadmap detalhado para migração do localStorage para arquitetura dual (Supabase + FastAPI)  
**Metodologia**: MosCoW (Must/Should/Could/Won't Have)

---

## 🎯 **VISÃO GERAL DA MIGRAÇÃO**

### **Arquitetura Alvo**
- **Produção**: Supabase (PostgreSQL + Auth + RLS + Storage)
- **Desenvolvimento TDD**: FastAPI local (para Test-Driven Development)
- **Transição**: Sistema de fallback para localStorage durante migração

### **Metodologia TDD com FastAPI**
- **Objetivo**: Evitar loops de correção que atrasam a migração
- **Estratégia**: Desenvolver frontend com testes primeiro, usando FastAPI como mock
- **Benefícios**: Feedback rápido, controle total de cenários, desenvolvimento offline

### **Estratégia de Implementação**
1. **Módulo Piloto**: Alimentação (mais documentado)
2. **Migração Gradual**: Um módulo por vez
3. **Compatibilidade**: Manter funcionamento durante toda a transição
4. **Validação**: Testes funcionais com MCP Playwright

---

## 🔴 **FASE 1: CONFIGURAÇÃO E INFRAESTRUTURA (MUST HAVE)**
*Estimativa: 1-2 dias*

### **1.1 Criar projeto no Supabase**
- [ ] Acessar [supabase.com](https://supabase.com) e criar novo projeto
- [ ] Configurar região: `sa-east-1` (conforme documentação)
- [ ] Anotar URL do projeto: `https://[project-id].supabase.co`
- [ ] Anotar chave anônima (anon key)
- [ ] Anotar chave de serviço (service key) - **MANTER SEGURA**

### **1.2 Instalar dependências do Supabase**
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### **1.3 Configurar variáveis de ambiente**
Criar/atualizar `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]

# Environment Configuration
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY=false

# Dual-Track Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
AUTH_PROVIDER=supabase
```

### **1.6 Testar conexão básica**
Criar arquivo de teste `lib/supabase-test.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function testConnection() {
  const { data, error } = await supabase.from('users').select('count')
  console.log('Supabase connection test:', { data, error })
  return !error
}
```

---

## 🔴 **FASE 2: ARQUITETURA DUAL-TRACK (MUST HAVE)**
*Estimativa: 3-4 dias*

### **2.1 Criar interface DataProvider**
Arquivo: `lib/dataProviders/types.ts`
```typescript
export interface DataProvider {
  // Autenticação
  login(email: string, password: string): Promise<AuthResponse>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  
  // Meal Plans
  getMealPlans(): Promise<MealPlan[]>
  createMealPlan(data: CreateMealPlanDto): Promise<MealPlan>
  updateMealPlan(id: string, data: UpdateMealPlanDto): Promise<MealPlan>
  deleteMealPlan(id: string): Promise<void>
  
  // Meal Records
  getMealRecords(date?: string): Promise<MealRecord[]>
  createMealRecord(data: CreateMealRecordDto): Promise<MealRecord>
  deleteMealRecord(id: string): Promise<void>
  
  // Hydration
  getHydrationToday(): Promise<HydrationData>
  addGlass(): Promise<HydrationData>
  removeGlass(): Promise<HydrationData>
  updateDailyGoal(goal: number): Promise<HydrationData>
  
  // Receitas
  getRecipes(filters?: RecipeFilters): Promise<Recipe[]>
  createRecipe(data: CreateRecipeDto): Promise<Recipe>
  getRecipe(id: string): Promise<Recipe>
  toggleFavorite(id: string): Promise<void>
}
```

### **2.2 Implementar SupabaseProvider**
Arquivo: `lib/dataProviders/supabase.ts`
- [ ] Implementar todos os métodos da interface DataProvider
- [ ] Usar Supabase Auth para autenticação
- [ ] Implementar upload de imagens no Supabase Storage
- [ ] Tratar erros e validações

### **2.3 Implementar FastAPIProvider (TDD)**
Arquivo: `lib/dataProviders/fastapi.ts`
- [ ] **Implementar mock server** para TDD do frontend
- [ ] **Criar respostas controladas** para todos os cenários
- [ ] **Simular edge cases** (erros, timeouts, dados inválidos)
- [ ] **Implementar delays realistas** para testar loading states
- [ ] **Configurar cenários de teste** específicos
- [ ] **Documentar endpoints mock** para equipe

### **2.4 Criar factory de providers**
Arquivo: `lib/dataProviders/index.ts`
```typescript
export const getDataProvider = (): DataProvider => {
  if (process.env.NODE_ENV === 'production' || process.env.AUTH_PROVIDER === 'supabase') {
    return new SupabaseProvider()
  }
  return new FastAPIProvider()
}
```

### **2.5 Configurar autenticação JWT**
- [ ] Implementar contexto de autenticação unificado
- [ ] Criar hooks para login/logout
- [ ] Implementar proteção de rotas
- [ ] Sincronizar estado de auth entre providers

### **2.6 Criar service layer abstrato**
Arquivo: `lib/services/alimentacao.ts`
```typescript
export class AlimentacaoService {
  constructor(private dataProvider: DataProvider) {}
  
  async getMealPlans() {
    return this.dataProvider.getMealPlans()
  }
  
  // ... outros métodos
}
```

### **2.7 Implementar sistema de fallback**
- [ ] Detectar falhas de conexão
- [ ] Fallback automático para localStorage
- [ ] Queue de sincronização quando voltar online
- [ ] Indicadores visuais de modo offline

---

## 🔴 **FASE 3: MIGRAÇÃO MÓDULO ALIMENTAÇÃO (MUST HAVE)**
*Estimativa: 5-6 dias*

### **3.1 Implementar APIs do módulo alimentação**
- [ ] Endpoints de meal-plans (CRUD completo)
- [ ] Endpoints de meal-records (CRUD completo)
- [ ] Endpoints de hydration (operações específicas)
- [ ] Validação de dados de entrada
- [ ] Tratamento de erros padronizado

### **3.2 Refatorar arquitetura frontend com TDD**
- [ ] **Escrever testes primeiro** para cada componente/hook
- [ ] **Usar FastAPI mock** para desenvolvimento orientado a testes
- [ ] **Implementar React Query/SWR** com testes de cache
- [ ] **Reestruturar stores Zustand** testando cada mutation
- [ ] **Refatorar componentes** com testes de integração
- [ ] **Criar custom hooks** testáveis para lógica de negócio
- [ ] **Testar loading/error states** com cenários controlados
- [ ] **Validar formulários** com testes de edge cases
- [ ] **Garantir acessibilidade** com testes automatizados

### **3.3 Implementar APIs de receitas**
- [ ] CRUD completo de receitas
- [ ] Gerenciamento de ingredientes
- [ ] Sistema de categorias e tags
- [ ] Funcionalidade de favoritos
- [ ] Busca e filtros

### **3.4 Configurar upload de imagens**
- [ ] Configurar bucket no Supabase Storage
- [ ] Implementar upload de fotos de refeições
- [ ] Implementar upload de imagens de receitas
- [ ] Otimização e redimensionamento
- [ ] Fallback para base64 (desenvolvimento)

### **3.5 Criar script de migração de dados**
Arquivo: `scripts/migrate-alimentacao.ts`
- [ ] Ler dados do localStorage
- [ ] Validar estrutura dos dados
- [ ] Migrar para APIs via service layer
- [ ] Backup automático antes da migração
- [ ] Rollback em caso de erro

### **3.6 Implementar sincronização offline/online**
- [ ] Detectar status de conexão
- [ ] Cache local com React Query/SWR
- [ ] Queue de operações offline
- [ ] Sincronização automática
- [ ] Resolução de conflitos

### **3.7 Testar módulo alimentação completo**
- [ ] Testes funcionais com MCP Playwright
- [ ] Validar CRUD operations
- [ ] Testar upload de imagens
- [ ] Validar sincronização offline/online
- [ ] Testar migração de dados

---

## 🟡 **FASE 4: REFATORAÇÃO DEMAIS MÓDULOS COM TDD (SHOULD HAVE)**
*Estimativa: 10-12 dias (incluindo tempo para TDD)*

### **Padrão TDD para Todos os Módulos**
**Cada módulo deve seguir rigorosamente:**
1. **Red** → Escrever testes que falham primeiro
2. **Green** → Implementar código mínimo que passa nos testes
3. **Refactor** → Melhorar código mantendo testes passando
4. **FastAPI Mock** → Usar cenários controlados para todos os casos
5. **Validação** → Testar edge cases, erros e performance

### **4.1 Refatorar módulo Hiperfocos com TDD**
- [ ] **Escrever testes primeiro** para hierarquia de tarefas
- [ ] **Configurar FastAPI mock** para sistema de hiperfocos
- [ ] **Testar alternância** de foco com cenários controlados
- [ ] **Implementar APIs** conforme docs/hiperfocos-migracao.txt
- [ ] **Refatorar stores** com React Query e testes de hierarquia
- [ ] **Testar drag-and-drop** com simulação de eventos
- [ ] **Validar timing** de sessões com mocks precisos
- [ ] **Otimizar performance** com testes de stress
- [ ] **Aplicar metodologia TDD** estabelecida no módulo alimentação

### **4.2 Refatorar módulo Saúde com TDD**
- [ ] **Escrever testes primeiro** para funcionalidades de saúde
- [ ] **Configurar FastAPI mock** para medicamentos e humor
- [ ] **Implementar APIs** para medicamentos com cenários de teste
- [ ] **Refatorar componentes** de registro de humor com TDD
- [ ] **Testar lembretes críticos** com mock de notificações
- [ ] **Validar dados sensíveis** com testes de segurança
- [ ] **Migrar dados existentes** com validação rigorosa
- [ ] **Aplicar padrão TDD** estabelecido no módulo alimentação

### **4.3 Refatorar módulo Estudos com TDD**
- [ ] **Escrever testes** para sistema de pomodoro
- [ ] **Configurar FastAPI mock** para sessões de estudo
- [ ] **Testar timing preciso** com mocks controlados
- [ ] **Refatorar stores** de pomodoro com React Query
- [ ] **Implementar testes** de estatísticas de produtividade
- [ ] **Validar integração** com store existente (pomodoroStore.ts)
- [ ] **Testar persistência** de sessões com cenários de falha
- [ ] **Aplicar padrão TDD** do módulo alimentação

### **4.4 Refatorar módulo Sono com TDD**
- [ ] **Escrever testes** para padrões de sono
- [ ] **Configurar FastAPI mock** para dados temporais
- [ ] **Testar análise de qualidade** do sono com dados mock
- [ ] **Refatorar componentes** de registro de sono
- [ ] **Implementar testes** de relatórios e tendências
- [ ] **Validar cálculos** de padrões com cenários edge
- [ ] **Seguir plano específico** em docs/sono-migracao.txt
- [ ] **Aplicar metodologia TDD** estabelecida

### **4.5 Refatorar módulo Lazer com TDD**
- [ ] **Escrever testes** para atividades de lazer
- [ ] **Configurar FastAPI mock** para catálogo de atividades
- [ ] **Testar tracking** de tempo livre com cenários diversos
- [ ] **Refatorar componentes** de sugestões personalizadas
- [ ] **Implementar testes** de algoritmo de recomendação
- [ ] **Validar balance** vida-trabalho com dados mock
- [ ] **Testar categorização** de atividades
- [ ] **Aplicar padrão TDD** do módulo alimentação

### **4.6 Refatorar módulo Perfil com TDD**
- [ ] **Escrever testes** para configurações de usuário
- [ ] **Configurar FastAPI mock** para dados pessoais
- [ ] **Testar validação** de dados sensíveis
- [ ] **Refatorar componentes** de preferências
- [ ] **Implementar testes** de sincronização de configurações
- [ ] **Validar backup/restore** com cenários de falha
- [ ] **Testar configurações globais** que afetam outros módulos
- [ ] **Seguir plano específico** em docs/perfil-migracao.txt
- [ ] **Aplicar metodologia TDD** como último módulo

### **4.7 Testar integração entre módulos com TDD**
- [ ] **Escrever testes end-to-end** para fluxos completos
- [ ] **Configurar cenários integrados** no FastAPI mock
- [ ] **Testar compartilhamento** de dados entre módulos
- [ ] **Validar performance** com múltiplos módulos ativos
- [ ] **Testar sincronização** cross-module
- [ ] **Validar consistência** de estado global
- [ ] **Executar stress tests** com dados volumosos
- [ ] **Preparar transição** para Supabase em produção

---

## 🟢 **FASE 5: OTIMIZAÇÕES E FINALIZAÇÃO (COULD HAVE)**
*Estimativa: 2-3 dias*

### **5.1 Otimizar performance das queries**
- [ ] Analisar queries lentas
- [ ] Implementar índices adicionais
- [ ] Otimizar joins complexos

### **5.2 Implementar cache Redis (opcional)**
- [ ] Configurar Redis
- [ ] Cache de queries frequentes
- [ ] Invalidação inteligente

### **5.3 Implementar optimistic updates**
- [ ] Updates imediatos na UI
- [ ] Rollback em caso de erro
- [ ] Feedback visual adequado

### **5.4 Configurar monitoramento e logs**
- [ ] Logs estruturados
- [ ] Métricas de performance
- [ ] Alertas de erro

### **5.5 Implementar sistema de backup**
- [ ] Backup automático de dados
- [ ] Restore de dados
- [ ] Versionamento

### **5.6 Limpeza de código legacy**
- [ ] Remover código do localStorage
- [ ] Limpeza de dependências não utilizadas
- [ ] Refatoração final

### **5.7 Documentação final e deploy**
- [ ] Atualizar documentação
- [ ] Guia de deploy
- [ ] Manual de manutenção

---

## 🧪 **METODOLOGIA TDD COM FASTAPI**

### **Ciclo TDD para Refatoração Frontend**

#### **1. Red (Teste Falhando)**
```typescript
// Exemplo: Testar hook de meal plans
describe('useMealPlans', () => {
  it('should load meal plans from API', async () => {
    // Configurar mock no FastAPI
    mockServer.get('/api/meal-plans').reply(200, mockMealPlans)

    const { result } = renderHook(() => useMealPlans())

    await waitFor(() => {
      expect(result.current.data).toEqual(mockMealPlans)
    })
  })
})
```

#### **2. Green (Implementação Mínima)**
```typescript
// Implementar hook que passa no teste
export function useMealPlans() {
  return useQuery(['meal-plans'], () =>
    dataProvider.getMealPlans()
  )
}
```

#### **3. Refactor (Melhorar Código)**
```typescript
// Otimizar e adicionar features
export function useMealPlans(options?: UseQueryOptions) {
  return useQuery(
    ['meal-plans'],
    () => dataProvider.getMealPlans(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      ...options
    }
  )
}
```

### **Cenários de Teste com FastAPI Mock**

#### **Cenários de Sucesso**
- [ ] **Carregamento normal** de dados
- [ ] **Cache funcionando** corretamente
- [ ] **Sincronização** offline/online
- [ ] **Optimistic updates** funcionando

#### **Cenários de Erro**
- [ ] **Network timeout** (simular com delay)
- [ ] **Server error 500** (simular resposta de erro)
- [ ] **Dados inválidos** (simular resposta malformada)
- [ ] **Unauthorized 401** (simular token expirado)

#### **Cenários de Performance**
- [ ] **Loading states** durante requisições
- [ ] **Skeleton loading** para UX
- [ ] **Debounce** em buscas
- [ ] **Pagination** com grandes datasets

### **Configuração do FastAPI Mock**
```python
# mock_server.py
from fastapi import FastAPI, HTTPException
import time
import random

app = FastAPI()

# Simular delay de rede
@app.middleware("http")
async def add_delay(request, call_next):
    # Simular latência realista
    await asyncio.sleep(random.uniform(0.1, 0.5))
    response = await call_next(request)
    return response

# Endpoint com cenários controláveis
@app.get("/api/meal-plans")
async def get_meal_plans(scenario: str = "success"):
    if scenario == "error":
        raise HTTPException(500, "Server error")
    elif scenario == "timeout":
        await asyncio.sleep(10)  # Simular timeout
    elif scenario == "invalid":
        return {"invalid": "data"}

    return [{"id": "1", "time": "08:00", "description": "Café"}]
```

---

## 📊 **CHECKLIST DE VALIDAÇÃO**

### **Antes de cada fase:**
- [ ] Backup completo dos dados atuais
- [ ] Ambiente de teste configurado
- [ ] Plano de rollback definido

### **Após cada fase:**
- [ ] Testes funcionais executados
- [ ] Performance validada
- [ ] Documentação atualizada
- [ ] Aprovação para próxima fase

### **Critérios de sucesso:**
- [ ] Todos os dados migrados corretamente
- [ ] Performance igual ou melhor que antes
- [ ] Zero perda de funcionalidades
- [ ] Sistema estável em produção

---

## 🚨 **PONTOS DE ATENÇÃO**

### **Riscos Identificados:**
1. **Perda de dados** durante migração
2. **Incompatibilidade** entre ambientes
3. **Performance** degradada
4. **Falhas de autenticação**

### **Mitigações:**
1. **Backup automático** antes de cada operação
2. **Testes extensivos** em ambiente de desenvolvimento
3. **Monitoramento** contínuo de performance
4. **Fallback** para localStorage sempre disponível

---

**📝 Nota**: Esta lista deve ser atualizada conforme o progresso da migração. Cada tarefa concluída deve ser marcada e validada antes de prosseguir para a próxima.
