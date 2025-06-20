export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export interface HiperfocoInput {
  titulo: string
  descricao: string
  cor: string
  tempoLimite?: number
}

export interface TarefaInput {
  texto: string
  cor?: string
}

export interface SessaoAlternanciaInput {
  titulo: string
  hiperfocoAtual: string | null
  duracaoEstimada: number
}

// Regex para validar cor hexadecimal
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export function validateHiperfoco(hiperfoco: HiperfocoInput): void {
  // Validar título
  if (!hiperfoco.titulo || hiperfoco.titulo.trim() === '') {
    throw new ValidationError('Título é obrigatório')
  }
  
  if (hiperfoco.titulo.length > 255) {
    throw new ValidationError('Título deve ter no máximo 255 caracteres')
  }
  
  // Validar descrição
  if (hiperfoco.descricao && hiperfoco.descricao.length > 1000) {
    throw new ValidationError('Descrição deve ter no máximo 1000 caracteres')
  }
  
  // Validar cor
  if (!HEX_COLOR_REGEX.test(hiperfoco.cor)) {
    throw new ValidationError('Cor deve estar no formato hexadecimal (#RRGGBB)')
  }
  
  // Validar tempo limite
  if (hiperfoco.tempoLimite !== undefined && hiperfoco.tempoLimite <= 0) {
    throw new ValidationError('Tempo limite deve ser positivo')
  }
}

export function validateTarefa(tarefa: TarefaInput): void {
  // Validar texto
  if (!tarefa.texto || tarefa.texto.trim() === '') {
    throw new ValidationError('Texto da tarefa é obrigatório')
  }
  
  if (tarefa.texto.length > 500) {
    throw new ValidationError('Texto da tarefa deve ter no máximo 500 caracteres')
  }
  
  // Validar cor (opcional)
  if (tarefa.cor && !HEX_COLOR_REGEX.test(tarefa.cor)) {
    throw new ValidationError('Cor deve estar no formato hexadecimal (#RRGGBB)')
  }
}

export function validateSessaoAlternancia(sessao: SessaoAlternanciaInput): void {
  // Validar título
  if (!sessao.titulo || sessao.titulo.trim() === '') {
    throw new ValidationError('Título da sessão é obrigatório')
  }
  
  if (sessao.titulo.length > 255) {
    throw new ValidationError('Título da sessão deve ter no máximo 255 caracteres')
  }
  
  // Validar hiperfoco atual
  if (sessao.hiperfocoAtual === '') {
    throw new ValidationError('ID do hiperfoco não pode ser vazio')
  }
  
  // Validar duração
  if (sessao.duracaoEstimada <= 0) {
    throw new ValidationError('Duração estimada deve ser positiva')
  }
}

// Utilitários de validação
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color)
}

export function sanitizeText(text: string): string {
  return text.trim()
}

export function validateId(id: string, fieldName: string = 'ID'): void {
  if (!id || id.trim() === '') {
    throw new ValidationError(`${fieldName} é obrigatório`)
  }
}

// Validações específicas para o domínio
export function validateTempoLimite(tempo: number): void {
  if (tempo <= 0) {
    throw new ValidationError('Tempo limite deve ser positivo')
  }
  
  if (tempo > 1440) { // 24 horas em minutos
    throw new ValidationError('Tempo limite não pode exceder 24 horas')
  }
}

export function validateDuracaoSessao(duracao: number): void {
  if (duracao <= 0) {
    throw new ValidationError('Duração da sessão deve ser positiva')
  }
  
  if (duracao > 480) { // 8 horas em minutos
    throw new ValidationError('Duração da sessão não pode exceder 8 horas')
  }
}
