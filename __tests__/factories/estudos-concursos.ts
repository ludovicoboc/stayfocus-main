/**
 * Factories TDD para o módulo de Estudos e Concursos
 * Seguindo padrões estabelecidos nos módulos de alimentação e saúde
 */

import { faker } from '@faker-js/faker'

// Contadores para IDs únicos
let concursoCounter = 1
let questaoCounter = 1
let sessaoCounter = 1
let alternativaCounter = 1

// ===== INTERFACES =====

export interface ConcursoFactory {
  id: string
  titulo: string
  organizadora: string
  dataInscricao: string
  dataProva: string
  edital?: string
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado'
  conteudoProgramatico: ConteudoProgramaticoFactory[]
}

export interface ConteudoProgramaticoFactory {
  disciplina: string
  topicos: string[]
  progresso: number
}

export interface QuestaoFactory {
  id: string
  concursoId?: string
  disciplina: string
  topico: string
  enunciado: string
  alternativas: AlternativaFactory[]
  respostaCorreta: string
  justificativa?: string
  nivelDificuldade?: 'facil' | 'medio' | 'dificil'
  ano?: number
  banca?: string
  tags?: string[]
  respondida?: boolean
  respostaUsuario?: string
  acertou?: boolean
}

export interface AlternativaFactory {
  id: string
  texto: string
  correta: boolean
}

export interface SessaoEstudoFactory {
  id: string
  titulo: string
  descricao: string
  duracao: number
  data: string
  completo: boolean
}

export interface ConfiguracaoPomodoroFactory {
  tempoFoco: number
  tempoPausa: number
  tempoLongapausa: number
  ciclosAntesLongapausa: number
}

export interface HistoricoSimuladoFactory {
  titulo: string
  totalQuestoes: number
  tentativas: TentativaFactory[]
}

export interface TentativaFactory {
  timestamp: string
  acertos: number
  percentual: number
}

// ===== FACTORIES PRINCIPAIS =====

export const createConteudoProgramatico = (overrides: Partial<ConteudoProgramaticoFactory> = {}): ConteudoProgramaticoFactory => ({
  disciplina: faker.helpers.arrayElement([
    'Direito Administrativo',
    'Direito Constitucional',
    'Direito Civil',
    'Direito Penal',
    'Português',
    'Matemática',
    'Informática',
    'Raciocínio Lógico'
  ]),
  topicos: faker.helpers.arrayElements([
    'Princípios',
    'Atos Administrativos',
    'Contratos',
    'Licitações',
    'Servidores Públicos',
    'Responsabilidade Civil',
    'Processo Administrativo'
  ], { min: 2, max: 5 }),
  progresso: faker.number.int({ min: 0, max: 100 }),
  ...overrides
})

export const createConcurso = (overrides: Partial<ConcursoFactory> = {}): ConcursoFactory => ({
  id: `concurso-${concursoCounter++}`,
  titulo: faker.helpers.arrayElement([
    'Analista Administrativo - TRT',
    'Técnico Judiciário - TRF',
    'Auditor Fiscal - Receita Federal',
    'Analista - INSS',
    'Técnico - Banco Central',
    'Especialista - ANAC'
  ]),
  organizadora: faker.helpers.arrayElement(['FCC', 'CESPE', 'FGV', 'VUNESP', 'AOCP', 'IADES']),
  dataInscricao: faker.date.future({ years: 1 }).toISOString().split('T')[0],
  dataProva: faker.date.future({ years: 1 }).toISOString().split('T')[0],
  edital: faker.internet.url(),
  status: faker.helpers.arrayElement(['planejado', 'inscrito', 'estudando', 'realizado', 'aguardando_resultado']),
  conteudoProgramatico: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => createConteudoProgramatico()),
  ...overrides
})

export const createAlternativa = (overrides: Partial<AlternativaFactory> = {}): AlternativaFactory => ({
  id: String.fromCharCode(97 + alternativaCounter++ % 26), // a, b, c, d, e...
  texto: faker.lorem.sentence({ min: 5, max: 15 }),
  correta: false,
  ...overrides
})

