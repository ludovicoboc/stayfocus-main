import { create } from 'zustand'
import * as alimentacaoService from '@/app/lib/services/alimentacaoService'

// Tipos
export type Refeicao = {
  id: string
  horario: string
  descricao: string
}

export type RegistroRefeicao = {
  id: string
  data: string
  horario: string
  descricao: string
  tipo_icone: string | null
  foto_url: string | null
}

export type Hidratacao = {
    copos_bebidos: number;
    meta_diaria: number;
    data: string;
}

type AlimentacaoState = {
  refeicoes: Refeicao[]
  registros: RegistroRefeicao[]
  hidratacao: Hidratacao
  loading: boolean
  error: string | null

  fetchAlimentacaoData: () => Promise<void>

  // Ações de Refeição Programada
  adicionarRefeicao: (horario: string, descricao: string) => Promise<void>
  atualizarRefeicao: (id: string, updates: Partial<Omit<Refeicao, 'id'>>) => Promise<void>
  removerRefeicao: (id: string) => Promise<void>
  
  // Ações de Registro de Refeição
  adicionarRegistro: (registro: Omit<RegistroRefeicao, 'id'>) => Promise<void>
  removerRegistro: (id: string) => Promise<void>

  // Ações de Hidratação
  atualizarHidratacao: (updates: Partial<Omit<Hidratacao, 'data'>>) => Promise<void>
}

export const useAlimentacaoStore = create<AlimentacaoState>((set, get) => ({
  refeicoes: [],
  registros: [],
  hidratacao: { copos_bebidos: 0, meta_diaria: 8, data: new Date().toISOString().split('T')[0] },
  loading: true,
  error: null,

  fetchAlimentacaoData: async () => {
    try {
      set({ loading: true, error: null })
      const data = await alimentacaoService.fetchAlimentacaoData()
      set({ ...data, loading: false })
    } catch (error) {
      set({ loading: false, error: (error as Error).message })
    }
  },

  // --- Ações de Refeição Programada ---
  adicionarRefeicao: async (horario, descricao) => {
    const novaRefeicao = await alimentacaoService.addRefeicao({ horario, descricao })
    set((state) => ({ refeicoes: [...state.refeicoes, novaRefeicao] }))
  },
  atualizarRefeicao: async (id, updates) => {
    const refeicaoAtualizada = await alimentacaoService.updateRefeicao(id, updates)
    set((state) => ({
      refeicoes: state.refeicoes.map((r) => (r.id === id ? refeicaoAtualizada : r)),
    }))
  },
  removerRefeicao: async (id) => {
    await alimentacaoService.deleteRefeicao(id)
    set((state) => ({
      refeicoes: state.refeicoes.filter((r) => r.id !== id),
    }))
  },

  // --- Ações de Registro de Refeição ---
  adicionarRegistro: async (registro) => {
    const novoRegistro = await alimentacaoService.addRegistroRefeicao(registro)
    set((state) => ({ registros: [...state.registros, novoRegistro] }))
  },
  removerRegistro: async (id) => {
    await alimentacaoService.deleteRegistroRefeicao(id)
    set((state) => ({
      registros: state.registros.filter((r) => r.id !== id),
    }))
  },

  // --- Ações de Hidratação ---
  atualizarHidratacao: async (updates) => {
    const { hidratacao } = get()
    const novosDados = { ...hidratacao, ...updates }
    const hidratacaoAtualizada = await alimentacaoService.upsertHidratacao(novosDados)
    set({ hidratacao: hidratacaoAtualizada })
  },
}))
