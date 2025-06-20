# 📑 Índice Geral - Documentação StayFocus

**Navegação rápida por toda a documentação de migração para Supabase**

---

## 🗂️ **ESTRUTURA COMPLETA**

```
docs/
├── README.md                           # 📚 Visão geral da documentação
├── INDICE.md                          # 📑 Este arquivo (navegação)
│
├── 01-planejamento/                   # 📋 PLANEJAMENTO
│   ├── README.md                      # 📋 Guia da seção
│   ├── lista-tarefas-migracao-supabase.md  # 📋 34 tarefas em 5 fases
│   ├── acompanhamento-migracao.md     # 📊 Tracking de progresso
│   └── referencia-rapida-migracao.md  # ⚡ Consulta rápida
│
├── 02-migracao/                       # 🔄 MIGRAÇÃO (Módulo Piloto)
│   ├── README.md                      # 🔄 Guia da seção
│   ├── README-migracao-alimentacao.md # 📚 Guia original
│   ├── plano-migracao-alimentacao.md  # 📋 Plano detalhado (417 linhas)
│   └── schema-alimentacao.sql         # 🗄️ Script SQL (432 linhas)
│
├── 03-modulos/                        # 🧩 MÓDULOS
│   ├── README.md                      # 🧩 Guia da seção
│   ├── hiperfocos-migracao.txt        # 🎯 Sistema de hiperfocos
│   ├── saude-migracao.txt             # 💊 Medicamentos e humor
│   ├── estudos-migracao.txt           # 📚 Pomodoro e estudos
│   ├── sono-migracao.txt              # 😴 Padrões de sono
│   ├── lazer-migracao.txt             # 🎮 Atividades de lazer
│   └── perfil-migracao.txt            # 👤 Configurações de usuário
│
├── 04-implementacao/                  # ⚙️ IMPLEMENTAÇÃO
│   ├── README.md                      # ⚙️ Guia da seção
│   ├── autenticacao-migracao.txt      # 🔐 Sistema de auth unificado
│   └── relatorio-migracao.txt         # 📊 Relatórios e métricas
│
└── 05-referencias/                    # 📖 REFERÊNCIAS
    ├── README.md                      # 📖 Guia da seção
    └── depuracao.md                   # 🔧 MCP Playwright debugging
```

---

## 🚀 **GUIAS DE NAVEGAÇÃO POR OBJETIVO**

### **🎯 Para INICIAR a migração:**
1. **[README.md](./README.md)** - Visão geral do projeto
2. **[01-planejamento/lista-tarefas-migracao-supabase.md](./01-planejamento/lista-tarefas-migracao-supabase.md)** - Lista completa de tarefas
3. **[01-planejamento/acompanhamento-migracao.md](./01-planejamento/acompanhamento-migracao.md)** - Setup de tracking

### **🔧 Durante a IMPLEMENTAÇÃO:**
1. **[01-planejamento/referencia-rapida-migracao.md](./01-planejamento/referencia-rapida-migracao.md)** - Comandos e snippets
2. **[02-migracao/](./02-migracao/)** - Documentação do módulo piloto
3. **[04-implementacao/](./04-implementacao/)** - Documentos técnicos

### **🧩 Para MIGRAR módulos específicos:**
1. **[03-modulos/README.md](./03-modulos/README.md)** - Estratégia por módulo
2. **[03-modulos/[modulo]-migracao.txt](./03-modulos/)** - Plano específico do módulo

### **🚨 Para RESOLVER problemas:**
1. **[05-referencias/depuracao.md](./05-referencias/depuracao.md)** - Debugging com MCP Playwright
2. **[01-planejamento/referencia-rapida-migracao.md](./01-planejamento/referencia-rapida-migracao.md)** - Troubleshooting rápido
3. **[05-referencias/README.md](./05-referencias/README.md)** - Recursos e suporte

---

## 📊 **DOCUMENTOS POR PRIORIDADE**

### **🔴 CRÍTICOS (Ler primeiro)**
| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **[README.md](./README.md)** | Visão geral completa | Início do projeto |
| **[lista-tarefas-migracao-supabase.md](./01-planejamento/lista-tarefas-migracao-supabase.md)** | 34 tarefas organizadas | Planejamento e execução |
| **[referencia-rapida-migracao.md](./01-planejamento/referencia-rapida-migracao.md)** | Comandos e troubleshooting | Durante implementação |

### **🟡 IMPORTANTES (Consultar conforme necessário)**
| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **[plano-migracao-alimentacao.md](./02-migracao/plano-migracao-alimentacao.md)** | Plano detalhado do piloto | Migração do módulo alimentação |
| **[schema-alimentacao.sql](./02-migracao/schema-alimentacao.sql)** | Script SQL completo | Configuração do banco |
| **[acompanhamento-migracao.md](./01-planejamento/acompanhamento-migracao.md)** | Tracking de progresso | Acompanhamento diário |

