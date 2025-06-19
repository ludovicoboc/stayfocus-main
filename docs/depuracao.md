# 🎭 Roteiro MCP Playwright Automation - Depuração StayFocus

**Data**: 19 de Janeiro de 2025  
**Versão**: 2.0 - Refatorado para MCP Tools  
**Objetivo**: Guia prático para uso das ferramentas MCP Playwright automation em depuração  
**Contexto**: Migração dual-track (localStorage → Supabase + FastAPI)

---

## 🛠️ **FERRAMENTAS MCP DISPONÍVEIS**

### **📋 INVENTÁRIO DE FERRAMENTAS**

Temos acesso completo às seguintes ferramentas MCP Playwright automation:

#### **🌐 Navegação**
- `mcp_Playwright_Automation_browser_navigate` - Navegar para URLs
- `mcp_Playwright_Automation_browser_navigate_back` - Voltar página anterior  
- `mcp_Playwright_Automation_browser_navigate_forward` - Avançar página

#### **📸 Captura e Análise**
- `mcp_Playwright_Automation_browser_snapshot` - Captura estrutura acessível da página
- `mcp_Playwright_Automation_browser_take_screenshot` - Screenshot visual
- `mcp_Playwright_Automation_browser_console_messages` - Mensagens do console

#### **🖱️ Interação**
- `mcp_Playwright_Automation_browser_click` - Clicar em elementos
- `mcp_Playwright_Automation_browser_type` - Digitar texto
- `mcp_Playwright_Automation_browser_hover` - Passar mouse sobre elementos
- `mcp_Playwright_Automation_browser_select_option` - Selecionar opções em dropdowns
- `mcp_Playwright_Automation_browser_drag` - Arrastar e soltar

#### **⏱️ Controle de Tempo**
- `mcp_Playwright_Automation_browser_wait_for` - Aguardar tempo/texto/mudanças
- `mcp_Playwright_Automation_browser_press_key` - Pressionar teclas

#### **🔧 Gerenciamento**
- `mcp_Playwright_Automation_browser_close` - Fechar navegador
- `mcp_Playwright_Automation_browser_resize` - Redimensionar janela
- `mcp_Playwright_Automation_browser_tab_*` - Gerenciar abas

#### **📊 Monitoramento**
- `mcp_Playwright_Automation_browser_network_requests` - Requisições de rede
- `mcp_Playwright_Automation_browser_handle_dialog` - Lidar com alertas/modais

---

## 🔍 **METODOLOGIA DE DEPURAÇÃO COM MCP**

### **🎯 FASE 1: DIAGNÓSTICO INICIAL**

#### **1.1 Verificação de Conectividade Básica**
```typescript
// Objetivo: Validar se a aplicação está rodando
await mcp_Playwright_Automation_browser_navigate({
  url: "http://localhost:3000"
});

// Capturar snapshot inicial
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "diagnostico-inicial"
});

// Verificar erros no console
await mcp_Playwright_Automation_browser_console_messages({
  random_string: "console-check"
});
```

**🔍 O que procurar:**
- ✅ **Página carrega**: snapshot mostra estrutura HTML
- ❌ **Página vazia**: problemas de build/servidor
- ⚠️ **Erros 404**: problemas de API connectivity

#### **1.2 Teste de Módulos Específicos**
```typescript
// Navegar para módulo em teste
await mcp_Playwright_Automation_browser_navigate({
  url: "http://localhost:3000/alimentacao"  // ou /saude, /estudos, etc
});

// Aguardar carregamento completo
await mcp_Playwright_Automation_browser_wait_for({
  time: 10  // 10 segundos para componentes React Query
});

// Capturar estado após loading
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "modulo-carregado"
});
```

**🔍 Sinais de problemas:**
- **"Carregando..."** persistente = React Query em loading infinito
- **Componentes vazios** = Service Layer não funcionando
- **Erros no console** = Problemas de configuração

---

### **🎯 FASE 2: DEPURAÇÃO DE INTERAÇÕES**

#### **2.1 Teste de CRUD Operations**
```typescript
// Exemplo: Testar hidratação (optimistic updates)
await mcp_Playwright_Automation_browser_click({
  element: "Botão 'Registrar um copo de água'",
  ref: "e140"  // Usar ref do snapshot anterior
});

// Verificar mudança imediata (optimistic update)
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "pos-optimistic-update"
});
```

