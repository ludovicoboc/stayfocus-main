# Melhores Práticas TDD - Lições da FASE 1

## 🎯 Introdução

Este documento captura as melhores práticas de Test-Driven Development (TDD) identificadas durante a implementação da FASE 1: Autenticação. Estas práticas foram validadas na prática e resultaram em 92% de taxa de sucesso nos testes.

## 🔄 Ciclo TDD Otimizado

### 1. **RED: Escrever Testes que Falham**

#### ✅ Boas Práticas
```typescript
// ✅ Teste específico e focado
it('deve fazer login com credenciais válidas', async () => {
  const credentials = { email: 'test@test.com', password: 'password123' }
  const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper })
  
  await act(async () => {
    await result.current.login(credentials)
  })
  
  expect(result.current.isAuthenticated).toBe(true)
  expect(result.current.user?.email).toBe(credentials.email)
})
```

#### ❌ Evitar
```typescript
// ❌ Teste muito genérico
it('deve funcionar', () => {
  // Teste vago demais
})

// ❌ Múltiplas responsabilidades
it('deve fazer login e logout e registrar usuário', () => {
  // Teste fazendo muitas coisas
})
```

### 2. **GREEN: Implementação Mínima**

#### ✅ Boas Práticas
```typescript
// ✅ Implementação simples que faz o teste passar
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      localStorage.setItem('auth_session', JSON.stringify(response))
    } finally {
      setLoading(false)
    }
  }
  
  return { user, isAuthenticated: !!user, loading, login }
}
```

#### ❌ Evitar
```typescript
// ❌ Over-engineering na fase GREEN
export function useAuth() {
  // Implementação complexa demais para fazer teste passar
  const [state, dispatch] = useReducer(complexReducer, initialState)
  // ... 50 linhas de código para um teste simples
}
```

### 3. **REFACTOR: Melhorar sem Quebrar**

#### ✅ Boas Práticas
```typescript
// ✅ Refatoração incremental
// Antes: Lógica no componente
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // Validação inline
    if (!email) setErrors(prev => ({ ...prev, email: 'Required' }))
    // ... mais validação
  }
}

// Depois: Extrair hook customizado
function LoginForm() {
  const { values, errors, handleSubmit } = useLoginForm()
  // Componente mais limpo
}
```

## 🧪 Estratégias de Teste

### 1. **Estrutura de Testes**

#### Padrão AAA (Arrange-Act-Assert)
```typescript
describe('useAuth', () => {
  beforeEach(() => {
    // Arrange: Setup limpo
    vi.clearAllMocks()
    mockStorage.clear()
  })

  it('deve restaurar sessão válida do localStorage', async () => {
    // Arrange: Configurar estado inicial
    const validSession = {
      user: { id: '1', email: 'test@test.com' },
      token: 'valid-token',
      expiresAt: Date.now() + 3600000
    }
    mockStorage.setItem('auth_session', JSON.stringify(validSession))

    // Act: Executar ação
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Assert: Verificar resultado
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('test@test.com')
  })
})
```

### 2. **Mocking Estratégico**

#### ✅ Mock Focado
```typescript
// ✅ Mock apenas o que é necessário
vi.mock('@/app/lib/data-providers', () => ({
  DataProviders: {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    }
  }
}))
```

#### ❌ Over-mocking
```typescript
// ❌ Mock excessivo
vi.mock('next/navigation')
vi.mock('next/link')
vi.mock('react')
vi.mock('@tanstack/react-query')
// ... mockando tudo desnecessariamente
```

### 3. **Test Utilities**

#### Factory Functions
```typescript
// ✅ Factories para dados de teste
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
  ...overrides
})

export const createMockSession = (overrides = {}) => ({
  user: createMockUser(),
  token: 'mock-token',
  expiresAt: Date.now() + 3600000,
  ...overrides
})
```

#### Custom Matchers
```typescript
// ✅ Matchers específicos do domínio
expect.extend({
  toBeAuthenticated(received) {
    const pass = received.isAuthenticated && received.user !== null
    return {
      message: () => `expected user to be authenticated`,
      pass,
    }
  }
})
```

## 🏗️ Padrões de Arquitetura

### 1. **Separation of Concerns**

#### ✅ Responsabilidades Claras
```typescript
// ✅ Hook para lógica de estado
export function useAuth() {
  // Apenas lógica de autenticação
}

// ✅ Componente para UI
export function LoginForm({ onSuccess }) {
  const { login, loading } = useAuth()
  // Apenas lógica de apresentação
}

// ✅ Service para API
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  // Apenas lógica de comunicação
}
```

