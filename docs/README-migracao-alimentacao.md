# 📚 DOCUMENTAÇÃO DE MIGRAÇÃO - MÓDULO ALIMENTAÇÃO

Esta pasta contém toda a documentação necessária para migrar o módulo de alimentação do localStorage para uma arquitetura dual (Supabase + FastAPI).

## 📄 Arquivos Incluídos

### 1. `plano-migracao-alimentacao.md`
**Documento principal** com o plano completo de migração utilizando o método MosCoW:
- 🔍 Auditoria completa do localStorage
- 🗄️ Esquema de banco de dados unificado
- 🌐 Contrato de API detalhado
- 📋 Plano de implementação por fases
- 🔧 Checklist de execução

### 2. `schema-alimentacao.sql`
**Script SQL completo** para criação do banco de dados:
- Tabelas principais (users, meal_plans, meal_records, etc.)
- Índices otimizados para performance
- Triggers para updated_at automático
- Políticas RLS (Row Level Security) para Supabase
- Views úteis para consultas complexas
- Dados iniciais (seed data)

### 3. `script-migracao-dados.js`
**Script JavaScript** para migração automatizada dos dados:
- Backup automático dos dados do localStorage
- Migração gradual por funcionalidade
- Validação de dados migrados
- Sistema de rollback em caso de erro
- Logs detalhados do processo

### 4. `README-migracao-alimentacao.md` (este arquivo)
**Guia de uso** da documentação e ordem de execução.

## 🚀 Como Usar Esta Documentação

### Passo 1: Planejamento
1. Leia o `plano-migracao-alimentacao.md` completamente
2. Identifique qual ambiente você está configurando (desenvolvimento ou produção)
3. Prepare as ferramentas necessárias (Node.js, PostgreSQL, etc.)

### Passo 2: Configuração do Banco de Dados
1. Execute o script `schema-alimentacao.sql` no seu banco PostgreSQL
   ```bash
   # Para desenvolvimento local
   psql -U seu_usuario -d stayfocus_dev -f schema-alimentacao.sql
   
   # Para Supabase (via interface web ou CLI)
   supabase db reset
   # Depois cole o conteúdo do schema-alimentacao.sql no SQL Editor
   ```

### Passo 3: Implementação das APIs
Siga o checklist do plano de migração:
- Implemente autenticação JWT
- Crie endpoints conforme o contrato de API
- Configure Row Level Security (se usando Supabase)

### Passo 4: Migração dos Dados
1. Abra o console do navegador na aplicação atual
2. Carregue o script de migração:
   ```javascript
   // Cole o conteúdo do script-migracao-dados.js no console
   
   // Execute a migração
   const migration = await MigrationRunner.run({
     apiBaseUrl: 'http://localhost:8000', // ou sua URL da API
     authToken: 'seu_token_jwt_aqui'
   });
   ```

### Passo 5: Validação e Limpeza
1. Valide se os dados foram migrados corretamente
2. Teste todas as funcionalidades
3. Após confirmação, limpe dados antigos (opcional)

## 📊 Método MosCoW Aplicado

### 🔴 MUST HAVE (Implementar primeiro)
- Autenticação JWT
- APIs básicas (meal-plans, meal-records, hydration)
- Service layer abstrato no frontend
- Fallback para localStorage

### 🟡 SHOULD HAVE (Implementar em seguida)
- APIs completas de receitas
- Migração completa dos stores
- Sincronização offline/online
- RLS no Supabase

### 🟢 COULD HAVE (Melhorias futuras)
- Cache Redis
- Optimistic updates
- Sistema de backup/restore
- Monitoramento e logs

### ⚫ WON'T HAVE (Não nesta iteração)
- Compartilhamento de receitas
- IA para análise nutricional
- CI/CD automatizado
- Notificações push

## 🛠️ Tecnologias Envolvidas

### Frontend
- **Next.js** - Framework React
- **Zustand** - Gerenciamento de estado
- **TypeScript** - Tipagem estática

### Backend Dual-Track
- **Supabase** - Produção (PostgreSQL + Auth + RLS)
- **FastAPI** - Desenvolvimento local (Python + SQLAlchemy)

### Banco de Dados
- **PostgreSQL** - Banco principal em ambos os ambientes
- **Row Level Security** - Segurança a nível de linha (Supabase)

## 🔐 Considerações de Segurança

1. **Autenticação**: JWT tokens em ambos os ambientes
2. **Autorização**: RLS policies no Supabase
3. **Validação**: Schemas de validação na API
4. **CORS**: Configuração adequada para produção
5. **HTTPS**: Obrigatório em produção

## 📈 Monitoramento e Logs

### Desenvolvimento
- Logs detalhados no console
- Validação de dados em cada operação
- Backup automático antes da migração

### Produção
- Métricas de performance das APIs
- Logs de auditoria de operações
- Monitoramento de uso do banco

## 🤝 Processo de Review

Antes de executar em produção:
1. ✅ Review do esquema de banco de dados
2. ✅ Teste de todas as APIs em desenvolvimento
3. ✅ Validação do script de migração com dados reais
4. ✅ Teste de rollback
5. ✅ Backup completo dos dados atuais

## 📞 Suporte e Troubleshooting

### Problemas Comuns

**Erro de Autenticação**
- Verifique se o token JWT está válido
- Confirme se as políticas RLS estão corretas

**Falha na Migração**
- Execute o rollback automático
- Verifique logs detalhados no console
- Mantenha backup dos dados originais

**Performance Lenta**
- Verifique se os índices foram criados
- Analise queries com EXPLAIN ANALYZE
- Configure cache se necessário

### Contato
Para dúvidas sobre a migração, consulte:
- Documentação técnica no plano principal
- Logs detalhados dos scripts
- Comentários no código SQL

---

**⚠️ IMPORTANTE**: Sempre faça backup completo dos dados antes de iniciar a migração!

---

*Documentação gerada automaticamente em {{ current_date }}* 