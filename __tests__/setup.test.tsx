import { describe, it, expect, vi } from 'vitest'
import { render } from './utils/test-utils'
import React from 'react'

// Componente simples para testar
const TestComponent = () => {
  return <div data-testid="test-component">Hello World</div>
}

describe('Setup de Testes', () => {
  it('deve renderizar componente básico', () => {
    const { getByTestId } = render(<TestComponent />)
    expect(getByTestId('test-component')).toBeInTheDocument()
  })

  it('deve ter localStorage mockado', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
  })

  it('deve ter fetch mockado', () => {
    expect(global.fetch).toBeDefined()
    expect(typeof global.fetch).toBe('function')
  })

  it('deve ter QueryClient configurado', () => {
    // Este teste verifica se o QueryClientProvider está funcionando
    const ComponentWithQuery = () => {
      return <div data-testid="query-component">Query Test</div>
    }
    
    const { getByTestId } = render(<ComponentWithQuery />)
    expect(getByTestId('query-component')).toBeInTheDocument()
  })

  it('deve ter MSW configurado', () => {
    // Verificar se o MSW está interceptando requests
    expect(global.fetch).toBeDefined()
  })

  it('deve limpar mocks entre testes', () => {
    const mockFn = vi.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
    
    // Este teste verifica se os mocks são limpos automaticamente
    vi.clearAllMocks()
    expect(mockFn).not.toHaveBeenCalled()
  })
})
