'use client'

import { useState } from 'react'
import { Clock, Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { useMealPlans, useCreateMealPlan, useUpdateMealPlan, useDeleteMealPlan, useToggleMealPlan } from '@/app/lib/hooks/useMealPlans'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

export function PlanejadorRefeicoesV2() {
  const [novoPlano, setNovoPlano] = useState({ time: '', description: '' })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoPlano, setEditandoPlano] = useState({ time: '', description: '' })

  // React Query hooks
  const { data: planos, isLoading, error } = useMealPlans()
  const createMealPlan = useCreateMealPlan()
  const updateMealPlan = useUpdateMealPlan()
  const deleteMealPlan = useDeleteMealPlan()
  const toggleMealPlan = useToggleMealPlan()

  // Fallback para localStorage
  const fallbackStore = useAlimentacaoStore()

  // Determinar qual fonte de dados usar
  const isOnline = !error && planos
  const planosRefeicao = isOnline ? planos : fallbackStore.planosRefeicao

  const handleAdicionarPlano = async () => {
    if (novoPlano.time && novoPlano.description) {
      try {
        await createMealPlan.mutateAsync(novoPlano)
        setNovoPlano({ time: '', description: '' })
      } catch (error) {
        console.error('Erro ao adicionar plano:', error)
      }
    }
  }

  const handleEditarPlano = (id: string, time: string, description: string) => {
    setEditandoId(id)
    setEditandoPlano({ time, description })
  }

  const handleSalvarEdicao = async () => {
    if (editandoId && editandoPlano.time && editandoPlano.description) {
      try {
        await updateMealPlan.mutateAsync({
          id: editandoId,
          time: editandoPlano.time,
          description: editandoPlano.description,
        })
        setEditandoId(null)
        setEditandoPlano({ time: '', description: '' })
      } catch (error) {
        console.error('Erro ao editar plano:', error)
      }
    }
  }

  const handleCancelarEdicao = () => {
    setEditandoId(null)
    setEditandoPlano({ time: '', description: '' })
  }

  const handleRemoverPlano = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este plano?')) {
      try {
        await deleteMealPlan.mutateAsync(id)
      } catch (error) {
        console.error('Erro ao remover plano:', error)
      }
    }
  }

  const handleToggleAtivo = async (id: string, currentStatus: boolean) => {
    try {
      toggleMealPlan.mutate(id, currentStatus)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com indicador de status */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Planejador de Refeições
        </h3>
        {/* Indicador de status */}
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-yellow-500'
        }`} title={isOnline ? 'Online' : 'Offline'} />
        {!isOnline && (
          <span className="text-sm text-yellow-600 dark:text-yellow-400">
            (Modo offline)
          </span>
        )}
      </div>

      {/* Formulário para adicionar novo plano */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Adicionar Novo Plano
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Horário
            </label>
            <input
              type="time"
              value={novoPlano.time}
              onChange={(e) => setNovoPlano({ ...novoPlano, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Café da manhã com frutas"
              value={novoPlano.description}
              onChange={(e) => setNovoPlano({ ...novoPlano, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAdicionarPlano}
              disabled={!novoPlano.time || !novoPlano.description || createMealPlan.isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMealPlan.isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de planos */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          Planos Ativos ({planosRefeicao?.filter(p => p.is_active).length || 0})
        </h4>
        
        {planosRefeicao?.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum plano de refeição cadastrado</p>
            <p className="text-sm">Adicione seu primeiro plano acima</p>
          </div>
        ) : (
          planosRefeicao?.map((plano) => (
            <div
              key={plano.id}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg border ${
                plano.is_active 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              {editandoId === plano.id ? (
                // Modo de edição
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="time"
                    value={editandoPlano.time}
                    onChange={(e) => setEditandoPlano({ ...editandoPlano, time: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    value={editandoPlano.description}
                    onChange={(e) => setEditandoPlano({ ...editandoPlano, description: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSalvarEdicao}
                      disabled={updateMealPlan.isLoading}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {updateMealPlan.isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelarEdicao}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plano.time}
                      </span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.description}
                    </span>
                    {!plano.is_active && (
                      <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        Inativo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAtivo(plano.id, plano.is_active)}
                      disabled={toggleMealPlan.isLoading}
                      className={`px-3 py-1 text-xs rounded ${
                        plano.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                      } disabled:opacity-50`}
                    >
                      {plano.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <button
                      onClick={() => handleEditarPlano(plano.id, plano.time, plano.description)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Editar plano"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRemoverPlano(plano.id)}
                      disabled={deleteMealPlan.isLoading}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                      title="Remover plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400 text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          Usando dados locais. Verifique sua conexão para sincronizar.
        </div>
      )}
    </div>
  )
}
