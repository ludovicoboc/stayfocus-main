# 📅 CRONOGRAMA DETALHADO - MIGRAÇÃO TDD ESTUDOS E CONCURSOS

## 🎯 VISÃO GERAL

**Duração Total**: 9 semanas  
**Metodologia**: Test-Driven Development (RED-GREEN-REFACTOR)  
**Arquitetura**: Dual Backend (Supabase + FastAPI)  
**Quality Gates**: Implementados desde a Semana 1  

---

## 📊 FASES DE IMPLEMENTAÇÃO

### 🔴 FASE 1: RED (Semanas 1-2) - Testes Falhando

#### Semana 1: Setup e Testes Básicos
**Objetivo**: Estabelecer infraestrutura TDD e primeiros testes falhando

**Dia 1-2: Configuração do Ambiente**
- [ ] Configurar Vitest com coverage específico para módulo
- [ ] Setup MSW com handlers para estudos/concursos
- [ ] Criar factories completas (concursos, questões, sessões)
- [ ] Configurar pipeline CI/CD com quality gates

**Dia 3-5: Testes de Stores (RED)**
```typescript
// Exemplo de teste falhando
describe('useConcursosStore', () => {
  it('🔴 deve adicionar concurso com validação', () => {
    const { result } = renderHook(() => useConcursosStore())
    const concurso = createConcurso()
    
    act(() => {
      result.current.adicionarConcurso(concurso)
    })
    
    expect(result.current.concursos).toHaveLength(1)
    // FALHA: Store ainda não implementado
  })
})
```

**Entregáveis Semana 1**:
- ✅ 15 testes falhando para concursosStore
- ✅ 20 testes falhando para questoesStore  
- ✅ 10 testes falhando para registroEstudosStore
- ✅ Coverage setup com threshold 70%

#### Semana 2: Testes de Componentes (RED)
**Objetivo**: Criar testes falhando para componentes principais

**Dia 1-3: Componentes de Concursos**
- [ ] ConcursoForm.test.tsx (25 testes)
- [ ] QuestaoForm.test.tsx (30 testes)
- [ ] QuestaoList.test.tsx (20 testes)
- [ ] GeradorQuestoesLLM.test.tsx (15 testes)

**Dia 4-5: Componentes de Estudos**
- [ ] RegistroEstudos.test.tsx (20 testes)
- [ ] TemporizadorPomodoro.test.tsx (25 testes)
- [ ] SimuladoLoader.test.tsx (20 testes)

**Entregáveis Semana 2**:
- ✅ 155 testes falhando total
- ✅ Estrutura completa de testes
- ✅ Mocks e factories funcionais

---

### 🟢 FASE 2: GREEN (Semanas 3-5) - Implementação Mínima

#### Semana 3: Stores e APIs Básicas
**Objetivo**: Fazer testes passarem com implementação mínima

**Dia 1-2: ConcursosStore + API**
```typescript
// Implementação mínima para passar nos testes
export const useConcursosStore = create<ConcursosStore>()(
  persist(
    (set, get) => ({
      concursos: [],
      adicionarConcurso: (concurso) => {
        // Implementação mínima
        set((state) => ({
          concursos: [...state.concursos, { ...concurso, id: crypto.randomUUID() }]
        }))
      },
      // ... outras funções mínimas
    }),
    { name: 'concursos-storage' }
  )
)
```

**Dia 3-4: QuestoesStore + API**
- Implementar CRUD básico
- Relacionamento com concursos
- Busca simples por filtros

**Dia 5: RegistroEstudosStore**
- CRUD de sessões de estudo
- Cálculos básicos de estatísticas

**Entregáveis Semana 3**:
- ✅ 45 testes passando (stores)
- ✅ APIs básicas funcionais
- ✅ Persistência localStorage mantida

#### Semana 4: Componentes Principais
**Objetivo**: Implementar componentes para passar nos testes

**Dia 1-2: ConcursoForm**
- Formulário básico CRUD
- Validações essenciais
- Integração com store

**Dia 3-4: QuestaoForm + QuestaoList**
- Formulário de questões
- Lista com filtros básicos
- Gerenciamento de alternativas

**Dia 5: RegistroEstudos**
- Interface de sessões
- Estatísticas básicas

**Entregáveis Semana 4**:
- ✅ 100 testes passando (componentes)
- ✅ Interfaces funcionais
- ✅ Integração store-componente

#### Semana 5: Infraestrutura Backend
**Objetivo**: Configurar arquitetura dual

**Dia 1-2: Supabase Setup**
```sql
-- Schema básico
CREATE TABLE concursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    titulo VARCHAR(500) NOT NULL,
    organizadora VARCHAR(255) NOT NULL,
    -- ... outros campos
);
```

**Dia 3-4: FastAPI Local**
```python
# API básica para desenvolvimento
@app.get("/api/concursos")
async def get_concursos(user_id: str):
    return await concursos_service.get_by_user(user_id)
```

**Dia 5: Integração e Testes**
- Conectar frontend com backends
- Testes de integração básicos

**Entregáveis Semana 5**:
- ✅ 130 testes passando
- ✅ Supabase configurado
- ✅ FastAPI funcionando
- ✅ Migração de dados básica

---

### 🔵 FASE 3: REFACTOR (Semanas 6-7) - Otimização

