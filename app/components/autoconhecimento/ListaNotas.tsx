'use client'

import { useState, useEffect } from 'react'
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore' // Kept for modoRefugio
import { Card } from '@/app/components/ui/Card'
// import { Badge } from '@/app/components/ui/Badge' // Not used with API notes for now
// import { Input } from '@/app/components/ui/Input' // Search removed for simplicity
import { Edit, Trash2 } from 'lucide-react' // Search, Image icons removed

// API Note type
type ApiNote = {
  id: number;
  title: string;
  content: string;
  timestamp: number;
};

type ListaNotasProps = {
  // secaoAtual: 'quem-sou' | 'meus-porques' | 'meus-padroes'; // Removed, API doesn't filter by section
  onSelectNota: (id: string) => void // Editor still expects string ID
}

export function ListaNotas({ onSelectNota }: ListaNotasProps) {
  const { modoRefugio } = useAutoconhecimentoStore(state => ({ modoRefugio: state.modoRefugio }))
  const [apiNotes, setApiNotes] = useState<ApiNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch notes from API
  useEffect(() => {
    const fetchNotas = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/notas')
        if (!response.ok) {
          throw new Error(`Falha ao buscar notas: ${response.statusText}`)
        }
        const data: ApiNote[] = await response.json()
        // Sort by timestamp, newest first
        data.sort((a, b) => b.timestamp - a.timestamp);
        setApiNotes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotas()
  }, []) // Empty dependency array to run once on mount

  // Função para lidar com a exclusão via API
  const handleRemoverNota = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (window.confirm('Tem certeza que deseja excluir esta nota via API?')) {
      try {
        const response = await fetch(`/api/notas/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Falha ao excluir nota: ${response.statusText}`)
        }
        setApiNotes(prevNotes => prevNotes.filter(note => note.id !== id))
        alert('Nota excluída com sucesso!')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao excluir')
        alert(`Erro ao excluir nota: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
        console.error(err)
      }
    }
  }
  
  // Simple timestamp formatting
  const formatarTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }
  
  const interfaceSimplificada = modoRefugio
  
  if (isLoading) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">Carregando notas...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 py-4">Erro ao carregar notas: {error}</p>
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca removida para simplificação */}
      
      {/* Lista de notas */}
      <div className="space-y-3">
        {apiNotes.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhuma nota encontrada.
          </p>
        ) : (
          apiNotes.map((nota) => (
            <Card
              key={nota.id}
              className={`${
                interfaceSimplificada ? 'opacity-90' : ''
              }`}
            >
              <div 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-autoconhecimento-primary"
                onClick={() => onSelectNota(String(nota.id))} // Convert number ID to string for editor
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white line-clamp-1">
                    {nota.title}
                  </h4>
                  
                  <div className="flex space-x-1">
                    {!interfaceSimplificada && (
                      <>
                        <button
                          className="p-1 text-gray-500 hover:text-autoconhecimento-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectNota(String(nota.id)) // Convert number ID to string
                          }}
                          aria-label="Editar nota"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                          onClick={(e) => handleRemoverNota(nota.id, e)}
                          aria-label="Excluir nota"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                  {nota.content}
                </p>
                
                {/* Tags and ImageUrl removed as not available in ApiNote */}
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Registrado em: {formatarTimestamp(nota.timestamp)}</span>
                  {/* Image icon removed */}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
