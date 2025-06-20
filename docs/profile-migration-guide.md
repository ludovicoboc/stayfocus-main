# 🔄 Guia de Migração - Sistema de Perfil

## 📋 Visão Geral

Este guia orienta a migração do sistema de perfil baseado apenas em localStorage para um sistema híbrido com Supabase + localStorage, mantendo compatibilidade e garantindo zero downtime.

## 🎯 Objetivos da Migração

- ✅ Persistência de dados na nuvem
- ✅ Sincronização entre dispositivos
- ✅ Backup automático de dados
- ✅ Isolamento seguro entre usuários
- ✅ Compatibilidade com sistema existente

## 📊 Estado Atual vs. Novo Sistema

### Antes (localStorage apenas)
```typescript
// perfilStore.ts
const usePerfilStore = create<PerfilState>((set) => ({
  nome: 'Usuário',
  preferenciasVisuais: { ... },
  metasDiarias: { ... },
  // Dados apenas locais
}))
```

### Depois (Híbrido Supabase + localStorage)
```typescript
// useProfile.ts
const useProfile = () => {
  // Dados sincronizados entre Supabase e localStorage
  const { profile, createProfile, updateProfile } = useProfileHook()
  // Fallback para localStorage quando offline
}
```

## 🚀 Plano de Migração

### Fase 1: Preparação (✅ Concluída)
- [x] Criar tabela `user_profiles` no Supabase
- [x] Implementar políticas RLS
- [x] Criar hook `useProfile`
- [x] Implementar APIs no `SupabaseProvider`
- [x] Criar testes abrangentes

### Fase 2: Implementação Paralela (✅ Concluída)
- [x] Manter `perfilStore` funcionando
- [x] Implementar `ProfileForm` com novo sistema
- [x] Sincronização bidirecional
- [x] Validações robustas

### Fase 3: Migração Gradual (🔄 Em Progresso)
- [ ] Migrar componentes existentes
- [ ] Migrar dados de usuários existentes
- [ ] Testes em produção
- [ ] Monitoramento de performance

### Fase 4: Finalização (📋 Planejada)
- [ ] Remover código legado
- [ ] Otimizar performance
- [ ] Documentação final
- [ ] Treinamento da equipe

## 🔧 Implementação Técnica

### 1. Configuração do Banco de Dados

```sql
-- Criar tabela user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can manage own profile" ON user_profiles
  USING (auth.uid() = user_id);
```

### 2. Migração de Dados Existentes

```typescript
// scripts/migrate-profiles.ts
export async function migrateExistingProfiles() {
  const users = await getAuthenticatedUsers()
  
  for (const user of users) {
    // Buscar dados do localStorage (se disponível)
    const localData = getLocalStorageProfile(user.id)
    
    if (localData && !await hasSupabaseProfile(user.id)) {
      // Migrar para Supabase
      await createSupabaseProfile(user.id, localData)
      console.log(`Migrado perfil do usuário ${user.id}`)
    }
  }
}
```

### 3. Compatibilidade com Sistema Existente

```typescript
// hooks/useProfileCompat.ts
export function useProfileCompat() {
  const newProfile = useProfile()
  const oldProfile = usePerfilStore()
  
  // Retornar dados do novo sistema se disponível,
  // senão usar sistema antigo
  return {
    profile: newProfile.profile || mapOldToNewProfile(oldProfile),
    updateProfile: newProfile.profile 
      ? newProfile.updateProfile 
      : updateOldProfile,
    // ... outras operações
  }
}
```

## 📋 Checklist de Migração

### Pré-Migração
- [ ] Backup completo do banco de dados
- [ ] Backup dos dados localStorage dos usuários
- [ ] Testes de carga no ambiente de staging
- [ ] Plano de rollback definido

### Durante a Migração
- [ ] Monitorar logs de erro
- [ ] Verificar performance das queries
- [ ] Acompanhar métricas de usuário
- [ ] Comunicar status para usuários

### Pós-Migração
- [ ] Validar integridade dos dados
- [ ] Verificar funcionalidades críticas
- [ ] Coletar feedback dos usuários
- [ ] Otimizar queries baseado no uso real

## 🛡️ Estratégias de Segurança

### 1. Validação de Dados
```typescript
// Validar dados antes da migração
const validateProfileData = (data: any): boolean => {
  return (
    data.name && 
    data.name.length >= 2 &&
    data.timezone &&
    isValidTimezone(data.timezone) &&
    validatePreferences(data.preferences)
  )
}
```

