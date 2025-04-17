'use client'

import { useState, useEffect } from 'react' // Adicionar useEffect
import { useAuth } from '../../lib/authContext' // Importar useAuth
import { useDb } from '../../lib/db-context'   // Importar useDb
import { Save, User, Edit, Loader2 } from 'lucide-react' // Adicionar Loader2
import { Alert } from '../ui/Alert' // Importar Alert

export function InformacoesPessoais() {
  const { user } = useAuth()
  const { usuario: usuarioService } = useDb() // Renomear para evitar conflito com 'user' de useAuth

  const [nomeAtual, setNomeAtual] = useState('') // Nome vindo do DB
  const [novoNome, setNovoNome] = useState('')   // Nome durante edição
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(true) // Loading inicial para buscar dados
  const [saving, setSaving] = useState(false)   // Loading para salvar
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do perfil ao carregar
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return // Não busca se não houver ID

      setLoading(true)
      setError(null)
      try {
        const perfil = await usuarioService.buscarPorId(user.id)
        if (perfil?.nome) {
          setNomeAtual(perfil.nome)
          setNovoNome(perfil.nome) // Inicializa campo de edição
        } else {
          // Se não houver nome no perfil, usa o placeholder do email como antes
          const placeholder = user.email?.split('@')[0] || 'Usuário'
          setNomeAtual(placeholder)
          setNovoNome(placeholder)
        }
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", err)
        setError("Não foi possível carregar as informações do perfil.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user?.id, usuarioService, user?.email]) // Depende do ID do usuário e do serviço

  const iniciarEdicao = () => {
    setNovoNome(nomeAtual) // Garante que a edição comece com o valor atual
    setError(null) // Limpa erros anteriores
    setEditando(true)
  }

  const salvarAlteracoes = async () => {
    if (!user?.id || !novoNome.trim()) return

    setSaving(true)
    setError(null)
    try {
      await usuarioService.atualizar(user.id, { nome: novoNome.trim() })
      setNomeAtual(novoNome.trim()) // Atualiza o nome exibido
      setEditando(false)
    } catch (err: any) {
      console.error("Erro ao salvar nome:", err)
      setError("Não foi possível salvar o nome.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-perfil-primary" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-perfil-primary" />
        Informações Básicas
      </h2>
      
      <div className="space-y-4">
        {/* Nome do usuário */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome
          </label>
          
          {editando ? (
            <div className="flex items-center">
              <input
                type="text"
                id="nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Seu nome"
                maxLength={50} // Aumentar limite se necessário
                required
                disabled={saving} // Desabilita durante o salvamento
              />

              <button
                onClick={salvarAlteracoes}
                className="ml-2 p-2 text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50"
                aria-label="Salvar nome"
                disabled={saving || !novoNome.trim()} // Desabilita se estiver salvando ou nome vazio
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between min-h-[40px]"> {/* Altura mínima para evitar pulos */}
              <p className="text-gray-800 dark:text-white text-lg">{nomeAtual}</p>

              <button
                onClick={iniciarEdicao}
                className="p-2 text-gray-500 hover:text-perfil-primary focus:outline-none focus:ring-2 focus:ring-perfil-primary rounded-md"
                aria-label="Editar nome"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seu nome é usado para personalizar a experiência no StayFocus.
            Suas informações agora são salvas de forma segura.
          </p>
        </div>
      </div>
    </div>
  )
}
