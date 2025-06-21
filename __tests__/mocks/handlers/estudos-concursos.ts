/**
 * Mock Service Worker handlers para o módulo de Estudos e Concursos
 * Seguindo padrões estabelecidos nos módulos de alimentação e saúde
 */

import { http, HttpResponse } from 'msw'
import { 
  createConcurso, 
  createQuestao, 
  createSessaoEstudo,
  createHistoricoSimulado,
  createList,
  createQuestoesParaConcurso,
  type ConcursoFactory,
  type QuestaoFactory,
  type SessaoEstudoFactory
} from '../factories/estudos-concursos'

// Base URL para APIs
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Dados mock em memória
let mockConcursos: ConcursoFactory[] = createList(createConcurso, 5)
let mockQuestoes: QuestaoFactory[] = createList(createQuestao, 50)
let mockSessoes: SessaoEstudoFactory[] = createList(createSessaoEstudo, 20)
let mockHistorico: Record<string, any> = {
  'Simulado Direito|20': createHistoricoSimulado(),
  'Simulado Português|15': createHistoricoSimulado()
}

// ===== HANDLERS PARA CONCURSOS =====

export const concursosHandlers = [
  // GET /api/concursos - Listar concursos do usuário
  http.get(`${API_BASE}/concursos`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filteredConcursos = [...mockConcursos]

    if (status) {
      filteredConcursos = filteredConcursos.filter(c => c.status === status)
    }

    if (search) {
      filteredConcursos = filteredConcursos.filter(c => 
        c.titulo.toLowerCase().includes(search.toLowerCase()) ||
        c.organizadora.toLowerCase().includes(search.toLowerCase())
      )
    }

    return HttpResponse.json(filteredConcursos)
  }),

  // GET /api/concursos/:id - Buscar concurso específico
  http.get(`${API_BASE}/concursos/:id`, ({ params }) => {
    const concurso = mockConcursos.find(c => c.id === params.id)
    
    if (!concurso) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(concurso)
  }),

  // POST /api/concursos - Criar novo concurso
  http.post(`${API_BASE}/concursos`, async ({ request }) => {
    const novoConcurso = await request.json() as Partial<ConcursoFactory>
    const concursoCompleto = createConcurso({
      ...novoConcurso,
      id: `concurso-${Date.now()}`
    })

    mockConcursos.push(concursoCompleto)
    return HttpResponse.json(concursoCompleto, { status: 201 })
  }),

  // PUT /api/concursos/:id - Atualizar concurso
  http.put(`${API_BASE}/concursos/:id`, async ({ params, request }) => {
    const index = mockConcursos.findIndex(c => c.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const dadosAtualizados = await request.json()
    mockConcursos[index] = { ...mockConcursos[index], ...dadosAtualizados }
    
    return HttpResponse.json(mockConcursos[index])
  }),

  // DELETE /api/concursos/:id - Remover concurso
  http.delete(`${API_BASE}/concursos/:id`, ({ params }) => {
    const index = mockConcursos.findIndex(c => c.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockConcursos.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  })
]

// ===== HANDLERS PARA QUESTÕES =====

export const questoesHandlers = [
  // GET /api/questoes - Listar questões com filtros
  http.get(`${API_BASE}/questoes`, ({ request }) => {
    const url = new URL(request.url)
    const concursoId = url.searchParams.get('concursoId')
    const disciplina = url.searchParams.get('disciplina')
    const nivel = url.searchParams.get('nivel')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filteredQuestoes = [...mockQuestoes]

    if (concursoId) {
      filteredQuestoes = filteredQuestoes.filter(q => q.concursoId === concursoId)
    }

    if (disciplina) {
      filteredQuestoes = filteredQuestoes.filter(q => q.disciplina === disciplina)
    }

    if (nivel) {
      filteredQuestoes = filteredQuestoes.filter(q => q.nivelDificuldade === nivel)
    }

    if (search) {
      filteredQuestoes = filteredQuestoes.filter(q => 
        q.enunciado.toLowerCase().includes(search.toLowerCase()) ||
        q.disciplina.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedQuestoes = filteredQuestoes.slice(startIndex, endIndex)

    return HttpResponse.json({
      questoes: paginatedQuestoes,
      total: filteredQuestoes.length,
      page,
      limit,
      totalPages: Math.ceil(filteredQuestoes.length / limit)
    })
  }),

  // GET /api/questoes/:id - Buscar questão específica
  http.get(`${API_BASE}/questoes/:id`, ({ params }) => {
    const questao = mockQuestoes.find(q => q.id === params.id)
    
    if (!questao) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(questao)
  }),

  // POST /api/questoes - Criar nova questão
  http.post(`${API_BASE}/questoes`, async ({ request }) => {
    const novaQuestao = await request.json() as Partial<QuestaoFactory>
    const questaoCompleta = createQuestao({
      ...novaQuestao,
      id: `questao-${Date.now()}`
    })

    mockQuestoes.push(questaoCompleta)
    return HttpResponse.json(questaoCompleta, { status: 201 })
  }),

  // PUT /api/questoes/:id - Atualizar questão
  http.put(`${API_BASE}/questoes/:id`, async ({ params, request }) => {
    const index = mockQuestoes.findIndex(q => q.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const dadosAtualizados = await request.json()
    mockQuestoes[index] = { ...mockQuestoes[index], ...dadosAtualizados }
    
    return HttpResponse.json(mockQuestoes[index])
  }),

  // DELETE /api/questoes/:id - Remover questão
  http.delete(`${API_BASE}/questoes/:id`, ({ params }) => {
    const index = mockQuestoes.findIndex(q => q.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockQuestoes.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/questoes/bulk - Importar múltiplas questões
  http.post(`${API_BASE}/questoes/bulk`, async ({ request }) => {
    const { questoes } = await request.json() as { questoes: Partial<QuestaoFactory>[] }
    
    const questoesCompletas = questoes.map(q => createQuestao({
      ...q,
      id: `questao-${Date.now()}-${Math.random()}`
    }))

    mockQuestoes.push(...questoesCompletas)
    return HttpResponse.json({ 
      imported: questoesCompletas.length,
      questoes: questoesCompletas 
    }, { status: 201 })
  })
]

// ===== HANDLERS PARA SESSÕES DE ESTUDO =====

export const sessoesHandlers = [
  // GET /api/sessoes-estudo - Listar sessões
  http.get(`${API_BASE}/sessoes-estudo`, ({ request }) => {
    const url = new URL(request.url)
    const concursoId = url.searchParams.get('concursoId')
    const completo = url.searchParams.get('completo')

    let filteredSessoes = [...mockSessoes]

    if (concursoId) {
      filteredSessoes = filteredSessoes.filter(s => s.id.includes(concursoId))
    }

    if (completo !== null) {
      filteredSessoes = filteredSessoes.filter(s => s.completo === (completo === 'true'))
    }

    return HttpResponse.json(filteredSessoes)
  }),

  // POST /api/sessoes-estudo - Criar nova sessão
  http.post(`${API_BASE}/sessoes-estudo`, async ({ request }) => {
    const novaSessao = await request.json() as Partial<SessaoEstudoFactory>
    const sessaoCompleta = createSessaoEstudo({
      ...novaSessao,
      id: `sessao-${Date.now()}`
    })

    mockSessoes.push(sessaoCompleta)
    return HttpResponse.json(sessaoCompleta, { status: 201 })
  }),

  // PUT /api/sessoes-estudo/:id - Atualizar sessão
  http.put(`${API_BASE}/sessoes-estudo/:id`, async ({ params, request }) => {
    const index = mockSessoes.findIndex(s => s.id === params.id)
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const dadosAtualizados = await request.json()
    mockSessoes[index] = { ...mockSessoes[index], ...dadosAtualizados }
    
    return HttpResponse.json(mockSessoes[index])
  })
]

// ===== HANDLERS PARA HISTÓRICO DE SIMULADOS =====

export const historicoHandlers = [
  // GET /api/historico-simulados - Buscar histórico
  http.get(`${API_BASE}/historico-simulados`, () => {
    return HttpResponse.json(mockHistorico)
  }),

  // POST /api/historico-simulados - Adicionar tentativa
  http.post(`${API_BASE}/historico-simulados`, async ({ request }) => {
    const { identificador, titulo, totalQuestoes, acertos, percentual } = await request.json()
    
    if (!mockHistorico[identificador]) {
      mockHistorico[identificador] = {
        titulo,
        totalQuestoes,
        tentativas: []
      }
    }

    mockHistorico[identificador].tentativas.push({
      timestamp: new Date().toISOString(),
      acertos,
      percentual
    })

    return HttpResponse.json(mockHistorico[identificador], { status: 201 })
  })
]

// ===== HANDLERS DE ERRO PARA TESTES =====

export const errorHandlers = [
  // Simular erro de servidor
  http.get(`${API_BASE}/concursos/error`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  // Simular timeout
  http.get(`${API_BASE}/questoes/timeout`, () => {
    return new Promise(() => {}) // Never resolves
  }),

  // Simular erro de validação
  http.post(`${API_BASE}/questoes/validation-error`, () => {
    return HttpResponse.json(
      { error: 'Dados inválidos', details: ['Enunciado é obrigatório'] },
      { status: 400 }
    )
  })
]

// ===== EXPORT CONSOLIDADO =====

export const estudosConcursosHandlers = [
  ...concursosHandlers,
  ...questoesHandlers,
  ...sessoesHandlers,
  ...historicoHandlers,
  ...errorHandlers
]

// Utilities para testes
export const resetMockData = () => {
  mockConcursos = createList(createConcurso, 5)
  mockQuestoes = createList(createQuestao, 50)
  mockSessoes = createList(createSessaoEstudo, 20)
  mockHistorico = {
    'Simulado Direito|20': createHistoricoSimulado(),
    'Simulado Português|15': createHistoricoSimulado()
  }
}

export const getMockData = () => ({
  concursos: mockConcursos,
  questoes: mockQuestoes,
  sessoes: mockSessoes,
  historico: mockHistorico
})