### 2. Sanitização
```typescript
// Limpar dados potencialmente perigosos
const sanitizeProfileData = (data: any) => {
  return {
    name: sanitizeString(data.name),
    timezone: sanitizeTimezone(data.timezone),
    preferences: sanitizePreferences(data.preferences)
  }
}
```

### 3. Rate Limiting
```typescript
// Limitar operações por usuário
const rateLimiter = new Map()

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now()
  const userRequests = rateLimiter.get(userId) || []
  
  // Máximo 10 operações por minuto
  const recentRequests = userRequests.filter(
    time => now - time < 60000
  )
  
  if (recentRequests.length >= 10) {
    return false
  }
  
  rateLimiter.set(userId, [...recentRequests, now])
  return true
}
```

## 📊 Monitoramento e Métricas

### Métricas Importantes
```typescript
// Métricas de migração
interface MigrationMetrics {
  totalUsers: number
  migratedUsers: number
  failedMigrations: number
  averageMigrationTime: number
  dataIntegrityIssues: number
}

// Métricas de performance
interface PerformanceMetrics {
  profileLoadTime: number
  profileUpdateTime: number
  syncSuccessRate: number
  errorRate: number
  cacheHitRate: number
}
```

### Dashboard de Monitoramento
```typescript
// Exemplo de tracking
const trackMigrationEvent = (event: string, data: any) => {
  analytics.track('profile_migration', {
    event,
    data,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}
```

## 🚨 Plano de Rollback

### Cenários de Rollback
1. **Taxa de erro > 5%**: Rollback automático
2. **Performance degradada > 50%**: Rollback manual
3. **Perda de dados detectada**: Rollback imediato

### Procedimento de Rollback
```bash
# 1. Parar deploy
kubectl rollout undo deployment/stayfocus-app

# 2. Restaurar banco de dados
pg_restore --clean --if-exists -d stayfocus backup_pre_migration.sql

# 3. Verificar integridade
npm run test:integration

# 4. Comunicar usuários
npm run notify:rollback
```

## 🔍 Testes de Validação

### Testes Automatizados
```typescript
// Teste de integridade de dados
describe('Migration Data Integrity', () => {
  it('should preserve all user data', async () => {
    const originalData = await getOriginalProfileData()
    const migratedData = await getMigratedProfileData()
    
    expect(migratedData).toMatchObject(originalData)
  })
  
  it('should maintain data relationships', async () => {
    const profiles = await getAllProfiles()
    
    for (const profile of profiles) {
      expect(profile.user_id).toBeDefined()
      expect(await userExists(profile.user_id)).toBe(true)
    }
  })
})
```

### Testes Manuais
- [ ] Login e visualização de perfil
- [ ] Edição de informações básicas
- [ ] Atualização de preferências
- [ ] Sincronização entre dispositivos
- [ ] Comportamento offline

## 📞 Suporte e Comunicação

### Comunicação com Usuários
```typescript
// Notificação de migração
const notifyUsers = async () => {
  const message = {
    title: "Melhorias no Sistema de Perfil",
    body: "Estamos migrando seus dados para melhor sincronização entre dispositivos.",
    type: "info",
    duration: "2024-01-15 a 2024-01-16"
  }
  
  await sendNotificationToAllUsers(message)
}
```

### FAQ para Usuários
**P: Meus dados serão perdidos?**
R: Não, todos os dados são preservados e teremos backup completo.

**P: Preciso fazer algo?**
R: Não, a migração é automática e transparente.

**P: E se algo der errado?**
R: Temos plano de rollback e suporte 24/7 durante a migração.

## 🎯 Critérios de Sucesso

### Métricas de Sucesso
- ✅ 100% dos dados migrados sem perda
- ✅ Performance igual ou melhor que antes
- ✅ Taxa de erro < 1%
- ✅ Satisfação do usuário > 95%
- ✅ Zero downtime durante migração

### Validação Final
- [ ] Todos os testes automatizados passando
- [ ] Validação manual em produção
- [ ] Feedback positivo dos usuários
- [ ] Métricas de performance estáveis
- [ ] Documentação atualizada

## 📚 Recursos Adicionais

- [Documentação do Sistema de Perfil](./profile-system.md)
- [Guia de Testes](./testing-guide.md)
- [Troubleshooting](./troubleshooting.md)
- [API Reference](./api-reference.md)
