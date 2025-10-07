import { create } from 'zustand'
import { createClient } from '@/app/lib/supabase/client'
import { type User } from '@supabase/supabase-js'

export type PreferenciasVisuais = {
  altoContraste: boolean
  reducaoEstimulos: boolean
  textoGrande: boolean
}

export type MetasDiarias = {
  horasSono: number         // Horas ideais de sono
  tarefasPrioritarias: number // Número de tarefas prioritárias
  coposAgua: number         // Copos de água por dia
  pausasProgramadas: number // Número de pausas programadas
}

export type PerfilState = {
  user: User | null
  nome: string
  preferenciasVisuais: PreferenciasVisuais
  metasDiarias: MetasDiarias
  notificacoesAtivas: boolean
  pausasAtivas: boolean
  // Ações
  setPerfil: (perfil: Partial<PerfilState>) => void
  atualizarNome: (nome: string) => Promise<void>
  atualizarPreferenciasVisuais: (preferencias: Partial<PreferenciasVisuais>) => Promise<void>
  atualizarMetasDiarias: (metas: Partial<MetasDiarias>) => Promise<void>
  alternarNotificacoes: () => Promise<void>
  alternarPausas: () => Promise<void>
}

const defaultState = {
  user: null,
  nome: 'Usuário',
  preferenciasVisuais: {
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false
  },
  metasDiarias: {
    horasSono: 8,
    tarefasPrioritarias: 3,
    coposAgua: 8,
    pausasProgramadas: 4
  },
  notificacoesAtivas: true,
  pausasAtivas: true
}

export const usePerfilStore = create<PerfilState>()(
    (set, get) => ({
      ...defaultState,

      setPerfil: (perfil) => set({ ...perfil }),
      
      atualizarNome: async (nome) => {
        const { user } = get()
        if (!user) return

        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ nome }).eq('id', user.id)

        if (!error) {
          set({ nome })
        } else {
          console.error("Erro ao atualizar nome:", error)
        }
      },
      
      atualizarPreferenciasVisuais: async (preferencias) => {
        const { user, preferenciasVisuais } = get()
        if (!user) return

        const novasPreferencias = { ...preferenciasVisuais, ...preferencias }

        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ preferencias_visuais: novasPreferencias }).eq('id', user.id)

        if (!error) {
          set({ preferenciasVisuais: novasPreferencias })
        } else {
          console.error("Erro ao atualizar preferências visuais:", error)
        }
      },
      
      atualizarMetasDiarias: async (metas) => {
        const { user, metasDiarias } = get()
        if (!user) return

        const novasMetas = { ...metasDiarias, ...metas }

        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ metas_diarias: novasMetas }).eq('id', user.id)

        if (!error) {
          set({ metasDiarias: novasMetas })
        } else {
          console.error("Erro ao atualizar metas diárias:", error)
        }
      },
      
      alternarNotificacoes: async () => {
        const { user, notificacoesAtivas } = get()
        if (!user) return

        const novoStatus = !notificacoesAtivas
        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ notificacoes_ativas: novoStatus }).eq('id', user.id)

        if (!error) {
          set({ notificacoesAtivas: novoStatus })
        } else {
          console.error("Erro ao alternar notificações:", error)
        }
      },
      
      alternarPausas: async () => {
        const { user, pausasAtivas } = get()
        if (!user) return

        const novoStatus = !pausasAtivas
        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({ pausas_ativas: novoStatus }).eq('id', user.id)

        if (!error) {
          set({ pausasAtivas: novoStatus })
        } else {
          console.error("Erro ao alternar pausas:", error)
        }
      },
    })
)