**🔍 O que validar:**
- ✅ **Mudança imediata**: Optimistic updates funcionando
- ❌ **Sem resposta**: Event handlers não conectados
- ⚠️ **Loading persistente**: Mutation não completando

#### **2.2 Teste de Formulários**
```typescript
// Preencher campos
await mcp_Playwright_Automation_browser_type({
  element: "Campo de horário",
  ref: "e88",
  text: "12:30"
});

await mcp_Playwright_Automation_browser_type({
  element: "Campo 'Descrição da refeição'",
  ref: "e89", 
  text: "Almoço - Teste automatizado"
});

// Verificar se botão foi habilitado
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "formulario-preenchido"
});

// Submeter formulário
await mcp_Playwright_Automation_browser_click({
  element: "Botão 'Adicionar'",
  ref: "e90"
});
```

**🔍 Validações esperadas:**
- **Estado disabled → enabled**: Validação funcionando
- **Reset automático**: Formulário limpa após submit
- **Item aparece na lista**: CRUD Create funcionando

---

## 🚨 **CENÁRIOS DE DEPURAÇÃO ESPECÍFICOS**

### **🔧 PROBLEMA: Loading Infinito**

#### **Diagnóstico:**
```typescript
// 1. Navegar para módulo problemático
await mcp_Playwright_Automation_browser_navigate({
  url: "http://localhost:3000/alimentacao"
});

// 2. Aguardar mais tempo que o normal
await mcp_Playwright_Automation_browser_wait_for({
  time: 15
});

// 3. Verificar se ainda está carregando
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "loading-infinito-check"
});

// 4. Analisar console para erros
await mcp_Playwright_Automation_browser_console_messages({
  random_string: "loading-infinito-console"
});
```

#### **Soluções a testar:**
1. **Verificar .env.local**: `NEXT_PUBLIC_USE_LOCALSTORAGE_ONLY=true`
2. **Restart servidor**: Recarregar variáveis de ambiente
3. **Clear localStorage**: Dados corrompidos

### **🔧 PROBLEMA: Optimistic Updates Não Funcionam**

#### **Diagnóstico:**
```typescript
// 1. Capturar estado inicial
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "pre-click"
});

// 2. Realizar ação
await mcp_Playwright_Automation_browser_click({
  element: "Botão de ação",
  ref: "eXXX"
});

// 3. Verificar mudança IMEDIATA (< 1s)
await mcp_Playwright_Automation_browser_snapshot({
  random_string: "pos-click-imediato"
});

// 4. Aguardar e verificar persistência
await mcp_Playwright_Automation_browser_wait_for({
  time: 3
});

await mcp_Playwright_Automation_browser_snapshot({
  random_string: "pos-click-persistido"
});
```

---

## 📊 **PADRÕES DE SNAPSHOT ANALYSIS**

### **✅ Sinais de Funcionamento Correto**

#### **Componente Hidratação:**
```yaml
- generic [ref=e111]:
  - generic [ref=e112]: "2 de 8 copos"  # ← Contador incrementando
  - generic [ref=e113]: "25%"           # ← Porcentagem correta
- button "Remover Copo" [ref=e141] [cursor=pointer]  # ← Botão habilitado
```

#### **Formulário Validado:**
```yaml
- button "Adicionar" [ref=e90] [cursor=pointer]:  # ← Sem [disabled]
  - text: Adicionar
```

### **❌ Sinais de Problemas**

#### **Loading Infinito:**
```yaml
- generic [ref=e38]: "Carregando planejamento..."  # ← Texto estático
- generic [ref=e46]: "Carregando registros..."     # ← Não muda
```

#### **Botões Inativos:**
```yaml
- button "Adicionar" [disabled] [ref=e90]:  # ← [disabled] persistente
```

---

## 🎯 **SCRIPTS PRONTOS PARA DEPURAÇÃO**

### **🚀 Script Diagnóstico Completo**
```typescript
// SCRIPT 1: Diagnóstico Geral
async function diagnosticoCompleto() {
  // Navegação inicial
  await mcp_Playwright_Automation_browser_navigate({
    url: "http://localhost:3000/alimentacao"
  });
  
  // Aguardar carregamento
  await mcp_Playwright_Automation_browser_wait_for({time: 10});
  
  // Capturar estado
  await mcp_Playwright_Automation_browser_snapshot({
    random_string: "diagnostico-completo"
  });
  
  // Verificar console
  await mcp_Playwright_Automation_browser_console_messages({
    random_string: "diagnostico-console"
  });
  
  // Screenshot para evidência
  await mcp_Playwright_Automation_browser_take_screenshot({
    filename: "diagnostico-estado-atual.png",
    raw: false
  });
}
```

