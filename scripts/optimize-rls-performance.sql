-- =============================================================================
-- OTIMIZAÇÃO DE PERFORMANCE PARA POLÍTICAS RLS
-- =============================================================================
-- 
-- Este script otimiza a performance das políticas RLS através de:
-- 1. Índices compostos específicos para RLS
-- 2. Análise de planos de execução
-- 3. Otimizações de queries
-- 4. Monitoramento de performance
--
-- =============================================================================

-- =============================================================================
-- ÍNDICES OTIMIZADOS PARA RLS
-- =============================================================================

-- Índices compostos para hiperfocos (user_id sempre primeiro para RLS)
CREATE INDEX IF NOT EXISTS idx_hiperfocos_user_created 
ON hiperfocos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hiperfocos_user_status_created 
ON hiperfocos (user_id, status, created_at DESC);

-- Índices para tarefas (otimizar JOIN com hiperfocos)
CREATE INDEX IF NOT EXISTS idx_tarefas_hiperfoco_user 
ON tarefas (hiperfoco_id) 
INCLUDE (concluida, ordem, nivel);

-- Índices para sessoes_alternancia
CREATE INDEX IF NOT EXISTS idx_sessoes_user_tempo 
ON sessoes_alternancia (user_id, tempo_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_sessoes_user_concluida 
ON sessoes_alternancia (user_id, concluida, tempo_inicio DESC);

-- =============================================================================
-- VIEWS OTIMIZADAS COM RLS
-- =============================================================================

-- View para hiperfocos ativos do usuário (pré-filtrada)
CREATE OR REPLACE VIEW user_hiperfocos_ativos AS
SELECT 
    id,
    titulo,
    descricao,
    cor,
    tempo_limite,
    status,
    data_criacao,
    created_at,
    updated_at
FROM hiperfocos 
WHERE status = 'ativo' 
    AND auth.uid() = user_id;

-- View para estatísticas de tarefas por hiperfoco
CREATE OR REPLACE VIEW user_hiperfoco_stats AS
SELECT 
    h.id as hiperfoco_id,
    h.titulo,
    h.user_id,
    COUNT(t.id) as total_tarefas,
    COUNT(CASE WHEN t.concluida THEN 1 END) as tarefas_concluidas,
    ROUND(
        COUNT(CASE WHEN t.concluida THEN 1 END) * 100.0 / NULLIF(COUNT(t.id), 0), 
        2
    ) as percentual_conclusao
FROM hiperfocos h
LEFT JOIN tarefas t ON h.id = t.hiperfoco_id
WHERE h.user_id = auth.uid()
GROUP BY h.id, h.titulo, h.user_id;

-- View para sessões recentes do usuário
CREATE OR REPLACE VIEW user_sessoes_recentes AS
SELECT 
    id,
    hiperfoco_anterior_id,
    hiperfoco_novo_id,
    tempo_inicio,
    tempo_fim,
    duracao_minutos,
    concluida,
    motivo_alternancia
FROM sessoes_alternancia 
WHERE user_id = auth.uid()
    AND tempo_inicio >= NOW() - INTERVAL '30 days'
ORDER BY tempo_inicio DESC;

-- =============================================================================
-- FUNÇÕES OTIMIZADAS PARA RLS
-- =============================================================================

-- Função para buscar hiperfocos do usuário com filtros otimizados
CREATE OR REPLACE FUNCTION get_user_hiperfocos(
    p_status TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    titulo VARCHAR(255),
    descricao TEXT,
    cor VARCHAR(7),
    tempo_limite INTEGER,
    status VARCHAR(20),
    data_criacao TIMESTAMP WITH TIME ZONE,
    total_tarefas BIGINT,
    tarefas_concluidas BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.titulo,
        h.descricao,
        h.cor,
        h.tempo_limite,
        h.status,
        h.data_criacao,
        COUNT(t.id) as total_tarefas,
        COUNT(CASE WHEN t.concluida THEN 1 END) as tarefas_concluidas
    FROM hiperfocos h
    LEFT JOIN tarefas t ON h.id = t.hiperfoco_id
    WHERE h.user_id = auth.uid()
        AND (p_status IS NULL OR h.status = p_status)
    GROUP BY h.id, h.titulo, h.descricao, h.cor, h.tempo_limite, h.status, h.data_criacao
    ORDER BY h.data_criacao DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Função para buscar tarefas hierárquicas otimizada
CREATE OR REPLACE FUNCTION get_user_tarefas_hierarquicas(
    p_hiperfoco_id UUID
)
RETURNS TABLE (
    id UUID,
    texto TEXT,
    concluida BOOLEAN,
    ordem INTEGER,
    nivel INTEGER,
    parent_id UUID,
    hiperfoco_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o hiperfoco pertence ao usuário
    IF NOT EXISTS (
        SELECT 1 FROM hiperfocos 
        WHERE id = p_hiperfoco_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Hiperfoco não encontrado ou acesso negado';
    END IF;

    RETURN QUERY
    WITH RECURSIVE tarefa_tree AS (
        -- Tarefas raiz (sem parent)
        SELECT 
            t.id, t.texto, t.concluida, t.ordem, t.nivel, 
            t.parent_id, t.hiperfoco_id, 0 as depth
        FROM tarefas t
        WHERE t.hiperfoco_id = p_hiperfoco_id 
            AND t.parent_id IS NULL
        
        UNION ALL
        
        -- Subtarefas recursivamente
        SELECT 
            t.id, t.texto, t.concluida, t.ordem, t.nivel,
            t.parent_id, t.hiperfoco_id, tt.depth + 1
        FROM tarefas t
        INNER JOIN tarefa_tree tt ON t.parent_id = tt.id
        WHERE tt.depth < 10 -- Limite de profundidade para evitar loops
    )
    SELECT 
        tt.id, tt.texto, tt.concluida, tt.ordem, tt.nivel,
        tt.parent_id, tt.hiperfoco_id
    FROM tarefa_tree tt
    ORDER BY tt.nivel, tt.ordem;
END;
$$;

-- =============================================================================
-- ANÁLISE DE PERFORMANCE
-- =============================================================================

-- Função para analisar performance das políticas RLS
CREATE OR REPLACE FUNCTION analyze_rls_performance()
RETURNS TABLE (
    table_name TEXT,
    policy_name TEXT,
    avg_execution_time NUMERIC,
    total_calls BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Esta função seria implementada com pg_stat_statements
    -- Por enquanto, retorna estrutura básica
    RETURN QUERY
    SELECT 
        'hiperfocos'::TEXT as table_name,
        'Users can view their own hiperfocos'::TEXT as policy_name,
        0.0::NUMERIC as avg_execution_time,
        0::BIGINT as total_calls;
END;
$$;

-- =============================================================================
-- QUERIES DE MONITORAMENTO
-- =============================================================================

-- Query para verificar uso de índices em políticas RLS
CREATE OR REPLACE VIEW rls_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('hiperfocos', 'tarefas', 'sessoes_alternancia')
ORDER BY idx_scan DESC;

-- Query para verificar estatísticas de tabelas com RLS
CREATE OR REPLACE VIEW rls_table_stats AS
SELECT 
    schemaname,
    relname as tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND relname IN ('hiperfocos', 'tarefas', 'sessoes_alternancia')
ORDER BY seq_scan + idx_scan DESC;

-- =============================================================================
-- OTIMIZAÇÕES DE CONFIGURAÇÃO
-- =============================================================================

-- Configurações otimizadas para RLS (executar como superuser se necessário)
-- ALTER SYSTEM SET row_security = on;
-- ALTER SYSTEM SET enable_seqscan = off; -- Para forçar uso de índices em desenvolvimento

-- =============================================================================
-- TESTES DE PERFORMANCE
-- =============================================================================

-- Função para testar performance de queries com RLS
CREATE OR REPLACE FUNCTION test_rls_performance()
RETURNS TABLE (
    test_name TEXT,
    execution_time_ms NUMERIC,
    rows_returned BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    row_count BIGINT;
BEGIN
    -- Teste 1: SELECT simples em hiperfocos
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM hiperfocos WHERE user_id = auth.uid();
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'SELECT hiperfocos by user_id'::TEXT,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::NUMERIC,
        row_count;

    -- Teste 2: JOIN entre hiperfocos e tarefas
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count 
    FROM hiperfocos h 
    JOIN tarefas t ON h.id = t.hiperfoco_id 
    WHERE h.user_id = auth.uid();
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'JOIN hiperfocos-tarefas'::TEXT,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::NUMERIC,
        row_count;

    -- Teste 3: Query complexa com agregações
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM user_hiperfoco_stats;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Complex aggregation query'::TEXT,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::NUMERIC,
        row_count;
END;
$$;

-- =============================================================================
-- COMANDOS DE MANUTENÇÃO
-- =============================================================================

-- Atualizar estatísticas das tabelas
ANALYZE hiperfocos;
ANALYZE tarefas;
ANALYZE sessoes_alternancia;

-- Reindexar se necessário (executar em horário de baixo uso)
-- REINDEX TABLE hiperfocos;
-- REINDEX TABLE tarefas;
-- REINDEX TABLE sessoes_alternancia;

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

-- Verificar se todos os índices foram criados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('hiperfocos', 'tarefas', 'sessoes_alternancia')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE 'Otimizações RLS aplicadas com sucesso!';
    RAISE NOTICE 'Índices criados, views otimizadas e funções de performance implementadas.';
    RAISE NOTICE 'Execute test_rls_performance() para verificar melhorias.';
END $$;
