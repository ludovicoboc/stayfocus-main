# 🏗️ Arquitetura do Sistema de Hiperfocos

## 📋 Visão Geral da Arquitetura

O sistema de hiperfocos foi projetado seguindo princípios de arquitetura limpa, separação de responsabilidades e padrões modernos do React. A arquitetura é modular, testável e escalável.

## 🎯 Princípios Arquiteturais

### 1. Separação de Responsabilidades
- **Componentes**: Apenas apresentação e interação
- **Hooks**: Lógica de negócio e estado
- **Serviços**: Comunicação com APIs e validação
- **Utilitários**: Funções auxiliares reutilizáveis

### 2. Inversão de Dependência
- Componentes dependem de abstrações (hooks)
- Hooks dependem de serviços
- Serviços são injetáveis e testáveis

### 3. Single Responsibility
- Cada módulo tem uma responsabilidade específica
- Funções pequenas e focadas
- Componentes com propósito único

## 🧩 Estrutura de Camadas

```
┌─────────────────────────────────────┐
│           PRESENTATION              │
│     (Components + UI Logic)         │
├─────────────────────────────────────┤
│            BUSINESS                 │
│        (Hooks + State)              │
├─────────────────────────────────────┤
│            SERVICES                 │
│      (API + Validation)             │
├─────────────────────────────────────┤
│            UTILITIES                │
│       (Helpers + Utils)             │
└─────────────────────────────────────┘
```

### Camada de Apresentação
**Responsabilidade**: Interface do usuário e interações

```typescript
// Componentes focados apenas em UI
const FormularioHiperfocoRefatorado = ({ onSubmit, initialData }) => {
  const { formState, handlers } = useHiperfocoForm(initialData)
  
  return (
    <form onSubmit={handlers.submit}>
      {/* JSX focado apenas na apresentação */}
    </form>
  )
}
```

### Camada de Negócio
**Responsabilidade**: Lógica de negócio e gerenciamento de estado

```typescript
// Hooks encapsulam toda a lógica
const useHiperfocoForm = (initialData) => {
  const [formState, setFormState] = useState(initialData)
  const { validate } = useValidation()
  const { save } = useHiperfocoService()
  
  const handlers = {
    submit: async (data) => {
      const errors = validate(data)
      if (!errors.length) {
        await save(data)
      }
    }
  }
  
  return { formState, handlers }
}
```

### Camada de Serviços
**Responsabilidade**: Comunicação externa e validação

```typescript
// Serviços abstraem APIs e validação
export const hiperfocoService = {
  async create(data: CreateHiperfocoData) {
    const validated = await validate(data)
    return api.post('/hiperfocos', validated)
  },
  
  async update(id: string, data: UpdateHiperfocoData) {
    const validated = await validate(data)
    return api.put(`/hiperfocos/${id}`, validated)
  }
}
```

### Camada de Utilitários
**Responsabilidade**: Funções auxiliares reutilizáveis

```typescript
// Utilitários puros e testáveis
export const formatters = {
  timeToMinutes: (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  },
  
  calculateProgress: (tasks: Task[]) => {
    const completed = tasks.filter(t => t.completed).length
    return Math.round((completed / tasks.length) * 100)
  }
}
```

## 🔄 Fluxo de Dados

### 1. Fluxo Unidirecional
```
User Action → Component → Hook → Service → API
                ↓
            State Update ← Hook ← Response
                ↓
            Re-render ← Component
```

### 2. Gerenciamento de Estado

#### Estado Local (useState)
```typescript
// Para estado específico do componente
const [isEditing, setIsEditing] = useState(false)
const [formData, setFormData] = useState(initialData)
```

#### Estado Compartilhado (Context)
```typescript
// Para estado compartilhado entre componentes
const HiperfocoContext = createContext()

const HiperfocoProvider = ({ children }) => {
  const [hiperfocos, setHiperfocos] = useState([])
  const [selectedHiperfoco, setSelectedHiperfoco] = useState(null)
  
  return (
    <HiperfocoContext.Provider value={{ hiperfocos, selectedHiperfoco }}>
      {children}
    </HiperfocoContext.Provider>
  )
}
```

#### Estado do Servidor (React Query)
```typescript
// Para dados do servidor com cache
const useHiperfocos = () => {
  return useQuery({
    queryKey: ['hiperfocos'],
    queryFn: () => hiperfocoService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}
```

## 🎣 Padrões de Hooks

### 1. Custom Hooks para Lógica de Negócio

```typescript
// Hook especializado para hierarquia de tarefas
const useHiperfocosHierarchy = (initialTasks) => {
  const [tasks, setTasks] = useState(initialTasks)
  
  const addTask = useCallback((text, parentId = null) => {
    const newTask = createTask(text, parentId)
    setTasks(prev => [...prev, newTask])
  }, [])
  
  const removeTask = useCallback((taskId) => {
    setTasks(prev => removeTaskRecursively(prev, taskId))
  }, [])
  
  return {
    tasks,
    addTask,
    removeTask,
    totalCount: tasks.length,
    completedCount: tasks.filter(t => t.completed).length
  }
}
```