### **🧪 Script Teste de Interação**
```typescript
// SCRIPT 2: Teste Funcional
async function testeInteracao() {
  // Teste optimistic update
  await mcp_Playwright_Automation_browser_click({
    element: "Botão 'Registrar um copo de água'",
    ref: "e140"
  });
  
  // Verificar resposta imediata
  await mcp_Playwright_Automation_browser_snapshot({
    random_string: "pos-optimistic-update"
  });
  
  // Teste CRUD
  await mcp_Playwright_Automation_browser_type({
    element: "Campo de horário",
    ref: "e88",
    text: "14:00"
  });
  
  await mcp_Playwright_Automation_browser_type({
    element: "Campo 'Descrição da refeição'",
    ref: "e89",
    text: "Lanche - Teste MCP"
  });
  
  await mcp_Playwright_Automation_browser_click({
    element: "Botão 'Adicionar'",
    ref: "e90"
  });
  
  // Verificar resultado
  await mcp_Playwright_Automation_browser_snapshot({
    random_string: "pos-crud-create"
  });
}
```

---

## 📋 **CHECKLIST DE DEPURAÇÃO MCP**

### **✅ Preparação**
- [ ] Servidor Next.js rodando (`npm run dev`)
- [ ] Arquivo `.env.local` configurado
- [ ] Variáveis de ambiente carregadas
- [ ] Módulo específico identificado para teste

### **✅ Execução Básica**
- [ ] `browser_navigate` para página alvo
- [ ] `browser_wait_for` adequado (5-15s para React Query)
- [ ] `browser_snapshot` para capturar estado
- [ ] `browser_console_messages` para verificar erros

### **✅ Teste de Interações**
- [ ] `browser_click` em elementos funcionais
- [ ] `browser_type` para formulários
- [ ] Snapshots antes/depois de ações
- [ ] Verificação de mudanças esperadas

### **✅ Documentação**
- [ ] Screenshots capturados (`browser_take_screenshot`)
- [ ] Console logs analisados
- [ ] Padrões identificados documentados
- [ ] Resultados reportados

### **✅ Finalização**
- [ ] `browser_close` para liberar recursos
- [ ] Evidências organizadas
- [ ] Próximos passos definidos

---

## 🎯 **INTERPRETAÇÃO DE RESULTADOS**

### **🟢 SUCESSO - Sinais Positivos**
- **Snapshots mostram dados reais** (não "Carregando...")
- **Console sem erros críticos**
- **Interações respondem imediatamente**
- **Estados transitam corretamente** (disabled → enabled)

### **🟡 ATENÇÃO - Sinais de Alerta**
- **Loading > 5 segundos** para componentes simples
- **Warnings no console** sobre deprecated APIs
- **Interações lentas** (> 2 segundos resposta)

### **🔴 PROBLEMA - Sinais Críticos**
- **"Carregando..." persistente** > 15 segundos
- **ERR_CONNECTION_REFUSED** em massa
- **Componentes completamente vazios**
- **Erros TypeScript/React no console**

---

## 🚀 **PRÓXIMOS PASSOS PÓS-DEPURAÇÃO**

### **📊 Com Base nos Resultados MCP:**

#### **Se TUDO OK:**
1. **Documentar padrões funcionais**
2. **Replicar para próximo módulo** (Saúde, Estudos, etc)
3. **Otimizar performance** se necessário

#### **Se PROBLEMAS ENCONTRADOS:**
1. **Analisar console logs coletados**
2. **Verificar configuração de ambiente**
3. **Testar soluções específicas** (restart, clear cache, etc)
4. **Re-executar scripts MCP** após correções

#### **Para Novos Módulos:**
1. **Usar template validado** do módulo Alimentação
2. **Aplicar mesmo roteiro MCP**
3. **Documentar diferenças** encontradas

---

**🎭 Ferramentas MCP Playwright Automation: Sua solução completa para depuração visual e funcional do StayFocus!**
