'use client'

import { useState, useEffect } from 'react'
import { Camera, Plus, X } from 'lucide-react'

// API Type
type RefeicaoRegistrada = {
  id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  descricao: string;
  tipoIcone?: string;
  fotoUrl?: string;
};

// Form state type
type FormData = {
  data: string;
  horario: string;
  descricao: string;
  tipoIcone: string | null;
  fotoUrl: string | null;
};

// Ícones simples para tipos de refeição (can be kept as is)
const tiposRefeicao = [
  { id: 'cafe', emoji: '☕', nome: 'Café' },
  { id: 'fruta', emoji: '🍎', nome: 'Fruta' },
  { id: 'salada', emoji: '🥗', nome: 'Salada' },
  { id: 'proteina', emoji: '🍗', nome: 'Proteína' },
  { id: 'carboidrato', emoji: '🍚', nome: 'Carboidrato' },
  { id: 'sobremesa', emoji: '🍰', nome: 'Sobremesa' },
  { id: 'agua', emoji: '💧', nome: 'Água' },
];

// Regex for YYYY-MM-DD and HH:MM formats
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export function RegistroRefeicoes() {
  const [registrosApi, setRegistrosApi] = useState<RefeicaoRegistrada[]>([])
  const [formData, setFormData] = useState<FormData>({
    data: new Date().toISOString().split('T')[0], // Default to today
    horario: '',
    descricao: '',
    tipoIcone: null,
    fotoUrl: null,
  })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0])

  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    const fetchRegistros = async () => {
      setIsLoading(true)
      setApiError(null)
      try {
        const response = await fetch(`/api/alimentacao/refeicoes-registradas?data=${filtroData}`)
        if (!response.ok) {
          throw new Error(`Erro ao buscar registros: ${response.statusText}`)
        }
        const data: RefeicaoRegistrada[] = await response.json()
        setRegistrosApi(data) // API already sorts by date/time desc
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    }
    if (DATE_REGEX.test(filtroData)) { // Only fetch if filter date is valid
        fetchRegistros()
    } else {
        setApiError("Formato de data inválido para filtro.");
        setRegistrosApi([]); // Clear results if filter is bad
        setIsLoading(false);
    }
  }, [filtroData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selecionarTipoIcone = (tipoId: string) => {
    setFormData(prev => ({
      ...prev,
      tipoIcone: prev.tipoIcone === tipoId ? null : tipoId,
    }));
  };

  const validateForm = () => {
    if(!formData.data || !DATE_REGEX.test(formData.data)) {
        setApiError("Data inválida. Use YYYY-MM-DD."); return false;
    }
    if(!formData.horario || !TIME_REGEX.test(formData.horario)) {
        setApiError("Horário inválido. Use HH:MM."); return false;
    }
    if(!formData.descricao.trim()) {
        setApiError("Descrição não pode ser vazia."); return false;
    }
    // Basic URL validation (optional, can be more robust)
    if (formData.fotoUrl && !formData.fotoUrl.startsWith('http')) {
        setApiError("URL da foto parece inválida."); return false;
    }
    setApiError(null);
    return true;
  }

  const handleAdicionarRegistroAPI = async () => {
    if (!validateForm()) return;
    setApiError(null);
    try {
      const payload: any = { ...formData };
      if (!payload.tipoIcone) delete payload.tipoIcone;
      if (!payload.fotoUrl) delete payload.fotoUrl;

      const response = await fetch('/api/alimentacao/refeicoes-registradas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Erro ao adicionar registro');
      }
      const novoRegistro: RefeicaoRegistrada = await response.json()
      // If the new record's date matches the current filter, add it to the list. Otherwise, user will see it if they change filter.
      if (novoRegistro.data === filtroData) {
        setRegistrosApi(prev => [...prev, novoRegistro].sort((a, b) => {
            const dateComp = b.data.localeCompare(a.data);
            if (dateComp !== 0) return dateComp;
            return b.horario.localeCompare(a.horario);
        }));
      } else {
        alert("Registro adicionado para uma data diferente da exibida. Mude o filtro para vê-lo.")
      }

      setFormData({ // Reset form, keeping current date for convenience
        data: formData.data,
        horario: '',
        descricao: '',
        tipoIcone: null,
        fotoUrl: null
      });
      setMostrarForm(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro desconhecido ao adicionar');
    }
  }

  const handleRemoverRegistroAPI = async (id: string) => {
    setApiError(null);
    if (!window.confirm("Tem certeza que deseja remover este registro?")) return;
    try {
      const response = await fetch(`/api/alimentacao/refeicoes-registradas/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Erro ao remover registro');
      }
      setRegistrosApi(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erro desconhecido ao remover');
    }
  }

  // PUT handler for editing is optional and not implemented here to keep focus.

  return (
    <div className="space-y-4">
        <div className="flex items-center space-x-2">
            <label htmlFor="filtroData" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mostrar registros de:
            </label>
            <input
                type="date"
                id="filtroData"
                name="filtroData"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
        </div>

      {isLoading && <p>Carregando registros...</p>}
      {apiError && <p className="text-red-500 bg-red-100 p-2 rounded-md">{apiError}</p>}

      <div className="space-y-3">
        {!isLoading && registrosApi.length === 0 && !apiError && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Nenhum registro encontrado para {filtroData}.
            </p>
        )}
        {registrosApi.map((registro) => (
          <div
            key={registro.id}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-medium text-gray-500 dark:text-gray-400 text-xs mr-2">
                    {new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                    {registro.horario}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  {registro.descricao}
                </p>
                
                {registro.tipoIcone && (
                  <div className="mb-2">
                    <span className="text-2xl" aria-label={`Tipo: ${tiposRefeicao.find(t => t.id === registro.tipoIcone)?.nome || ''}`}>
                      {tiposRefeicao.find(t => t.id === registro.tipoIcone)?.emoji}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleRemoverRegistroAPI(registro.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Remover registro"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {registro.fotoUrl && (
              <div className="mt-2">
                <img
                  src={registro.fotoUrl}
                  alt="Foto da refeição"
                  className="w-full h-40 object-cover rounded-md" // Increased height
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {mostrarForm ? (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Novo Registro de Refeição
            </h3>
            <button
              onClick={() => { setMostrarForm(false); setApiError(null); }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Fechar formulário"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  aria-label="Data da refeição"
                />
              <input
                type="time"
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                aria-label="Horário da refeição"
              />
            </div>
            <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Descrição da refeição"
                aria-label="Descrição da refeição"
                rows={3}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo (opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {tiposRefeicao.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => selecionarTipoIcone(tipo.id)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      formData.tipoIcone === tipo.id
                        ? 'bg-alimentacao-light border-2 border-alimentacao-primary'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                    }`}
                    aria-label={tipo.nome}
                    aria-pressed={formData.tipoIcone === tipo.id}
                  >
                    {tipo.emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
                <label htmlFor="fotoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL da Foto (opcional)
                </label>
                <input
                    type="url"
                    id="fotoUrl"
                    name="fotoUrl"
                    value={formData.fotoUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="https://exemplo.com/imagem.jpg"
                    aria-label="URL da foto da refeição"
                />
              {formData.fotoUrl && (
                <div className="mt-2 relative">
                  <img
                    src={formData.fotoUrl}
                    alt="Prévia da foto"
                    className="w-full h-32 object-cover rounded-md border dark:border-gray-600"
                    onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                    onLoad={(e) => (e.currentTarget.style.display = 'block')}
                  />
                   <button
                    onClick={() => setFormData(prev => ({ ...prev, fotoUrl: null }))}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    aria-label="Remover foto URL"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAdicionarRegistroAPI}
                disabled={!formData.horario || !formData.descricao.trim() || !formData.data.trim()}
                className="px-4 py-2 bg-alimentacao-primary text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Salvar registro"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setFormData({ // Reset form but keep current date filter as default for new entry
                data: filtroData,
                horario: '',
                descricao: '',
                tipoIcone: null,
                fotoUrl: null
            });
            setMostrarForm(true);
            setApiError(null);
          }}
          className="w-full py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          aria-label="Adicionar novo registro de refeição"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Adicionar Registro</span>
        </button>
      )}
    </div>
  )
}
