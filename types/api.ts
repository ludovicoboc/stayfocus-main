// =============================================================================
// TIPOS PARA AS APIS DO BACKEND
// =============================================================================

// Tipos base do banco de dados
export interface Hiperfoco {
  id: string
  user_id: string
  titulo: string
  descricao?: string
  cor: string
  tempo_limite?: number
  status: 'ativo' | 'pausado' | 'concluido' | 'arquivado'
  data_criacao: string
  created_at: string
  updated_at: string
}

export interface Tarefa {
  id: string
  hiperfoco_id: string
  parent_id?: string
  texto: string
  concluida: boolean
  cor?: string
  ordem: number
  nivel: number
  created_at: string
  updated_at: string
}

export interface SessaoAlternancia {
  id: string
  user_id: string
  titulo: string
  hiperfoco_atual?: string
  hiperfoco_anterior?: string
  tempo_inicio: string
  duracao_estimada: number
  duracao_real?: number
  concluida: boolean
  created_at: string
  updated_at: string
}

// Tipos com relacionamentos
export interface HiperfocoComTarefas extends Hiperfoco {
  tarefas: TarefaHierarquica[]
}

export interface TarefaHierarquica extends Tarefa {
  subtarefas: TarefaHierarquica[]
}

export interface TarefaComHiperfoco extends Tarefa {
  hiperfoco: Pick<Hiperfoco, 'id' | 'user_id'>
  subtarefas?: Tarefa[]
}

export interface SessaoComHiperfocos extends SessaoAlternancia {
  hiperfoco_atual?: Pick<Hiperfoco, 'id' | 'titulo' | 'cor'>
  hiperfoco_anterior?: Pick<Hiperfoco, 'id' | 'titulo' | 'cor'>
}

// Tipos para requests
export interface CreateHiperfocoRequest {
  user_id: string
  titulo: string
  descricao?: string
  cor: string
  tempo_limite?: number
}

export interface UpdateHiperfocoRequest {
  user_id: string
  titulo?: string
  descricao?: string
  cor?: string
  tempo_limite?: number
  status?: 'ativo' | 'pausado' | 'concluido' | 'arquivado'
}

export interface CreateTarefaRequest {
  hiperfoco_id: string
  user_id: string
  texto: string
  parent_id?: string
  cor?: string
  ordem?: number
}

export interface UpdateTarefaRequest {
  user_id: string
  texto?: string
  concluida?: boolean
  cor?: string
  ordem?: number
  parent_id?: string
}

export interface CreateSessaoRequest {
  user_id: string
  titulo: string
  hiperfoco_atual?: string
  duracao_estimada: number
  tempo_inicio?: string
}

export interface UpdateSessaoRequest {
  user_id: string
  titulo?: string
  hiperfoco_atual?: string
  duracao_estimada?: number
  duracao_real?: number
  concluida?: boolean
}

export interface FinalizarSessaoRequest {
  user_id: string
  duracao_real?: number
}

// Tipos para responses
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiListResponse<T> {
  data: T[]
  count: number
}

export interface ApiError {
  error: string
}

export interface EstatisticasSessao {
  duracao_estimada: number
  duracao_real: number
  diferenca: number
  eficiencia: number
  status: 'exato' | 'excedeu' | 'antecipou'
}

export interface FinalizarSessaoResponse extends ApiResponse<SessaoComHiperfocos> {
  estatisticas: EstatisticasSessao
}

// Tipos para query parameters
export interface GetHiperfocosQuery {
  user_id: string
  status?: string
  limit?: number
  offset?: number
}

export interface GetTarefasQuery {
  hiperfoco_id: string
  user_id: string
  parent_id?: string
  nivel?: number
}

export interface GetSessoesQuery {
  user_id: string
  concluida?: string
  limit?: number
  offset?: number
  order_by?: 'tempo_inicio' | 'created_at' | 'duracao_estimada' | 'titulo'
  order_direction?: 'asc' | 'desc'
}

// Tipos para validação
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// Constantes para validação
export const VALIDATION_LIMITS = {
  TITULO_MAX_LENGTH: 255,
  TEXTO_TAREFA_MAX_LENGTH: 500,
  MAX_HIERARCHY_LEVEL: 5,
  MIN_DURACAO: 1,
  COR_REGEX: /^#[0-9A-Fa-f]{6}$/
} as const

export const VALID_STATUSES = ['ativo', 'pausado', 'concluido', 'arquivado'] as const
export const VALID_ORDER_BY = ['tempo_inicio', 'created_at', 'duracao_estimada', 'titulo'] as const
export const VALID_ORDER_DIRECTION = ['asc', 'desc'] as const

// Tipos utilitários
export type HiperfocoStatus = typeof VALID_STATUSES[number]
export type OrderBy = typeof VALID_ORDER_BY[number]
export type OrderDirection = typeof VALID_ORDER_DIRECTION[number]
