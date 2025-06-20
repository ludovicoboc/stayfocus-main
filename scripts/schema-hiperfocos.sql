-- =============================================================================
-- SCHEMA HIPERFOCOS - SUPABASE
-- =============================================================================
-- Criação das tabelas para o módulo de hiperfocos e tarefas
-- Baseado na estrutura do hiperfocosStore.ts
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELAS DO MÓDULO HIPERFOCOS
-- =============================================================================

-- Tabela principal de hiperfocos
CREATE TABLE IF NOT EXISTS hiperfocos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) NOT NULL, -- Hexadecimal: #FFFFFF
    tempo_limite INTEGER, -- Minutos (opcional)
    status VARCHAR(20) DEFAULT 'ativo',
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_cor_format CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_tempo_limite CHECK (tempo_limite > 0 OR tempo_limite IS NULL),
    CONSTRAINT chk_status CHECK (status IN ('ativo', 'pausado', 'concluido', 'arquivado'))
);

-- Tabela de tarefas (hierárquica)
CREATE TABLE IF NOT EXISTS tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiperfoco_id UUID NOT NULL REFERENCES hiperfocos(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tarefas(id) ON DELETE CASCADE, -- Para subtarefas
    texto VARCHAR(500) NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    cor VARCHAR(7), -- Cor opcional para a tarefa
    ordem INTEGER NOT NULL DEFAULT 0,
    nivel INTEGER DEFAULT 0, -- 0 = tarefa principal, 1+ = subtarefas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_cor_tarefa_format CHECK (cor ~ '^#[0-9A-Fa-f]{6}$' OR cor IS NULL),
    CONSTRAINT chk_nivel CHECK (nivel >= 0 AND nivel <= 5), -- Máximo 5 níveis de hierarquia
    CONSTRAINT chk_ordem CHECK (ordem >= 0)
);

-- Tabela de sessões de alternância
CREATE TABLE IF NOT EXISTS sessoes_alternancia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    hiperfoco_atual UUID REFERENCES hiperfocos(id) ON DELETE SET NULL,
    hiperfoco_anterior UUID REFERENCES hiperfocos(id) ON DELETE SET NULL,
    tempo_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duracao_estimada INTEGER NOT NULL, -- Minutos
    duracao_real INTEGER, -- Minutos (preenchido quando concluída)
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_duracao_estimada CHECK (duracao_estimada > 0),
    CONSTRAINT chk_duracao_real CHECK (duracao_real > 0 OR duracao_real IS NULL)
);

-- =============================================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para hiperfocos
CREATE INDEX IF NOT EXISTS idx_hiperfocos_user_id ON hiperfocos(user_id);
CREATE INDEX IF NOT EXISTS idx_hiperfocos_status ON hiperfocos(status);
CREATE INDEX IF NOT EXISTS idx_hiperfocos_data_criacao ON hiperfocos(data_criacao);
CREATE INDEX IF NOT EXISTS idx_hiperfocos_user_status ON hiperfocos(user_id, status);

-- Índices para tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_hiperfoco_id ON tarefas(hiperfoco_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_parent_id ON tarefas(parent_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_concluida ON tarefas(concluida);
CREATE INDEX IF NOT EXISTS idx_tarefas_ordem ON tarefas(ordem);
CREATE INDEX IF NOT EXISTS idx_tarefas_nivel ON tarefas(nivel);
CREATE INDEX IF NOT EXISTS idx_tarefas_hiperfoco_ordem ON tarefas(hiperfoco_id, ordem);
CREATE INDEX IF NOT EXISTS idx_tarefas_parent_ordem ON tarefas(parent_id, ordem);

-- Índices para sessões
CREATE INDEX IF NOT EXISTS idx_sessoes_user_id ON sessoes_alternancia(user_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_hiperfoco_atual ON sessoes_alternancia(hiperfoco_atual);
CREATE INDEX IF NOT EXISTS idx_sessoes_concluida ON sessoes_alternancia(concluida);
CREATE INDEX IF NOT EXISTS idx_sessoes_tempo_inicio ON sessoes_alternancia(tempo_inicio);

-- =============================================================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para hiperfocos
CREATE TRIGGER update_hiperfocos_updated_at 
    BEFORE UPDATE ON hiperfocos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para tarefas
CREATE TRIGGER update_tarefas_updated_at 
    BEFORE UPDATE ON tarefas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para sessões
CREATE TRIGGER update_sessoes_updated_at 
    BEFORE UPDATE ON sessoes_alternancia 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS
ALTER TABLE hiperfocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_alternancia ENABLE ROW LEVEL SECURITY;

-- Políticas para hiperfocos
CREATE POLICY "Users can view their own hiperfocos" ON hiperfocos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hiperfocos" ON hiperfocos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hiperfocos" ON hiperfocos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hiperfocos" ON hiperfocos
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tarefas
CREATE POLICY "Users can view tarefas of their hiperfocos" ON tarefas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hiperfocos 
            WHERE hiperfocos.id = tarefas.hiperfoco_id 
            AND hiperfocos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tarefas in their hiperfocos" ON tarefas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM hiperfocos 
            WHERE hiperfocos.id = tarefas.hiperfoco_id 
            AND hiperfocos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tarefas of their hiperfocos" ON tarefas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM hiperfocos 
            WHERE hiperfocos.id = tarefas.hiperfoco_id 
            AND hiperfocos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tarefas of their hiperfocos" ON tarefas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM hiperfocos 
            WHERE hiperfocos.id = tarefas.hiperfoco_id 
            AND hiperfocos.user_id = auth.uid()
        )
    );

-- Políticas para sessões
CREATE POLICY "Users can view their own sessoes" ON sessoes_alternancia
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessoes" ON sessoes_alternancia
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessoes" ON sessoes_alternancia
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessoes" ON sessoes_alternancia
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =============================================================================

COMMENT ON TABLE hiperfocos IS 'Hiperfocos criados pelos usuários com configurações de tempo e cor';
COMMENT ON TABLE tarefas IS 'Tarefas hierárquicas associadas aos hiperfocos com suporte a subtarefas';
COMMENT ON TABLE sessoes_alternancia IS 'Sessões de alternância entre hiperfocos para gerenciamento de tempo';

COMMENT ON COLUMN hiperfocos.tempo_limite IS 'Tempo limite em minutos para o hiperfoco (opcional)';
COMMENT ON COLUMN hiperfocos.cor IS 'Cor hexadecimal para identificação visual do hiperfoco';
COMMENT ON COLUMN hiperfocos.status IS 'Status atual do hiperfoco: ativo, pausado, concluido, arquivado';

COMMENT ON COLUMN tarefas.parent_id IS 'ID da tarefa pai para criar hierarquia (subtarefas)';
COMMENT ON COLUMN tarefas.nivel IS 'Nível hierárquico: 0=principal, 1+=subtarefas';
COMMENT ON COLUMN tarefas.ordem IS 'Ordem de exibição dentro do mesmo nível hierárquico';

COMMENT ON COLUMN sessoes_alternancia.duracao_estimada IS 'Duração estimada da sessão em minutos';
COMMENT ON COLUMN sessoes_alternancia.duracao_real IS 'Duração real da sessão em minutos (preenchido ao concluir)';
