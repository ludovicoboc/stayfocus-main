'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/app/components/ui/Card'
import { EnvelopesVirtuais } from '@/app/components/financas/EnvelopesVirtuais'
import { CalendarioPagamentos } from '@/app/components/financas/CalendarioPagamentos'
import { AdicionarDespesa } from '@/app/components/financas/AdicionarDespesa'
import { useFinancasStore } from '@/app/stores/financasStore'
import { Loader2, AlertTriangle } from 'lucide-react'

const RastreadorGastos = dynamic(
  () => import('@/app/components/financas/RastreadorGastos'),
  { 
    ssr: false,
    loading: () => <p className="text-center text-gray-500 dark:text-gray-400">Carregando gráfico...</p> 
  }
)

export default function FinancasPage() {
  const { fetchFinancasData, loading, error } = useFinancasStore()

  useEffect(() => {
    fetchFinancasData()
  }, [fetchFinancasData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600 dark:text-gray-400">Carregando dados financeiros...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Erro ao carregar os dados financeiros.</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanças</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Rastreador de Gastos">
          <RastreadorGastos />
        </Card>
        
        <Card title="Envelopes Virtuais">
          <EnvelopesVirtuais />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Calendário de Pagamentos">
          <CalendarioPagamentos />
        </Card>
        
        <Card title="Adicionar Despesa">
          <AdicionarDespesa />
        </Card>
      </div>
    </div>
  )
}
