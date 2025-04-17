'use client'

import { useState, useEffect } from 'react' // Adicionar useEffect
import { useAuth } from '../../lib/authContext' // Importar useAuth
import { useDb } from '../../lib/db-context'   // Importar useDb
import { Save, Target, Clock, Droplet, Coffee, Loader2 } from 'lucide-react' // Adicionar Loader2
import { Alert } from '../ui/Alert' // Importar Alert

// Tipo para o estado das metas
type MetasState = {
  metaHorasSono: number;
  metaTarefasPrioritarias: number;
  metaCoposAgua: number;
  metaPausasProgramadas: number;
}

// Valores padrão caso não existam no DB
const defaultMetas: MetasState = {
  metaHorasSono: 8,
  metaTarefasPrioritarias: 3,
  metaCoposAgua: 8,
  metaPausasProgramadas: 4,
}

export function MetasDiarias() {
  const { user } = useAuth()
  const { usuario: usuarioService } = useDb()

  const [metasAtuais, setMetasAtuais] = useState<MetasState>(defaultMetas)
  const [metasEditando, setMetasEditando] = useState<MetasState>(defaultMetas)
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do perfil ao carregar
  useEffect(() => {
    const fetchProfile = async () => {
       if (!user?.id) {
         setLoading(false);
         return;
       }

      setLoading(true)
      setError(null)
      try {
        const perfil = await usuarioService.buscarPorId(user.id)
        if (perfil) {
          const currentMetas = {
            metaHorasSono: perfil.metaHorasSono ?? defaultMetas.metaHorasSono,
            metaTarefasPrioritarias: perfil.metaTarefasPrioritarias ?? defaultMetas.metaTarefasPrioritarias,
            metaCoposAgua: perfil.metaCoposAgua ?? defaultMetas.metaCoposAgua,
            metaPausasProgramadas: perfil.metaPausasProgramadas ?? defaultMetas.metaPausasProgramadas,
          };
          setMetasAtuais(currentMetas)
          setMetasEditando(currentMetas) // Inicializa edição com valores atuais
        } else {
           setError("Perfil não encontrado.")
           setMetasAtuais(defaultMetas); // Usa padrão se perfil não encontrado
           setMetasEditando(defaultMetas);
        }
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", err)
        setError("Não foi possível carregar as metas diárias.")
        setMetasAtuais(defaultMetas); // Usa padrão em caso de erro
        setMetasEditando(defaultMetas);
      } finally {
        setLoading(false)
      }
    }
     if (user?.id) {
        fetchProfile();
    } else if (!user?.id) {
        setLoading(false);
        setMetasAtuais(defaultMetas); // Reseta para padrão se deslogar
        setMetasEditando(defaultMetas);
    }
  }, [user?.id, usuarioService])

  const iniciarEdicao = () => {
    setMetasEditando({ ...metasAtuais }) // Copia valores atuais para edição
    setError(null)
    setEditando(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Tenta converter para número, mas mantém como string vazia se falhar ou for vazio
    const valorNumerico = value === '' ? '' : parseInt(value, 10);

    // Permite campo vazio temporariamente, validação pode ocorrer no save ou com estado de erro
    if (valorNumerico === '' || (!isNaN(valorNumerico) && valorNumerico >= 0)) {
       setMetasEditando(prev => ({
        ...prev,
        [name]: valorNumerico === '' ? 0 : valorNumerico // Guarda 0 se vazio, ou o número
      }));
    }
  }

  const salvarAlteracoes = async () => {
     if (!user?.id) return;

     // Validação simples antes de salvar
     const metasParaSalvar = { ...metasEditando };
     let hasError = false;
     Object.entries(metasParaSalvar).forEach(([key, value]) => {
         if (typeof value !== 'number' || value < 0) {
             // Considera 0 como válido, mas poderia adicionar validações mais estritas aqui
             console.warn(`Valor inválido para ${key}: ${value}. Usando 0.`);
             (metasParaSalvar as any)[key] = 0; // Força para 0 se inválido
         }
     });


    setSaving(true)
    setError(null)
    try {
      await usuarioService.atualizarMetasDiarias(user.id, metasParaSalvar)
      setMetasAtuais(metasParaSalvar) // Atualiza estado principal
      setEditando(false)
    } catch (err: any) {
      console.error("Erro ao salvar metas:", err)
      setError("Não foi possível salvar as metas diárias.")
    } finally {
      setSaving(false)
    }
  }

  const cancelarEdicao = () => {
    setMetasEditando({ ...metasAtuais }) // Restaura valores originais
    setError(null)
    setEditando(false)
  }

   if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 flex items-center justify-center h-60">
        <Loader2 className="h-6 w-6 animate-spin text-perfil-primary" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
       {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Target className="h-5 w-5 mr-2 text-perfil-primary" />
          Metas Diárias
        </h2>
        
        {!editando ? (
          <button
            onClick={iniciarEdicao}
            className="px-3 py-2 text-sm text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary"
            aria-label="Editar metas"
          >
            Personalizar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelarEdicao}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
              aria-label="Cancelar edição"
            >
              Cancelar
            </button>
            <button
              onClick={salvarAlteracoes}
              className="px-3 py-2 text-sm text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary"
              aria-label="Salvar metas"
            >
              Salvar
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-5">
        {/* Horas de sono */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-sono-primary flex items-center justify-center mr-3">
            <Clock className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Horas de sono
            </div>
            
            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="metaHorasSono" // Corrigir nome para corresponder ao estado/DB
                  value={metasEditando.metaHorasSono}
                  onChange={handleChange}
                  min="1" // Ajustar min/max conforme necessário
                  max="16"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  disabled={saving}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">horas</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasAtuais.metaHorasSono} horas
              </div>
            )}
          </div>
        </div>
        
        {/* Tarefas prioritárias */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-hiperfocos-primary flex items-center justify-center mr-3">
            <Target className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tarefas prioritárias
            </div>
            
            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="metaTarefasPrioritarias" // Corrigir nome
                  value={metasEditando.metaTarefasPrioritarias}
                  onChange={handleChange}
                  min="0" // Permitir 0
                  max="10"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  disabled={saving}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">por dia</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasAtuais.metaTarefasPrioritarias} por dia
              </div>
            )}
          </div>
        </div>
        
        {/* Copos de água */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-alimentacao-primary flex items-center justify-center mr-3">
            <Droplet className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Copos de água
            </div>
            
            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="metaCoposAgua" // Corrigir nome
                  value={metasEditando.metaCoposAgua}
                  onChange={handleChange}
                  min="0"
                  max="20"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  disabled={saving}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">por dia</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasAtuais.metaCoposAgua} por dia
              </div>
            )}
          </div>
        </div>
        
        {/* Pausas programadas */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-lazer-primary flex items-center justify-center mr-3">
            <Coffee className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pausas programadas
            </div>
            
            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="metaPausasProgramadas" // Corrigir nome
                  value={metasEditando.metaPausasProgramadas}
                  onChange={handleChange}
                  min="0"
                  max="15"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  disabled={saving}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">por dia</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasAtuais.metaPausasProgramadas} por dia
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Suas metas diárias são usadas para personalizar recomendações e lembretes em todo o painel.
        </p>
      </div>
    </div>
  )
}
