'use client'

import { useEffect, useState } from 'react'
import { usePainelDiaStore, BlocoTempo } from '@/app/stores/painelDiaStore'
import { usePrioridadesStore, Prioridade } from '@/app/stores/prioridadesStore'
import { usePerfilStore } from '@/app/stores/perfilStore'

export type DashboardData = {
  blocosDia: BlocoTempo[]
  prioridadesDia: Prioridade[] 
  proximosCompromissos: BlocoTempo[]
  prioridadesPendentes: number
  prioridadesConcluidas: number
  metasPausas: number
  mostrarPausas: boolean
  metasPrioridades: number
  nomeUsuario: string
  preferenciasVisuais: {
    altoContraste: boolean
    reducaoEstimulos: boolean
    textoGrande: boolean
  }
  isLoading: boolean
}

// Valores padrão para garantir tipo seguro
const defaultDashboardData: DashboardData = {
  blocosDia: [],
  prioridadesDia: [],
  proximosCompromissos: [],
  prioridadesPendentes: 0,
  prioridadesConcluidas: 0,
  metasPausas: 4,
  mostrarPausas: true,
  metasPrioridades: 3,
  nomeUsuario: 'Usuário',
  preferenciasVisuais: {
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false
  },
  isLoading: true
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>(defaultDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  
  // Stores do Zustand
  const { blocos } = usePainelDiaStore()
  const { prioridades, getHistoricoPorData } = usePrioridadesStore()
  const { 
    nome, 
    metasDiarias, 
    pausasAtivas, 
    preferenciasVisuais 
  } = usePerfilStore()
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Obtenha a data atual em formato ISO (YYYY-MM-DD)
        const dataAtual = new Date().toISOString().split('T')[0]
        
        // Obtenha prioridades do dia atual
        const prioridadesDoDia = getHistoricoPorData(dataAtual)
        
        // Calcule próximos compromissos (próximos 3 blocos a partir da hora atual)
        const agora = new Date()
        const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`
        
        // Ordenar blocos por hora e filtrar os que ainda estão por vir
        const blocosFuturos = [...blocos]
          .sort((a, b) => {
            const horaA = a.hora.split(':').map(Number)
            const horaB = b.hora.split(':').map(Number)
            
            if (horaA[0] !== horaB[0]) {
              return horaA[0] - horaB[0]
            }
            return horaA[1] - horaB[1]
          })
          .filter(bloco => bloco.hora >= horaAtual)
          .slice(0, 3)
        
        // Calcule estatísticas de prioridades
        const prioridadesPendentes = prioridadesDoDia.filter(p => !p.concluida).length
        const prioridadesConcluidas = prioridadesDoDia.filter(p => p.concluida).length
        
        // Atualizar dados do dashboard
        setData({
          blocosDia: blocos || [],
          prioridadesDia: prioridadesDoDia || [],
          proximosCompromissos: blocosFuturos,
          prioridadesPendentes,
          prioridadesConcluidas,
          metasPausas: metasDiarias?.pausasProgramadas || 4,
          mostrarPausas: pausasAtivas,
          metasPrioridades: metasDiarias?.tarefasPrioritarias || 3,
          nomeUsuario: nome || 'Usuário',
          preferenciasVisuais: preferenciasVisuais || {
            altoContraste: false,
            reducaoEstimulos: false,
            textoGrande: false
          },
          isLoading: false
        })
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
        // Em caso de erro, definir valores padrão, mas manter isLoading como false
        setData({
          ...defaultDashboardData,
          isLoading: false
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    carregarDados()
  }, [blocos, prioridades, nome, metasDiarias, pausasAtivas, preferenciasVisuais, getHistoricoPorData])
  
  return { ...data, isLoading }
} 