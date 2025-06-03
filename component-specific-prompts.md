# Component-Specific Refactoring Prompts

## Overview

This document provides detailed, component-specific prompt templates for refactoring React components in the StayFocus project to work with Supabase-integrated stores while maintaining existing UI/UX and adding real-time capabilities.

---

## PROMPT 6A: Dashboard Components Refactoring

### Role Definition
You are a React performance specialist with expertise in dashboard optimization, real-time data visualization, and seamless user experience design for productivity applications.

### Task Context
Refactor the main dashboard components (`DashboardHeader`, `DashboardSummary`, `PainelDia`, `ListaPrioridades`) to work with Supabase-integrated stores while maintaining the existing user experience and adding real-time updates.

### Current Dashboard Implementation
```typescript
// app/page.tsx - Main dashboard
export default function HomePage() {
  const {
    blocosDia,
    prioridadesDia,
    proximosCompromissos,
    prioridadesPendentes,
    prioridadesConcluidas,
    metasPausas,
    mostrarPausas,
    nomeUsuario,
    preferenciasVisuais,
    isLoading
  } = useDashboard()
  
  // Current implementation uses local stores only
}
```

### Refactoring Requirements
1. Integrate with migrated Supabase stores
2. Add real-time updates for priorities and schedule changes
3. Implement loading states for sync operations
4. Add offline/online status indicators
5. Maintain exact same UI/UX experience
6. Optimize re-renders for real-time updates

### Implementation Template
```typescript
// hooks/useDashboard.ts - Enhanced version
export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>(defaultDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  
  // Supabase-integrated stores
  const { prioridades, subscribeToRealtime: subscribePrioridades } = usePrioridadesStore()
  const { blocos, subscribeToRealtime: subscribeBlocos } = usePainelDiaStore()
  const { nome, preferenciasVisuais, isOnline } = usePerfilStore()
  const { isSyncing } = useSyncStore()
  
  // Real-time subscriptions
  useEffect(() => {
    const unsubscribePrioridades = subscribePrioridades()
    const unsubscribeBlocos = subscribeBlocos()
    
    return () => {
      unsubscribePrioridades()
      unsubscribeBlocos()
    }
  }, [])
  
  // Enhanced data processing with sync status
  useEffect(() => {
    const processData = async () => {
      // Process data with real-time updates
      const processedData = {
        ...data,
        isOnline,
        isSyncing,
        lastSyncTime: new Date().toISOString()
      }
      setData(processedData)
    }
    
    processData()
  }, [prioridades, blocos, nome, preferenciasVisuais, isOnline, isSyncing])
  
  return { ...data, isLoading, isOnline, isSyncing }
}
```

### Enhanced Dashboard Components
```typescript
// components/ui/DashboardHeader.tsx - Enhanced version
export function DashboardHeader({ 
  title, 
  userName, 
  description, 
  actions,
  isOnline,
  isSyncing 
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-600 dark:text-gray-400">
            {getGreeting()}, {userName}
          </p>
          <SyncStatusIndicator isOnline={isOnline} isSyncing={isSyncing} />
        </div>
      </div>
      {actions}
    </header>
  )
}

// New component for sync status
function SyncStatusIndicator({ isOnline, isSyncing }: SyncStatusProps) {
  if (isSyncing) {
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Sincronizando...</span>
      </div>
    )
  }
  
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1 text-orange-600">
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Offline</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1 text-green-600">
      <Wifi className="h-3 w-3" />
      <span className="text-xs">Online</span>
    </div>
  )
}
```

### Deliverables
1. Enhanced dashboard hook with real-time integration
2. Sync status indicators throughout the dashboard
3. Optimized re-rendering for real-time updates
4. Loading states for sync operations
5. Backward compatibility with existing UI

---

## PROMPT 6B: Priority Management Components

### Role Definition
You are a task management UI specialist with expertise in optimistic updates, real-time collaboration interfaces, and intuitive task interaction patterns.

### Task Context
Refactor priority/task management components (`ListaPrioridades`, `AdicionarPrioridade`, `PrioridadeItem`) to work with the Supabase-integrated priorities store while adding real-time updates and optimistic UI feedback.

