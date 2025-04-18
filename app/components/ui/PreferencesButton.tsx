'use client'

import { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, Type, Moon, Sun, BellRing, BellOff, Clock } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Modal } from '@/app/components/ui/Modal'
import { usePerfilStore } from '@/app/stores/perfilStore'

export function PreferencesButton() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    preferenciasVisuais,
    atualizarPreferenciasVisuais,
    notificacoesAtivas,
    alternarNotificacoes,
    pausasAtivas,
    alternarPausas
  } = usePerfilStore()

  function toggleModal() {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleModal}
        className="flex items-center gap-2"
        aria-label="Preferências de visualização"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Preferências</span>
      </Button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          title="Preferências de Interface"
          onClose={toggleModal}
          className="max-w-md"
        >
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Acessibilidade Visual
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => atualizarPreferenciasVisuais({ 
                    altoContraste: !preferenciasVisuais.altoContraste 
                  })}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    preferenciasVisuais.altoContraste
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  aria-pressed={preferenciasVisuais.altoContraste}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${
                      preferenciasVisuais.altoContraste
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <Eye className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Alto Contraste
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aumenta o contraste entre elementos
                      </p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full ${
                    preferenciasVisuais.altoContraste
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {preferenciasVisuais.altoContraste && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => atualizarPreferenciasVisuais({ 
                    reducaoEstimulos: !preferenciasVisuais.reducaoEstimulos 
                  })}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    preferenciasVisuais.reducaoEstimulos
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  aria-pressed={preferenciasVisuais.reducaoEstimulos}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${
                      preferenciasVisuais.reducaoEstimulos
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <EyeOff className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Redução de Estímulos
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Remove animações e reduz elementos visuais
                      </p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full ${
                    preferenciasVisuais.reducaoEstimulos
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {preferenciasVisuais.reducaoEstimulos && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => atualizarPreferenciasVisuais({ 
                    textoGrande: !preferenciasVisuais.textoGrande 
                  })}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    preferenciasVisuais.textoGrande
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  aria-pressed={preferenciasVisuais.textoGrande}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${
                      preferenciasVisuais.textoGrande
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <Type className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Texto Grande
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Aumenta o tamanho do texto para melhor legibilidade
                      </p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full ${
                    preferenciasVisuais.textoGrande
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {preferenciasVisuais.textoGrande && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Notificações e Lembretes
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={alternarNotificacoes}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    notificacoesAtivas
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  aria-pressed={notificacoesAtivas}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${
                      notificacoesAtivas
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {notificacoesAtivas ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Notificações
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {notificacoesAtivas ? 'Notificações ativadas' : 'Notificações desativadas'}
                      </p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full ${
                    notificacoesAtivas
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {notificacoesAtivas && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={alternarPausas}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    pausasAtivas
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  aria-pressed={pausasAtivas}
                  tabIndex={0}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${
                      pausasAtivas
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Lembretes de Pausas
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pausasAtivas ? 'Lembretes ativados' : 'Lembretes desativados'}
                      </p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full ${
                    pausasAtivas
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {pausasAtivas && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={toggleModal}
              className="w-full"
            >
              Salvar e Fechar
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
} 