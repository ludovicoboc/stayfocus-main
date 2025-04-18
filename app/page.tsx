'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { DashboardCard } from '@/app/components/ui/DashboardCard'
import { DashboardSection } from '@/app/components/ui/DashboardSection'
import { DashboardHeader } from '@/app/components/ui/DashboardHeader'
import { DashboardSummary } from '@/app/components/ui/DashboardSummary'
import { SuspenseWrapper } from '@/app/components/ui/SuspenseWrapper'
import { PreferencesButton } from '@/app/components/ui/PreferencesButton'
import { Button, buttonVariants } from '@/app/components/ui/Button'
import { PainelDia } from '@/app/components/inicio/PainelDia'
import { ListaPrioridades } from '@/app/components/inicio/ListaPrioridades'
import { LembretePausas } from '@/app/components/inicio/LembretePausas'
import { ChecklistMedicamentos } from '@/app/components/inicio/ChecklistMedicamentos'
import { ProximaProvaCard } from '@/app/components/inicio/ProximaProvaCard'
import { useDashboard } from '@/app/hooks/useDashboard'
import { cn } from '@/app/lib/utils'

// Componentes de placeholder para Suspense
const PainelDiaPlaceholder = () => (
  <div className="md:col-span-2">
    <DashboardCard isLoading title="Painel do Dia">
      Carregando...
    </DashboardCard>
  </div>
)

const ListaPrioridadesPlaceholder = () => (
  <div>
    <DashboardCard isLoading title="Prioridades do Dia">
      Carregando...
    </DashboardCard>
  </div>
)

const LembretePausasPlaceholder = () => (
  <div className="h-40 bg-white dark:bg-gray-800 rounded-xl shadow-md animate-pulse"></div>
)

const ProximaProvaPlaceholder = () => (
  <div className="h-32 bg-white dark:bg-gray-800 rounded-xl shadow-md animate-pulse"></div>
)

export default function HomePage() {
  // Usar o hook personalizado para carregar os dados do dashboard
  const {
    blocosDia,
    prioridadesDia,
    proximosCompromissos,
    prioridadesPendentes,
    prioridadesConcluidas,
    metasPausas,
    mostrarPausas,
    nomeUsuario,
    preferenciasVisuais,
    isLoading
  } = useDashboard()

  // Aplicar preferências visuais se estiverem definidas
  useEffect(() => {
    if (preferenciasVisuais) {
      // Aplicar texto grande
      if (preferenciasVisuais.textoGrande) {
        document.documentElement.classList.add('text-lg')
      } else {
        document.documentElement.classList.remove('text-lg')
      }
      
      // Aplicar alto contraste
      if (preferenciasVisuais.altoContraste) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
      
      // Aplicar redução de estímulos
      if (preferenciasVisuais.reducaoEstimulos) {
        document.documentElement.classList.add('reduce-motion')
      } else {
        document.documentElement.classList.remove('reduce-motion')
      }
    }
  }, [preferenciasVisuais])

  return (
    <div className={`container mx-auto px-4 space-y-6 ${isLoading ? 'opacity-80' : ''}`}>
      <DashboardHeader
        title="Início"
        userName={nomeUsuario}
        description="Aqui está seu progresso e tarefas para hoje."
        actions={<PreferencesButton />}
      />
      
      {/* Resumo rápido */}
      <DashboardSummary
        prioridadesPendentes={prioridadesPendentes}
        prioridadesConcluidas={prioridadesConcluidas}
        proximosCompromissos={proximosCompromissos?.length || 0}
        className="mb-8"
      />
      
      <main className="pb-8">
        <DashboardSection id="painel-principal" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Painel Visual do Dia */}
          <SuspenseWrapper fallback={<PainelDiaPlaceholder />}>
            <div className="md:col-span-2">
              <DashboardCard title="Painel do Dia">
                <PainelDia />
              </DashboardCard>
            </div>
          </SuspenseWrapper>
          
          {/* Lista de Prioridades */}
          <SuspenseWrapper fallback={<ListaPrioridadesPlaceholder />}>
            <div>
              <DashboardCard 
                title="Prioridades do Dia"
                className="h-full"
              >
                <div className="space-y-6">
                  <ListaPrioridades />
                  
                  {/* Separador */}
                  <div 
                    role="separator" 
                    className="border-t border-gray-200 dark:border-gray-700 my-2" 
                    aria-hidden="true"
                  ></div>
                  
                  {/* Checklist de Medicamentos Diários */}
                  <ChecklistMedicamentos />
                </div>
              </DashboardCard>
            </div>
          </SuspenseWrapper>
        </DashboardSection>
        
        {/* Lembretes de Pausas e Próximas Provas */}
        {mostrarPausas && (
          <DashboardSection id="pausas-provas" className="mt-8 space-y-6">
            <SuspenseWrapper fallback={<LembretePausasPlaceholder />}>
              <LembretePausas />
            </SuspenseWrapper>

            <SuspenseWrapper fallback={<ProximaProvaPlaceholder />}>
              <ProximaProvaCard />
            </SuspenseWrapper>
          </DashboardSection>
        )}
        
        {/* Links Rápidos */}
        <DashboardSection id="links-rapidos" title="Acesso Rápido" className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/estudos" className={cn(
              buttonVariants({ variant: "outline" }),
              "flex flex-col items-center justify-center h-24 p-4 text-estudos-primary hover:bg-estudos-light hover:border-estudos-primary"
            )}>
              <span className="text-sm font-medium">Estudos</span>
              <span className="text-xs mt-1 text-gray-500">Materiais e Técnicas</span>
            </Link>
            
            <Link href="/saude" className={cn(
              buttonVariants({ variant: "outline" }),
              "flex flex-col items-center justify-center h-24 p-4 text-saude-primary hover:bg-saude-light hover:border-saude-primary"
            )}>
              <span className="text-sm font-medium">Saúde</span>
              <span className="text-xs mt-1 text-gray-500">Medicamentos e Bem-estar</span>
            </Link>
            
            <Link href="/hiperfocos" className={cn(
              buttonVariants({ variant: "outline" }),
              "flex flex-col items-center justify-center h-24 p-4 text-hiperfocos-primary hover:bg-hiperfocos-light hover:border-hiperfocos-primary"
            )}>
              <span className="text-sm font-medium">Hiperfocos</span>
              <span className="text-xs mt-1 text-gray-500">Projetos e Interesses</span>
            </Link>
            
            <Link href="/lazer" className={cn(
              buttonVariants({ variant: "outline" }),
              "flex flex-col items-center justify-center h-24 p-4 text-lazer-primary hover:bg-lazer-light hover:border-lazer-primary"
            )}>
              <span className="text-sm font-medium">Lazer</span>
              <span className="text-xs mt-1 text-gray-500">Atividades e Descanso</span>
            </Link>
          </div>
        </DashboardSection>
      </main>
    </div>
  )
}
