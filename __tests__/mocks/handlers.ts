import { http, HttpResponse } from 'msw'
import { createTestData } from '../utils/test-utils'

// Base URL para APIs do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'

// Handlers para APIs de Hiperfocos
export const hiperfocosHandlers = [
  // GET /rest/v1/hiperfocos
  http.get(`${SUPABASE_URL}/rest/v1/hiperfocos`, () => {
    return HttpResponse.json([
      createTestData.hiperfoco(),
      createTestData.hiperfoco({
        id: 'hiperfoco-2',
        titulo: 'Segundo Hiperfoco',
        cor: '#E91E63',
      }),
    ])
  }),

  // POST /rest/v1/hiperfocos
  http.post(`${SUPABASE_URL}/rest/v1/hiperfocos`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      createTestData.hiperfoco({
        id: 'new-hiperfoco-id',
        ...body,
      }),
      { status: 201 }
    )
  }),

  // PATCH /rest/v1/hiperfocos
  http.patch(`${SUPABASE_URL}/rest/v1/hiperfocos`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      createTestData.hiperfoco({
        ...body,
        updated_at: new Date().toISOString(),
      })
    )
  }),

  // DELETE /rest/v1/hiperfocos
  http.delete(`${SUPABASE_URL}/rest/v1/hiperfocos`, () => {
    return HttpResponse.json({}, { status: 204 })
  }),
]

// Handlers para APIs de Tarefas
export const tarefasHandlers = [
  // GET /rest/v1/tarefas
  http.get(`${SUPABASE_URL}/rest/v1/tarefas`, () => {
    return HttpResponse.json([
      createTestData.tarefa(),
      createTestData.tarefa({
        id: 'tarefa-2',
        titulo: 'Segunda Tarefa',
        ordem: 1,
      }),
    ])
  }),

  // POST /rest/v1/tarefas
  http.post(`${SUPABASE_URL}/rest/v1/tarefas`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      createTestData.tarefa({
        id: 'new-tarefa-id',
        ...body,
      }),
      { status: 201 }
    )
  }),

  // PATCH /rest/v1/tarefas
  http.patch(`${SUPABASE_URL}/rest/v1/tarefas`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      createTestData.tarefa({
        ...body,
        updated_at: new Date().toISOString(),
      })
    )
  }),

  // DELETE /rest/v1/tarefas
  http.delete(`${SUPABASE_URL}/rest/v1/tarefas`, () => {
    return HttpResponse.json({}, { status: 204 })
  }),
]

// Handlers para APIs de Sessões
export const sessoesHandlers = [
  // GET /rest/v1/sessoes
  http.get(`${SUPABASE_URL}/rest/v1/sessoes`, () => {
    return HttpResponse.json([
      createTestData.sessao(),
      createTestData.sessao({
        id: 'sessao-2',
        tipo: 'pausa',
        duracao_planejada: 5,
      }),
    ])
  }),

  // POST /rest/v1/sessoes
  http.post(`${SUPABASE_URL}/rest/v1/sessoes`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      createTestData.sessao({
        id: 'new-sessao-id',
        ...body,
      }),
      { status: 201 }
    )
  }),

  // PATCH /rest/v1/sessoes
  http.patch(`${SUPABASE_URL}/rest/v1/sessoes`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      createTestData.sessao({
        ...body,
        updated_at: new Date().toISOString(),
      })
    )
  }),
]

// Handlers para autenticação
export const authHandlers = [
  // POST /auth/v1/token
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = await request.json()
    
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: createTestData.user(),
      })
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 400 }
    )
  }),

  // GET /auth/v1/user
  http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(createTestData.user())
    }
    
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }),

  // POST /auth/v1/logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({}, { status: 204 })
  }),
]

// Handlers para conectividade (usado em testes de status online)
export const connectivityHandlers = [
  // GET para teste de conectividade
  http.get('https://www.google.com/generate_204', () => {
    return HttpResponse.text('', { status: 204 })
  }),

  // GET para teste de conectividade alternativo
  http.get('https://httpbin.org/status/200', () => {
    return HttpResponse.json({ status: 'ok' })
  }),
]

// Handlers para erros simulados
export const errorHandlers = [
  // Simular erro de rede
  http.get(`${SUPABASE_URL}/rest/v1/error-network`, () => {
    return HttpResponse.error()
  }),

  // Simular erro 500
  http.get(`${SUPABASE_URL}/rest/v1/error-500`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  // Simular erro 404
  http.get(`${SUPABASE_URL}/rest/v1/error-404`, () => {
    return HttpResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    )
  }),

  // Simular timeout
  http.get(`${SUPABASE_URL}/rest/v1/error-timeout`, async () => {
    await new Promise(resolve => setTimeout(resolve, 30000))
    return HttpResponse.json({ data: 'This should timeout' })
  }),
]

// Todos os handlers combinados
export const handlers = [
  ...hiperfocosHandlers,
  ...tarefasHandlers,
  ...sessoesHandlers,
  ...authHandlers,
  ...connectivityHandlers,
  ...errorHandlers,
]
