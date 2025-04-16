# Integração Prisma + Supabase no StayFocus

Este documento descreve a integração do Prisma ORM com o Supabase (PostgreSQL) no projeto StayFocus.

## Visão Geral

O StayFocus é uma aplicação voltada para suporte a usuários neurodivergentes (TDAH), oferecendo ferramentas para gerenciamento de alimentação, sono, estudos, hiperfocos e outras áreas. A migração para o Supabase visa melhorar a persistência de dados, permitir sincronização entre dispositivos e preparar a base para futuras integrações com LLMs.

### Stack Tecnológica

- **Frontend**: React + Next.js
- **Gerenciamento de Estado**: Zustand
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth (planejado)

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                     │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Aplicação Next.js                       │
│                                                             │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │  Componentes    │      │      Contexto React          │  │
│  │     React       │◄────►│    (DbContext Provider)      │  │
│  └────────┬────────┘      └─────────────┬────────────────┘  │
│           │                             │                    │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │  Stores Zustand │      │     Serviços de Domínio      │  │
│  │ (Estado Local)  │◄────►│  (usuarioService, etc.)      │  │
│  └─────────────────┘      └─────────────┬────────────────┘  │
│                                         │                    │
│                                         │                    │
│                                         ▼                    │
│                           ┌──────────────────────────────┐  │
│                           │      Cliente Prisma          │  │
│                           └─────────────┬────────────────┘  │
└─────────────────────────────────────────┼─────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         Supabase                            │
│                                                             │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │  Autenticação   │      │      PostgreSQL              │  │
│  │    (Auth)       │      │      (Database)              │  │
│  └─────────────────┘      └──────────────────────────────┘  │
│                                                             │
│  ┌─────────────────┐      ┌──────────────────────────────┐  │
│  │  Armazenamento  │      │      Funções Edge            │  │
│  │    (Storage)    │      │      (Functions)             │  │
│  └─────────────────┘      └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Componente React** solicita dados ou realiza operações
2. **Contexto React (DbContext)** fornece acesso aos serviços
3. **Serviços de Domínio** implementam a lógica de negócio
4. **Cliente Prisma** traduz operações para consultas SQL
5. **Supabase/PostgreSQL** armazena e recupera os dados

Durante a fase de migração, os dados também são sincronizados com as **Stores Zustand** para manter compatibilidade com componentes existentes.

## Configuração

### 1. Instalação

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Configuração do Banco de Dados

Edite o arquivo `.env` com suas credenciais do Supabase:

```
# Connect to Supabase via connection pooling.
DATABASE_URL="postgresql://postgres.iclkolaiqyyoeslcxvbk:efOtqys1OQPzkvwm@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations.
DIRECT_URL="postgresql://postgres.iclkolaiqyyoeslcxvbk:efOtqys1OQPzkvwm@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

Também é útil armazenar outras informações do projeto Supabase:

```
SUPABASE_PROJECT_REF=iclkolaiqyyoeslcxvbk
SUPABASE_REGION=sa-east-1
```

### 3. Schema do Prisma

O schema do Prisma (`prisma/schema.prisma`) define os modelos de dados baseados nas stores Zustand existentes:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/lib/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Note que estamos usando `directUrl` para conexões diretas (migrações) e `url` para conexões via pooling (queries).

Os modelos principais são:

- **Usuario**: Perfil do usuário com preferências e metas
- **Refeicao/RegistroRefeicao/RegistroHidratacao**: Dados de alimentação
- **RegistroSono/LembreteSono**: Dados de sono
- **Receita/Ingrediente/PassoReceita/ReceitaFavorita**: Dados de receitas

#### Diagrama de Relacionamentos

```
┌───────────────┐
│    Usuario    │
└───────┬───────┘
        │
        │    ┌────────────────┐    ┌─────────────────┐    ┌────────────────┐
        ├───►│    Refeicao    │    │RegistroRefeicao │    │RegistroHidratacao│
        │    └────────────────┘    └─────────────────┘    └────────────────┘
        │
        │    ┌────────────────┐    ┌─────────────────┐
        ├───►│  RegistroSono  │    │  LembreteSono   │
        │    └────────────────┘    └─────────────────┘
        │
        │    ┌────────────────┐
        └───►│    Receita     │◄─────┐
             └───────┬────────┘      │
                     │               │
        ┌────────────┴─────────┐     │
        │                      │     │
