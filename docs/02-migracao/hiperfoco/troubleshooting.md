# 🔧 Troubleshooting - Sistema de Hiperfocos

## 📋 Problemas Comuns e Soluções

### 🚨 Problemas de Instalação

#### Erro: "Module not found"
```bash
Error: Cannot resolve module '@/components/hiperfocos/FormularioHiperfocoRefatorado'
```

**Solução:**
1. Verificar se o arquivo existe no caminho correto
2. Verificar configuração do TypeScript paths
3. Reiniciar o servidor de desenvolvimento

```bash
# Verificar estrutura
ls -la app/components/hiperfocos/

# Verificar tsconfig.json
cat tsconfig.json | grep -A 10 "paths"

# Reiniciar servidor
npm run dev
```

#### Erro: "Supabase client not configured"
```bash
Error: supabase client is not configured
```

**Solução:**
1. Verificar variáveis de ambiente
2. Verificar configuração do cliente Supabase

```bash
# Verificar .env.local
cat .env.local | grep SUPABASE

# Exemplo de configuração correta
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 🧪 Problemas de Testes

#### Testes falhando com "ReferenceError: fetch is not defined"
```bash
ReferenceError: fetch is not defined
```

**Solução:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    globals: true
  }
})

// test-setup.ts
import { vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}))
```

#### Testes de componentes falhando com "Cannot read properties of undefined"
```bash
TypeError: Cannot read properties of undefined (reading 'user')
```

**Solução:**
```typescript
// Criar wrapper de teste
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

// Usar no teste
render(
  <TestWrapper>
    <FormularioHiperfocoRefatorado onSubmit={mockSubmit} />
  </TestWrapper>
)
```

### 🔄 Problemas de Sincronização

#### Dados não sincronizando offline
```bash
Warning: Offline queue not processing
```

**Solução:**
1. Verificar se o Service Worker está registrado
2. Verificar se a queue está sendo populada
3. Verificar conectividade

```typescript
// Verificar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('SW registrations:', registrations.length)
  })
}

// Verificar queue
const queue = new OfflineQueue()
console.log('Queue stats:', queue.getStats())

// Forçar processamento
queue.process()
```

#### Conflitos de dados ao sincronizar
```bash
Error: Conflict detected during sync
```

**Solução:**
```typescript
// Implementar resolução de conflitos
const resolveConflict = (local: Hiperfoco, server: Hiperfoco) => {
  // Estratégia: último modificado ganha
  if (new Date(local.updatedAt) > new Date(server.updatedAt)) {
    return local
  }
  return server
}

// Ou permitir escolha do usuário
const showConflictDialog = (local: Hiperfoco, server: Hiperfoco) => {
  return new Promise((resolve) => {
    // Mostrar modal para usuário escolher
    showModal({
      title: 'Conflito de dados',
      local,
      server,
      onResolve: resolve
    })
  })
}
```

### 🎨 Problemas de UI/UX

#### Componentes não renderizando corretamente
```bash
Warning: React does not recognize the `isLoading` prop on a DOM element
```

**Solução:**
```typescript
// Remover props não-DOM antes de passar para elemento
const { isLoading, onSubmit, ...domProps } = props

return (
  <div {...domProps}>
    {/* conteúdo */}
  </div>
)
```

#### Animações não funcionando
```bash
Warning: CSS transitions not working
```

**Solução:**
1. Verificar se Tailwind CSS está configurado corretamente
2. Verificar se as classes de animação existem
3. Verificar se há conflitos de CSS

```css
/* Adicionar ao globals.css se necessário */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
```

### 🔒 Problemas de Segurança

#### RLS (Row Level Security) bloqueando operações
```bash
Error: new row violates row-level security policy
```

**Solução:**
1. Verificar se o usuário está autenticado
2. Verificar políticas RLS no Supabase
3. Verificar se user_id está sendo passado corretamente

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'hiperfocos';

-- Verificar se usuário está autenticado
SELECT auth.uid();

-- Exemplo de política correta
CREATE POLICY "Users can insert own hiperfocos" ON hiperfocos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Validação XSS falhando
```bash
Warning: Potential XSS detected
```

**Solução:**
```typescript
import DOMPurify from 'dompurify'

// Sanitizar entrada
const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // Não permitir tags HTML
    ALLOWED_ATTR: []  // Não permitir atributos
  })
}

// Usar em validação
const validateAndSanitize = (data: HiperfocoFormData) => {
  return {
    ...data,
    titulo: sanitizeInput(data.titulo),
    descricao: data.descricao ? sanitizeInput(data.descricao) : undefined
  }
}
```

