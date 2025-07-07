'use client'

import { CheckCircle, Clock, CalendarClock } from 'lucide-react'
import { cn } from '@/app/lib/utils'

type StatItemProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  className?: string
}

const StatItem = ({ title, value, icon, description, className }: StatItemProps) => (
  <div className={cn(
    "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm",
    className
  )}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
        {icon}
      </div>
    </div>
  </div>
)

type DashboardSummaryProps = {
  prioridadesPendentes: number
  prioridadesConcluidas: number
  proximosCompromissos: number
  className?: string
}

export function DashboardSummary({
  prioridadesPendentes = 0,
  prioridadesConcluidas = 0,
  proximosCompromissos = 0,
  className
}: DashboardSummaryProps) {
  // Garantir que os valores são números válidos
  const pendentes = typeof prioridadesPendentes === 'number' ? prioridadesPendentes : 0
  const concluidas = typeof prioridadesConcluidas === 'number' ? prioridadesConcluidas : 0 
  const compromissos = typeof proximosCompromissos === 'number' ? proximosCompromissos : 0

  const totalPrioridades = pendentes + concluidas
  const porcentagemConcluidas = totalPrioridades > 0 
    ? Math.round((concluidas / totalPrioridades) * 100) 
    : 0
    
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      <StatItem
        title="Prioridades Concluídas"
        value={`${concluidas}/${totalPrioridades}`}
        description={`${porcentagemConcluidas}% das tarefas concluídas`}
        icon={<CheckCircle className="h-5 w-5" />}
        className="border-l-4 border-green-500 dark:border-green-600"
      />
      
      <StatItem
        title="Próximos Compromissos"
        value={compromissos}
        description="Atividades programadas para hoje"
        icon={<CalendarClock className="h-5 w-5" />}
        className="border-l-4 border-blue-500 dark:border-blue-600"
      />
      
      <StatItem
        title="Tempo Restante"
        value={new Date().getHours() >= 18 ? "Finalizando o dia" : "Dia em andamento"}
        description="Aproveite seu tempo com sabedoria"
        icon={<Clock className="h-5 w-5" />}
        className="border-l-4 border-purple-500 dark:border-purple-600"
      />
    </div>
  )
} 