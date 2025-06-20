# 🧪 Guia de Testes - StayFocus

Este documento estabelece os padrões e práticas de teste para o projeto StayFocus, seguindo metodologia TDD (Test-Driven Development).

## 📋 Índice

- [Filosofia de Testes](#filosofia-de-testes)
- [Estrutura de Testes](#estrutura-de-testes)
- [Padrões de Nomenclatura](#padrões-de-nomenclatura)
- [Tipos de Teste](#tipos-de-teste)
- [Ferramentas e Configuração](#ferramentas-e-configuração)
- [Exemplos Práticos](#exemplos-práticos)
- [Boas Práticas](#boas-práticas)
- [Troubleshooting](#troubleshooting)

## 🎯 Filosofia de Testes

### Princípios Fundamentais

1. **Test-First**: Escreva testes antes do código de produção
2. **Red-Green-Refactor**: Ciclo TDD clássico
3. **Coverage Mínimo**: 70% de cobertura em todas as métricas
4. **Testes Rápidos**: Testes unitários devem executar em < 100ms
5. **Isolamento**: Cada teste deve ser independente
6. **Clareza**: Testes devem ser auto-documentados

### Pirâmide de Testes

```
    🔺 E2E (Poucos)
   🔺🔺 Integration (Alguns)
  🔺🔺🔺 Unit (Muitos)
```

- **70%** Testes Unitários
- **20%** Testes de Integração  
- **10%** Testes E2E

## 📁 Estrutura de Testes

```
__tests__/
├── components/          # Testes de componentes React
├── hooks/              # Testes de hooks customizados
├── services/           # Testes de serviços e APIs
├── utils/              # Testes de utilitários
├── integration/        # Testes de integração
├── e2e/               # Testes end-to-end
├── factories/         # Factories para dados de teste
├── mocks/             # Mocks e stubs
│   ├── handlers.ts    # MSW handlers
│   ├── server.ts      # MSW server
│   ├── hooks.ts       # Mock hooks
│   └── services.ts    # Mock services
└── utils/             # Utilitários de teste
    ├── test-utils.tsx # Render customizado
    ├── custom-queries.ts
    ├── custom-matchers.ts
    └── test-helpers.ts
```

## 🏷️ Padrões de Nomenclatura

### Arquivos de Teste

```typescript
// ✅ Correto
ComponentName.test.tsx
hookName.test.ts
serviceName.test.ts
utilityName.test.ts

// ❌ Incorreto
ComponentName.spec.tsx
test-ComponentName.tsx
ComponentNameTest.tsx
```

### Describe Blocks

```typescript
// ✅ Correto
describe('ComponentName', () => {
  describe('quando prop X é verdadeira', () => {
    describe('e usuário clica no botão', () => {
      it('deve executar ação Y', () => {})
    })
  })
})

// ❌ Incorreto
describe('Teste do ComponentName', () => {})
describe('ComponentName tests', () => {})
```

### Test Cases

```typescript
// ✅ Correto - Comportamento esperado
it('deve renderizar título quando fornecido', () => {})
it('deve chamar onSubmit quando formulário é válido', () => {})
it('deve mostrar erro quando API falha', () => {})

// ❌ Incorreto - Implementação
it('deve ter className "title"', () => {})
it('deve chamar useState', () => {})
```

## 🧪 Tipos de Teste

### 1. Testes Unitários

**Objetivo**: Testar unidades isoladas de código

```typescript
// Exemplo: Teste de hook
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

describe('useCounter', () => {
  it('deve inicializar com valor padrão', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('deve incrementar quando increment é chamado', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### 2. Testes de Componente

**Objetivo**: Testar comportamento e interação de componentes

```typescript
import { render, screen, fireEvent } from '@/test-utils'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('deve renderizar com texto fornecido', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument()
  })

  it('deve chamar onClick quando clicado', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clique</Button>)
    
    await fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('deve estar desabilitado quando loading', () => {
    render(<Button loading>Carregando</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 3. Testes de Integração

**Objetivo**: Testar interação entre múltiplos componentes/serviços

```typescript
import { render, screen, waitFor } from '@/test-utils'
import { HiperfocoForm } from '@/components/HiperfocoForm'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('HiperfocoForm Integration', () => {
  it('deve criar hiperfoco com sucesso', async () => {
    server.use(
      http.post('/api/hiperfocos', () => {
        return HttpResponse.json({ id: '1', titulo: 'Novo Hiperfoco' })
      })
    )

    render(<HiperfocoForm />)
    
    // Preencher formulário
    await fillForm({
      'Título': 'Novo Hiperfoco',
      'Descrição': 'Descrição do hiperfoco'
    })
    
    // Submeter
    await submitForm()
    
    // Verificar resultado
    await waitFor(() => {
      expect(screen.getByText(/hiperfoco criado com sucesso/i)).toBeInTheDocument()
    })
  })
})
```

## 🛠️ Ferramentas e Configuração

### Stack de Testes

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: V8
- **Assertions**: Vitest + Custom Matchers

### Configuração Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        }
      }
    }
  }
})
```

## 📚 Exemplos Práticos

### Testando Hooks com React Query

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { createTestQueryClient, render } from '@/test-utils'
import { useHiperfocos } from '@/hooks/useHiperfocos'

describe('useHiperfocos', () => {
  it('deve carregar hiperfocos com sucesso', async () => {
    const { result } = renderHook(() => useHiperfocos(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={createTestQueryClient()}>
          {children}
        </QueryClientProvider>
      )
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(2)
  })
})
```

### Testando Formulários

```typescript
import { render, screen } from '@/test-utils'
import { HiperfocoForm } from '@/components/HiperfocoForm'

describe('HiperfocoForm', () => {
  it('deve validar campos obrigatórios', async () => {
    render(<HiperfocoForm />)
    
    // Tentar submeter sem preencher
    await submitForm()
    
    // Verificar erros de validação
    expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument()
  })

  it('deve submeter com dados válidos', async () => {
    const onSubmit = vi.fn()
    render(<HiperfocoForm onSubmit={onSubmit} />)
    
    await fillForm({
      'Título': 'Hiperfoco Teste',
      'Descrição': 'Descrição teste'
    })
    
    await submitForm()
    
    expect(onSubmit).toHaveBeenCalledWith({
      titulo: 'Hiperfoco Teste',
      descricao: 'Descrição teste'
    })
  })
})
```

## ✅ Boas Práticas

### 1. Arrange-Act-Assert (AAA)

```typescript
it('deve incrementar contador', () => {
  // Arrange
  const { result } = renderHook(() => useCounter(0))
  
  // Act
  act(() => {
    result.current.increment()
  })
  
  // Assert
  expect(result.current.count).toBe(1)
})
```

### 2. Use Factories para Dados

```typescript
// ✅ Correto
const hiperfoco = createHiperfoco({ titulo: 'Teste' })

// ❌ Incorreto
const hiperfoco = {
  id: '1',
  titulo: 'Teste',
  descricao: 'Desc',
  // ... muitos campos
}
```

### 3. Mock no Nível Certo

```typescript
// ✅ Correto - Mock de serviço
vi.mock('@/services/hiperfocos', () => ({
  getHiperfocos: vi.fn().mockResolvedValue([])
}))

// ❌ Incorreto - Mock de implementação interna
vi.mock('react-query', () => ({
  useQuery: vi.fn()
}))
```

### 4. Teste Comportamento, Não Implementação

```typescript
// ✅ Correto
it('deve mostrar loading durante carregamento', () => {
  render(<HiperfocosList loading />)
  expect(screen.getByTestId('loading')).toBeInTheDocument()
})

// ❌ Incorreto
it('deve ter estado loading true', () => {
  const component = render(<HiperfocosList />)
  expect(component.state.loading).toBe(true)
})
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Testes Flaky**: Use `waitFor` para operações assíncronas
2. **Memory Leaks**: Limpe timers e listeners em `afterEach`
3. **Mocks Não Funcionam**: Verifique ordem de imports
4. **Coverage Baixo**: Adicione testes para edge cases

### Debug de Testes

```typescript
// Debug de queries
screen.debug() // Mostra DOM atual
screen.logTestingPlaygroundURL() // URL para playground

// Debug de hooks
console.log(result.current) // Estado atual do hook
```

## 📊 Métricas de Qualidade

### Coverage Targets

| Tipo | Mínimo | Ideal |
|------|--------|-------|
| Lines | 70% | 85% |
| Functions | 70% | 85% |
| Branches | 70% | 80% |
| Statements | 70% | 85% |

### Performance Targets

| Métrica | Target |
|---------|--------|
| Teste Unitário | < 100ms |
| Teste Integração | < 500ms |
| Suite Completa | < 30s |

---

**Próximos Passos**: Consulte os guias específicos em:
- [Testando Componentes](./components.md)
- [Testando Hooks](./hooks.md)
- [Testando Serviços](./services.md)
- [Testes de Integração](./integration.md)