### 2. Hooks para Performance

```typescript
// Hook para otimizações de performance
const usePerformanceOptimization = () => {
  const memoCache = useRef(new Map())
  
  const memoizedCalculation = useCallback((key, calculation, deps) => {
    const depsKey = JSON.stringify(deps)
    const fullKey = `${key}-${depsKey}`
    
    if (memoCache.current.has(fullKey)) {
      return memoCache.current.get(fullKey)
    }
    
    const result = calculation()
    memoCache.current.set(fullKey, result)
    return result
  }, [])
  
  return { memoizedCalculation }
}
```

### 3. Hooks para Side Effects

```typescript
// Hook para sincronização offline
const useOfflineSync = () => {
  const { isOnline } = useOnlineStatus()
  const queue = useRef(new OfflineQueue())
  
  useEffect(() => {
    if (isOnline) {
      queue.current.process()
    }
  }, [isOnline])
  
  const addToQueue = useCallback((operation) => {
    queue.current.add(operation)
  }, [])
  
  return { addToQueue, isProcessing: queue.current.isProcessing }
}
```

## 🔧 Padrões de Componentes

### 1. Componentes Funcionais com TypeScript

```typescript
interface HiperfocoCardProps {
  hiperfoco: Hiperfoco
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  className?: string
}

const HiperfocoCard: React.FC<HiperfocoCardProps> = ({
  hiperfoco,
  onEdit,
  onDelete,
  className = ''
}) => {
  // Implementação do componente
}
```

### 2. Componentes com Memoização

```typescript
// Memoização com comparação customizada
const TaskItem = memo<TaskItemProps>(({ task, onToggle, onEdit }) => {
  return (
    <div className="task-item">
      {/* Implementação */}
    </div>
  )
}, (prevProps, nextProps) => {
  // Comparação customizada para otimização
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.text === nextProps.task.text
  )
})
```

### 3. Componentes Compostos

```typescript
// Padrão de composição para flexibilidade
const HiperfocoForm = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="hiperfoco-form">
      {children}
    </form>
  )
}

HiperfocoForm.Title = ({ children }) => (
  <h2 className="form-title">{children}</h2>
)

HiperfocoForm.Field = ({ label, children }) => (
  <div className="form-field">
    <label>{label}</label>
    {children}
  </div>
)

// Uso
<HiperfocoForm onSubmit={handleSubmit}>
  <HiperfocoForm.Title>Criar Hiperfoco</HiperfocoForm.Title>
  <HiperfocoForm.Field label="Título">
    <input type="text" />
  </HiperfocoForm.Field>
</HiperfocoForm>
```

## 🔄 Gerenciamento de Estado Complexo

### 1. Reducer para Estado Complexo

```typescript
interface HiperfocoState {
  hiperfocos: Hiperfoco[]
  selectedId: string | null
  filter: FilterType
  isLoading: boolean
  error: string | null
}

type HiperfocoAction =
  | { type: 'SET_HIPERFOCOS'; payload: Hiperfoco[] }
  | { type: 'SELECT_HIPERFOCO'; payload: string }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const hiperfocoReducer = (state: HiperfocoState, action: HiperfocoAction) => {
  switch (action.type) {
    case 'SET_HIPERFOCOS':
      return { ...state, hiperfocos: action.payload, isLoading: false }
    case 'SELECT_HIPERFOCO':
      return { ...state, selectedId: action.payload }
    // ... outros cases
    default:
      return state
  }
}

const useHiperfocoState = () => {
  const [state, dispatch] = useReducer(hiperfocoReducer, initialState)
  
  const actions = {
    setHiperfocos: (hiperfocos: Hiperfoco[]) =>
      dispatch({ type: 'SET_HIPERFOCOS', payload: hiperfocos }),
    selectHiperfoco: (id: string) =>
      dispatch({ type: 'SELECT_HIPERFOCO', payload: id })
  }
  
  return { state, actions }
}
```

### 2. Context para Estado Global

```typescript
interface AppContextType {
  user: User | null
  theme: Theme
  notifications: Notification[]
  settings: UserSettings
}

const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
```

## 🔒 Padrões de Segurança

### 1. Validação de Entrada

```typescript
// Validação no frontend
const validateHiperfoco = (data: HiperfocoFormData) => {
  const errors: ValidationError[] = []
  
  if (!data.titulo?.trim()) {
    errors.push({ field: 'titulo', message: 'Título é obrigatório' })
  }
  
  if (data.titulo && data.titulo.length > 255) {
    errors.push({ field: 'titulo', message: 'Título muito longo' })
  }
  
  return errors
}

// Sanitização
const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input.trim())
}
```

### 2. Autorização