### 📱 Problemas de Performance

#### Componente renderizando muitas vezes
```bash
Warning: Component re-rendering excessively
```

**Solução:**
```typescript
// Usar React.memo com comparação customizada
const OptimizedComponent = memo(Component, (prevProps, nextProps) => {
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.version === nextProps.data.version
  )
})

// Usar useCallback para funções
const handleClick = useCallback((id: string) => {
  // lógica
}, [dependency])

// Usar useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

#### Lista grande causando lag
```bash
Warning: Large list causing performance issues
```

**Solução:**
```typescript
// Implementar virtualização
const VirtualizedList = ({ items }) => {
  const [scrollTop, setScrollTop] = useState(0)
  const itemHeight = 60
  const containerHeight = 400
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      items.length
    )
    
    return items.slice(startIndex, endIndex)
  }, [items, scrollTop])
  
  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map(item => (
          <Item key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
```

## 🔍 Ferramentas de Debug

### 1. React Developer Tools
```bash
# Instalar extensão do navegador
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Usar para inspecionar:
# - Estado dos componentes
# - Props sendo passadas
# - Re-renders desnecessários
```

### 2. Supabase Dashboard
```bash
# Acessar dashboard do Supabase
# Verificar:
# - Logs de API
# - Políticas RLS
# - Dados das tabelas
# - Performance das queries
```

### 3. Network Tab
```bash
# Abrir DevTools > Network
# Verificar:
# - Requests falhando
# - Tempo de resposta
# - Dados sendo enviados/recebidos
# - Headers de autenticação
```

### 4. Console Logs
```typescript
// Adicionar logs estratégicos
console.group('🎯 Hiperfoco Debug')
console.log('Form data:', formData)
console.log('Validation errors:', errors)
console.log('User:', user)
console.groupEnd()

// Usar diferentes níveis
console.info('ℹ️ Info:', data)
console.warn('⚠️ Warning:', warning)
console.error('❌ Error:', error)
```

## 📊 Monitoramento de Performance

### 1. Lighthouse
```bash
# Executar audit de performance
npm run build
npm run start
# Abrir DevTools > Lighthouse > Run audit
```

### 2. Bundle Analyzer
```bash
# Instalar
npm install --save-dev @next/bundle-analyzer

# Configurar next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // config
})

# Executar análise
ANALYZE=true npm run build
```

### 3. Performance API
```typescript
// Medir performance de componentes
const measureComponentRender = (componentName: string) => {
  performance.mark(`${componentName}-start`)
  
  return () => {
    performance.mark(`${componentName}-end`)
    performance.measure(
      `${componentName}-render`,
      `${componentName}-start`,
      `${componentName}-end`
    )
    
    const measure = performance.getEntriesByName(`${componentName}-render`)[0]
    console.log(`${componentName} render time:`, measure.duration)
  }
}

// Usar no componente
useEffect(() => {
  const endMeasure = measureComponentRender('FormularioHiperfoco')
  return endMeasure
}, [])
```

## 🆘 Quando Pedir Ajuda

### Informações para Incluir

1. **Versões**
   - Node.js: `node --version`
   - npm: `npm --version`
   - Next.js: `npm list next`

2. **Erro Completo**
   - Stack trace completo
   - Console logs relevantes
   - Network requests falhando

3. **Contexto**
   - O que estava tentando fazer
   - Passos para reproduzir
   - Comportamento esperado vs atual

4. **Ambiente**
   - Sistema operacional
   - Navegador e versão
   - Modo (desenvolvimento/produção)

### Template de Issue

```markdown
## 🐛 Bug Report

### Descrição
Breve descrição do problema

### Passos para Reproduzir
1. Ir para...
2. Clicar em...
3. Ver erro...

### Comportamento Esperado
O que deveria acontecer

### Comportamento Atual
O que está acontecendo

### Ambiente
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96.0]
- Node.js: [e.g. 18.0.0]
- Next.js: [e.g. 14.0.0]

### Logs/Screenshots
```

---

**Lembre-se**: A maioria dos problemas pode ser resolvida verificando:
1. ✅ Configuração do ambiente
2. ✅ Dependências instaladas
3. ✅ Variáveis de ambiente
4. ✅ Logs do console
5. ✅ Documentação oficial
