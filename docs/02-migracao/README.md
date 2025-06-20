# 🔄 Migração - Módulo Alimentação (Piloto)

**Documentação específica para migração do módulo de alimentação como projeto piloto**

---

## 📄 **ARQUIVOS NESTE DIRETÓRIO**

### **`README-migracao-alimentacao.md`** 📚
**Guia principal** de uso da documentação do módulo alimentação
- ✅ **Ordem de execução** dos documentos
- ✅ **Como usar** cada arquivo
- ✅ **Passo a passo** detalhado
- ✅ **Método MosCoW** aplicado
- ✅ **Tecnologias envolvidas**

### **`plano-migracao-alimentacao.md`** 📋
**Plano detalhado** de migração (417 linhas)
- ✅ **Auditoria completa** do localStorage
- ✅ **Esquema de banco** unificado
- ✅ **Contrato de API** detalhado
- ✅ **Plano de implementação** por fases
- ✅ **Checklist de execução**

### **`schema-alimentacao.sql`** 🗄️
**Script SQL completo** para criação do banco (432 linhas)
- ✅ **Tabelas principais** (users, meal_plans, meal_records, etc.)
- ✅ **Índices otimizados** para performance
- ✅ **Triggers** para updated_at automático
- ✅ **Políticas RLS** (Row Level Security) para Supabase
- ✅ **Views úteis** para consultas complexas
- ✅ **Dados iniciais** (seed data)

---

## 🎯 **POR QUE MÓDULO ALIMENTAÇÃO COMO PILOTO?**

### **Vantagens Estratégicas**
1. **📚 Mais documentado** - Possui documentação mais completa e detalhada
2. **🔧 Complexidade média** - Não é muito simples nem muito complexo
3. **🧪 Casos de uso variados** - CRUD, upload de imagens, relacionamentos
4. **👥 Alto uso** - Funcionalidade frequentemente utilizada pelos usuários
5. **🔗 Independente** - Pode ser migrado sem afetar outros módulos

### **Funcionalidades Incluídas**
- **Planejamento de refeições** - Horários e descrições
- **Registro de refeições** - Com fotos e categorização
- **Controle de hidratação** - Meta diária e tracking
- **Sistema de receitas** - Completo com ingredientes e favoritos

---

## 🚀 **COMO USAR ESTA DOCUMENTAÇÃO**

### **Passo 1: Planejamento**
1. **Leia completamente**: `README-migracao-alimentacao.md`
2. **Estude o plano**: `plano-migracao-alimentacao.md`
3. **Analise o schema**: `schema-alimentacao.sql`

### **Passo 2: Configuração do Banco**
1. **Execute o script**: `schema-alimentacao.sql` no Supabase
2. **Verifique criação**: Tabelas, índices, triggers, RLS
3. **Teste conexão**: Validar configuração

### **Passo 3: Implementação**
1. **Siga o checklist**: Do plano de migração
2. **Implemente APIs**: Conforme contrato definido
3. **Configure RLS**: Se usando Supabase

### **Passo 4: Migração de Dados**
1. **Execute script**: De migração de dados
2. **Valide migração**: Verificar integridade
3. **Teste funcionalidades**: Validar tudo funciona

---

## 📊 **ESTRUTURA DO MÓDULO ALIMENTAÇÃO**

### **Componentes Frontend**
- **PlanejadorRefeicoes.tsx** - Gerencia horários e descrições
- **RegistroRefeicoes.tsx** - Registra refeições com fotos
- **LembreteHidratacao.tsx** - Controla intake de água
- **Módulo de Receitas** - Sistema completo de receitas

### **Estrutura de Dados (localStorage atual)**
```typescript
{
  "refeicoes": [
    {
      "id": "string",
      "horario": "string (HH:MM)",
      "descricao": "string"
    }
  ],
  "registros": [
    {
      "id": "string",
      "data": "string (YYYY-MM-DD)",
      "horario": "string (HH:MM)",
      "descricao": "string",
      "tipoIcone": "string | null",
      "foto": "string | null"
    }
  ],
  "coposBebidos": "number",
  "metaDiaria": "number",
  "ultimoRegistro": "string | null"
}
```

### **Estrutura de Dados (Supabase alvo)**
- **users** - Usuários do sistema
- **meal_plans** - Planejamento de refeições
- **meal_records** - Registros de refeições
- **hydration_tracking** - Controle de hidratação
- **recipes** - Receitas culinárias
- **recipe_ingredients** - Ingredientes das receitas
- **recipe_tags** - Tags das receitas
- **favorite_recipes** - Receitas favoritas

---

## 🔧 **TECNOLOGIAS ESPECÍFICAS**

### **Frontend**
- **Next.js** - Framework React
- **Zustand** - Store atual (será migrado)
- **TypeScript** - Tipagem estática

### **Backend**
- **Supabase** - Produção (PostgreSQL + Auth + RLS + Storage)
- **FastAPI** - Desenvolvimento local (Python + SQLAlchemy)

### **Banco de Dados**
- **PostgreSQL** - Banco principal
- **Row Level Security** - Segurança por usuário
- **Supabase Storage** - Upload de imagens

---

## 📋 **CHECKLIST DE MIGRAÇÃO**

### **Preparação**
- [ ] Backup dos dados atuais do localStorage
- [ ] Supabase configurado e testado
- [ ] Schema SQL executado com sucesso
- [ ] RLS configurado e testado

### **Implementação**
- [ ] DataProvider interface implementada
- [ ] SupabaseProvider para alimentação criado
- [ ] APIs de meal-plans implementadas
- [ ] APIs de meal-records implementadas
- [ ] APIs de hydration implementadas
- [ ] APIs de receitas implementadas
- [ ] Upload de imagens configurado

### **Migração**
- [ ] Script de migração criado
- [ ] Dados migrados com sucesso
- [ ] Validação de integridade realizada
- [ ] Stores refatorados para usar APIs

### **Testes**
- [ ] Testes funcionais executados
- [ ] Performance validada
- [ ] Sincronização offline/online testada
- [ ] Fallback para localStorage testado

### **Finalização**
- [ ] Documentação atualizada
- [ ] Código legacy removido (opcional)
- [ ] Deploy realizado

---

## 🚨 **PONTOS DE ATENÇÃO ESPECÍFICOS**

### **Upload de Imagens**
- Configurar bucket no Supabase Storage
- Implementar redimensionamento/otimização
- Fallback para base64 em desenvolvimento

### **Hidratação (Optimistic Updates)**
- Implementar updates imediatos na UI
- Sincronizar com backend em background
- Tratar conflitos de sincronização

### **Receitas (Relacionamentos Complexos)**
- Gerenciar ingredientes e tags corretamente
- Implementar busca e filtros eficientes
- Otimizar queries com joins

### **Migração de Dados**
- Validar formato dos dados existentes
- Tratar dados corrompidos ou incompletos
- Manter backup durante todo o processo

---

## 📈 **MÉTRICAS DE SUCESSO**

### **Critérios de Aceitação**
- [ ] **Zero perda de dados** durante migração
- [ ] **Performance igual ou melhor** que localStorage
- [ ] **Todas as funcionalidades** operacionais
- [ ] **Sincronização offline** funcionando
- [ ] **Upload de imagens** operacional

### **KPIs**
- **Tempo de carregamento**: < 2 segundos
- **Tempo de resposta API**: < 500ms
- **Taxa de sucesso de upload**: > 95%
- **Disponibilidade**: > 99%

---

**🔄 Este módulo servirá como modelo para migração dos demais módulos do sistema!**