### Current Priority Components
```typescript
// components/inicio/ListaPrioridades.tsx
export function ListaPrioridades() {
  const { prioridades, adicionarPrioridade, toggleConcluida } = usePrioridadesStore()
  const hoje = format(new Date(), 'yyyy-MM-dd')
  const prioridadesDoDia = prioridades.filter(p => p.data === hoje)
  
  // Current implementation with local state only
}
```

### Refactoring Requirements
1. Implement optimistic updates for immediate UI feedback
2. Add real-time updates when other devices modify priorities
3. Handle conflict resolution UI for simultaneous edits
4. Add loading states for sync operations
5. Implement retry mechanisms for failed operations

### Implementation Template
```typescript
// components/inicio/ListaPrioridades.tsx - Enhanced version
export function ListaPrioridades() {
  const { 
    prioridades, 
    adicionarPrioridade, 
    toggleConcluida,
    isOnline,
    isSyncing,
    pendingOperations 
  } = usePrioridadesStore()
  
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<Prioridade>>>(new Map())
  const hoje = format(new Date(), 'yyyy-MM-dd')
  
  // Merge real data with optimistic updates
  const prioridadesDoDia = useMemo(() => {
    return prioridades
      .filter(p => p.data === hoje)
      .map(prioridade => {
        const optimisticUpdate = optimisticUpdates.get(prioridade.id)
        return optimisticUpdate ? { ...prioridade, ...optimisticUpdate } : prioridade
      })
  }, [prioridades, hoje, optimisticUpdates])
  
  // Optimistic toggle with rollback on failure
  const handleToggleConcluida = async (id: string) => {
    const prioridade = prioridades.find(p => p.id === id)
    if (!prioridade) return
    
    // Optimistic update
    const optimisticUpdate = { concluida: !prioridade.concluida }
    setOptimisticUpdates(prev => new Map(prev).set(id, optimisticUpdate))
    
    try {
      await toggleConcluida(id)
      // Remove optimistic update on success
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
    } catch (error) {
      // Rollback optimistic update on failure
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
      toast.error('Erro ao atualizar prioridade. Tente novamente.')
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Prioridades do Dia</h3>
        <SyncStatusBadge isOnline={isOnline} isSyncing={isSyncing} />
      </div>
      
      {prioridadesDoDia.map(prioridade => (
        <PrioridadeItem
          key={prioridade.id}
          prioridade={prioridade}
          onToggle={handleToggleConcluida}
          isPending={pendingOperations.has(prioridade.id)}
          isOptimistic={optimisticUpdates.has(prioridade.id)}
        />
      ))}
      
      <AdicionarPrioridadeForm onAdd={adicionarPrioridade} />
    </div>
  )
}

// Enhanced priority item with visual feedback
function PrioridadeItem({ 
  prioridade, 
  onToggle, 
  isPending, 
  isOptimistic 
}: PrioridadeItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      isOptimistic && "opacity-70",
      isPending && "animate-pulse"
    )}>
      <Checkbox
        checked={prioridade.concluida}
        onCheckedChange={() => onToggle(prioridade.id)}
        disabled={isPending}
      />
      <span className={cn(
        "flex-1",
        prioridade.concluida && "line-through text-gray-500"
      )}>
        {prioridade.texto}
      </span>
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      {isOptimistic && <Clock className="h-4 w-4 text-orange-500" />}
    </div>
  )
}
```

### Deliverables
1. Optimistic update implementation for immediate feedback
2. Real-time priority synchronization
3. Visual indicators for sync status and pending operations
4. Error handling with rollback mechanisms
5. Enhanced user experience with loading states

---

## PROMPT 6C: Recipe Management Components

### Role Definition
You are a recipe management and meal planning UI specialist with expertise in media handling, search interfaces, and collaborative cooking applications.

### Task Context
Refactor recipe management components (`ListaReceitas`, `AdicionarReceitaForm`, `ReceitaCard`) to work with Supabase-integrated recipe store, adding image upload, enhanced search, and real-time recipe sharing.

### Current Recipe Components
```typescript
// components/receitas/ListaReceitas.tsx
export function ListaReceitas({ receitas }: { receitas: Receita[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {receitas.map(receita => (
        <ReceitaCard key={receita.id} receita={receita} />
      ))}
    </div>
  )
}
```

