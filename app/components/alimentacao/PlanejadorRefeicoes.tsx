'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Save, Trash2, Edit3 } from 'lucide-react' // Using Edit3 for a different edit icon

type RefeicaoPlanejada = {
  id: string
  horario: string // HH:MM
  descricao: string
}

// Regex for HH:MM format
const TIME_REGEX = /^\d{2}:\d{2}$/;

export function PlanejadorRefeicoes() {
  const [refeicoes, setRefeicoes] = useState<RefeicaoPlanejada[]>([])
  const [formState, setFormState] = useState({ horario: '', descricao: '' })
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchRefeicoes = async () => {
      setIsLoading(true)
      setApiError(null)
      try {
        const response = await fetch('/api/alimentacao/refeicoes-planejadas')
        if (!response.ok) {
          throw new Error(`Erro ao buscar refeições: ${response.statusText}`)
        }
        let data: RefeicaoPlanejada[] = await response.json()
        // Sort by horario
        data.sort((a, b) => a.horario.localeCompare(b.horario));
        setRefeicoes(data)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRefeicoes()
  }, [])

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formState.horario || !TIME_REGEX.test(formState.horario)) {
      setApiError("Horário inválido. Use o formato HH:MM.");
      return false;
    }
    if (!formState.descricao.trim()) {
      setApiError("Descrição não pode ser vazia.");
      return false;
    }
    setApiError(null); // Clear previous errors
    return true;
  }

  const handleAdicionarRefeicaoAPI = async () => {
    if (!validateForm()) return;
    setApiError(null)
    try {
      const response = await fetch('/api/alimentacao/refeicoes-planejadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erro ao adicionar refeição`);
      }
      const novaRefeicao: RefeicaoPlanejada = await response.json()
      setRefeicoes(prev => [...prev, novaRefeicao].sort((a,b) => a.horario.localeCompare(b.horario)))
      setFormState({ horario: '', descricao: '' }) // Reset form
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro desconhecido ao adicionar')
    }
  }

  const iniciarEdicao = (refeicao: RefeicaoPlanejada) => {
    setEditandoId(refeicao.id)
    setFormState({ horario: refeicao.horario, descricao: refeicao.descricao })
  }

  const handleSalvarEdicaoAPI = async () => {
    if (!editandoId || !validateForm()) return;
    setApiError(null)
    try {
      const response = await fetch(`/api/alimentacao/refeicoes-planejadas/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erro ao atualizar refeição`);
      }
      const refeicaoAtualizada: RefeicaoPlanejada = await response.json()
      setRefeicoes(prev =>
        prev.map(r => (r.id === editandoId ? refeicaoAtualizada : r))
            .sort((a,b) => a.horario.localeCompare(b.horario))
      )
      setEditandoId(null)
      setFormState({ horario: '', descricao: '' })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro desconhecido ao salvar')
    }
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setFormState({ horario: '', descricao: '' })
    setApiError(null)
  }

  const handleRemoverRefeicaoAPI = async (id: string) => {
    setApiError(null)
    if (!window.confirm("Tem certeza que deseja remover esta refeição?")) return;
    try {
      const response = await fetch(`/api/alimentacao/refeicoes-planejadas/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erro ao remover refeição`);
      }
      setRefeicoes(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro desconhecido ao remover')
    }
  }

  if (isLoading) return <p>Carregando planejador de refeições...</p>

  return (
    <div className="space-y-4">
      {apiError && <p className="text-red-500 bg-red-100 p-2 rounded-md">{apiError}</p>}
      <div className="space-y-2">
        {refeicoes.map((refeicao) => (
          <div
            key={refeicao.id}
            className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center text-alimentacao-primary mr-3">
              <Clock className="h-5 w-5" />
            </div>
            
            {editandoId === refeicao.id ? (
              <>
                <input
                  type="time"
                  name="horario"
                  value={formState.horario}
                  onChange={handleFormInputChange}
                  className="w-24 px-2 py-1 mr-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  name="descricao"
                  value={formState.descricao}
                  onChange={handleFormInputChange}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Descrição da refeição"
                />
                <button
                  onClick={handleSalvarEdicaoAPI}
                  className="ml-2 p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  aria-label="Salvar edição"
                >
                  <Save className="h-5 w-5" />
                </button>
                <button
                  onClick={cancelarEdicao}
                  className="ml-1 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Cancelar edição"
                >
                  <Trash2 className="h-5 w-5" /> {/* Using Trash2 for cancel here is a bit odd, consider X icon */}
                </button>
              </>
            ) : (
              <>
                <span className="font-medium text-gray-700 dark:text-gray-300 w-16">
                  {refeicao.horario}
                </span>
                <span className="flex-1 text-gray-900 dark:text-white">
                  {refeicao.descricao}
                </span>
                <button
                  onClick={() => iniciarEdicao(refeicao)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Editar refeição"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleRemoverRefeicaoAPI(refeicao.id)}
                  className="ml-1 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Remover refeição"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new meal form (not in editing mode) */}
      {!editandoId && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Adicionar Nova Refeição
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="time"
              name="horario"
              value={formState.horario}
              onChange={handleFormInputChange}
              className="w-full sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              name="descricao"
              value={formState.descricao}
              onChange={handleFormInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Descrição da refeição"
            />
            <button
              onClick={handleAdicionarRefeicaoAPI}
              disabled={!formState.horario || !formState.descricao.trim() || !TIME_REGEX.test(formState.horario)}
              className="w-full sm:w-auto px-4 py-2 bg-alimentacao-primary text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5 inline mr-1" />
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
