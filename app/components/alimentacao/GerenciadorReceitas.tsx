'use client'

import { useState } from 'react'
import { Search, Plus, Heart, Clock, Users, Filter, Star } from 'lucide-react'
import {
  useRecipes,
  useSearchRecipes,
  useRecipeCategories,
  useFavoriteRecipes,
  useToggleFavoriteRecipe,
  useDeleteRecipe,
  RecipeFilters
} from '@/app/lib/hooks/useRecipes'
import type { Recipe } from '@/app/lib/dataProviders/types'

export function GerenciadorReceitas() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<RecipeFilters>({})
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Hooks do React Query
  const { data: recipes, isLoading, error } = useRecipes(filters)
  const { data: searchResults } = useSearchRecipes(searchQuery)
  const { data: categories } = useRecipeCategories()
  const { data: favoriteRecipes } = useFavoriteRecipes()
  const toggleFavorite = useToggleFavoriteRecipe()
  const deleteRecipe = useDeleteRecipe()

  // Determinar quais receitas mostrar
  const displayRecipes = searchQuery.length >= 2 
    ? searchResults 
    : showFavoritesOnly 
      ? favoriteRecipes 
      : recipes

  const handleToggleFavorite = (recipe: Recipe) => {
    toggleFavorite.mutate({
      recipeId: recipe.id,
      isFavorite: recipe.is_favorite
    })
  }

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta receita?')) {
      deleteRecipe.mutate(id)
    }
  }

  const handleFilterChange = (key: keyof RecipeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setShowFavoritesOnly(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Minhas Receitas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {displayRecipes?.length || 0} receitas encontradas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
              showFavoritesOnly
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favoritas
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 text-sm"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar receitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todas</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tempo máximo (min)
              </label>
              <input
                type="number"
                placeholder="Ex: 30"
                value={filters.prepTimeMax || ''}
                onChange={(e) => handleFilterChange('prepTimeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Porções
              </label>
              <input
                type="number"
                placeholder="Ex: 4"
                value={filters.servings || ''}
                onChange={(e) => handleFilterChange('servings', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Receitas */}
      {error && (
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          <p>Erro ao carregar receitas. Tente novamente.</p>
        </div>
      )}

      {!error && displayRecipes?.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Nenhuma receita encontrada</p>
          <p className="text-sm">
            {searchQuery ? 'Tente ajustar sua busca' : 'Comece criando sua primeira receita'}
          </p>
        </div>
      )}

      {!error && displayRecipes && displayRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Imagem */}
              {recipe.photo_url ? (
                <img
                  src={recipe.photo_url}
                  alt={recipe.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Star className="h-12 w-12 text-gray-400" />
                </div>
              )}

              {/* Conteúdo */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                    {recipe.name}
                  </h4>
                  <button
                    onClick={() => handleToggleFavorite(recipe)}
                    disabled={toggleFavorite.isPending}
                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-current text-red-500' : ''}`} />
                  </button>
                </div>

                {recipe.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                )}

                {/* Metadados */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {recipe.prep_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recipe.prep_time_minutes}min
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {recipe.servings} porções
                    </div>
                  )}
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                        +{recipe.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Ver Receita
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    disabled={deleteRecipe.isPending}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
