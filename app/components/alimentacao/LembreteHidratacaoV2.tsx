'use client'

import { Droplet, PlusCircle, MinusCircle, Loader2 } from 'lucide-react'
import { useHydrationProgress, useAddGlass, useRemoveGlass } from '@/app/lib/hooks/useHydration'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'
import { useOnlineStatus } from '@/app/lib/hooks/useOnlineStatus'

export function LembreteHidratacaoV2() {
  // Usar React Query para dados do servidor
  const { data: progressData, isLoading, error } = useHydrationProgress()
  const addGlass = useAddGlass()
  const removeGlass = useRemoveGlass()

  // Status de conexão
  const { isOnline: connectionOnline } = useOnlineStatus()

  // Fallback para localStorage quando offline ou erro
  const fallbackStore = useAlimentacaoStore()

  // Determinar qual fonte de dados usar
  const isOnline = connectionOnline && !error && progressData
  const coposBebidos = isOnline 
    ? Math.floor(progressData.current / 250) // Converter ml para copos
    : fallbackStore.coposBebidos
  const metaDiaria = isOnline 
    ? Math.floor(progressData.goal / 250) // Converter ml para copos
    : fallbackStore.metaDiaria
  const progresso = isOnline 
    ? progressData.progress * 100
    : Math.min((coposBebidos / metaDiaria) * 100, 100)
  const ultimoRegistro = fallbackStore.ultimoRegistro // Manter do store local por simplicidade

  const handleAdicionarCopo = () => {
    if (coposBebidos < metaDiaria) {
      addGlass.mutate()
    }
  }

  const handleRemoverCopo = () => {
    if (coposBebidos > 0) {
      removeGlass.mutate()
    }
  }

  const handleAjustarMeta = (valor: number) => {
    // Por enquanto, usar apenas o store local para ajuste de meta
    fallbackStore.ajustarMeta(valor)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="animate-pulse flex space-x-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com indicador de status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Acompanhamento de Hidratação
            </h3>
            {/* Indicador de status */}
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-yellow-500'
            }`} title={isOnline ? 'Online' : 'Offline'} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registre os copos de água que você bebe durante o dia
            {!isOnline && (
              <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                (Modo offline)
              </span>
            )}
          </p>
        </div>
        
        {/* Controles de meta */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAjustarMeta(-1)}
            disabled={metaDiaria <= 1}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            aria-label="Diminuir meta diária"
          >
            <MinusCircle className="h-6 w-6" />
          </button>
          
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Meta: {metaDiaria} copos
            </span>
          </div>
          
          <button
            onClick={() => handleAjustarMeta(1)}
            disabled={metaDiaria >= 15}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            aria-label="Aumentar meta diária"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progresso}%` }}
          role="progressbar"
          aria-valuenow={coposBebidos}
          aria-valuemin={0}
          aria-valuemax={metaDiaria}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {coposBebidos} de {metaDiaria} copos
          {ultimoRegistro && (
            <span className="ml-2">
              (Último: {ultimoRegistro})
            </span>
          )}
        </div>
        
        <div className="text-blue-600 dark:text-blue-400">
          {progresso.toFixed(0)}%
        </div>
      </div>

      {/* Visualização dos copos */}
      <div className="flex flex-wrap gap-2 my-4 justify-center">
        {Array.from({ length: metaDiaria }).map((_, index) => (
          <div
            key={index}
            className={`w-12 h-16 flex items-center justify-center rounded-b-lg border border-t-0 ${
              index < coposBebidos
                ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700'
            }`}
            aria-label={index < coposBebidos ? 'Copo bebido' : 'Copo não bebido'}
          >
            <Droplet
              className={`h-8 w-8 ${
                index < coposBebidos
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleAdicionarCopo}
          disabled={coposBebidos >= metaDiaria || addGlass.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Registrar um copo de água"
        >
          {addGlass.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            'Registrar Copo'
          )}
        </button>
        
        <button
          onClick={handleRemoverCopo}
          disabled={coposBebidos <= 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remover um copo de água"
        >
          Remover Copo
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
          Usando dados locais. Verifique sua conexão.
        </div>
      )}
    </div>
  )
}
