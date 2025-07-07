import dynamic from 'next/dynamic'
import { Card } from '@/app/components/ui/Card'
// import { RastreadorGastos } from '@/app/components/financas/RastreadorGastos' // Importação estática removida
import { EnvelopesVirtuais } from '@/app/components/financas/EnvelopesVirtuais'
import { CalendarioPagamentos } from '@/app/components/financas/CalendarioPagamentos'
import { AdicionarDespesa } from '@/app/components/financas/AdicionarDespesa'

// Importação dinâmica para o RastreadorGastos (ajustada para default export)
const RastreadorGastos = dynamic(
  () => import('@/app/components/financas/RastreadorGastos'), // Importa o módulo
  // O .then() não é mais necessário aqui, pois dynamic() lida com default export por padrão
  { 
    ssr: false, // Desabilita SSR pois recharts depende de APIs do browser
    loading: () => <p className="text-center text-gray-500 dark:text-gray-400">Carregando gráfico...</p> 
  }
)

export default function FinancasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanças</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rastreador de Gastos */}
        <Card title="Rastreador de Gastos">
          <RastreadorGastos />
        </Card>
        
        {/* Envelopes Virtuais */}
        <Card title="Envelopes Virtuais">
          <EnvelopesVirtuais />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendário de Pagamentos */}
        <Card title="Calendário de Pagamentos">
          <CalendarioPagamentos />
        </Card>
        
        {/* Adicionar Despesa Rápida */}
        <Card title="Adicionar Despesa">
          <AdicionarDespesa />
        </Card>
      </div>
    </div>
  )
}
