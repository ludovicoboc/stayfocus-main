# Melhores Práticas para Row Level Security (RLS)

Este documento estabelece as melhores práticas para implementação e manutenção de políticas RLS no projeto StayFocus.

## 🎯 Princípios Fundamentais

### 1. Princípio da Menor Permissão
- Usuários devem ter acesso apenas aos dados estritamente necessários
- Sempre usar `auth.uid() = user_id` como base das políticas
- Negar acesso por padrão, permitir explicitamente

### 2. Consistência nas Políticas
- Todas as tabelas com dados de usuário devem ter RLS habilitado
- Nomenclatura padronizada para políticas
- Estrutura consistente entre diferentes tabelas

### 3. Performance First
- Índices otimizados para políticas RLS
- Queries eficientes que aproveitam os índices
- Monitoramento contínuo de performance

## 📋 Checklist de Implementação

### ✅ Para Cada Nova Tabela

1. **Estrutura da Tabela**
   ```sql
   -- Sempre incluir user_id como UUID
   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
   ```

2. **Habilitar RLS**
   ```sql
   ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;
   ```

3. **Criar Políticas CRUD**
   ```sql
   -- SELECT
   CREATE POLICY "Users can view own data" ON nova_tabela
       FOR SELECT USING (auth.uid() = user_id);
   
   -- INSERT
   CREATE POLICY "Users can insert own data" ON nova_tabela
       FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   -- UPDATE
   CREATE POLICY "Users can update own data" ON nova_tabela
       FOR UPDATE USING (auth.uid() = user_id);
   
   -- DELETE
   CREATE POLICY "Users can delete own data" ON nova_tabela
       FOR DELETE USING (auth.uid() = user_id);
   ```

4. **Criar Índices Otimizados**
   ```sql
   -- Índice principal para RLS
   CREATE INDEX idx_nova_tabela_user_id ON nova_tabela (user_id);
   
   -- Índices compostos conforme necessário
   CREATE INDEX idx_nova_tabela_user_created 
   ON nova_tabela (user_id, created_at DESC);
   ```

5. **Testar Isolamento**
   - Verificar que usuários não conseguem acessar dados de outros
   - Testar todas as operações CRUD
   - Validar performance das queries

## 🔒 Padrões de Políticas

### Políticas Básicas (Tabelas Simples)

```sql
-- Para tabelas com user_id direto
CREATE POLICY "policy_name" ON table_name
    FOR operation USING (auth.uid() = user_id);
```

### Políticas Relacionais (Tabelas com FK)

```sql
-- Para tabelas que referenciam outras tabelas do usuário
CREATE POLICY "Users can access related data" ON child_table
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM parent_table 
            WHERE parent_table.id = child_table.parent_id 
            AND parent_table.user_id = auth.uid()
        )
    );
```

### Políticas Públicas (Dados Compartilhados)

```sql
-- Para dados que devem ser públicos (ex: categorias)
CREATE POLICY "Public read access" ON public_table
    FOR SELECT USING (true);
```

## 🚀 Otimizações de Performance

### 1. Índices Estratégicos

```sql
-- Sempre user_id primeiro para RLS
CREATE INDEX idx_table_user_field ON table (user_id, field);

-- Para queries com ORDER BY
CREATE INDEX idx_table_user_created ON table (user_id, created_at DESC);

-- Para queries com filtros específicos
CREATE INDEX idx_table_user_status ON table (user_id, status, created_at DESC);
```

### 2. Views Otimizadas

```sql
-- Views pré-filtradas para queries comuns
CREATE VIEW user_active_items AS
SELECT * FROM items 
WHERE status = 'active' AND user_id = auth.uid();
```

### 3. Funções Especializadas

```sql
-- Funções que encapsulam lógica complexa
CREATE FUNCTION get_user_items(p_status TEXT DEFAULT NULL)
RETURNS SETOF items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM items 
    WHERE user_id = auth.uid()
        AND (p_status IS NULL OR status = p_status);
END;
$$;
```

## 🧪 Estratégias de Teste

### 1. Testes Unitários