┌───────▼────────┐    ┌────────▼─────┐    ┌────────────────┐
│   Ingrediente  │    │  PassoReceita │    │ReceitaFavorita │
└────────────────┘    └──────────────┘    └────────────────┘
```

### 4. Geração do Cliente Prisma

Após definir o schema, gere o cliente Prisma:

```bash
npx prisma generate
```

### 5. Sincronização com o Banco de Dados

Para criar as tabelas no Supabase:

```bash
npx prisma db push
```

## Estrutura de Serviços

Os serviços estão organizados em:

### Cliente Prisma (`app/lib/prisma.ts`)

Singleton do cliente Prisma para uso em toda a aplicação. Implementado como um singleton para evitar múltiplas instâncias do Prisma Client em desenvolvimento.

```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
```

### Serviços de Domínio

Os serviços de domínio encapsulam a lógica de negócio e as operações de banco de dados para cada área funcional da aplicação:

#### usuarioService (`app/lib/services/usuarioService.ts`)

Gerencia perfis de usuários, incluindo:
- Criação e atualização de perfis
- Gerenciamento de preferências visuais
- Configuração de metas diárias
- Controle de notificações e pausas

```typescript
export const usuarioService = {
  async criar(data: UsuarioCreateInput) { /* ... */ },
  async buscarPorId(id: string) { /* ... */ },
  async buscarPorEmail(email: string) { /* ... */ },
  async atualizar(id: string, data: UsuarioUpdateInput) { /* ... */ },
  async atualizarPreferenciasVisuais(id: string, preferencias) { /* ... */ },
  async atualizarMetasDiarias(id: string, metas) { /* ... */ },
  async alternarNotificacoes(id: string) { /* ... */ },
  async alternarPausas(id: string) { /* ... */ }
}
```

#### alimentacaoService (`app/lib/services/alimentacaoService.ts`)

Gerencia refeições e hidratação, incluindo:
- Planejamento de refeições
- Registro de refeições realizadas
- Controle de hidratação

```typescript
export const alimentacaoService = {
  refeicoes: {
    async criar(data: RefeicaoCreateInput) { /* ... */ },
    async listarPorUsuario(usuarioId: string) { /* ... */ },
    async atualizar(id: string, data: RefeicaoUpdateInput) { /* ... */ },
    async remover(id: string) { /* ... */ }
  },
  registros: {
    async criar(data: RegistroRefeicaoCreateInput) { /* ... */ },
    async listarPorUsuario(usuarioId: string) { /* ... */ },
    async listarPorData(usuarioId: string, data: Date) { /* ... */ },
    async remover(id: string) { /* ... */ }
  },
  hidratacao: {
    async registrarCopo(usuarioId: string, quantidade: number = 1) { /* ... */ },
    async listarPorData(usuarioId: string, data: Date) { /* ... */ },
    async calcularTotalDia(usuarioId: string, data: Date) { /* ... */ }
  }
}
```

#### sonoService (`app/lib/services/sonoService.ts`)

Gerencia registros de sono e lembretes, incluindo:
- Registro de períodos de sono
- Avaliação da qualidade do sono
- Configuração de lembretes

```typescript
export const sonoService = {
  registros: {
    async criar(data: RegistroSonoCreateInput) { /* ... */ },
    async listarPorUsuario(usuarioId: string) { /* ... */ },
    async listarPorPeriodo(usuarioId: string, dataInicio: Date, dataFim: Date) { /* ... */ },
    async atualizar(id: string, data: RegistroSonoUpdateInput) { /* ... */ },
    async finalizar(id: string, fim: Date, qualidade?: number, notas?: string) { /* ... */ },
    async remover(id: string) { /* ... */ },
    async calcularMediaDuracao(usuarioId: string, dataInicio: Date, dataFim: Date) { /* ... */ }
  },
  lembretes: {
    async criar(data: LembreteSonoCreateInput) { /* ... */ },
    async listarPorUsuario(usuarioId: string) { /* ... */ },
    async atualizar(id: string, data: LembreteSonoUpdateInput) { /* ... */ },
    async alternarAtivo(id: string) { /* ... */ },
    async remover(id: string) { /* ... */ }
  }
}
```

#### receitasService (`app/lib/services/receitasService.ts`)

Gerencia receitas e favoritos, incluindo:
- Criação e atualização de receitas
- Gerenciamento de ingredientes e passos
- Marcação de favoritos

```typescript
export const receitasService = {
  async criar(data: ReceitaCreateInput) { /* ... */ },
  async listarPorUsuario(usuarioId: string) { /* ... */ },
  async buscarPorId(id: string) { /* ... */ },
  async buscarPorCategoria(usuarioId: string, categoria: string) { /* ... */ },
  async buscarPorTag(usuarioId: string, tag: string) { /* ... */ },
  async atualizar(id: string, data: ReceitaUpdateInput) { /* ... */ },
  async atualizarIngredientes(receitaId: string, ingredientes: IngredienteInput[]) { /* ... */ },
  async atualizarPassos(receitaId: string, passos: PassoReceitaInput[]) { /* ... */ },
  async remover(id: string) { /* ... */ },
  favoritos: {
    async adicionar(usuarioId: string, receitaId: string) { /* ... */ },
    async remover(usuarioId: string, receitaId: string) { /* ... */ },
    async verificar(usuarioId: string, receitaId: string) { /* ... */ },
    async listar(usuarioId: string) { /* ... */ },
    async alternar(usuarioId: string, receitaId: string) { /* ... */ }
  }
}
```

### Contexto de Banco de Dados (`app/lib/db-context.tsx`)

Provedor React que disponibiliza os serviços para os componentes. Implementado como um contexto React para facilitar o acesso aos serviços em qualquer componente da aplicação.

```typescript
'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { usuarioService } from './services/usuarioService'
import { alimentacaoService } from './services/alimentacaoService'
import { sonoService } from './services/sonoService'
import { receitasService } from './services/receitasService'

