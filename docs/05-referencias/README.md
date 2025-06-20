# 📖 Referências - Guias e Troubleshooting

**Guias de referência, troubleshooting e recursos para suporte durante a migração**

---

## 📄 **ARQUIVOS NESTE DIRETÓRIO**

### **`depuracao.md`** 🔧
**Roteiro MCP Playwright para depuração e testes funcionais**
- ✅ **Ferramentas MCP disponíveis** - Inventário completo
- ✅ **Metodologia de depuração** - Processo estruturado
- ✅ **Scripts prontos** para diagnóstico
- ✅ **Padrões de análise** de snapshots
- ✅ **Troubleshooting** de problemas comuns
- ✅ **Checklist de validação** completo

---

## 🔧 **DEPURAÇÃO COM MCP PLAYWRIGHT**

### **Ferramentas Disponíveis**
```typescript
// Navegação
mcp_Playwright_Automation_browser_navigate
mcp_Playwright_Automation_browser_navigate_back
mcp_Playwright_Automation_browser_navigate_forward

// Captura e Análise
mcp_Playwright_Automation_browser_snapshot
mcp_Playwright_Automation_browser_take_screenshot
mcp_Playwright_Automation_browser_console_messages

// Interação
mcp_Playwright_Automation_browser_click
mcp_Playwright_Automation_browser_type
mcp_Playwright_Automation_browser_hover

// Controle
mcp_Playwright_Automation_browser_wait_for
mcp_Playwright_Automation_browser_press_key
```

### **Fluxo de Depuração**
1. **Diagnóstico inicial** - Verificar conectividade
2. **Teste de módulos** - Validar funcionalidades
3. **Análise de interações** - CRUD operations
4. **Validação de performance** - Tempos de resposta

---

## 🚨 **TROUBLESHOOTING RÁPIDO**

### **Problemas Comuns**

#### **🔴 Erro: "Invalid API key"**
```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Reiniciar servidor
npm run dev
```

#### **🔴 Erro: "Row Level Security policy violation"**
```sql
-- Verificar se usuário está autenticado
SELECT auth.uid();

-- Verificar políticas RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### **🔴 Loading infinito**
```typescript
// Verificar no console
localStorage.getItem('NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY')

// Forçar localStorage temporariamente
localStorage.setItem('FORCE_LOCALSTORAGE', 'true')
window.location.reload()
```

#### **🔴 Dados não aparecem**
```typescript
// Verificar autenticação
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Verificar dados no banco
const { data, error } = await supabase
  .from('meal_plans')
  .select('*')
console.log('Data:', data, 'Error:', error)
```

---

## 📚 **RECURSOS EXTERNOS**

### **Documentação Oficial**
- **[Supabase Docs](https://supabase.com/docs)** - Documentação completa
- **[Supabase Auth](https://supabase.com/docs/guides/auth)** - Guia de autenticação
- **[Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)** - Row Level Security
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation
- **[Zustand Docs](https://zustand-demo.pmnd.rs/)** - State management

### **Comunidade e Suporte**
- **[Supabase Discord](https://discord.supabase.com)** - Comunidade ativa
- **[Supabase GitHub](https://github.com/supabase/supabase)** - Issues e discussões
- **[Next.js Discussions](https://github.com/vercel/next.js/discussions)** - Fórum oficial
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)** - Q&A

### **Status e Monitoramento**
- **[Supabase Status](https://status.supabase.com)** - Status dos serviços
- **[Supabase Incidents](https://status.supabase.com/incidents)** - Histórico de incidentes

---

## 🛠️ **FERRAMENTAS ÚTEIS**

### **Extensões do Navegador**
- **Supabase DevTools** - Debug de queries
- **React Developer Tools** - Debug de componentes
- **Redux DevTools** - Debug de estado (Zustand)

### **Comandos de Linha**
```bash
# Supabase CLI
npm install -g supabase
supabase login
supabase projects list
supabase db dump --db-url "postgresql://..."

