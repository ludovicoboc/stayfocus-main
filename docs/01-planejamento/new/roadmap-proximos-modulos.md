# 🗺️ Roadmap - Próximos Módulos StayFocus

## 📋 Status Executivo

### ✅ Concluído (Junho 2025)
- **Módulo Hiperfocos**: 100% refatorado e integrado
- **Arquitetura Base**: Next.js 14 + React Query + Supabase
- **Padrões Estabelecidos**: TDD, validação, hooks customizados
- **Documentação**: Guias completos para LLMs

### 🎯 Próximos Módulos (Ordem de Prioridade)

## 1. 🔥 ALTA PRIORIDADE

### 1.1 Módulo Sessões de Alternância
**Prazo**: 1-2 semanas  
**Complexidade**: Média  
**Impacto**: Alto

#### Funcionalidades
- ⏱️ **Timer Pomodoro**: 25min foco + 5min pausa
- ⏸️ **Pausar/Retomar**: Controle de sessões
- 📊 **Histórico**: Registro de sessões concluídas
- 🔔 **Notificações**: Alertas de início/fim

#### Arquivos Principais
```
app/components/sessoes/
├── TimerSessao.tsx          # Timer principal
├── ControleSessao.tsx       # Botões play/pause/stop
├── HistoricoSessoes.tsx     # Lista de sessões
└── ConfiguracoesTempo.tsx   # Personalizar durações

app/hooks/
├── useSessoes.ts           # CRUD sessões
├── useTimer.ts             # Lógica do timer
└── useNotificacoes.ts      # Web notifications

pages/api/sessoes/
├── index.ts                # GET/POST sessões
├── [id].ts                 # PUT/DELETE sessão específica
└── ativas.ts               # Sessões em andamento
```

#### Schema Supabase
```sql
CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hiperfoco_id UUID REFERENCES hiperfocos(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('foco', 'pausa_curta', 'pausa_longa')),
  duracao_planejada INTEGER NOT NULL, -- em minutos
  duracao_real INTEGER, -- em minutos (quando concluída)
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida', 'cancelada')),
  iniciada_em TIMESTAMPTZ DEFAULT NOW(),
  pausada_em TIMESTAMPTZ,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_sessoes_user_id ON sessoes(user_id);
CREATE INDEX idx_sessoes_hiperfoco_id ON sessoes(hiperfoco_id);
CREATE INDEX idx_sessoes_status ON sessoes(status);
CREATE INDEX idx_sessoes_created_at ON sessoes(created_at);
```

#### Estimativa de Esforço
- **APIs**: 4 horas
- **Hooks**: 3 horas  
- **Componentes**: 6 horas
- **Testes**: 3 horas
- **Total**: 16 horas (2 dias)

### 1.2 Autenticação Real
**Prazo**: 1 semana  
**Complexidade**: Média  
**Impacto**: Crítico

#### Funcionalidades
- 🔐 **Login/Registro**: Supabase Auth
- 👤 **Perfil**: Gestão de conta
- 🛡️ **RLS**: Row Level Security
- 🚪 **Rotas Protegidas**: Middleware de auth

#### Implementação
```typescript
// app/hooks/useAuth.ts
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

export const useAuth = () => {
  const user = useUser()
  const supabase = useSupabaseClient()
  
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }
  
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
  
  return {
    user,
    userId: user?.id,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }
}
```

#### RLS Policies
```sql
-- Hiperfocos
ALTER TABLE hiperfocos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hiperfocos" ON hiperfocos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hiperfocos" ON hiperfocos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hiperfocos" ON hiperfocos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hiperfocos" ON hiperfocos
  FOR DELETE USING (auth.uid() = user_id);

-- Aplicar para todas as tabelas (tarefas, sessoes, etc.)
```

## 2. 📊 MÉDIA PRIORIDADE

### 2.1 Módulo Estatísticas
**Prazo**: 2 semanas  
**Complexidade**: Alta  
**Impacto**: Médio

#### Funcionalidades
- 📈 **Gráficos**: Tempo por hiperfoco, produtividade
- 📊 **Métricas**: Sessões concluídas, tempo total
- 📅 **Períodos**: Dia, semana, mês, ano
- 📤 **Exportação**: CSV, PDF

#### Componentes Principais
```
app/components/estatisticas/
├── DashboardEstatisticas.tsx    # Visão geral
├── GraficoTempo.tsx            # Gráfico de tempo por período
├── GraficoHiperfocos.tsx       # Distribuição por hiperfoco
├── MetricasResumo.tsx          # Cards com métricas
├── RelatorioDetalhado.tsx      # Relatório completo
└── ExportarDados.tsx           # Botões de exportação
```

