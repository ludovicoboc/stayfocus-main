# Guia de Implementação RLS (Row Level Security)

Este documento descreve como implementar e testar as políticas RLS no projeto StayFocus.

## 📋 Visão Geral

Row Level Security (RLS) é um recurso do PostgreSQL/Supabase que permite controlar o acesso a linhas específicas de uma tabela baseado no usuário autenticado. No StayFocus, usamos RLS para garantir que cada usuário só possa acessar seus próprios dados.

## 🔒 Políticas Implementadas

### Princípio Base
Todas as políticas seguem o princípio: **`auth.uid() = user_id`**

Isso significa que um usuário só pode acessar registros onde o campo `user_id` corresponde ao seu ID de autenticação.

### Tabelas Protegidas

| Tabela | Políticas | Descrição |
|--------|-----------|-----------|
| `users` | SELECT, UPDATE, INSERT | Perfil do usuário |
| `hiperfocos` | SELECT, INSERT, UPDATE, DELETE | Hiperfocos do usuário |
| `tarefas` | SELECT, INSERT, UPDATE, DELETE | Tarefas do usuário |
| `sessoes_alternancia` | SELECT, INSERT, UPDATE, DELETE | Sessões de alternância |
| `meal_plans` | SELECT, INSERT, UPDATE, DELETE | Planos de refeição |
| `meal_records` | SELECT, INSERT, UPDATE, DELETE | Registros de refeições |
| `hydration_tracking` | SELECT, INSERT, UPDATE, DELETE | Controle de hidratação |
| `recipes` | SELECT, INSERT, UPDATE, DELETE | Receitas do usuário |
| `recipe_ingredients` | SELECT, INSERT, UPDATE, DELETE | Ingredientes (via receita) |
| `recipe_tags` | SELECT, INSERT, UPDATE, DELETE | Tags (via receita) |
| `recipe_categories` | SELECT | Categorias públicas |
| `recipe_category_assignments` | SELECT, INSERT, DELETE | Atribuições (via receita) |
| `favorite_recipes` | SELECT, INSERT, DELETE | Receitas favoritas |

## 🚀 Como Aplicar as Políticas

### Opção 1: Script SQL Direto

Execute o script SQL no Supabase Dashboard:

```bash
# Copie o conteúdo de scripts/rls-policies-complete.sql
# Cole no SQL Editor do Supabase Dashboard
# Execute o script
```

### Opção 2: Script TypeScript Automatizado

```bash
# Configure as variáveis de ambiente
export NEXT_PUBLIC_SUPABASE_URL="sua-url-do-supabase"
export SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"

# Execute o script
npx tsx scripts/apply-rls-policies.ts
```

## 🧪 Como Testar as Políticas

### Teste Automatizado

```bash
# Configure as variáveis de ambiente
export NEXT_PUBLIC_SUPABASE_URL="sua-url-do-supabase"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"

# Execute os testes
npx tsx scripts/test-rls-policies.ts
```

### Teste Manual no Supabase Dashboard

1. **Verificar RLS Habilitado:**
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('hiperfocos', 'tarefas', 'meal_plans')
ORDER BY tablename;
```

2. **Verificar Políticas Criadas:**
```sql
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename = 'hiperfocos'
ORDER BY policyname;
```

3. **Testar Isolamento:**
```sql
-- Como usuário autenticado, deve retornar apenas seus dados
SELECT * FROM hiperfocos WHERE user_id = auth.uid();

-- Tentativa de acessar dados de outro usuário (deve retornar vazio)
SELECT * FROM hiperfocos WHERE user_id = 'outro-user-id';
```

## 🔍 Verificação de Segurança

### Cenários de Teste

1. **✅ Acesso Próprio Permitido**
   - Usuário pode ler seus próprios dados
   - Usuário pode inserir dados para si mesmo
   - Usuário pode atualizar seus próprios dados
   - Usuário pode deletar seus próprios dados

2. **🚫 Acesso Cruzado Bloqueado**
   - Usuário não pode ler dados de outros usuários
   - Usuário não pode inserir dados para outros usuários
   - Usuário não pode atualizar dados de outros usuários
   - Usuário não pode deletar dados de outros usuários

3. **🔒 Usuário Não Autenticado**
   - Sem autenticação, nenhum dado é acessível
   - Operações de escrita são bloqueadas

### Comandos de Verificação

```sql
-- Verificar se auth.uid() está funcionando
SELECT auth.uid();

-- Testar política SELECT
SELECT COUNT(*) FROM hiperfocos; -- Deve retornar apenas dados do usuário

-- Testar política INSERT
INSERT INTO hiperfocos (titulo, user_id) 
VALUES ('Teste', 'outro-user-id'); -- Deve falhar

-- Testar política UPDATE
UPDATE hiperfocos 
SET titulo = 'Hack' 
WHERE user_id = 'outro-user-id'; -- Deve falhar

-- Testar política DELETE
DELETE FROM hiperfocos 
WHERE user_id = 'outro-user-id'; -- Deve falhar
```

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Erro: "new row violates row-level security policy"**
   - ✅ **Esperado**: Indica que RLS está funcionando
   - 🔍 **Verificar**: Se o `user_id` corresponde ao `auth.uid()`

2. **Usuário não consegue acessar próprios dados**
   - 🔍 **Verificar**: Se o usuário está autenticado (`auth.uid()` não é null)
   - 🔍 **Verificar**: Se o campo `user_id` está preenchido corretamente

3. **Políticas não estão sendo aplicadas**
   - 🔍 **Verificar**: Se RLS está habilitado na tabela
   - 🔍 **Verificar**: Se as políticas foram criadas corretamente

### Comandos de Debug

```sql
-- Verificar usuário atual
SELECT auth.uid() as current_user_id;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'hiperfocos';

-- Listar políticas
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'hiperfocos';

-- Testar acesso direto (como service_role)
SELECT user_id, titulo FROM hiperfocos LIMIT 5;
```

## 📊 Métricas de Segurança

### KPIs de RLS

1. **Cobertura de Tabelas**: 100% das tabelas com dados de usuário têm RLS
2. **Isolamento**: 0 vazamentos de dados entre usuários
3. **Performance**: Políticas não impactam significativamente a performance
4. **Manutenibilidade**: Políticas são consistentes e bem documentadas

### Monitoramento

```sql
-- Verificar tentativas de violação de RLS (logs do Supabase)
-- Monitorar performance de queries com RLS
-- Auditar políticas regularmente
```

## 🔄 Manutenção

### Adicionando Nova Tabela

1. Criar a tabela com campo `user_id`
2. Habilitar RLS: `ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;`
3. Criar políticas CRUD
4. Testar isolamento
5. Atualizar documentação

### Atualizando Políticas

1. Fazer backup das políticas existentes
2. Testar novas políticas em ambiente de desenvolvimento
3. Aplicar em produção
4. Verificar funcionamento
5. Monitorar por vazamentos

## 📚 Referências

- [Documentação RLS do PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Documentação RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Melhores Práticas de Segurança](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-row-level-security)