```typescript
describe('RLS Policies', () => {
  it('should block access to other users data', async () => {
    // Teste de isolamento
  })
  
  it('should allow access to own data', async () => {
    // Teste de acesso próprio
  })
})
```

### 2. Testes de Performance

```typescript
describe('RLS Performance', () => {
  it('should execute queries within acceptable time', async () => {
    const startTime = Date.now()
    await supabase.from('table').select('*')
    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(100) // ms
  })
})
```

### 3. Testes de Carga

```typescript
describe('RLS Load Testing', () => {
  it('should handle multiple concurrent users', async () => {
    const users = ['user1', 'user2', 'user3']
    const operations = users.map(userId => 
      supabase.from('table').select('*').eq('user_id', userId)
    )
    const results = await Promise.all(operations)
    // Verificar isolamento
  })
})
```

## 📊 Monitoramento e Métricas

### 1. Métricas de Performance

```sql
-- Query para monitorar uso de índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 2. Detecção de Queries Lentas

```sql
-- Identificar queries que podem precisar de otimização
SELECT 
    query,
    mean_exec_time,
    calls
FROM pg_stat_statements 
WHERE query LIKE '%auth.uid()%'
ORDER BY mean_exec_time DESC;
```

### 3. Alertas de Segurança

```sql
-- Monitorar tentativas de violação de RLS
-- (implementar via logs do Supabase)
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **"new row violates row-level security policy"**
   - ✅ **Esperado**: RLS está funcionando
   - 🔍 **Verificar**: `user_id` corresponde ao `auth.uid()`

2. **Queries lentas após implementar RLS**
   - 🔍 **Verificar**: Índices em `user_id`
   - 🔍 **Otimizar**: Usar índices compostos

3. **Usuário não consegue acessar próprios dados**
   - 🔍 **Verificar**: Usuário está autenticado
   - 🔍 **Verificar**: Campo `user_id` está preenchido

### Comandos de Debug

```sql
-- Verificar usuário atual
SELECT auth.uid();

-- Verificar políticas de uma tabela
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'sua_tabela';

-- Analisar plano de execução
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM sua_tabela WHERE user_id = auth.uid();
```

## 📚 Recursos Adicionais

### Documentação Oficial
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Ferramentas Úteis
- `pg_stat_statements` para análise de performance
- `EXPLAIN ANALYZE` para otimização de queries
- Supabase Dashboard para monitoramento

### Scripts de Manutenção
- `scripts/rls-policies-complete.sql` - Aplicar todas as políticas
- `scripts/optimize-rls-performance.sql` - Otimizações de performance
- `scripts/test-rls-policies.ts` - Testes automatizados

## 🔄 Processo de Manutenção

### Revisão Mensal
1. Verificar performance das políticas RLS
2. Analisar logs de tentativas de violação
3. Otimizar índices conforme necessário
4. Atualizar documentação

### Ao Adicionar Nova Funcionalidade
1. Identificar tabelas que precisam de RLS
2. Implementar políticas seguindo os padrões
3. Criar testes de isolamento
4. Documentar mudanças

### Ao Detectar Problemas
1. Identificar a causa raiz
2. Implementar correção
3. Adicionar testes para prevenir regressão
4. Atualizar documentação

## ⚠️ Avisos Importantes

### ❌ Nunca Fazer
- Desabilitar RLS em produção
- Usar `true` em políticas de dados sensíveis
- Ignorar erros de violação de RLS
- Implementar lógica de autorização apenas no frontend

### ✅ Sempre Fazer
- Testar políticas em ambiente de desenvolvimento
- Monitorar performance após mudanças
- Documentar novas políticas
- Revisar políticas regularmente

### 🚨 Emergência
Em caso de vazamento de dados detectado:
1. Identificar a política problemática
2. Desabilitar acesso temporariamente se necessário
3. Corrigir a política
4. Testar correção
5. Reabilitar acesso
6. Investigar impacto e notificar usuários se necessário

---

**Lembre-se**: RLS é sua última linha de defesa. Implemente-o corretamente e mantenha-o atualizado!