// Tipo para o contexto do banco de dados
type DbContextType = {
  usuario: typeof usuarioService
  alimentacao: typeof alimentacaoService
  sono: typeof sonoService
  receitas: typeof receitasService
}

// Criação do contexto
const DbContext = createContext<DbContextType | null>(null)

// Hook para usar o contexto
export const useDb = () => {
  const context = useContext(DbContext)
  if (!context) {
    throw new Error('useDb deve ser usado dentro de um DbProvider')
  }
  return context
}

// Provedor do contexto
export const DbProvider = ({ children }: { children: ReactNode }) => {
  const value: DbContextType = {
    usuario: usuarioService,
    alimentacao: alimentacaoService,
    sono: sonoService,
    receitas: receitasService
  }

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}
```

## Uso nos Componentes

### Exemplo: Componente de Registro de Sono

```tsx
'use client'

import { useDb } from '../../lib/db-context'

export function MeuComponente() {
  const { sono } = useDb()
  
  // Exemplo de uso
  const handleSalvar = async () => {
    await sono.registros.criar({
      inicio: new Date(),
      usuarioId: 'id-do-usuario'
    })
  }
  
  // ...
}
```

## Migração das Stores Zustand

A migração do armazenamento local (Zustand + localStorage) para o banco de dados Supabase é um processo crucial. A estratégia adotada visa minimizar a interrupção para o usuário e permitir uma transição gradual.

### Estratégia de Migração

1.  **Manter Stores Zustand**: As stores Zustand são mantidas inicialmente para garantir a compatibilidade com os componentes existentes que dependem delas.
2.  **Introduzir Camada de Serviços**: A camada de serviços (`app/lib/services`) se torna a principal interface para interagir com os dados, seja localmente (Zustand) ou remotamente (Supabase).
3.  **Sincronização Bidirecional**: Implementar mecanismos para sincronizar dados entre as stores Zustand e o banco de dados Supabase. Isso pode ser feito:
    *   **Ao carregar a aplicação**: Buscar dados do Supabase e hidratar as stores Zustand.
    *   **Após operações locais**: Enviar alterações feitas nas stores Zustand para o Supabase.
    *   **Usando Supabase Realtime**: Ouvir alterações no banco de dados e atualizar as stores Zustand em tempo real (opcional, para funcionalidades específicas).
4.  **Migração Gradual de Componentes**: Adaptar os componentes um por um (ou módulo por módulo) para usar a camada de serviços em vez de interagir diretamente com as stores Zustand.
5.  **Utilitário de Migração Inicial**: Fornecer um utilitário (`app/lib/migracao/migrarDadosParaDb.ts` e `app/components/perfil/MigracaoDados.tsx`) para que os usuários possam migrar seus dados locais existentes para o banco de dados pela primeira vez.

### Utilitário de Migração (`app/lib/migracao/migrarDadosParaDb.ts`)

Este script contém funções para ler dados das stores Zustand e gravá-los no banco de dados Supabase usando os serviços Prisma.

-   **`migrarPerfil(usuarioId, email)`**: Migra dados do `usePerfilStore`.
-   **`migrarRegistrosSono(usuarioId)`**: Migra dados do `useSonoStore`.
-   **`migrarDadosAlimentacao(usuarioId)`**: Migra dados do `useAlimentacaoStore`.
-   **`migrarReceitas(usuarioId)`**: Migra dados do `useReceitasStore`.
-   **`migrarTodosDados(usuarioId, email)`**: Orquestra a migração de todos os dados.

**Importante**: O script de migração inclui verificações para evitar a duplicação de dados, inserindo apenas registros que ainda não existem no banco de dados.

### Componente de Migração (`app/components/perfil/MigracaoDados.tsx`)

Este componente fornece uma interface para o usuário iniciar o processo de migração inicial. Ele solicita o email do usuário (para identificação, futuramente substituído pela autenticação) e chama a função `migrarTodosDados`.

### Desafios da Migração

-   **Conflitos de Sincronização**: Lidar com situações onde os dados locais e remotos foram modificados independentemente. Estratégias como "última escrita vence" ou resolução manual podem ser necessárias.
-   **Desempenho**: A sincronização inicial ou operações em massa podem impactar o desempenho. Otimizar queries e usar operações em lote (`createMany`, `updateMany`) é importante.
-   **Experiência do Usuário**: A migração deve ser o mais transparente possível. Informar o usuário sobre o processo e fornecer feedback claro é essencial.
-   **Integridade dos Dados**: Garantir que nenhum dado seja perdido ou corrompido durante a migração. Implementar validações e tratamento de erros robusto.

## Autenticação

Para integrar com a autenticação do Supabase:

1. Configure o Auth do Supabase
2. Use o ID do usuário autenticado como `usuarioId` nos serviços
3. Implemente middleware para garantir acesso apenas aos dados do próprio usuário

## Considerações de Desempenho

- Use `include` do Prisma para carregar relações apenas quando necessário
- Implemente paginação para listas grandes
- Considere usar Prisma Accelerate para melhorar o desempenho em produção

## Próximos Passos

1. Implementar autenticação com Supabase Auth
2. Migrar dados existentes do localStorage para o banco de dados
3. Implementar sincronização offline
4. Adicionar validação de dados nos serviços
5. Implementar testes automatizados para os serviços