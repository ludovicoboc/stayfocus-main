'use client'

import { useState } from 'react'
import { Upload, Download, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { 
  extractLocalStorageData, 
  migrateAllData, 
  createLocalBackup, 
  clearLocalDataAfterMigration 
} from '@/app/lib/utils/dataMigration'

export function MigracaoDados() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [localData, setLocalData] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Verificar dados locais na inicialização
  const checkLocalData = () => {
    const data = extractLocalStorageData()
    setLocalData(data)
    return data
  }

  // Executar migração
  const handleMigration = async () => {
    setIsLoading(true)
    setMigrationResult(null)

    try {
      // Criar backup antes da migração
      const backup = createLocalBackup()
      if (!backup) {
        throw new Error('Falha ao criar backup dos dados locais')
      }

      // Executar migração
      const result = await migrateAllData()
      setMigrationResult(result)

      // Se migração foi bem-sucedida, limpar dados locais
      if (result.success) {
        clearLocalDataAfterMigration()
        setLocalData(null) // Atualizar estado local
      }

    } catch (error) {
      setMigrationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        summary: {
          mealPlans: { success: 0, errors: 1 },
          mealRecords: { success: 0, errors: 1 },
          hydration: { success: 0, errors: 1 }
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Download do backup
  const handleDownloadBackup = () => {
    const backup = createLocalBackup()
    if (backup) {
      const blob = new Blob([backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stayfocus-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  // Verificar dados na primeira renderização
  useState(() => {
    checkLocalData()
  })

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Migração de Dados
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Migre seus dados do armazenamento local para o servidor para sincronização entre dispositivos.
        </p>

        {/* Status dos dados locais */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Dados Locais Encontrados
            </h4>
            <button
              onClick={checkLocalData}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Atualizar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {localData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Planos de Refeição
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {localData.planosRefeicao?.length || 0}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  Registros de Refeição
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {localData.registrosRefeicao?.length || 0}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Hidratação (copos)
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {localData.hidratacao?.coposBebidos || 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum dado local encontrado</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleMigration}
            disabled={isLoading || !localData}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Migrando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Migrar para Servidor
              </>
            )}
          </button>

          <button
            onClick={handleDownloadBackup}
            disabled={!localData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Backup
          </button>
        </div>

        {/* Aviso */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Um backup será criado automaticamente antes da migração</li>
                <li>Os dados locais serão limpos após migração bem-sucedida</li>
                <li>Certifique-se de estar conectado à internet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado da migração */}
      {migrationResult && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {migrationResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <h4 className="font-medium text-gray-900 dark:text-white">
              Resultado da Migração
            </h4>
          </div>

          {migrationResult.success ? (
            <div className="text-green-600 dark:text-green-400 mb-4">
              ✅ Migração concluída com sucesso!
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 mb-4">
              ❌ Migração falhou: {migrationResult.error}
            </div>
          )}

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Planos de Refeição
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ✅ {migrationResult.summary?.mealPlans?.success || 0} | 
                ❌ {migrationResult.summary?.mealPlans?.errors || 0}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-700 dark:text-green-300">
                Registros de Refeição
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                ✅ {migrationResult.summary?.mealRecords?.success || 0} | 
                ❌ {migrationResult.summary?.mealRecords?.errors || 0}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Hidratação
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ✅ {migrationResult.summary?.hydration?.success || 0} | 
                ❌ {migrationResult.summary?.hydration?.errors || 0}
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showDetails ? 'Ocultar' : 'Mostrar'} detalhes
          </button>

          {showDetails && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                {JSON.stringify(migrationResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
