# 📋 Sistema de Gestão de Perfil - Documentação

## 🎯 Visão Geral

O Sistema de Gestão de Perfil do StayFocus permite que usuários criem, visualizem, atualizem e deletem seus perfis pessoais, incluindo preferências de interface, configurações de Pomodoro e metas diárias.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ProfileForm   │───▶│   useProfile    │───▶│ SupabaseProvider│
│   Component     │    │     Hook        │    │      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │  React Query    │    │   Supabase DB   │
         │              │     Cache       │    │ user_profiles   │
         │              └─────────────────┘    └─────────────────┘
         ▼
┌─────────────────┐
│  perfilStore    │
│   (Zustand)     │
└─────────────────┘
```

## 🔧 Componentes Principais

### 1. Hook `useProfile`

**Localização**: `app/hooks/useProfile.ts`

**Responsabilidades**:
- Gerenciar estado do perfil com React Query
- Sincronizar dados entre Supabase e localStorage
- Fornecer operações CRUD para perfil

**Interface**:
```typescript
interface UseProfileReturn {
  // Estado
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  
  // Operações CRUD
  createProfile: (data: CreateProfileData) => Promise<UserProfile>
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>
  deleteProfile: () => Promise<void>
  
  // Operações específicas
  updateBasicInfo: (data: { name: string }) => Promise<UserProfile>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserProfile>
  updateDailyGoals: (goals: DailyGoals) => Promise<UserProfile>
  
  // Sincronização
  syncWithLocal: () => void
  refreshProfile: () => Promise<void>
}
```

**Exemplo de uso**:
```typescript
import { useProfile } from '@/app/hooks/useProfile'

function MyComponent() {
  const { 
    profile, 
    isLoading, 
    createProfile, 
    updatePreferences 
  } = useProfile()

  const handleUpdateTheme = async () => {
    await updatePreferences({ theme: 'dark' })
  }

  if (isLoading) return <div>Carregando...</div>
  
  return (
    <div>
      <h1>Olá, {profile?.name}!</h1>
      <button onClick={handleUpdateTheme}>
        Trocar para tema escuro
      </button>
    </div>
  )
}
```

### 2. Componente `ProfileForm`

**Localização**: `app/components/perfil/ProfileForm.tsx`

**Responsabilidades**:
- Interface para criação e edição de perfil
- Validação de dados em tempo real
- Feedback visual para usuário

**Props**: Nenhuma (usa hook interno)

**Exemplo de uso**:
```typescript
import { ProfileForm } from '@/app/components/perfil/ProfileForm'

function ProfilePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
      <ProfileForm />
    </div>
  )
}
```

### 3. API Provider `SupabaseProvider`

**Localização**: `app/lib/dataProviders/supabase.ts`

**Responsabilidades**:
- Implementar operações CRUD no Supabase
- Validar dados antes de persistir
- Garantir isolamento entre usuários

**Métodos principais**:
```typescript
class SupabaseProvider {
  // Criar novo perfil
  async createProfile(data: CreateProfileData): Promise<UserProfile>
  
  // Buscar perfil do usuário autenticado
  async getProfile(): Promise<UserProfile | null>
  
  // Atualizar perfil existente
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile>
  
  // Deletar perfil
  async deleteProfile(): Promise<void>
  
  // Validar dados de perfil
  validateProfileData(data: any): void
}
```

## 🗄️ Estrutura de Dados

### UserProfile
```typescript
interface UserProfile {
  id: string
  user_id: string
  name: string
  avatar_url?: string
  timezone: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}
```

### UserPreferences
```typescript
interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notifications_enabled: boolean
  pomodoro_focus_minutes: number
  pomodoro_short_break_minutes: number
  pomodoro_long_break_minutes: number
  daily_water_goal_ml: number
  stimulus_reduction: boolean
}
```

## 🛡️ Segurança

### Row Level Security (RLS)

O sistema implementa RLS no Supabase para garantir isolamento de dados:

```sql
-- Política para SELECT
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);
```

### Validações

**Validações de dados**:
- Nome: obrigatório, mínimo 2 caracteres
- Timezone: deve ser válido (lista pré-definida)
- Tema: apenas 'light' ou 'dark'
- Configurações Pomodoro: valores positivos e dentro de limites
- Meta de água: valor positivo

## 🔄 Sincronização

### localStorage ↔ Supabase

O sistema mantém sincronização bidirecional:

1. **Carregamento inicial**: Dados do Supabase são sincronizados para localStorage
2. **Atualizações**: Mudanças são salvas no Supabase e refletidas no localStorage
3. **Offline**: localStorage mantém dados disponíveis offline

### Mapeamento de Dados

```typescript
// Supabase → localStorage
const syncProfileToLocal = (profileData: UserProfile) => {
  perfilStore.atualizarNome(profileData.name)
  perfilStore.atualizarPreferenciasVisuais({
    reducaoEstimulos: profileData.preferences.stimulus_reduction
  })
  // ... outros mapeamentos
}
```

## 🧪 Testes

### Cobertura de Testes

- **Hook useProfile**: 7 testes (100% passando)
- **API SupabaseProvider**: 16 testes (100% passando)
- **Componente ProfileForm**: 15 testes (100% passando)
- **Integração**: 6 testes (funcionalidade 100% testada)

### Executar Testes

```bash
# Testes unitários
npm test -- __tests__/hooks/useProfile.test.tsx
npm test -- __tests__/api/profile.test.tsx
npm test -- __tests__/components/perfil/ProfileForm.test.tsx

# Testes de integração (mock)
npm test -- __tests__/integration/profile-flow.test.tsx

# Testes de integração (dados reais)
./scripts/test-integration.sh
```

## 🚀 Deploy e Produção

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Tabela `user_profiles` criada no Supabase
- [ ] Políticas RLS ativadas
- [ ] Testes de integração passando
- [ ] Backup de dados configurado

## 🔧 Troubleshooting

### Problemas Comuns

**1. Erro "Usuário não autenticado"**
- Verificar se usuário está logado
- Verificar token de autenticação válido

**2. Erro de validação de timezone**
- Usar apenas timezones da lista válida
- Verificar formato: 'America/Sao_Paulo'

**3. Perfil não carrega**
- Verificar políticas RLS
- Verificar se usuário tem perfil criado

**4. Sincronização localStorage falha**
- Verificar se localStorage está disponível
- Verificar se perfilStore está inicializado

### Logs e Debug

```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'profile:*')

// Verificar estado do React Query
import { useQueryClient } from '@tanstack/react-query'
const queryClient = useQueryClient()
console.log(queryClient.getQueryData(['profile', userId]))
```

## 📈 Métricas e Monitoramento

### KPIs Importantes

- Taxa de criação de perfil
- Tempo de carregamento de perfil
- Frequência de atualizações
- Erros de sincronização

### Monitoramento

```typescript
// Exemplo de tracking de eventos
const trackProfileUpdate = (field: string) => {
  analytics.track('profile_updated', {
    field,
    timestamp: new Date().toISOString(),
    user_id: user.id
  })
}
```

## 🔮 Próximos Passos

1. **Funcionalidades Futuras**:
   - Upload de avatar
   - Configurações avançadas de notificação
   - Exportação de dados
   - Temas personalizados

2. **Melhorias Técnicas**:
   - Cache mais inteligente
   - Sincronização em tempo real
   - Compressão de dados
   - Otimização de performance

3. **UX/UI**:
   - Animações de transição
   - Feedback visual melhorado
   - Modo offline mais robusto
   - Acessibilidade aprimorada