```typescript
// Hook para verificar permissões
const usePermissions = () => {
  const { user } = useAuth()
  
  const canEdit = useCallback((hiperfoco: Hiperfoco) => {
    return hiperfoco.userId === user?.id
  }, [user])
  
  const canDelete = useCallback((hiperfoco: Hiperfoco) => {
    return hiperfoco.userId === user?.id && hiperfoco.status !== 'archived'
  }, [user])
  
  return { canEdit, canDelete }
}
```

## 📊 Padrões de Performance

### 1. Lazy Loading

```typescript
// Lazy loading de componentes
const HiperfocoDetails = lazy(() => import('./HiperfocoDetails'))
const TaskEditor = lazy(() => import('./TaskEditor'))

// Uso com Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <HiperfocoDetails id={selectedId} />
</Suspense>
```

### 2. Virtualização

```typescript
// Virtualização para listas grandes
const VirtualizedTaskList = ({ tasks }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  
  const { visibleItems, totalHeight } = useMemo(() => {
    const itemHeight = 60
    const containerHeight = 400
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      tasks.length
    )
    
    return {
      visibleItems: tasks.slice(startIndex, endIndex),
      totalHeight: tasks.length * itemHeight
    }
  }, [tasks, scrollTop])
  
  return (
    <div
      ref={containerRef}
      style={{ height: 400, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight }}>
        {visibleItems.map((task, index) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
```

### 3. Debouncing

```typescript
// Hook para debouncing
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Uso para validação
const useValidatedInput = (initialValue: string) => {
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebounce(value, 300)
  const [errors, setErrors] = useState<string[]>([])
  
  useEffect(() => {
    if (debouncedValue) {
      const validationErrors = validate(debouncedValue)
      setErrors(validationErrors)
    }
  }, [debouncedValue])
  
  return { value, setValue, errors }
}
```

## 🧪 Padrões de Teste

### 1. Testes de Componentes

```typescript
// Teste focado no comportamento
describe('FormularioHiperfocoRefatorado', () => {
  it('should validate required fields', async () => {
    const onSubmit = vi.fn()
    render(<FormularioHiperfocoRefatorado onSubmit={onSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /criar/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
```

### 2. Testes de Hooks

```typescript
// Teste de hook customizado
describe('useHiperfocosHierarchy', () => {
  it('should add task correctly', () => {
    const { result } = renderHook(() => useHiperfocosHierarchy([]))
    
    act(() => {
      result.current.addTask('Nova tarefa')
    })
    
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].text).toBe('Nova tarefa')
  })
})
```

### 3. Testes de Integração

```typescript
// Teste de fluxo completo
describe('Hiperfoco Integration', () => {
  it('should create and display hiperfoco', async () => {
    const mockApi = setupMockApi()
    
    render(<HiperfocoApp />)
    
    // Criar hiperfoco
    await user.click(screen.getByRole('button', { name: /novo hiperfoco/i }))
    await user.type(screen.getByLabelText(/título/i), 'Estudar React')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    
    // Verificar se foi criado
    await waitFor(() => {
      expect(screen.getByText('Estudar React')).toBeInTheDocument()
    })
    
    expect(mockApi.post).toHaveBeenCalledWith('/hiperfocos', expect.any(Object))
  })
})
```

## 📚 Padrões de Documentação

### 1. Documentação de Componentes

```typescript
/**
 * FormularioHiperfocoRefatorado
 * 
 * Componente para criação e edição de hiperfocos com validação em tempo real.
 * 
 * @example
 * ```tsx
 * <FormularioHiperfocoRefatorado
 *   initialData={hiperfoco}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 * />
 * ```
 */
interface FormularioHiperfocoRefatoradoProps {
  /** Dados iniciais para edição (opcional) */
  initialData?: Hiperfoco
  /** Callback executado ao submeter o formulário */
  onSubmit: (data: HiperfocoFormData) => Promise<void>
  /** Callback executado ao cancelar (opcional) */
  onCancel?: () => void
  /** Classes CSS adicionais (opcional) */
  className?: string
}
```

### 2. Documentação de APIs

```typescript
/**
 * Serviço para gerenciamento de hiperfocos
 */
export interface HiperfocoService {
  /**
   * Busca todos os hiperfocos do usuário
   * @param filters - Filtros opcionais
   * @returns Promise com lista de hiperfocos
   */
  getAll(filters?: HiperfocoFilters): Promise<Hiperfoco[]>
  
  /**
   * Cria um novo hiperfoco
   * @param data - Dados do hiperfoco
   * @returns Promise com hiperfoco criado
   */
  create(data: CreateHiperfocoData): Promise<Hiperfoco>
}
```

---

Esta arquitetura garante:
- **Manutenibilidade**: Código organizado e fácil de modificar
- **Testabilidade**: Componentes e lógica facilmente testáveis
- **Escalabilidade**: Estrutura que suporta crescimento
- **Performance**: Otimizações em todos os níveis
- **Segurança**: Validação e sanitização adequadas