#### Semana 6: Performance e Otimizações
**Objetivo**: Melhorar performance e qualidade do código

**Dia 1-2: Otimização de Queries**
```typescript
// Antes: Busca simples
const questoes = allQuestoes.filter(q => q.disciplina === disciplina)

// Depois: Busca otimizada com índices
const questoes = await questoesApi.buscarPorDisciplina(disciplina, {
  cache: true,
  limit: 20,
  offset: page * 20
})
```

**Dia 3-4: Cache e Estado**
- Implementar React Query
- Cache inteligente
- Otimização de re-renders

**Dia 5: Bundle Optimization**
- Lazy loading de componentes
- Code splitting
- Tree shaking

**Entregáveis Semana 6**:
- ✅ Performance < 100ms para queries
- ✅ Bundle size reduzido 20%
- ✅ Cache implementado

#### Semana 7: Qualidade e Acessibilidade
**Objetivo**: Melhorar qualidade geral e acessibilidade

**Dia 1-2: Acessibilidade**
- ARIA labels completos
- Navegação por teclado
- Screen reader support

**Dia 3-4: Validações Avançadas**
```typescript
// Validação educacional específica
const validateQuestionStructure = (questao: Questao) => {
  const errors = []
  
  if (!questao.alternativas.some(alt => alt.correta)) {
    errors.push('Questão deve ter pelo menos uma alternativa correta')
  }
  
  if (questao.alternativas.length < 2) {
    errors.push('Questão deve ter pelo menos 2 alternativas')
  }
  
  return { isValid: errors.length === 0, errors }
}
```

**Dia 5: Testes de Qualidade**
- Testes de acessibilidade
- Testes de performance
- Validação de dados educacionais

**Entregáveis Semana 7**:
- ✅ 155 testes passando (100%)
- ✅ Acessibilidade WCAG 2.1 AA
- ✅ Validações robustas

---

### 🚀 FASE 4: FEATURES AVANÇADAS (Semanas 8-9)

#### Semana 8: Funcionalidades Avançadas
**Objetivo**: Implementar features diferenciadas

**Dia 1-2: Geração Automática de Questões**
```typescript
// Integração com LLM para geração
const gerarQuestoes = async (tema: string, quantidade: number) => {
  const prompt = `Gere ${quantidade} questões sobre ${tema}...`
  const response = await llmApi.generate(prompt)
  return parseQuestoes(response)
}
```

**Dia 3-4: Sistema de Importação/Exportação**
- Importar de múltiplos formatos
- Exportar para PDF/JSON
- Validação automática

**Dia 5: Analytics Avançados**
- Métricas de performance
- Relatórios de estudo
- Recomendações personalizadas

#### Semana 9: Finalização e Deploy
**Objetivo**: Preparar para produção

**Dia 1-2: Migração de Dados**
```typescript
// Script de migração do localStorage
const migrarDados = async () => {
  const dadosLocais = {
    concursos: JSON.parse(localStorage.getItem('concursos-storage') || '[]'),
    questoes: JSON.parse(localStorage.getItem('questoes-store') || '[]'),
    // ... outros dados
  }
  
  await api.migrarDados(dadosLocais)
  console.log('Migração concluída com sucesso')
}
```

**Dia 3-4: Testes Finais**
- Testes end-to-end
- Testes de carga
- Validação de migração

**Dia 5: Deploy e Monitoramento**
- Deploy em produção
- Configurar monitoramento
- Documentação final

---

## 📈 MÉTRICAS DE ACOMPANHAMENTO

### Métricas Semanais
| Semana | Testes Passando | Coverage | Performance | Features |
|--------|----------------|----------|-------------|----------|
| 1 | 0/155 (0%) | 0% | N/A | Setup |
| 2 | 0/155 (0%) | 0% | N/A | Testes RED |
| 3 | 45/155 (29%) | 30% | N/A | Stores |
| 4 | 100/155 (65%) | 65% | N/A | Componentes |
| 5 | 130/155 (84%) | 70% | 200ms | Backend |
| 6 | 145/155 (94%) | 75% | 100ms | Performance |
| 7 | 155/155 (100%) | 80% | 50ms | Qualidade |
| 8 | 155/155 (100%) | 85% | 50ms | Features |
| 9 | 155/155 (100%) | 85% | 50ms | Deploy |

### Quality Gates por Semana
- **Semana 3**: Coverage > 30%
- **Semana 5**: Coverage > 70%, Backend funcionando
- **Semana 6**: Performance < 100ms
- **Semana 7**: Coverage > 80%, Acessibilidade OK
- **Semana 9**: Todos os critérios atendidos

---

## 🎯 CRITÉRIOS DE SUCESSO

### Técnicos
- ✅ 155 testes passando (100%)
- ✅ Coverage > 80%
- ✅ Performance < 50ms
- ✅ Bundle size otimizado
- ✅ Acessibilidade WCAG 2.1 AA

### Funcionais
- ✅ Migração de dados 100% íntegra
- ✅ Todas as funcionalidades preservadas
- ✅ Novas features implementadas
- ✅ UX melhorada

### Operacionais
- ✅ Deploy automatizado
- ✅ Monitoramento ativo
- ✅ Documentação completa
- ✅ Rollback plan definido
