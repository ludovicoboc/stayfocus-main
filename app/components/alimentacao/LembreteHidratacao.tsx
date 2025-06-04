'use client'

import { useState, useEffect } from 'react'
import { Droplet, PlusCircle, MinusCircle } from 'lucide-react'

// Types for API data
type HidratacaoRegistro = {
  id: number;
  hora: string;
};

type HidratacaoApiResponse = {
  metaDiaria: number;
  coposBebidosHoje: number;
  registrosHoje?: HidratacaoRegistro[]; // Optional in some responses, but good to have
  ultimoReset?: string; // From GET /api/alimentacao/hidratacao
};

export function LembreteHidratacao() {
  const [coposBebidos, setCoposBebidos] = useState(0)
  const [metaDiaria, setMetaDiaria] = useState(8) // Default, will be fetched
  const [registrosHoje, setRegistrosHoje] = useState<HidratacaoRegistro[]>([])
  const [ultimoRegistroDisplay, setUltimoRegistroDisplay] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/alimentacao/hidratacao')
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`)
        }
        const data: HidratacaoApiResponse = await response.json()
        setMetaDiaria(data.metaDiaria)
        setCoposBebidos(data.coposBebidosHoje)
        // The GET /api/alimentacao/hidratacao doesn't directly return 'registrosHoje' in its main response structure
        // but the /copo endpoint does. For consistency, let's assume we need another call or adjust API.
        // For now, we'll rely on the count and fetch full records if needed, or assume `copo` calls will populate `registrosHoje`
        // Let's modify the GET /api/alimentacao/hidratacao to also return `registrosHoje` for this to work smoothly.
        // Assuming for now it's part of the response or we make another call.
        // For this refactor, let's assume the main GET returns `registrosHoje` as well for simplicity.
        // If not, this would require a separate fetch to `/api/alimentacao/hidratacao/copo` or similar to get records.
        // The API `index.ts` GET returns `coposBebidosHoje: data.registrosHoje.length`.
        // The `copo.ts` POST/DELETE returns `registrosHoje: data.registrosHoje`.
        // Let's assume the main GET /api/alimentacao/hidratacao is updated to provide `registrosHoje` array.
        // If previous subtask for GET /api/alimentacao/hidratacao didn't include it, this is an integration point.
        // For now, I'll assume it returns it or the component would make another call.
        // Let's proceed as if `data.registrosHoje` is available from the initial fetch.
        // If `data.registrosHoje` isn't returned by the main GET, this part needs adjustment.
        // The current `index.ts` for GET /api/alimentacao/hidratacao returns:
        // { metaDiaria, coposBebidosHoje (length), ultimoReset }
        // It does NOT return the actual `registrosHoje` array.
        // This means we can't get `ultimoRegistroDisplay` directly from this initial call.
        // The component will have to build up `registrosHoje` from POST/DELETE calls, or we need a new endpoint.

        // For now, let's manage `registrosHoje` locally and update it via `copo` calls.
        // The initial call will set counts, but not the actual records.
        // This means `ultimoRegistroDisplay` will only update when cups are added/removed via UI.

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Update ultimoRegistroDisplay when registrosHoje changes
  useEffect(() => {
    if (registrosHoje.length > 0) {
      setUltimoRegistroDisplay(registrosHoje[registrosHoje.length - 1].hora)
    } else {
      setUltimoRegistroDisplay(null)
    }
  }, [registrosHoje])

  const handleApiResponse = (data: HidratacaoApiResponse) => {
    setCoposBebidos(data.coposBebidosHoje)
    if (data.registrosHoje) { // Check if API returns this
      setRegistrosHoje(data.registrosHoje)
    }
    if (data.metaDiaria) { // PUT endpoint returns this
        setMetaDiaria(data.metaDiaria)
    }
  }

  const adicionarCopo = async () => {
    setError(null)
    try {
      const response = await fetch('/api/alimentacao/hidratacao/copo', { method: 'POST' })
      if (!response.ok) throw new Error('Erro ao adicionar copo')
      const data: HidratacaoApiResponse = await response.json()
      handleApiResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const removerCopo = async () => {
    setError(null)
    try {
      const response = await fetch('/api/alimentacao/hidratacao/copo', { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao remover copo')
      const data: HidratacaoApiResponse = await response.json()
      handleApiResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const ajustarMetaRequest = async (novaMeta: number) => {
    setError(null)
    try {
      const response = await fetch('/api/alimentacao/hidratacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaDiaria: novaMeta }),
      })
      if (!response.ok) throw new Error('Erro ao ajustar meta')
      const data: HidratacaoApiResponse = await response.json()
      handleApiResponse(data) // API returns { metaDiaria, coposBebidosHoje, ultimoReset }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const handleAjustarMetaClick = (valor: number) => {
    const novaMeta = metaDiaria + valor;
    if (novaMeta >= 1 && novaMeta <= 15) { // Keep UI validation
        ajustarMetaRequest(novaMeta);
    }
  }

  const progresso = metaDiaria > 0 ? Math.min((coposBebidos / metaDiaria) * 100, 100) : 0;

  if (isLoading) return <p>Carregando hidratação...</p>
  // Error display can be more sophisticated
  if (error) return <p className="text-red-500">Erro: {error}. Tente recarregar.</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Acompanhamento de Hidratação
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registre os copos de água que você bebe durante o dia
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAjustarMetaClick(-1)}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Diminuir meta diária"
            disabled={metaDiaria <= 1}
          >
            <MinusCircle className="h-6 w-6" />
          </button>
          
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Meta: {metaDiaria} copos
            </span>
          </div>
          
          <button
            onClick={() => handleAjustarMetaClick(1)}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Aumentar meta diária"
            disabled={metaDiaria >= 15}
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
          {ultimoRegistroDisplay && (
            <span className="ml-2">
              (Último: {ultimoRegistroDisplay})
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
          onClick={adicionarCopo}
          disabled={coposBebidos >= metaDiaria}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Registrar um copo de água"
        >
          Registrar Copo
        </button>
        
        <button
          onClick={removerCopo}
          disabled={coposBebidos <= 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remover um copo de água"
        >
          Remover Copo
        </button>
      </div>

      {/* Dicas */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <h4 className="font-medium mb-1">Dicas de Hidratação:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mantenha uma garrafa de água sempre visível</li>
          <li>Beba um copo ao acordar e antes de cada refeição</li>
          <li>Configure lembretes no celular a cada 1-2 horas</li>
        </ul>
      </div>
    </div>
  )
}
