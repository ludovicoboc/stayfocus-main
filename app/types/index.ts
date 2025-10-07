// Tipos compartilhados para todo o aplicativo

// Categorias principais do aplicativo
export type Categoria = 'inicio' | 'alimentacao' | 'saude' | 'lazer' | 'nenhuma'

// Opções de humor para o monitor de humor
export type OpcaoHumor = 'otimo' | 'bom' | 'neutro' | 'baixo' | 'ruim'

// Interface para atividades de lazer
export type AtividadeLazer = {
  id: string
  nome: string
  descricao: string
  duracao: number // em minutos
  categoria: 'ativo' | 'passivo' | 'criativo' | 'social'
}

// Interface para registro de humor
export type RegistroHumor = {
  id: string
  data: string // formato YYYY-MM-DD
  humor: OpcaoHumor
  notas?: string
}

// Interface para lembretes
export type Lembrete = {
  id: string
  titulo: string
  descricao?: string
  data: string // formato YYYY-MM-DD
  hora: string // formato HH:MM
  recorrente: boolean
  diasRecorrencia?: ('seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom')[]
  categoria: Categoria
  completado: boolean
}

// Interface para registro de hidratação
export type RegistroHidratacao = {
  id: string
  data: string // formato YYYY-MM-DD
  quantidade: number // em ml
  hora: string // formato HH:MM
}

// Tipos para componentes do Dashboard
export type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  color: string
  activeColor: string
  iconClasses?: string
}

export type PlaceholderProps = {
  className?: string
}

export type DashboardCardProps = {
  children: React.ReactNode
  title?: string
  className?: string
  isLoading?: boolean
}

export type DashboardSectionProps = {
  id?: string
  title?: string
  children: React.ReactNode
  className?: string
}

// Tipos para componentes de Suspense do Dashboard
export type SuspenseWrapperProps = {
  children: React.ReactNode
  fallback: React.ReactNode
}
