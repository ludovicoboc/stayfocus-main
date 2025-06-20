import { setupServer } from 'msw/node'
import { http } from 'msw'
import { handlers } from './handlers'

// Configurar o servidor MSW para testes
export const server = setupServer(...handlers)

// Configurações para diferentes cenários de teste
export const serverConfig = {
  // Configuração padrão (sucesso)
  success: () => {
    server.use(...handlers)
  },

  // Configuração para simular erros de rede
  networkError: () => {
    server.use(
      ...handlers.map(handler => {
        // Substituir todos os handlers por erros de rede
        return handler.clone({
          resolver: () => {
            throw new Error('Network Error')
          }
        })
      })
    )
  },

  // Configuração para simular lentidão na rede
  slowNetwork: (delay = 2000) => {
    server.use(
      ...handlers.map(handler => {
        return handler.clone({
          resolver: async (info) => {
            await new Promise(resolve => setTimeout(resolve, delay))
            return handler.resolver(info)
          }
        })
      })
    )
  },

  // Configuração para simular modo offline
  offline: () => {
    server.use(
      ...handlers.map(handler => {
        return handler.clone({
          resolver: () => {
            return new Response(null, {
              status: 0,
              statusText: 'Network request failed'
            })
          }
        })
      })
    )
  },

  // Configuração para simular erros específicos
  withErrors: (statusCode = 500, message = 'Internal Server Error') => {
    server.use(
      ...handlers.map(handler => {
        return handler.clone({
          resolver: () => {
            return new Response(
              JSON.stringify({ error: message }),
              {
                status: statusCode,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
          }
        })
      })
    )
  },

  // Resetar para configuração padrão
  reset: () => {
    server.resetHandlers(...handlers)
  },
}

// Utilities para testes específicos
export const testScenarios = {
  // Cenário: usuário não autenticado
  unauthenticated: () => {
    server.use(
      http.get('*/auth/v1/user', () => {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401 }
        )
      })
    )
  },

  // Cenário: dados vazios
  emptyData: () => {
    server.use(
      http.get('*/rest/v1/*', () => {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )
  },

  // Cenário: dados corrompidos
  corruptedData: () => {
    server.use(
      http.get('*/rest/v1/*', () => {
        return new Response('invalid json{', {
          headers: { 'Content-Type': 'application/json' }
        })
      })
    )
  },

  // Cenário: rate limiting
  rateLimited: () => {
    server.use(
      http.all('*/rest/v1/*', () => {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        )
      })
    )
  },
}

// Helper para criar handlers customizados em testes
export const createCustomHandler = (method: string, url: string, response: any, status = 200) => {
  const httpMethod = http[method.toLowerCase() as keyof typeof http] as any
  
  return httpMethod(url, () => {
    return new Response(JSON.stringify(response), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  })
}

// Helper para simular delays específicos
export const withDelay = (handler: any, delay: number) => {
  return handler.clone({
    resolver: async (info: any) => {
      await new Promise(resolve => setTimeout(resolve, delay))
      return handler.resolver(info)
    }
  })
}

export default server
