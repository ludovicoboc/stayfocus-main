# 🧩 TEMPLATES DE CÓDIGO - ESTUDOS E CONCURSOS

## 🎯 OBJETIVO

Templates reutilizáveis seguindo padrões TDD estabelecidos para acelerar o desenvolvimento de novos componentes e funcionalidades no módulo de Estudos e Concursos.

---

## 🏗️ TEMPLATE: NOVO STORE ZUSTAND

### Estrutura Base
```typescript
// app/stores/[nome]Store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface [Nome] {
  id: string
  // ... outros campos
  createdAt: string
  updatedAt: string
}

interface [Nome]Store {
  items: [Nome][]
  loading: boolean
  error: string | null
  
  // Actions CRUD
  adicionar[Nome]: (item: Omit<[Nome], 'id' | 'createdAt' | 'updatedAt'>) => void
  atualizar[Nome]: (id: string, updates: Partial<[Nome]>) => void
  remover[Nome]: (id: string) => void
  buscar[Nome]PorId: (id: string) => [Nome] | undefined
  
  // Actions específicas
  // ... adicionar conforme necessário
  
  // Utilities
  reset: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const use[Nome]Store = create<[Nome]Store>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      adicionar[Nome]: (novoItem) => set((state) => ({
        items: [
          ...state.items,
          {
            ...novoItem,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      })),

      atualizar[Nome]: (id, updates) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
      })),

      remover[Nome]: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),

      buscar[Nome]PorId: (id) => {
        return get().items.find((item) => item.id === id)
      },

      reset: () => set({
        items: [],
        loading: false,
        error: null
      }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error })
    }),
    {
      name: '[nome]-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### Teste do Store
```typescript
// __tests__/hooks/use[Nome].test.ts
import { renderHook, act } from '@testing-library/react'
import { use[Nome]Store } from '@/stores/[nome]Store'
import { create[Nome] } from '@/factories/estudos-concursos'

