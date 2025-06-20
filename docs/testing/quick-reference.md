# 🚀 Quick Reference - Testes

Referência rápida para desenvolvimento com TDD no StayFocus.

## 🔄 Ciclo TDD

```
1. 🔴 RED    → Escreva um teste que falha
2. 🟢 GREEN  → Escreva código mínimo para passar
3. 🔵 REFACTOR → Melhore o código mantendo testes passando
```

## 📝 Comandos Essenciais

```bash
# Executar testes
npm run test                 # Watch mode
npm run test:run            # Single run
npm run test:coverage       # Com coverage
npm run test:ui             # Interface visual

# Executar testes específicos
npm run test -- Button      # Testes do Button
npm run test -- --watch     # Watch mode específico
```

## 🧪 Templates Rápidos

### Componente Básico

```typescript
import { render, screen } from '@/test-utils'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  it('deve renderizar corretamente', () => {
    render(<ComponentName />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })
})
```

### Hook Customizado

```typescript
import { renderHook, act } from '@testing-library/react'
import { useHookName } from '@/hooks/useHookName'

describe('useHookName', () => {
  it('deve retornar valor inicial', () => {
    const { result } = renderHook(() => useHookName())
    expect(result.current.value).toBe(expectedValue)
  })
})
```

### Serviço/API

```typescript
import { vi } from 'vitest'
import { serviceName } from '@/services/serviceName'

describe('serviceName', () => {
  it('deve chamar API corretamente', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: [] })
    global.fetch = mockFetch
    
    await serviceName.getData()
    
    expect(mockFetch).toHaveBeenCalledWith('/api/endpoint')
  })
})
```

## 🎯 Queries Mais Usadas

```typescript
// Por role (preferido)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })

// Por label
screen.getByLabelText(/password/i)

// Por texto
screen.getByText(/welcome/i)

// Por test-id (último recurso)
screen.getByTestId('loading-spinner')

// Queries que podem não existir
screen.queryByText(/optional/i)  // Retorna null se não encontrar
screen.findByText(/async/i)      // Aguarda aparecer
```

## 🔧 Utilitários Customizados

```typescript
// Render com providers
import { render } from '@/test-utils'  // Já inclui QueryClient

// Preencher formulário
await fillForm({
  'Email': 'test@example.com',
  'Password': 'password123'
})

// Submeter formulário
await submitForm(/save|submit/i)

// Aguardar loading sumir
await waitForLoadingToFinish()

// Simular drag and drop
await dragAndDrop('[data-testid="item-1"]', '[data-testid="item-2"]')
```

## 🎭 Mocks Essenciais

### React Query

```typescript
import { createTestQueryClient } from '@/test-utils'

const queryClient = createTestQueryClient()
// Já configurado para testes (sem retry, cache, etc.)
```

### MSW (API Mocking)

```typescript
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

// Override handler para teste específico
server.use(
  http.get('/api/data', () => {
    return HttpResponse.json({ data: 'test' })
  })
)
```

### Hooks

```typescript
import { createMockUseHiperfocos } from '@/mocks/hooks'

vi.mock('@/hooks/useHiperfocos', () => ({
  useHiperfocos: createMockUseHiperfocos({ isLoading: true })
}))
```

## 🏭 Factories

```typescript
import { 
  createHiperfoco, 
  createTarefa, 
  createUser,
  createList 
} from '@/factories'

// Dados únicos
const hiperfoco = createHiperfoco()
const tarefa = createTarefa({ titulo: 'Custom title' })

// Listas
const hiperfocos = createList(createHiperfoco, 3)
const tarefas = createList(createTarefa, 5, [
  { titulo: 'First' },
  { titulo: 'Second' }
])
```

## 🎨 Matchers Customizados

```typescript
// Verificar loading
expect(element).toBeLoading()

// Verificar erro
expect(element).toHaveErrorState()

// Verificar acessibilidade
expect(button).toBeAccessible()

// Verificar formulário válido
expect(form).toBeValidForm()

// Verificar foco
expect(input).toBeFocused()

// Verificar viewport
expect(element).toBeInViewport()
```

## 🚨 Checklist de Teste

### Antes de Escrever

- [ ] Entendi o comportamento esperado?
- [ ] Identifiquei os casos edge?
- [ ] Sei quais dados preciso mockar?

### Durante o Desenvolvimento

- [ ] Teste falha primeiro (RED)?
- [ ] Código mínimo para passar (GREEN)?
- [ ] Refatorei mantendo testes (REFACTOR)?

### Antes do Commit

- [ ] Todos os testes passam?
- [ ] Coverage está acima de 70%?
- [ ] Não há testes flaky?
- [ ] Testes são legíveis?

## 🐛 Debug Rápido

```typescript
// Ver DOM atual
screen.debug()

// Ver elemento específico
screen.debug(screen.getByRole('button'))

// Playground URL
screen.logTestingPlaygroundURL()

// Listar queries disponíveis
console.log(screen.getAllByRole('button'))

// Verificar se elemento existe
console.log(!!screen.queryByText('Text'))
```

## 📊 Coverage

```bash
# Gerar relatório
npm run test:coverage

# Ver no browser
open coverage/index.html

# Verificar thresholds
npm run test:coverage -- --reporter=json
```

## 🔗 Links Úteis

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [MSW Docs](https://mswjs.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## 🆘 Quando Pedir Ajuda

1. **Teste flaky**: Verifique operações assíncronas
2. **Mock não funciona**: Verifique ordem de imports
3. **Coverage baixo**: Adicione testes para edge cases
4. **Teste lento**: Verifique timeouts e mocks

---

💡 **Dica**: Mantenha esta referência aberta durante o desenvolvimento!