### 2.2 PWA Avançado
**Prazo**: 1-2 semanas  
**Complexidade**: Média  
**Impacto**: Médio

#### Funcionalidades
- 📱 **Instalação**: Add to Home Screen
- 🔄 **Sync Offline**: Background sync
- 🔔 **Push Notifications**: Lembretes
- 💾 **Cache Inteligente**: Estratégias de cache

## 3. 🔮 BAIXA PRIORIDADE (Futuro)

### 3.1 Colaboração
- 👥 **Equipes**: Hiperfocos compartilhados
- 💬 **Comentários**: Feedback em tarefas
- 📊 **Relatórios de Equipe**: Métricas coletivas

### 3.2 Integrações
- 📅 **Calendário**: Google Calendar, Outlook
- 📝 **Notas**: Notion, Obsidian
- ⏰ **Lembretes**: Integração com apps nativos

### 3.3 IA e Machine Learning
- 🤖 **Sugestões**: Hiperfocos baseados em padrões
- 📈 **Predições**: Tempo estimado para tarefas
- 🎯 **Otimização**: Horários ideais para foco

## 📅 Cronograma Detalhado

### Semana 1-2: Sessões de Alternância
- **Dias 1-2**: APIs e schema do banco
- **Dias 3-4**: Hooks React Query
- **Dias 5-7**: Componentes React
- **Dias 8-10**: Testes e refinamentos

### Semana 3: Autenticação Real
- **Dias 1-2**: Configuração Supabase Auth
- **Dias 3-4**: RLS e políticas de segurança
- **Dias 5-7**: Componentes de auth e middleware

### Semana 4-5: Estatísticas
- **Dias 1-3**: APIs de agregação
- **Dias 4-7**: Componentes e gráficos
- **Dias 8-10**: Exportação e relatórios

### Semana 6-7: PWA Avançado
- **Dias 1-3**: Service Worker e cache
- **Dias 4-5**: Push notifications
- **Dias 6-7**: Testes e otimizações

## 🎯 Métricas de Sucesso por Módulo

### Sessões
- ✅ Timer funciona sem travamentos
- ✅ Notificações chegam no tempo correto
- ✅ Histórico persiste corretamente
- ✅ Performance < 100ms para operações

### Autenticação
- ✅ Login/logout funcionam perfeitamente
- ✅ RLS protege dados adequadamente
- ✅ Rotas protegidas redirecionam corretamente
- ✅ Sem vazamentos de dados entre usuários

### Estatísticas
- ✅ Gráficos carregam < 2 segundos
- ✅ Dados agregados estão corretos
- ✅ Exportação funciona para grandes volumes
- ✅ Interface responsiva em todos os dispositivos

### PWA
- ✅ Funciona offline para operações básicas
- ✅ Sincronização automática quando online
- ✅ Notificações chegam mesmo com app fechado
- ✅ Instalação funciona em todos os browsers

## 🚨 Riscos e Mitigações

### Riscos Técnicos
1. **Performance com grandes volumes de dados**
   - Mitigação: Paginação, lazy loading, índices otimizados

2. **Complexidade do timer em background**
   - Mitigação: Web Workers, testes extensivos

3. **Sincronização offline complexa**
   - Mitigação: Implementação incremental, fallbacks

### Riscos de Prazo
1. **Subestimativa de complexidade**
   - Mitigação: Buffer de 20% em cada estimativa

2. **Dependências entre módulos**
   - Mitigação: Desenvolvimento paralelo quando possível

## 🔧 Ferramentas e Recursos

### Desenvolvimento
- **React Query DevTools**: Debug de cache
- **Supabase Dashboard**: Monitoramento de banco
- **Lighthouse**: Performance e PWA
- **React DevTools**: Debug de componentes

### Testes
- **Jest**: Testes unitários
- **React Testing Library**: Testes de componentes
- **Playwright**: Testes E2E
- **Supabase CLI**: Testes de banco local

### Monitoramento
- **Vercel Analytics**: Performance em produção
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Supabase Metrics**: Métricas de banco

## 📚 Documentação Necessária

### Por Módulo
- [ ] README específico
- [ ] API documentation
- [ ] Guia de uso para usuários
- [ ] Troubleshooting guide

### Geral
- [ ] Guia de deployment
- [ ] Guia de contribuição
- [ ] Arquitetura atualizada
- [ ] Roadmap público

---

**Última atualização**: Junho 2025  
**Próxima revisão**: Após conclusão do módulo Sessões  
**Responsável**: Equipe de desenvolvimento  
**Status**: Planejamento aprovado
