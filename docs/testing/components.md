# 🧩 Testando Componentes React

Guia específico para testes de componentes React no projeto StayFocus.

## 📋 Índice

- [Princípios](#princípios)
- [Setup Básico](#setup-básico)
- [Padrões de Teste](#padrões-de-teste)
- [Casos Comuns](#casos-comuns)
- [Acessibilidade](#acessibilidade)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

## 🎯 Princípios

### O que Testar

✅ **TESTE**:
- Renderização condicional
- Interações do usuário
- Props e estados
- Callbacks e eventos
- Acessibilidade
- Estados de loading/error

❌ **NÃO TESTE**:
- Detalhes de implementação
- Estilos CSS específicos
- Estrutura DOM interna
- Bibliotecas externas

### Filosofia

> "Teste como o usuário usa, não como o código funciona"

## 🛠️ Setup Básico

### Imports Padrão

```typescript
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ComponentName } from '@/components/ComponentName'
```

### Template de Teste

```typescript
import { render, screen } from '@/test-utils'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  // Props padrão para reduzir repetição
  const defaultProps = {
    title: 'Test Title',
    onSubmit: vi.fn(),
  }

  // Helper para render com props padrão
  const renderComponent = (props = {}) => {
    return render(<ComponentName {...defaultProps} {...props} />)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar com props básicas', () => {
      renderComponent()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })
  })

  describe('Interações', () => {
    it('deve chamar callback quando ação é executada', async () => {
      const onSubmit = vi.fn()
      renderComponent({ onSubmit })
      
      await userEvent.click(screen.getByRole('button', { name: /submit/i }))
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Estados', () => {
    it('deve mostrar loading quando carregando', () => {
      renderComponent({ loading: true })
      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })
  })
})
```

## 📝 Padrões de Teste

### 1. Renderização Condicional

```typescript
describe('HiperfocoCard', () => {
  it('deve mostrar botão editar quando editável', () => {
    render(<HiperfocoCard hiperfoco={mockHiperfoco} editable />)
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('deve ocultar botão editar quando não editável', () => {
    render(<HiperfocoCard hiperfoco={mockHiperfoco} editable={false} />)
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
  })

  it('deve mostrar placeholder quando sem dados', () => {
    render(<HiperfocoCard hiperfoco={null} />)
    expect(screen.getByText(/nenhum hiperfoco selecionado/i)).toBeInTheDocument()
  })
})
```

### 2. Interações do Usuário

```typescript
describe('TarefaForm', () => {
  it('deve atualizar campo quando usuário digita', async () => {
    const user = userEvent.setup()
    render(<TarefaForm />)
    
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Nova tarefa')
    
    expect(titleInput).toHaveValue('Nova tarefa')
  })

  it('deve submeter formulário com dados corretos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<TarefaForm onSubmit={onSubmit} />)
    
    // Preencher formulário
    await user.type(screen.getByLabelText(/título/i), 'Tarefa teste')
    await user.type(screen.getByLabelText(/descrição/i), 'Descrição teste')
    
    // Submeter
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    
    expect(onSubmit).toHaveBeenCalledWith({
      titulo: 'Tarefa teste',
      descricao: 'Descrição teste'
    })
  })
})
```

### 3. Estados Assíncronos

```typescript
describe('HiperfocosList', () => {
  it('deve mostrar loading inicialmente', () => {
    render(<HiperfocosList loading />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('deve mostrar dados após carregamento', async () => {
    const { rerender } = render(<HiperfocosList loading />)
    
    // Simular fim do loading
    rerender(<HiperfocosList data={mockHiperfocos} loading={false} />)
    
    await waitFor(() => {
      expect(screen.getByText('Hiperfoco 1')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro quando falha', () => {
    render(<HiperfocosList error="Erro ao carregar" />)
    expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument()
  })
})
```

### 4. Formulários Complexos

```typescript
describe('HiperfocoForm', () => {
  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<HiperfocoForm />)
    
    // Tentar submeter sem preencher
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    
    // Verificar mensagens de erro
    expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument()
  })

  it('deve limpar erros quando campo é preenchido', async () => {
    const user = userEvent.setup()
    render(<HiperfocoForm />)
    
    // Gerar erro
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    
    // Preencher campo
    await user.type(screen.getByLabelText(/título/i), 'Título válido')
    
    // Verificar que erro foi removido
    await waitFor(() => {
      expect(screen.queryByText(/título é obrigatório/i)).not.toBeInTheDocument()
    })
  })
})
```

## 🎯 Casos Comuns

### Modais e Overlays

```typescript
describe('ConfirmDialog', () => {
  it('deve abrir quando trigger é clicado', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog trigger={<button>Deletar</button>} />)
    
    await user.click(screen.getByRole('button', { name: /deletar/i }))
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/tem certeza/i)).toBeInTheDocument()
  })

  it('deve fechar quando cancelar é clicado', async () => {
    const user = userEvent.setup()
    render(<ConfirmDialog open />)
    
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
```

### Listas e Virtualization

```typescript
describe('TarefasList', () => {
  it('deve renderizar todas as tarefas', () => {
    const tarefas = [
      createTarefa({ titulo: 'Tarefa 1' }),
      createTarefa({ titulo: 'Tarefa 2' }),
      createTarefa({ titulo: 'Tarefa 3' }),
    ]
    
    render(<TarefasList tarefas={tarefas} />)
    
    tarefas.forEach(tarefa => {
      expect(screen.getByText(tarefa.titulo)).toBeInTheDocument()
    })
  })

  it('deve mostrar mensagem quando lista vazia', () => {
    render(<TarefasList tarefas={[]} />)
    expect(screen.getByText(/nenhuma tarefa encontrada/i)).toBeInTheDocument()
  })
})
```

### Drag and Drop

```typescript
describe('TarefasDragDrop', () => {
  it('deve reordenar tarefas quando arrastadas', async () => {
    const onReorder = vi.fn()
    const tarefas = [
      createTarefa({ id: '1', titulo: 'Tarefa 1', ordem: 0 }),
      createTarefa({ id: '2', titulo: 'Tarefa 2', ordem: 1 }),
    ]
    
    render(<TarefasDragDrop tarefas={tarefas} onReorder={onReorder} />)
    
    // Simular drag and drop
    await dragAndDrop(
      '[data-testid="tarefa-1"]',
      '[data-testid="tarefa-2"]'
    )
    
    expect(onReorder).toHaveBeenCalledWith([
      { id: '2', ordem: 0 },
      { id: '1', ordem: 1 },
    ])
  })
})
```

## ♿ Acessibilidade

### Testes de A11y

```typescript
describe('Button Accessibility', () => {
  it('deve ter atributos ARIA corretos', () => {
    render(<Button loading>Carregando</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAriaAttribute('aria-disabled', 'true')
    expect(button).toHaveAriaAttribute('aria-label', 'Carregando')
  })

  it('deve ser navegável por teclado', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Clique</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(button).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Formulários Acessíveis

```typescript
describe('Form Accessibility', () => {
  it('deve associar labels com inputs', () => {
    render(<TarefaForm />)
    
    const titleInput = screen.getByLabelText(/título/i)
    const descInput = screen.getByLabelText(/descrição/i)
    
    expect(titleInput).toBeInTheDocument()
    expect(descInput).toBeInTheDocument()
  })

  it('deve mostrar erros com aria-describedby', async () => {
    const user = userEvent.setup()
    render(<TarefaForm />)
    
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    
    const titleInput = screen.getByLabelText(/título/i)
    const errorMessage = screen.getByText(/título é obrigatório/i)
    
    expect(titleInput).toHaveAttribute('aria-describedby')
    expect(errorMessage).toHaveAttribute('role', 'alert')
  })
})
```

## ⚡ Performance

### Lazy Loading

```typescript
describe('LazyComponent', () => {
  it('deve carregar componente sob demanda', async () => {
    render(<LazyComponentWrapper />)
    
    // Inicialmente não deve estar carregado
    expect(screen.queryByTestId('lazy-content')).not.toBeInTheDocument()
    
    // Trigger para carregar
    await userEvent.click(screen.getByRole('button', { name: /carregar/i }))
    
    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.getByTestId('lazy-content')).toBeInTheDocument()
    })
  })
})
```

### Memoization

```typescript
describe('MemoizedComponent', () => {
  it('não deve re-renderizar com mesmas props', () => {
    const renderSpy = vi.fn()
    const TestComponent = React.memo(() => {
      renderSpy()
      return <div>Test</div>
    })
    
    const { rerender } = render(<TestComponent prop="value" />)
    expect(renderSpy).toHaveBeenCalledTimes(1)
    
    // Re-render com mesmas props
    rerender(<TestComponent prop="value" />)
    expect(renderSpy).toHaveBeenCalledTimes(1) // Não deve re-renderizar
    
    // Re-render com props diferentes
    rerender(<TestComponent prop="new-value" />)
    expect(renderSpy).toHaveBeenCalledTimes(2) // Deve re-renderizar
  })
})
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Elemento não encontrado**
   ```typescript
   // ❌ Muito específico
   screen.getByText('Texto exato')
   
   // ✅ Mais flexível
   screen.getByText(/texto/i)
   ```

2. **Operações assíncronas**
   ```typescript
   // ❌ Sem aguardar
   fireEvent.click(button)
   expect(screen.getByText('Resultado')).toBeInTheDocument()
   
   // ✅ Com waitFor
   fireEvent.click(button)
   await waitFor(() => {
     expect(screen.getByText('Resultado')).toBeInTheDocument()
   })
   ```

3. **Cleanup de efeitos**
   ```typescript
   afterEach(() => {
     cleanup()
     vi.clearAllMocks()
     vi.clearAllTimers()
   })
   ```

### Debug Tips

```typescript
// Ver DOM atual
screen.debug()

// Ver queries disponíveis
screen.logTestingPlaygroundURL()

// Verificar se elemento existe
console.log(screen.queryByText('Texto'))
```
