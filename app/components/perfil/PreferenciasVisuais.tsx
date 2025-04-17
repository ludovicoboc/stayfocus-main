'use client'

import { useState, useEffect } from 'react' // Adicionar useState, useEffect
import { useAuth } from '../../lib/authContext' // Importar useAuth
import { useDb } from '../../lib/db-context'   // Importar useDb
import { Eye, BarChart2, Type, Bell, Coffee, Moon, Loader2 } from 'lucide-react' // Adicionar Loader2
import { Alert } from '../ui/Alert' // Importar Alert

// Definir tipo para o estado local das preferências
type PreferenciasState = {
  altoContraste: boolean;
  reducaoEstimulos: boolean;
  textoGrande: boolean;
  notificacoesAtivas: boolean;
  pausasAtivas: boolean;
}

export function PreferenciasVisuais() {
  const { user } = useAuth()
  const { usuario: usuarioService } = useDb()

  const [preferencias, setPreferencias] = useState<PreferenciasState | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingStates, setSavingStates] = useState<Record<keyof PreferenciasState, boolean>>({
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false,
    notificacoesAtivas: false,
    pausasAtivas: false,
  })
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do perfil ao carregar
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      setLoading(true)
      setError(null)
      try {
        const perfil = await usuarioService.buscarPorId(user.id)
        if (perfil) {
          setPreferencias({
            altoContraste: perfil.altoContraste ?? false,
            reducaoEstimulos: perfil.reducaoEstimulos ?? false,
            textoGrande: perfil.textoGrande ?? false,
            notificacoesAtivas: perfil.notificacoesAtivas ?? false,
            pausasAtivas: perfil.pausasAtivas ?? false,
          })
          // Aplicar classes iniciais
          document.documentElement.classList.toggle('alto-contraste', perfil.altoContraste ?? false)
          document.documentElement.classList.toggle('reducao-estimulos', perfil.reducaoEstimulos ?? false)
          document.documentElement.classList.toggle('texto-grande', perfil.textoGrande ?? false)
        } else {
           setError("Perfil não encontrado.")
        }
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", err)
        setError("Não foi possível carregar as preferências.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user?.id, usuarioService])

  // Função genérica para lidar com o toggle e salvar no DB
  const handleToggle = async (key: keyof PreferenciasState) => {
    if (!user?.id || !preferencias) return

    const newValue = !preferencias[key]

    setSavingStates(prev => ({ ...prev, [key]: true }))
    setError(null)

    try {
      // Atualiza estado local otimisticamente
      setPreferencias(prev => prev ? { ...prev, [key]: newValue } : null)

      // Aplica/Remove classes CSS imediatamente para feedback visual
      if (key === 'altoContraste' || key === 'reducaoEstimulos' || key === 'textoGrande') {
         document.documentElement.classList.toggle(key.replace(/([A-Z])/g, '-$1').toLowerCase(), newValue)
      }

      // Salva no banco de dados
      if (key === 'altoContraste' || key === 'reducaoEstimulos' || key === 'textoGrande') {
        await usuarioService.atualizarPreferenciasVisuais(user.id, { [key]: newValue })
      } else if (key === 'notificacoesAtivas') {
        await usuarioService.alternarNotificacoes(user.id) // O serviço alterna, não precisa passar valor
      } else if (key === 'pausasAtivas') {
        await usuarioService.alternarPausas(user.id) // O serviço alterna
      }

      // Confirma a atualização no estado local (já feito otimisticamente, mas poderia re-buscar se necessário)
      // setPreferencias(prev => prev ? { ...prev, [key]: newValue } : null);

    } catch (err: any) {
      console.error(`Erro ao atualizar ${key}:`, err)
      setError(`Não foi possível salvar a preferência de ${key}.`)
      // Reverte a mudança otimista no estado local
      setPreferencias(prev => prev ? { ...prev, [key]: !newValue } : null)
      // Reverte a classe CSS
       if (key === 'altoContraste' || key === 'reducaoEstimulos' || key === 'textoGrande') {
         document.documentElement.classList.toggle(key.replace(/([A-Z])/g, '-$1').toLowerCase(), !newValue)
      }
    } finally {
      setSavingStates(prev => ({ ...prev, [key]: false }))
    }
  }


  if (loading) {
     return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-center justify-center h-60">
        <Loader2 className="h-6 w-6 animate-spin text-perfil-primary" />
      </div>
    )
  }

  if (!preferencias) {
     return (
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
         <Alert variant="error">{error || "Não foi possível carregar as preferências."}</Alert>
       </div>
     )
  }

  // Simplifica as chamadas onClick usando a função genérica
  const toggleAltoContraste = () => handleToggle('altoContraste')
  const toggleReducaoEstimulos = () => handleToggle('reducaoEstimulos')
  const toggleTextoGrande = () => handleToggle('textoGrande')
  const alternarNotificacoes = () => handleToggle('notificacoesAtivas')
  const alternarPausas = () => handleToggle('pausasAtivas')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
       {error && !loading && <Alert variant="error" className="mb-4">{error}</Alert>}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <Eye className="h-5 w-5 mr-2 text-perfil-primary" />
        Preferências de Acessibilidade
      </h2>

      <div className="space-y-5">
        {/* Modos visuais */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Modos Visuais
          </h3>

          <div className="space-y-3">
            {/* Alto contraste */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-3">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Alto Contraste
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aumenta o contraste para melhor legibilidade
                  </p>
                </div>
              </div>

              <button
                role="switch"
                aria-checked={preferencias.altoContraste}
                onClick={toggleAltoContraste}
                disabled={savingStates.altoContraste}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 ${
                  preferencias.altoContraste ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar alto contraste</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.altoContraste ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                 {savingStates.altoContraste && <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-perfil-primary/50" />}
              </button>
            </div>

            {/* Redução de estímulos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center mr-3">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Redução de Estímulos
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Remove animações e reduz cores intensas
                  </p>
                </div>
              </div>

              <button
                role="switch"
                aria-checked={preferencias.reducaoEstimulos}
                onClick={toggleReducaoEstimulos}
                disabled={savingStates.reducaoEstimulos}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 ${
                  preferencias.reducaoEstimulos ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar redução de estímulos</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.reducaoEstimulos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                 {savingStates.reducaoEstimulos && <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-perfil-primary/50" />}
              </button>
            </div>

            {/* Texto grande */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <Type className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Texto Grande
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aumenta o tamanho do texto em toda a aplicação
                  </p>
                </div>
              </div>

              <button
                role="switch"
                aria-checked={preferencias.textoGrande}
                onClick={toggleTextoGrande}
                disabled={savingStates.textoGrande}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 ${
                  preferencias.textoGrande ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar texto grande</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.textoGrande ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                 {savingStates.textoGrande && <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-perfil-primary/50" />}
              </button>
            </div>
          </div>
        </div>

        {/* Preferências gerais */}
        <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Preferências Gerais
          </h3>

          <div className="space-y-3">
            {/* Notificações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mr-3">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Lembretes
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Exibir lembretes visuais no painel
                  </p>
                </div>
              </div>

              <button
                role="switch"
                aria-checked={preferencias.notificacoesAtivas}
                onClick={alternarNotificacoes}
                disabled={savingStates.notificacoesAtivas}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 ${
                  preferencias.notificacoesAtivas ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar notificações</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.notificacoesAtivas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                 {savingStates.notificacoesAtivas && <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-perfil-primary/50" />}
              </button>
            </div>

            {/* Pausas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <Coffee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Pausas Programadas
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Exibir lembretes para fazer pausas
                  </p>
                </div>
              </div>

              <button
                role="switch"
                aria-checked={preferencias.pausasAtivas}
                onClick={alternarPausas}
                disabled={savingStates.pausasAtivas}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 ${
                  preferencias.pausasAtivas ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar pausas programadas</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.pausasAtivas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                 {savingStates.pausasAtivas && <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-perfil-primary/50" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          As preferências visuais são aplicadas imediatamente e salvas automaticamente.
        </p>
      </div>
    </div>
  )
}