### **🟢 ESPECÍFICOS (Usar quando relevante)**
| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **[03-modulos/[modulo]-migracao.txt](./03-modulos/)** | Planos por módulo | Migração de módulos específicos |
| **[depuracao.md](./05-referencias/depuracao.md)** | Debugging MCP Playwright | Resolução de problemas |
| **[04-implementacao/](./04-implementacao/)** | Documentos técnicos | Implementação avançada |

---

## 🔍 **BUSCA RÁPIDA POR TÓPICO**

### **Configuração e Setup**
- **Supabase**: [README.md](./README.md) → [lista-tarefas (Fase 1)](./01-planejamento/lista-tarefas-migracao-supabase.md)
- **Variáveis de ambiente**: [referencia-rapida](./01-planejamento/referencia-rapida-migracao.md)
- **Schema SQL**: [schema-alimentacao.sql](./02-migracao/schema-alimentacao.sql)

### **Autenticação e Segurança**
- **Sistema de auth**: [autenticacao-migracao.txt](./04-implementacao/autenticacao-migracao.txt)
- **RLS**: [schema-alimentacao.sql](./02-migracao/schema-alimentacao.sql)
- **Segurança**: [04-implementacao/README.md](./04-implementacao/README.md)

### **Migração de Dados**
- **Módulo piloto**: [02-migracao/](./02-migracao/)
- **Outros módulos**: [03-modulos/](./03-modulos/)
- **Scripts**: [plano-migracao-alimentacao.md](./02-migracao/plano-migracao-alimentacao.md)

### **Testes e Debugging**
- **MCP Playwright**: [depuracao.md](./05-referencias/depuracao.md)
- **Troubleshooting**: [referencia-rapida](./01-planejamento/referencia-rapida-migracao.md)
- **Validação**: [05-referencias/README.md](./05-referencias/README.md)

### **Performance e Otimização**
- **Métricas**: [acompanhamento-migracao.md](./01-planejamento/acompanhamento-migracao.md)
- **Otimizações**: [lista-tarefas (Fase 5)](./01-planejamento/lista-tarefas-migracao-supabase.md)
- **Monitoramento**: [04-implementacao/README.md](./04-implementacao/README.md)

---

## 📋 **CHECKLISTS RÁPIDOS**

### **✅ Antes de Começar**
- [ ] Li [README.md](./README.md) completamente
- [ ] Entendi a [lista de tarefas](./01-planejamento/lista-tarefas-migracao-supabase.md)
- [ ] Configurei [tracking](./01-planejamento/acompanhamento-migracao.md)
- [ ] Tenho [referência rápida](./01-planejamento/referencia-rapida-migracao.md) acessível

### **✅ Durante Implementação**
- [ ] Sigo a [lista de tarefas](./01-planejamento/lista-tarefas-migracao-supabase.md) sequencialmente
- [ ] Atualizo [progresso](./01-planejamento/acompanhamento-migracao.md) diariamente
- [ ] Uso [referência rápida](./01-planejamento/referencia-rapida-migracao.md) para comandos
- [ ] Consulto [debugging](./05-referencias/depuracao.md) quando necessário

### **✅ Para Cada Módulo**
- [ ] Li o [plano específico](./03-modulos/) do módulo
- [ ] Segui o [padrão estabelecido](./02-migracao/) no módulo piloto
- [ ] Executei [testes funcionais](./05-referencias/depuracao.md)
- [ ] Documentei [lições aprendidas](./01-planejamento/acompanhamento-migracao.md)

---

## 🎯 **FLUXO RECOMENDADO DE LEITURA**

### **Primeira Vez (Setup)**
```
1. README.md (visão geral)
   ↓
2. 01-planejamento/lista-tarefas-migracao-supabase.md (plano completo)
   ↓
3. 01-planejamento/acompanhamento-migracao.md (configurar tracking)
   ↓
4. 01-planejamento/referencia-rapida-migracao.md (bookmark)
```

### **Implementação do Piloto**
```
1. 02-migracao/README.md (contexto)
   ↓
2. 02-migracao/plano-migracao-alimentacao.md (plano detalhado)
   ↓
3. 02-migracao/schema-alimentacao.sql (executar)
   ↓
4. 05-referencias/depuracao.md (testes)
```

### **Outros Módulos**
```
1. 03-modulos/README.md (estratégia)
   ↓
2. 03-modulos/[modulo]-migracao.txt (plano específico)
   ↓
3. Aplicar padrão do módulo piloto
   ↓
4. Testar e documentar
```

---

## 📞 **SUPORTE E RECURSOS**

### **Documentação Interna**
- **Dúvidas gerais**: [README.md](./README.md)
- **Problemas técnicos**: [05-referencias/](./05-referencias/)
- **Progresso**: [01-planejamento/acompanhamento-migracao.md](./01-planejamento/acompanhamento-migracao.md)

### **Recursos Externos**
- **[Supabase Docs](https://supabase.com/docs)** - Documentação oficial
- **[Supabase Discord](https://discord.supabase.com)** - Comunidade
- **[Next.js Docs](https://nextjs.org/docs)** - Framework

### **Status e Monitoramento**
- **[Supabase Status](https://status.supabase.com)** - Status dos serviços

---

**📑 Use este índice como seu mapa de navegação durante toda a migração!**