### 2. **Composição sobre Herança**

#### ✅ Componentes Composáveis
```typescript
// ✅ Componentes pequenos e composáveis
function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <Header />
      {children}
      <Footer />
    </div>
  )
}

function LoginPage() {
  return (
    <AuthLayout>
      <GuestOnly>
        <LoginForm onSuccess={() => router.push('/')} />
      </GuestOnly>
    </AuthLayout>
  )
}
```

### 3. **Dependency Injection**

#### ✅ Injeção via Props/Context
```typescript
// ✅ Dependências injetáveis
function AuthProvider({ children, authService = defaultAuthService }) {
  // Permite mock em testes
}

// ✅ Context para dependências
const ServicesContext = createContext({
  authService,
  dataService,
  notificationService,
})
```

## 🔒 Testes de Segurança

### 1. **Validação de Dados**

```typescript
describe('Validação de Segurança', () => {
  it('não deve expor tokens no DOM', () => {
    const { container } = render(<AuthenticatedApp />)
    expect(container.innerHTML).not.toContain('secret-token')
  })

  it('deve limpar dados sensíveis no logout', () => {
    const { result } = renderHook(() => useAuth())
    
    act(() => result.current.logout())
    
    expect(localStorage.getItem('auth_session')).toBeNull()
    expect(result.current.user).toBeNull()
  })
})
```

### 2. **Isolamento de Dados**

```typescript
describe('Isolamento de Usuários', () => {
  it('deve manter dados separados por usuário', () => {
    // Teste que verifica que User A não vê dados de User B
  })
})
```

## 📊 Métricas de Qualidade

### 1. **Cobertura de Testes**
- **Objetivo**: 90%+ de cobertura
- **Foco**: Caminhos críticos de negócio
- **Ferramenta**: Vitest coverage

### 2. **Performance de Testes**
- **Objetivo**: < 10s para suite completa
- **Estratégia**: Paralelização, mocks eficientes
- **Monitoramento**: CI/CD metrics

### 3. **Qualidade de Código**
- **Linting**: ESLint + TypeScript strict
- **Formatação**: Prettier
- **Complexidade**: Máx 10 por função

## 🚀 Automação e CI/CD

### 1. **Pipeline de Testes**
```yaml
# ✅ Pipeline otimizado
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm run test:unit
    - run: npm run test:integration
    - run: npm run test:e2e
```

### 2. **Quality Gates**
- Todos os testes devem passar
- Cobertura mínima de 90%
- Sem vulnerabilidades críticas
- Performance dentro dos limites

## 📝 Documentação de Testes

### 1. **Naming Conventions**
```typescript
// ✅ Nomes descritivos
describe('useAuth Hook', () => {
  describe('quando usuário faz login', () => {
    it('deve atualizar estado para autenticado', () => {})
    it('deve salvar sessão no localStorage', () => {})
    it('deve redirecionar para dashboard', () => {})
  })
})
```

### 2. **Comentários Estratégicos**
```typescript
// ✅ Comentários que explicam o "porquê"
it('deve rejeitar sessões expiradas', async () => {
  // Importante para segurança: sessões antigas não devem ser válidas
  const expiredSession = { expiresAt: Date.now() - 1000 }
  // ...
})
```

## 🎯 Conclusões

### ✅ Práticas que Funcionaram
1. **Ciclos curtos**: Red-Green-Refactor em iterações pequenas
2. **Testes focados**: Um conceito por teste
3. **Mocks mínimos**: Mock apenas o necessário
4. **Factories**: Dados de teste reutilizáveis
5. **Separação clara**: Lógica vs Apresentação vs Dados

### 🔄 Melhorias Identificadas
1. **Timer tests**: Estratégia específica para testes com tempo
2. **Integration tests**: Mais cenários de edge cases
3. **Performance**: Otimização de setup/teardown
4. **Mocking**: Estratégia mais robusta para localStorage

### 📚 Próximos Passos
- Aplicar estas práticas na FASE 2: Timer/Sessões
- Refinar estratégias de mock
- Expandir test utilities
- Documentar padrões emergentes

---

**Referências**:
- [Documentação FASE 1](./fase1-autenticacao-tdd.md)
- [Kent C. Dodds - Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Martin Fowler - TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