export const createQuestao = (overrides: Partial<QuestaoFactory> = {}): QuestaoFactory => {
  const alternativas = Array.from({ length: 4 }, (_, index) => 
    createAlternativa({ 
      id: String.fromCharCode(97 + index), // a, b, c, d
      correta: index === 0 // primeira alternativa correta por padrão
    })
  )

  return {
    id: `questao-${questaoCounter++}`,
    concursoId: `concurso-${faker.number.int({ min: 1, max: 10 })}`,
    disciplina: faker.helpers.arrayElement([
      'Direito Administrativo',
      'Direito Constitucional',
      'Português',
      'Matemática',
      'Informática'
    ]),
    topico: faker.helpers.arrayElement([
      'Princípios',
      'Atos Administrativos',
      'Gramática',
      'Interpretação de Texto',
      'Álgebra',
      'Geometria'
    ]),
    enunciado: faker.lorem.paragraph({ min: 2, max: 5 }),
    alternativas,
    respostaCorreta: 'a', // primeira alternativa por padrão
    justificativa: faker.lorem.paragraph({ min: 1, max: 3 }),
    nivelDificuldade: faker.helpers.arrayElement(['facil', 'medio', 'dificil']),
    ano: faker.number.int({ min: 2020, max: 2024 }),
    banca: faker.helpers.arrayElement(['FCC', 'CESPE', 'FGV', 'VUNESP']),
    tags: faker.helpers.arrayElements([
      'fundamental',
      'avançado',
      'jurisprudência',
      'doutrina',
      'lei',
      'decreto'
    ], { min: 1, max: 3 }),
    respondida: false,
    respostaUsuario: undefined,
    acertou: undefined,
    ...overrides
  }
}

export const createSessaoEstudo = (overrides: Partial<SessaoEstudoFactory> = {}): SessaoEstudoFactory => ({
  id: `sessao-${sessaoCounter++}`,
  titulo: faker.helpers.arrayElement([
    'Revisão de Direito Administrativo',
    'Estudo de Português',
    'Resolução de Questões de Matemática',
    'Leitura do Edital',
    'Simulado de Informática'
  ]),
  descricao: faker.lorem.sentence({ min: 5, max: 15 }),
  duracao: faker.helpers.arrayElement([30, 45, 60, 90, 120]), // minutos
  data: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  completo: faker.datatype.boolean(),
  ...overrides
})

export const createConfiguracaoPomodoro = (overrides: Partial<ConfiguracaoPomodoroFactory> = {}): ConfiguracaoPomodoroFactory => ({
  tempoFoco: faker.helpers.arrayElement([25, 30, 45, 50]),
  tempoPausa: faker.helpers.arrayElement([5, 10, 15]),
  tempoLongapausa: faker.helpers.arrayElement([15, 20, 30]),
  ciclosAntesLongapausa: faker.helpers.arrayElement([3, 4, 5]),
  ...overrides
})

export const createTentativa = (overrides: Partial<TentativaFactory> = {}): TentativaFactory => ({
  timestamp: faker.date.recent({ days: 30 }).toISOString(),
  acertos: faker.number.int({ min: 0, max: 20 }),
  percentual: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
  ...overrides
})

export const createHistoricoSimulado = (overrides: Partial<HistoricoSimuladoFactory> = {}): HistoricoSimuladoFactory => ({
  titulo: faker.helpers.arrayElement([
    'Simulado Direito Administrativo',
    'Simulado Português',
    'Simulado Geral TRT',
    'Simulado Matemática Básica'
  ]),
  totalQuestoes: faker.helpers.arrayElement([10, 15, 20, 25, 30]),
  tentativas: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => createTentativa()),
  ...overrides
})

// ===== UTILITIES =====

/**
 * Cria uma lista de itens usando uma factory
 */
export const createList = <T>(factory: (overrides?: any) => T, count: number, overrides?: any): T[] =>
  Array.from({ length: count }, (_, i) => factory({ ...overrides, id: `${overrides?.id || 'item'}-${i + 1}` }))

/**
 * Cria um estado completo do módulo de estudos e concursos
 */
export const createEstudosConcursosState = (overrides: any = {}) => ({
  concursos: createList(createConcurso, 3),
  questoes: createList(createQuestao, 15),
  sessoes: createList(createSessaoEstudo, 8),
  configuracaoPomodoro: createConfiguracaoPomodoro(),
  historicoSimulados: {
    'Simulado Direito|20': createHistoricoSimulado(),
    'Simulado Português|15': createHistoricoSimulado()
  },
  ...overrides
})

/**
 * Cria questões com relacionamento específico a um concurso
 */
export const createQuestoesParaConcurso = (concursoId: string, count: number = 10): QuestaoFactory[] =>
  createList(createQuestao, count, { concursoId })

/**
 * Cria um simulado completo com questões e respostas
 */
export const createSimuladoCompleto = (totalQuestoes: number = 20) => {
  const questoes = createList(createQuestao, totalQuestoes)
  const respostas = questoes.reduce((acc, questao, index) => {
    acc[index] = faker.helpers.arrayElement(['a', 'b', 'c', 'd'])
    return acc
  }, {} as Record<number, string>)

  return {
    questoes,
    respostas,
    titulo: faker.helpers.arrayElement([
      'Simulado Geral',
      'Simulado Específico',
      'Prova Simulada'
    ])
  }
}

// Reset counters (útil para testes)
export const resetCounters = () => {
  concursoCounter = 1
  questaoCounter = 1
  sessaoCounter = 1
  alternativaCounter = 1
}