# Next.js
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Linting

# Análise de bundle
npm run analyze      # Se configurado
```

### **Scripts de Utilidade**
```typescript
// Verificar conexão Supabase
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count')
    console.log('✅ Supabase connected:', data)
  } catch (error) {
    console.error('❌ Supabase error:', error)
  }
}

// Limpar cache local
function clearLocalCache() {
  localStorage.clear()
  sessionStorage.clear()
  console.log('🧹 Cache cleared')
}

// Verificar dados migrados
async function validateMigration(tableName: string) {
  const { data, error } = await supabase
    .from(tableName)
    .select('count')
  
  console.log(`📊 ${tableName}:`, data?.[0]?.count || 0, 'records')
}
```

---

## 📋 **CHECKLISTS DE VALIDAÇÃO**

### **Checklist Pré-Migração**
- [ ] Backup completo dos dados localStorage
- [ ] Supabase projeto criado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Schema SQL executado com sucesso
- [ ] RLS configurado e testado
- [ ] Conexão básica funcionando

### **Checklist Pós-Migração**
- [ ] Todos os dados migrados corretamente
- [ ] Funcionalidades testadas manualmente
- [ ] Performance aceitável (< 2s carregamento)
- [ ] Sincronização offline/online funcionando
- [ ] Fallback para localStorage operacional
- [ ] Logs de erro limpos

### **Checklist de Deploy**
- [ ] Build de produção funcionando
- [ ] Variáveis de ambiente de produção configuradas
- [ ] Testes automatizados passando
- [ ] Monitoramento configurado
- [ ] Plano de rollback definido
- [ ] Documentação atualizada

---

## 🔍 **DEBUGGING AVANÇADO**

### **Logs Detalhados**
```typescript
// Habilitar logs do Supabase
localStorage.setItem('supabase.auth.debug', 'true')

// Log de todas as requisições
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth event:', event, session)
})

// Interceptar requisições
const originalFetch = window.fetch
window.fetch = async (...args) => {
  console.log('🌐 Fetch:', args[0])
  const response = await originalFetch(...args)
  console.log('📥 Response:', response.status, response.statusText)
  return response
}
```

### **Análise de Performance**
```typescript
// Medir tempo de operações
async function measureOperation(name: string, operation: () => Promise<any>) {
  const start = performance.now()
  try {
    const result = await operation()
    const duration = performance.now() - start
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

// Uso
const data = await measureOperation('Load meal plans', () => 
  supabase.from('meal_plans').select('*')
)
```

### **Monitoramento de Memória**
```typescript
// Verificar uso de memória
function checkMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log('💾 Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}
```

---

## 🆘 **SUPORTE DE EMERGÊNCIA**

### **Comandos de Emergência**
```typescript
// Forçar modo localStorage
localStorage.setItem('EMERGENCY_LOCALSTORAGE_MODE', 'true')
window.location.reload()

// Limpar tudo e reiniciar
localStorage.clear()
sessionStorage.clear()
window.location.href = '/'

// Verificar status do Supabase
fetch('https://[project-id].supabase.co/rest/v1/')
  .then(r => console.log('Supabase status:', r.status))
  .catch(e => console.error('Supabase down:', e))
```

### **Rollback de Emergência**
1. **Ativar modo localStorage**: `EMERGENCY_LOCALSTORAGE_MODE=true`
2. **Restaurar backup**: Copiar dados do backup para localStorage
3. **Reiniciar aplicação**: Refresh completo
4. **Investigar problema**: Usar logs e ferramentas de debug

### **Contatos de Emergência**
- **Supabase Support**: [support@supabase.com](mailto:support@supabase.com)
- **Supabase Status**: [status.supabase.com](https://status.supabase.com)
- **Community Discord**: [discord.supabase.com](https://discord.supabase.com)

---

**📖 Mantenha esta seção sempre acessível durante a migração para resolução rápida de problemas!**
