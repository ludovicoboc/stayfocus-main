# 🚀 Guia de Implementação - Sistema de Hiperfocos

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Implementação Passo a Passo](#implementação-passo-a-passo)
4. [Testes e Validação](#testes-e-validação)
5. [Deploy e Monitoramento](#deploy-e-monitoramento)
6. [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### Tecnologias Necessárias

- **Node.js**: v18.0.0 ou superior
- **npm**: v8.0.0 ou superior
- **TypeScript**: v5.0.0 ou superior
- **React**: v18.0.0 ou superior
- **Next.js**: v14.0.0 ou superior

### Conhecimentos Recomendados

- React Hooks avançados
- TypeScript intermediário
- Padrões de arquitetura limpa
- Testes com Vitest/Testing Library
- Supabase/PostgreSQL básico

### Ferramentas de Desenvolvimento

```bash
# Instalar dependências globais
npm install -g typescript
npm install -g @next/cli
npm install -g vitest

# Extensões VSCode recomendadas
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
```

## ⚙️ Configuração do Ambiente

### 1. Configuração do Projeto

```bash
# Clonar o repositório
git clone <repository-url>
cd stayfocus-main-2

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

### 2. Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Para desenvolvimento
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Para testes
VITEST_ENVIRONMENT=jsdom
```

### 3. Configuração do Supabase

```sql
-- Executar no SQL Editor do Supabase

-- 1. Criar tabelas
CREATE TABLE hiperfocos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tempo_limite INTEGER,
  cor VARCHAR(7) NOT NULL DEFAULT '#FF5252',
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiperfoco_id UUID REFERENCES hiperfocos(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES tarefas(id),
  texto VARCHAR(500) NOT NULL,
  concluida BOOLEAN DEFAULT FALSE,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX idx_hiperfocos_user_id ON hiperfocos(user_id);
CREATE INDEX idx_hiperfocos_status ON hiperfocos(status);
CREATE INDEX idx_tarefas_hiperfoco_id ON tarefas(hiperfoco_id);
CREATE INDEX idx_tarefas_parent_id ON tarefas(parent_id);

-- 3. Habilitar RLS
ALTER TABLE hiperfocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
CREATE POLICY "Users can view own hiperfocos" ON hiperfocos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hiperfocos" ON hiperfocos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hiperfocos" ON hiperfocos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hiperfocos" ON hiperfocos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tarefas
CREATE POLICY "Users can view own tasks" ON tarefas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hiperfocos
      WHERE hiperfocos.id = tarefas.hiperfoco_id
      AND hiperfocos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tasks" ON tarefas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hiperfocos
      WHERE hiperfocos.id = tarefas.hiperfoco_id
      AND hiperfocos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tasks" ON tarefas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM hiperfocos
      WHERE hiperfocos.id = tarefas.hiperfoco_id
      AND hiperfocos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks" ON tarefas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM hiperfocos
      WHERE hiperfocos.id = tarefas.hiperfoco_id
      AND hiperfocos.user_id = auth.uid()
    )
  );
```

### 4. Configuração do TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/lib/*": ["./app/lib/*"],
      "@/hooks/*": ["./app/lib/hooks/*"],
      "@/services/*": ["./app/lib/services/*"],
      "@/utils/*": ["./app/lib/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🏗️ Implementação Passo a Passo

### Fase 1: Estrutura Base (Dia 1)

#### 1.1 Criar Estrutura de Pastas

```bash
mkdir -p app/components/hiperfocos
mkdir -p app/lib/hooks
mkdir -p app/lib/services
mkdir -p app/lib/utils
mkdir -p __tests__/components
mkdir -p __tests__/hooks
mkdir -p __tests__/integration
mkdir -p __tests__/utils
```

#### 1.2 Implementar Tipos Base

```typescript
// app/lib/types/hiperfoco.ts
export interface Hiperfoco {
  id: string
  userId: string
  titulo: string
  descricao?: string
  tempoLimite?: number
  cor: string
  status: 'ativo' | 'pausado' | 'concluido' | 'arquivado'
  tarefas: Tarefa[]
  createdAt: string
  updatedAt: string
}

export interface Tarefa {
  id: string
  hiperfocoId: string
  parentId?: string
  texto: string
  concluida: boolean
  ordem: number
  children: Tarefa[]
  createdAt: string
  updatedAt: string
}

export interface HiperfocoFormData {
  titulo: string
  descricao?: string
  tempoLimite?: number
  cor: string
  tarefas: TarefaFormData[]
}

export interface TarefaFormData {
  texto: string
  parentId?: string
}
```

#### 1.3 Implementar Serviço de Validação

```typescript
// app/lib/services/hiperfocosValidation.ts
import DOMPurify from 'dompurify'

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const hiperfocosValidation = {
  validateTitulo(titulo: string): ValidationError[] {
    const errors: ValidationError[] = []

    if (!titulo?.trim()) {
      errors.push(new ValidationError(
        'Título é obrigatório',
        'titulo',
        'REQUIRED'
      ))
    }

    if (titulo && titulo.length > 255) {
      errors.push(new ValidationError(
        'Título deve ter no máximo 255 caracteres',
        'titulo',
        'MAX_LENGTH'
      ))
    }

    return errors
  },

  validateDescricao(descricao?: string): ValidationError[] {
    const errors: ValidationError[] = []

    if (descricao && descricao.length > 1000) {
      errors.push(new ValidationError(
        'Descrição deve ter no máximo 1000 caracteres',
        'descricao',
        'MAX_LENGTH'
      ))
    }

    return errors
  },

  validateTempoLimite(tempoLimite?: number): ValidationError[] {
    const errors: ValidationError[] = []

    if (tempoLimite !== undefined) {
      if (tempoLimite < 1) {
        errors.push(new ValidationError(
          'Tempo limite deve ser maior que 0',
          'tempoLimite',
          'MIN_VALUE'
        ))
      }

      if (tempoLimite > 1440) { // 24 horas
        errors.push(new ValidationError(
          'Tempo limite deve ser menor que 24 horas',
          'tempoLimite',
          'MAX_VALUE'
        ))
      }
    }

    return errors
  },

  validateCor(cor: string): ValidationError[] {
    const errors: ValidationError[] = []
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

    if (!cor) {
      errors.push(new ValidationError(
        'Cor é obrigatória',
        'cor',
        'REQUIRED'
      ))
    } else if (!hexColorRegex.test(cor)) {
      errors.push(new ValidationError(
        'Cor deve estar no formato hexadecimal (#RRGGBB)',
        'cor',
        'INVALID_FORMAT'
      ))
    }

    return errors
  },

  validateTarefa(tarefa: TarefaFormData): ValidationError[] {
    const errors: ValidationError[] = []

    if (!tarefa.texto?.trim()) {
      errors.push(new ValidationError(
        'Texto da tarefa é obrigatório',
        'texto',
        'REQUIRED'
      ))
    }

    if (tarefa.texto && tarefa.texto.length > 500) {
      errors.push(new ValidationError(
        'Texto da tarefa deve ter no máximo 500 caracteres',
        'texto',
        'MAX_LENGTH'
      ))
    }

    return errors
  },

  validateHiperfoco(data: HiperfocoFormData): ValidationError[] {
    const errors: ValidationError[] = []

    errors.push(...this.validateTitulo(data.titulo))
    errors.push(...this.validateDescricao(data.descricao))
    errors.push(...this.validateTempoLimite(data.tempoLimite))
    errors.push(...this.validateCor(data.cor))

    // Validar tarefas
    data.tarefas.forEach((tarefa, index) => {
      const tarefaErrors = this.validateTarefa(tarefa)
      tarefaErrors.forEach(error => {
        error.field = `tarefas.${index}.${error.field}`
      })
      errors.push(...tarefaErrors)
    })

    return errors
  },

  sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input.trim())
  },

  sanitizeHiperfoco(data: HiperfocoFormData): HiperfocoFormData {
    return {
      titulo: this.sanitizeInput(data.titulo),
      descricao: data.descricao ? this.sanitizeInput(data.descricao) : undefined,
      tempoLimite: data.tempoLimite,
      cor: data.cor,
      tarefas: data.tarefas.map(tarefa => ({
        texto: this.sanitizeInput(tarefa.texto),
        parentId: tarefa.parentId
      }))
    }
  }
}
```

### Fase 2: Hooks Customizados (Dia 2)

#### 2.1 Hook de Hierarquia de Tarefas

```typescript
// app/lib/hooks/useHiperfocosHierarchy.ts
import { useState, useCallback, useMemo } from 'react'
import { Tarefa, TarefaNode } from '../services/tarefasHierarchy'

export function useHiperfocosHierarchy(initialTasks: Tarefa[] = []) {
  const [tasks, setTasks] = useState<Tarefa[]>(initialTasks)

  // Converter para estrutura hierárquica
  const rootTasks = useMemo(() => {
    return buildHierarchy(tasks)
  }, [tasks])

  // Estatísticas
  const stats = useMemo(() => {
    const totalCount = tasks.length
    const completedCount = tasks.filter(t => t.concluida).length
    const progressPercentage = totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0

    return {
      totalCount,
      completedCount,
      progressPercentage,
      hasIncompleteTasks: completedCount < totalCount
    }
  }, [tasks])

  // Adicionar tarefa
  const addTask = useCallback((texto: string, parentId: string | null = null) => {
    const newTask: Tarefa = {
      id: generateId(),
      hiperfocoId: '', // Será definido ao salvar
      parentId,
      texto,
      concluida: false,
      ordem: tasks.length,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setTasks(prev => [...prev, newTask])
    return newTask
  }, [tasks.length])

  // Atualizar tarefa
  const updateTask = useCallback((id: string, updates: Partial<Tarefa>) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ))
  }, [])

  // Remover tarefa
  const removeTask = useCallback((id: string) => {
    setTasks(prev => {
      // Remover a tarefa e todas as suas filhas
      const toRemove = new Set<string>()

      const collectChildren = (taskId: string) => {
        toRemove.add(taskId)
        prev.filter(t => t.parentId === taskId).forEach(child => {
          collectChildren(child.id)
        })
      }

      collectChildren(id)

      return prev.filter(task => !toRemove.has(task.id))
    })
  }, [])

  // Toggle conclusão
  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? {
            ...task,
            concluida: !task.concluida,
            updatedAt: new Date().toISOString()
          }
        : task
    ))
  }, [])

  // Mover tarefa
  const moveTask = useCallback((taskId: string, newParentId: string | null, newOrder: number) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            parentId: newParentId,
            ordem: newOrder,
            updatedAt: new Date().toISOString()
          }
        : task
    ))
  }, [])

  return {
    tasks,
    rootTasks,
    ...stats,
    addTask,
    updateTask,
    removeTask,
    toggleTaskCompletion,
    moveTask
  }
}

// Função auxiliar para gerar IDs
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função auxiliar para construir hierarquia
function buildHierarchy(tasks: Tarefa[]): TarefaNode[] {
  const taskMap = new Map<string, TarefaNode>()
  const rootTasks: TarefaNode[] = []

  // Criar nós
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] })
  })

  // Construir hierarquia
  tasks.forEach(task => {
    const node = taskMap.get(task.id)!

    if (task.parentId) {
      const parent = taskMap.get(task.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        rootTasks.push(node)
      }
    } else {
      rootTasks.push(node)
    }
  })

  // Ordenar por ordem
  const sortByOrder = (nodes: TarefaNode[]) => {
    nodes.sort((a, b) => a.ordem - b.ordem)
    nodes.forEach(node => sortByOrder(node.children))
  }

  sortByOrder(rootTasks)

  return rootTasks
}
```

#### 2.2 Hook de Status Online

```typescript
// app/lib/hooks/useOnlineStatus.ts
import { useState, useEffect, useCallback, useRef } from 'react'

interface ConnectivityStatus {
  isOnline: boolean
  quality: 'good' | 'poor' | 'offline'
  latency?: number
  timestamp: string
}

export function useOnlineStatus() {
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    quality: 'good',
    timestamp: new Date().toISOString()
  })

  const checkConnectivity = useCallback(async () => {
    const startTime = Date.now()

    try {
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache'
      })

      const latency = Date.now() - startTime
      const isOnline = response.ok

      const quality = isOnline
        ? latency < 500 ? 'good' : 'poor'
        : 'offline'

      const newStatus = {
        isOnline,
        quality,
        latency: isOnline ? latency : undefined,
        timestamp: new Date().toISOString()
      }

      console.log('🌐 Connectivity check:', newStatus)
      setStatus(newStatus)

      return newStatus
    } catch (error) {
      const offlineStatus = {
        isOnline: false,
        quality: 'offline' as const,
        latency: undefined,
        timestamp: new Date().toISOString()
      }

      console.log('🌐 Connectivity check:', offlineStatus)
      setStatus(offlineStatus)

      return offlineStatus
    }
  }, [])

  useEffect(() => {
    // Verificação inicial
    checkConnectivity()

    // Listeners para eventos do navegador
    const handleOnline = () => {
      console.log('🟢 Browser online event')
      checkConnectivity()
    }

    const handleOffline = () => {
      console.log('🔴 Browser offline event')
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        quality: 'offline',
        timestamp: new Date().toISOString()
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificação periódica
    const interval = setInterval(checkConnectivity, 30000) // 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [checkConnectivity])

  return {
    ...status,
    checkConnectivity,
    lastCheck: status.timestamp
  }
}
```

### Fase 3: Componentes (Dia 3-4)

#### 3.1 Formulário Principal

```typescript
// app/components/hiperfocos/FormularioHiperfocoRefatorado.tsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { Rocket, Save, Plus, X } from 'lucide-react'
import { hiperfocosValidation, ValidationError } from '../../lib/services/hiperfocosValidation'
import { HiperfocoFormData, TarefaFormData } from '../../lib/types/hiperfoco'

interface FormularioHiperfocoRefatoradoProps {
  initialData?: Partial<HiperfocoFormData>
  onSubmit: (data: HiperfocoFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

const CORES_DISPONIVEIS = [
  '#FF5252', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
]

export function FormularioHiperfocoRefatorado({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: FormularioHiperfocoRefatoradoProps) {
  // Estado do formulário
  const [formData, setFormData] = useState<HiperfocoFormData>({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    tempoLimite: initialData?.tempoLimite,
    cor: initialData?.cor || CORES_DISPONIVEIS[0],
    tarefas: initialData?.tarefas || [{ texto: '', parentId: undefined }]
  })

  const [errors, setErrors] = useState<ValidationError[]>([])
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Validação em tempo real
  const validationErrors = useMemo(() => {
    return hiperfocosValidation.validateHiperfoco(formData)
  }, [formData])

  // Filtrar erros apenas para campos tocados
  const visibleErrors = useMemo(() => {
    return validationErrors.filter(error => touchedFields.has(error.field))
  }, [validationErrors, touchedFields])

  // Marcar campo como tocado
  const markFieldAsTouched = useCallback((field: string) => {
    setTouchedFields(prev => new Set(prev).add(field))
  }, [])

  // Handlers de mudança
  const handleTituloChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, titulo: value }))
    markFieldAsTouched('titulo')
  }, [markFieldAsTouched])

  const handleDescricaoChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, descricao: value }))
    markFieldAsTouched('descricao')
  }, [markFieldAsTouched])

  const handleTempoLimiteChange = useCallback((value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined
    setFormData(prev => ({ ...prev, tempoLimite: numValue }))
    markFieldAsTouched('tempoLimite')
  }, [markFieldAsTouched])

  const handleCorChange = useCallback((cor: string) => {
    setFormData(prev => ({ ...prev, cor }))
    markFieldAsTouched('cor')
  }, [markFieldAsTouched])

  // Gerenciamento de tarefas
  const handleTarefaChange = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tarefas: prev.tarefas.map((tarefa, i) =>
        i === index ? { ...tarefa, texto: value } : tarefa
      )
    }))
    markFieldAsTouched(`tarefas.${index}.texto`)
  }, [markFieldAsTouched])

  const addTarefa = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      tarefas: [...prev.tarefas, { texto: '', parentId: undefined }]
    }))
  }, [])

  const removeTarefa = useCallback((index: number) => {
    if (formData.tarefas.length > 1) {
      setFormData(prev => ({
        ...prev,
        tarefas: prev.tarefas.filter((_, i) => i !== index)
      }))
    }
  }, [formData.tarefas.length])

  // Submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos os campos como tocados
    const allFields = new Set([
      'titulo', 'descricao', 'tempoLimite', 'cor',
      ...formData.tarefas.map((_, i) => `tarefas.${i}.texto`)
    ])
    setTouchedFields(allFields)

    // Validar
    const errors = hiperfocosValidation.validateHiperfoco(formData)
    setErrors(errors)

    if (errors.length === 0) {
      try {
        const sanitizedData = hiperfocosValidation.sanitizeHiperfoco(formData)
        await onSubmit(sanitizedData)
      } catch (error) {
        console.error('Erro ao submeter formulário:', error)
      }
    }
  }, [formData, onSubmit])

  // Função para obter erro de campo específico
  const getFieldError = useCallback((field: string) => {
    return visibleErrors.find(error => error.field === field)
  }, [visibleErrors])

  // Função para verificar se campo tem erro
  const hasFieldError = useCallback((field: string) => {
    return !!getFieldError(field)
  }, [getFieldError])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Rocket className="h-6 w-6 text-hiperfocos-primary mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {initialData ? 'Editar Hiperfoco' : 'Criar Novo Hiperfoco'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              placeholder="Ex: Estudar React"
              maxLength={255}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                hasFieldError('titulo')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-hiperfocos-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-invalid={hasFieldError('titulo')}
              aria-label="Título"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {formData.titulo.length}/255
            </div>
          </div>
          {hasFieldError('titulo') && (
            <p className="text-sm text-red-600" role="alert">
              {getFieldError('titulo')?.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descrição
          </label>
          <div className="relative">
            <textarea
              value={formData.descricao}
              onChange={(e) => handleDescricaoChange(e.target.value)}
              placeholder="Descreva seu hiperfoco..."
              maxLength={1000}
              rows={3}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                hasFieldError('descricao')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-hiperfocos-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-invalid={hasFieldError('descricao')}
              aria-label="Descrição"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {formData.descricao.length}/1000
            </div>
          </div>
          {hasFieldError('descricao') && (
            <p className="text-sm text-red-600" role="alert">
              {getFieldError('descricao')?.message}
            </p>
          )}
        </div>

        {/* Tempo Limite */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tempo Limite (minutos)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.tempoLimite || ''}
              onChange={(e) => handleTempoLimiteChange(e.target.value)}
              placeholder="Ex: 60"
              min={1}
              max={1440}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                hasFieldError('tempoLimite')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-hiperfocos-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-invalid={hasFieldError('tempoLimite')}
              aria-label="Tempo Limite (minutos)"
            />
          </div>
          {hasFieldError('tempoLimite') && (
            <p className="text-sm text-red-600" role="alert">
              {getFieldError('tempoLimite')?.message}
            </p>
          )}
        </div>

        {/* Seleção de Cor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cor do Hiperfoco
          </label>
          <div className="flex space-x-2">
            {CORES_DISPONIVEIS.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => handleCorChange(cor)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.cor === cor
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-300 hover:scale-105'
                } disabled:opacity-50`}
                style={{ backgroundColor: cor }}
                aria-label={`Selecionar cor ${cor}`}
              />
            ))}
          </div>
        </div>

        {/* Tarefas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarefas
            </label>
            <button
              type="button"
              onClick={addTarefa}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              aria-label="Adicionar tarefa"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Tarefa
            </button>
          </div>

          {formData.tarefas.map((tarefa, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="flex-1">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tarefa {index + 1}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tarefa.texto}
                      onChange={(e) => handleTarefaChange(index, e.target.value)}
                      placeholder="Descreva a tarefa..."
                      maxLength={500}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                        hasFieldError(`tarefas.${index}.texto`)
                          ? 'border-red-500 focus:ring-red-500'
                          : tarefa.texto.trim()
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-hiperfocos-primary'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-invalid={hasFieldError(`tarefas.${index}.texto`)}
                      aria-label={`Tarefa ${index + 1}`}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {tarefa.texto.length}/500
                    </div>
                  </div>
                  {hasFieldError(`tarefas.${index}.texto`) && (
                    <p className="text-sm text-red-600" role="alert">
                      {getFieldError(`tarefas.${index}.texto`)?.message}
                    </p>
                  )}
                </div>
              </div>

              {formData.tarefas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTarefa(index)}
                  disabled={isLoading}
                  className="mt-8 p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                  aria-label="Remover tarefa"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {visibleErrors.length > 0 && (
              <span className="text-red-600">
                {visibleErrors.length} erro{visibleErrors.length !== 1 ? 's' : ''} encontrado{visibleErrors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || validationErrors.length > 0}
              className="inline-flex items-center px-6 py-3 bg-hiperfocos-primary text-white rounded-md hover:bg-hiperfocos-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? 'Atualizar' : 'Criar'} Hiperfoco
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
```