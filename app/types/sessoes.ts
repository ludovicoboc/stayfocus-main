// Tipos para o sistema de sessões/timer

export type TipoSessao = 'foco' | 'pausa' | 'pausa_longa'

export type StatusTimer = 'parado' | 'rodando' | 'pausado'

export interface ConfiguracaoTimer {
  tempoFoco: number // em minutos
  tempoPausa: number // em minutos
  tempoPausaLonga: number // em minutos
  ciclosAntesLongaPausa: number
  autoIniciarPausa: boolean
  autoIniciarFoco: boolean
  somNotificacao: boolean
}

export interface EstadoTimer {
  tempoRestante: number // em segundos
  tempoTotal: number // em segundos
  status: StatusTimer
  tipo: TipoSessao
  cicloAtual: number
  ciclosCompletos: number
}

export interface Sessao {
  id: string
  user_id: string
  titulo: string
  tipo: TipoSessao
  tempo_inicio: string
  tempo_fim?: string
  duracao_planejada: number // em minutos
  duracao_real?: number // em minutos
  concluida: boolean
  pausas: number
  interrupcoes: number
  hiperfoco_id?: string
  created_at: string
  updated_at: string
}

export interface CreateSessaoData {
  user_id: string
  titulo: string
  tipo: TipoSessao
  duracao_planejada: number
  hiperfoco_id?: string
}

export interface UpdateSessaoData {
  titulo?: string
  tempo_fim?: string
  duracao_real?: number
  concluida?: boolean
  pausas?: number
  interrupcoes?: number
}

export interface SessaoAtiva extends Sessao {
  timer: EstadoTimer
}

// Eventos do timer
export type TimerEvent = 
  | { type: 'START'; payload?: { tempo?: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'COMPLETE' }
  | { type: 'SWITCH_TYPE'; payload: { tipo: TipoSessao } }

// Hooks de retorno
export interface UseTimerReturn {
  // Estado
  timer: EstadoTimer
  configuracao: ConfiguracaoTimer
  
  // Ações
  iniciar: (tempo?: number) => void
  pausar: () => void
  retomar: () => void
  parar: () => void
  resetar: () => void
  alternarTipo: (tipo: TipoSessao) => void
  
  // Configuração
  atualizarConfiguracao: (config: Partial<ConfiguracaoTimer>) => void
  
  // Utilitários
  formatarTempo: (segundos: number) => string
  calcularProgresso: () => number
}

export interface UseSessoesReturn {
  // Estado
  sessoes: Sessao[]
  sessaoAtiva: SessaoAtiva | null
  isLoading: boolean
  error: Error | null
  
  // Ações
  criarSessao: (data: CreateSessaoData) => Promise<Sessao>
  atualizarSessao: (id: string, data: UpdateSessaoData) => Promise<Sessao>
  finalizarSessao: (id: string) => Promise<Sessao>
  cancelarSessao: (id: string) => Promise<void>
  
  // Sessão ativa
  iniciarSessaoAtiva: (sessaoId: string) => void
  pausarSessaoAtiva: () => void
  retomarSessaoAtiva: () => void
  finalizarSessaoAtiva: () => Promise<void>
}

// Notificações
export interface NotificacaoTimer {
  titulo: string
  corpo: string
  tipo: 'inicio' | 'fim' | 'pausa' | 'foco'
  som?: boolean
  vibrar?: boolean
}

export interface UseNotificacoesReturn {
  permissao: NotificationPermission
  solicitarPermissao: () => Promise<NotificationPermission>
  enviarNotificacao: (notificacao: NotificacaoTimer) => void
  configurarNotificacoes: (config: {
    som: boolean
    vibrar: boolean
    desktop: boolean
  }) => void
}
