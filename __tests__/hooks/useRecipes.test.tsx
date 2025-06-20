import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRecipes, useCreateRecipe, useDeleteRecipe, useToggleFavoriteRecipe } from '@/app/lib/hooks/useRecipes'

// Mock do service
vi.mock('@/app/lib/services/alimentacao', () => ({
  alimentacaoService: {
    getRecipes: vi.fn(),
    createRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
    addFavoriteRecipe: vi.fn(),
    removeFavoriteRecipe: vi.fn(),
  }
}))

// Wrapper com QueryClient para testes
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useRecipes hooks', () => {
  let mockService: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Obter referência ao mock do service
    const { alimentacaoService } = await import('@/app/lib/services/alimentacao')
    mockService = alimentacaoService
  })

  describe('useRecipes', () => {
    it('deve buscar receitas com sucesso', async () => {
      const mockRecipes = [
        {
          id: '1',
          user_id: 'user1',
          name: 'Receita Teste',
          description: 'Descrição teste',
          prep_time_minutes: 30,
          servings: 4,
          instructions: ['Passo 1', 'Passo 2'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          ingredients: [],
          tags: [],
          is_favorite: false,
        }
      ]

      mockService.getRecipes.mockResolvedValue(mockRecipes)

      const { result } = renderHook(() => useRecipes(), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockRecipes)
      expect(mockService.getRecipes).toHaveBeenCalledWith(undefined)
    })

    it('deve buscar receitas com filtros', async () => {
      const filters = {
        category: 'Sobremesa',
        prepTimeMax: 30,
        servings: 2,
      }

      mockService.getRecipes.mockResolvedValue([])

      const { result } = renderHook(() => useRecipes(filters), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockService.getRecipes).toHaveBeenCalledWith(filters)
    })

    it('deve lidar com erro ao buscar receitas', async () => {
      mockService.getRecipes.mockRejectedValue(new Error('Erro de rede'))

      const { result } = renderHook(() => useRecipes(), {
        wrapper: TestWrapper,
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('useCreateRecipe', () => {
    it('deve criar receita com sucesso', async () => {
      const newRecipe = {
        id: '2',
        user_id: 'user1',
        name: 'Nova Receita',
        description: 'Nova descrição',
        prep_time_minutes: 45,
        servings: 6,
        instructions: ['Novo passo 1'],
        created_at: '2024-01-15T11:00:00Z',
        updated_at: '2024-01-15T11:00:00Z',
        ingredients: [],
        tags: [],
        is_favorite: false,
      }

      const recipeData = {
        name: 'Nova Receita',
        description: 'Nova descrição',
        prep_time_minutes: 45,
        servings: 6,
        instructions: ['Novo passo 1'],
        ingredients: [
          { name: 'Ingrediente 1', quantity: 2, unit: 'xícaras' }
        ],
        tags: ['tag1', 'tag2'],
      }

      mockService.createRecipe.mockResolvedValue(newRecipe)

      const { result } = renderHook(() => useCreateRecipe(), {
        wrapper: TestWrapper,
      })

      result.current.mutate(recipeData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(newRecipe)
      expect(mockService.createRecipe).toHaveBeenCalledWith(recipeData)
    })

    it('deve lidar com erro ao criar receita', async () => {
      mockService.createRecipe.mockRejectedValue(new Error('Erro ao criar'))

      const { result } = renderHook(() => useCreateRecipe(), {
        wrapper: TestWrapper,
      })

      const recipeData = {
        name: 'Receita com erro',
        instructions: ['Passo 1'],
        ingredients: [],
        tags: [],
      }

      result.current.mutate(recipeData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('useDeleteRecipe', () => {
    it('deve deletar receita com sucesso', async () => {
      mockService.deleteRecipe.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteRecipe(), {
        wrapper: TestWrapper,
      })

      result.current.mutate('recipe-id')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockService.deleteRecipe).toHaveBeenCalledWith('recipe-id')
    })

    it('deve lidar com erro ao deletar receita', async () => {
      mockService.deleteRecipe.mockRejectedValue(new Error('Erro ao deletar'))

      const { result } = renderHook(() => useDeleteRecipe(), {
        wrapper: TestWrapper,
      })

      result.current.mutate('recipe-id')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('useToggleFavoriteRecipe', () => {
    it('deve adicionar receita aos favoritos', async () => {
      mockService.addFavoriteRecipe.mockResolvedValue(undefined)

      const { result } = renderHook(() => useToggleFavoriteRecipe(), {
        wrapper: TestWrapper,
      })

      result.current.mutate({
        recipeId: 'recipe-id',
        isFavorite: false, // Não é favorita, então vai adicionar
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockService.addFavoriteRecipe).toHaveBeenCalledWith('recipe-id')
    })

    it('deve remover receita dos favoritos', async () => {
      mockService.removeFavoriteRecipe.mockResolvedValue(undefined)

      const { result } = renderHook(() => useToggleFavoriteRecipe(), {
        wrapper: TestWrapper,
      })

      result.current.mutate({
        recipeId: 'recipe-id',
        isFavorite: true, // É favorita, então vai remover
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockService.removeFavoriteRecipe).toHaveBeenCalledWith('recipe-id')
    })

    it('deve lidar com erro ao alterar favorito', async () => {
      mockService.addFavoriteRecipe.mockRejectedValue(new Error('Erro ao favoritar'))

      const { result } = renderHook(() => useToggleFavoriteRecipe(), {
        wrapper: TestWrapper,
      })

      result.current.mutate({
        recipeId: 'recipe-id',
        isFavorite: false,
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('Cache e invalidação', () => {
    it('deve invalidar cache após criar receita', async () => {
      const newRecipe = {
        id: '3',
        user_id: 'user1',
        name: 'Receita Cache',
        instructions: ['Passo 1'],
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        ingredients: [],
        tags: [],
        is_favorite: false,
      }

      mockService.createRecipe.mockResolvedValue(newRecipe)
      mockService.getRecipes.mockResolvedValue([newRecipe])

      const { result: createResult } = renderHook(() => useCreateRecipe(), {
        wrapper: TestWrapper,
      })

      const { result: listResult } = renderHook(() => useRecipes(), {
        wrapper: TestWrapper,
      })

      // Criar receita
      createResult.current.mutate({
        name: 'Receita Cache',
        instructions: ['Passo 1'],
        ingredients: [],
        tags: [],
      })

      await waitFor(() => {
        expect(createResult.current.isSuccess).toBe(true)
      })

      // Verificar se a lista foi invalidada e recarregada
      await waitFor(() => {
        expect(listResult.current.data).toEqual([newRecipe])
      })
    })
  })
})