### Refactoring Requirements
1. Integrate with Supabase Storage for image uploads
2. Add real-time recipe updates and sharing
3. Implement enhanced search with ingredient filtering
4. Add optimistic updates for recipe modifications
5. Handle large recipe collections with pagination

### Implementation Template
```typescript
// components/receitas/ListaReceitas.tsx - Enhanced version
export function ListaReceitas({ 
  receitas, 
  isLoading, 
  hasMore, 
  onLoadMore 
}: ListaReceitasProps) {
  const { subscribeToRealtime } = useReceitasStore()
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())
  
  // Real-time subscription for recipe updates
  useEffect(() => {
    const unsubscribe = subscribeToRealtime()
    return unsubscribe
  }, [])
  
  const handleImageError = (receitaId: string) => {
    setImageLoadErrors(prev => new Set(prev).add(receitaId))
  }
  
  if (isLoading && receitas.length === 0) {
    return <ReceitasLoadingSkeleton />
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receitas.map(receita => (
          <ReceitaCard
            key={receita.id}
            receita={receita}
            hasImageError={imageLoadErrors.has(receita.id)}
            onImageError={() => handleImageError(receita.id)}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center">
          <Button 
            onClick={onLoadMore} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar mais receitas'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Enhanced recipe card with image handling
function ReceitaCard({ 
  receita, 
  hasImageError, 
  onImageError 
}: ReceitaCardProps) {
  const { alternarFavorito, uploadImagemReceita } = useReceitasStore()
  const [isUploading, setIsUploading] = useState(false)
  
  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await uploadImagemReceita(file, receita.id)
      toast.success('Imagem atualizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gray-100">
        {receita.imagem && !hasImageError ? (
          <Image
            src={receita.imagem}
            alt={receita.nome}
            fill
            className="object-cover"
            onError={onImageError}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        
        <ImageUploadOverlay 
          onUpload={handleImageUpload}
          disabled={isUploading}
        />
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{receita.nome}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {receita.descricao}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{receita.tempoPreparo} min</span>
          <span>{receita.porcoes} porções</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => alternarFavorito(receita.id)}
          >
            <Heart className={cn(
              "h-4 w-4",
              receita.isFavorito && "fill-red-500 text-red-500"
            )} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Deliverables
1. Enhanced recipe list with pagination and real-time updates
2. Image upload integration with Supabase Storage
3. Improved recipe card with visual feedback
4. Error handling for image loading and uploads
5. Optimistic updates for recipe modifications

---

## PROMPT 6D: Study Management Components

### Role Definition
You are an educational technology UI specialist with expertise in progress tracking interfaces, study session management, and performance visualization for learning applications.

### Task Context
Refactor study management components (`ConcursoCard`, `ConteudoProgramatico`, `ProgressTracker`) to work with Supabase-integrated study stores while adding real-time progress synchronization and enhanced analytics.

### Current Study Components
```typescript
// components/concursos/ConcursoCard.tsx
export function ConcursoCard({ concurso }: { concurso: Concurso }) {
  const progressoGeral = calcularProgressoGeral(concurso.conteudoProgramatico)
  
  return (
    <Card>
      <CardContent>
        <h3>{concurso.titulo}</h3>
        <p>{concurso.organizadora}</p>
        <ProgressBar value={progressoGeral} />
      </CardContent>
    </Card>
  )
}
```

### Refactoring Requirements
1. Real-time progress synchronization across devices
2. Enhanced progress visualization with analytics
3. Study session tracking and time management
4. Collaborative study features preparation
5. Performance insights and recommendations

### Implementation Template
```typescript
// components/concursos/ConcursoCard.tsx - Enhanced version
export function ConcursoCard({ concurso }: ConcursoCardProps) {
  const { 
    atualizarProgresso, 
    registrarSessaoEstudo,
    obterEstatisticasEstudo 
  } = useConcursosStore()
  
  const [estatisticas, setEstatisticas] = useState<EstatisticasEstudo | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Load study statistics
  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true)
      try {
        const stats = await obterEstatisticasEstudo(concurso.id)
        setEstatisticas(stats)
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }
    
    loadStats()
  }, [concurso.id])
  
  const progressoGeral = calcularProgressoGeral(concurso.conteudoProgramatico)
  const diasRestantes = differenceInDays(new Date(concurso.dataProva), new Date())
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{concurso.titulo}</CardTitle>
            <CardDescription>{concurso.organizadora}</CardDescription>
          </div>
          <StatusBadge status={concurso.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm text-gray-500">{progressoGeral}%</span>
          </div>
          <ProgressBar value={progressoGeral} className="h-2" />
        </div>
        
        {/* Study Statistics */}
        {isLoadingStats ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Carregando estatísticas...</span>
          </div>
        ) : estatisticas && (
          <StudyStatsDisplay stats={estatisticas} />
        )}
        
        {/* Time Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(concurso.dataProva), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className={cn(
              diasRestantes <= 30 && "text-orange-600",
              diasRestantes <= 7 && "text-red-600"
            )}>
              {diasRestantes > 0 ? `${diasRestantes} dias` : 'Prova realizada'}
            </span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/concursos/${concurso.id}`}>
              Ver detalhes
            </Link>
          </Button>
          <StudySessionButton concursoId={concurso.id} />
        </div>
      </CardContent>
    </Card>
  )
}

// Study statistics display component
function StudyStatsDisplay({ stats }: { stats: EstatisticasEstudo }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="text-center p-2 bg-blue-50 rounded">
        <div className="font-semibold text-blue-700">{stats.horasEstudadas}h</div>
        <div className="text-blue-600">Esta semana</div>
      </div>
      <div className="text-center p-2 bg-green-50 rounded">
        <div className="font-semibold text-green-700">{stats.sequenciaEstudos}</div>
        <div className="text-green-600">Dias seguidos</div>
      </div>
    </div>
  )
}

// Quick study session button
function StudySessionButton({ concursoId }: { concursoId: string }) {
  const { registrarSessaoEstudo } = useConcursosStore()
  const [isStudying, setIsStudying] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  
  const handleToggleStudy = async () => {
    if (isStudying) {
      // End study session
      if (startTime) {
        const duracao = differenceInMinutes(new Date(), startTime)
        await registrarSessaoEstudo({
          concursoId,
          duracaoMinutos: duracao,
          dataSessao: format(new Date(), 'yyyy-MM-dd'),
          observacoes: ''
        })
      }
      setIsStudying(false)
      setStartTime(null)
    } else {
      // Start study session
      setIsStudying(true)
      setStartTime(new Date())
    }
  }
  
  return (
    <Button
      variant={isStudying ? "destructive" : "default"}
      size="sm"
      onClick={handleToggleStudy}
    >
      {isStudying ? (
        <>
          <Square className="h-4 w-4 mr-1" />
          Parar estudo
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-1" />
          Iniciar estudo
        </>
      )}
    </Button>
  )
}
```

### Deliverables
1. Enhanced concurso card with real-time progress tracking
2. Study session management with time tracking
3. Performance statistics and insights display
4. Quick action buttons for study management
5. Visual indicators for study progress and deadlines

---

## Usage Instructions for Component-Specific Prompts

### Sequential Component Refactoring:

1. **Start with Dashboard Components** (6A) - Foundation UI with sync status
2. **Refactor Core Interaction Components** (6B) - Priority management with optimistic updates
3. **Update Content Management Components** (6C, 6D) - Recipe and study components with media handling
4. **Add Real-time Features** - Across all components
5. **Optimize Performance** - Final optimization pass

### For Each Component Refactoring:

1. Analyze current component implementation and dependencies
2. Identify integration points with migrated stores
3. Implement optimistic updates for immediate feedback
4. Add real-time subscription handling
5. Include loading states and error handling
6. Add visual indicators for sync status
7. Test backward compatibility and user experience
8. Optimize re-rendering performance

### Key Patterns to Follow:

- **Optimistic Updates**: Immediate UI feedback with rollback on failure
- **Real-time Integration**: Subscribe to store changes and handle updates
- **Loading States**: Visual feedback during sync operations
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Performance**: Minimize re-renders and optimize real-time updates

This systematic approach ensures all components are properly integrated with the Supabase infrastructure while maintaining the excellent user experience that StayFocus provides.