describe('use[Nome]Store', () => {
  beforeEach(() => {
    use[Nome]Store.getState().reset()
  })

  describe('🔴 RED: CRUD Operations', () => {
    it('deve adicionar novo item', () => {
      const { result } = renderHook(() => use[Nome]Store())
      const novoItem = create[Nome]()

      act(() => {
        result.current.adicionar[Nome](novoItem)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]).toMatchObject(novoItem)
    })

    it('deve atualizar item existente', () => {
      const item = create[Nome]()
      const { result } = renderHook(() => use[Nome]Store())

      act(() => {
        result.current.adicionar[Nome](item)
        result.current.atualizar[Nome](result.current.items[0].id, { 
          // ... campos a atualizar
        })
      })

      expect(result.current.items[0]).toMatchObject({
        ...item,
        // ... campos atualizados
      })
    })

    it('deve remover item', () => {
      const item = create[Nome]()
      const { result } = renderHook(() => use[Nome]Store())

      act(() => {
        result.current.adicionar[Nome](item)
        result.current.remover[Nome](result.current.items[0].id)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('🟢 GREEN: Advanced Operations', () => {
    it('deve buscar item por ID', () => {
      const item = create[Nome]()
      const { result } = renderHook(() => use[Nome]Store())

      act(() => {
        result.current.adicionar[Nome](item)
      })

      const found = result.current.buscar[Nome]PorId(result.current.items[0].id)
      expect(found).toBeDefined()
    })
  })
})
```

---

## 🎨 TEMPLATE: COMPONENTE FORM

### Estrutura Base
```typescript
// app/components/[modulo]/[Nome]Form.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { use[Nome]Store, type [Nome] } from '@/stores/[nome]Store'

interface [Nome]FormProps {
  isOpen: boolean
  onClose: () => void
  itemParaEditar?: [Nome] | null
}

export function [Nome]Form({ isOpen, onClose, itemParaEditar }: [Nome]FormProps) {
  const { adicionar[Nome], atualizar[Nome] } = use[Nome]Store()
  
  const [formData, setFormData] = useState({
    // ... campos do formulário
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Preencher formulário para edição
  useEffect(() => {
    if (itemParaEditar) {
      setFormData({
        // ... mapear campos do item
      })
    } else {
      setFormData({
        // ... valores padrão
      })
    }
  }, [itemParaEditar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Validações específicas
    if (!formData.campo1) {
      newErrors.campo1 = 'Campo obrigatório'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      if (itemParaEditar) {
        atualizar[Nome](itemParaEditar.id, formData)
      } else {
        adicionar[Nome](formData)
      }
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setErrors({ submit: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemParaEditar ? 'Editar [Nome]' : 'Novo [Nome]'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Campo 1"
          name="campo1"
          value={formData.campo1}
          onChange={handleChange}
          error={errors.campo1}
          required
        />
        
        {/* Adicionar outros campos conforme necessário */}
        
        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

### Teste do Componente
```typescript
// __tests__/components/[modulo]/[Nome]Form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { [Nome]Form } from '@/components/[modulo]/[Nome]Form'
import { use[Nome]Store } from '@/stores/[nome]Store'
import { create[Nome] } from '@/factories/estudos-concursos'

vi.mock('@/stores/[nome]Store')
const mockUse[Nome]Store = use[Nome]Store as vi.MockedFunction<typeof use[Nome]Store>

describe('[Nome]Form', () => {
  const mockAdicionar = vi.fn()
  const mockAtualizar = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUse[Nome]Store.mockReturnValue({
      items: [],
      adicionar[Nome]: mockAdicionar,
      atualizar[Nome]: mockAtualizar,
      // ... outros mocks
    })
  })

  describe('🔴 RED: Form Rendering', () => {
    it('deve renderizar formulário vazio', () => {
      render(<[Nome]Form isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText(/novo \[nome\]/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/campo 1/i)).toBeInTheDocument()
    })

    it('deve renderizar formulário preenchido para edição', () => {
      const item = create[Nome]()
      
      render(
        <[Nome]Form 
          isOpen={true} 
          onClose={mockOnClose}
          itemParaEditar={item}
        />
      )
      
      expect(screen.getByText(/editar \[nome\]/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue(item.campo1)).toBeInTheDocument()
    })
  })

  describe('🟢 GREEN: Form Validation', () => {
    it('deve validar campos obrigatórios', async () => {
      const user = userEvent.setup()
      render(<[Nome]Form isOpen={true} onClose={mockOnClose} />)

      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      expect(screen.getByText(/campo obrigatório/i)).toBeInTheDocument()
    })

    it('deve submeter formulário válido', async () => {
      const user = userEvent.setup()
      render(<[Nome]Form isOpen={true} onClose={mockOnClose} />)

      await user.type(screen.getByLabelText(/campo 1/i), 'Valor teste')
      
      const submitButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAdicionar).toHaveBeenCalledWith(
          expect.objectContaining({
            campo1: 'Valor teste'
          })
        )
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })
})
```

---

## 🔌 TEMPLATE: API SERVICE

### Estrutura Base
```typescript
// app/services/[nome]Api.ts
import { [Nome] } from '@/stores/[nome]Store'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

class [Nome]ApiService {
  async getAll(): Promise<[Nome][]> {
    const response = await fetch(`${API_BASE}/[nome-plural]`)
    if (!response.ok) {
      throw new Error('Erro ao buscar [nome-plural]')
    }
    return response.json()
  }

  async getById(id: string): Promise<[Nome]> {
    const response = await fetch(`${API_BASE}/[nome-plural]/${id}`)
    if (!response.ok) {
      throw new Error('[Nome] não encontrado')
    }
    return response.json()
  }

  async create(data: Omit<[Nome], 'id' | 'createdAt' | 'updatedAt'>): Promise<[Nome]> {
    const response = await fetch(`${API_BASE}/[nome-plural]`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erro ao criar [nome]')
    }
    
    return response.json()
  }

  async update(id: string, data: Partial<[Nome]>): Promise<[Nome]> {
    const response = await fetch(`${API_BASE}/[nome-plural]/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar [nome]')
    }
    
    return response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/[nome-plural]/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Erro ao remover [nome]')
    }
  }

  async bulkCreate(items: Omit<[Nome], 'id' | 'createdAt' | 'updatedAt'>[]): Promise<[Nome][]> {
    const response = await fetch(`${API_BASE}/[nome-plural]/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })
    
    if (!response.ok) {
      throw new Error('Erro ao criar [nome-plural] em lote')
    }
    
    return response.json()
  }
}

export const [nome]Api = new [Nome]ApiService()
```

### Teste do Service
```typescript
// __tests__/services/[nome]Api.test.ts
import { vi } from 'vitest'
import { [nome]Api } from '@/services/[nome]Api'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { create[Nome], createList } from '@/factories/estudos-concursos'

describe('[Nome]Api', () => {
  describe('🔴 RED: API Operations', () => {
    it('deve buscar todos os itens', async () => {
      const mockItems = createList(create[Nome], 3)

      server.use(
        http.get('/api/[nome-plural]', () => HttpResponse.json(mockItems))
      )

      const result = await [nome]Api.getAll()
      expect(result).toEqual(mockItems)
    })

    it('deve criar novo item', async () => {
      const novoItem = create[Nome]()

      server.use(
        http.post('/api/[nome-plural]', async ({ request }) => {
          const body = await request.json()
          return HttpResponse.json({ ...body, id: 'novo-id' })
        })
      )

      const result = await [nome]Api.create(novoItem)
      expect(result.id).toBe('novo-id')
    })

    it('deve lidar com erros da API', async () => {
      server.use(
        http.get('/api/[nome-plural]', () => 
          new HttpResponse(null, { status: 500 })
        )
      )

      await expect([nome]Api.getAll()).rejects.toThrow()
    })
  })
})
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Para cada novo Store:
- [ ] Criar interface TypeScript
- [ ] Implementar store com Zustand + persist
- [ ] Adicionar actions CRUD básicas
- [ ] Criar factory para testes
- [ ] Escrever testes unitários
- [ ] Configurar MSW handlers
- [ ] Documentar API

### Para cada novo Componente:
- [ ] Criar componente funcional
- [ ] Implementar validações
- [ ] Adicionar acessibilidade
- [ ] Escrever testes TDD
- [ ] Testar responsividade
- [ ] Validar performance

### Para cada novo Service:
- [ ] Implementar métodos CRUD
- [ ] Adicionar tratamento de erros
- [ ] Configurar tipos TypeScript
- [ ] Escrever testes com MSW
- [ ] Documentar endpoints
- [ ] Implementar cache se necessário

---

## 🎯 PADRÕES DE QUALIDADE

### Nomenclatura
- **Stores**: `use[Nome]Store`
- **Components**: `[Nome]Form`, `[Nome]List`, `[Nome]Card`
- **Services**: `[nome]Api`
- **Types**: `[Nome]`, `[Nome]Store`
- **Tests**: `[Nome].test.tsx`

### Estrutura de Arquivos
```
app/
├── stores/[nome]Store.ts
├── components/[modulo]/[Nome]Form.tsx
├── services/[nome]Api.ts
└── types/[nome].ts

__tests__/
├── hooks/use[Nome].test.ts
├── components/[modulo]/[Nome]Form.test.tsx
├── services/[nome]Api.test.ts
└── factories/[nome].ts
```

### Métricas de Qualidade
- **Coverage**: > 80%
- **Performance**: < 100ms
- **Acessibilidade**: WCAG 2.1 AA
- **Bundle Size**: Otimizado com lazy loading
