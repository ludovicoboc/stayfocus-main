import { create } from 'zustand'
import * as autoconhecimentoService from '@/app/lib/services/autoconhecimentoService'

// Tipo para as notas
export type Nota = {
  id: string
  titulo: string
  conteudo: string
  secao: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  tags: string[]
  data_criacao: string
  data_atualizacao: string
  imagem_url?: string
}

// Tipo para o estado da store
export type AutoconhecimentoState = {
  notas: Nota[]
  modoRefugio: boolean
  loading: boolean
  error: string | null

  fetchNotas: () => Promise<void>
  adicionarNota: (nota: Omit<Nota, 'id' | 'data_criacao' | 'data_atualizacao'>) => Promise<void>
  atualizarNota: (id: string, dados: Partial<Omit<Nota, 'id' | 'data_criacao'>>) => Promise<void>
  removerNota: (id: string) => Promise<void>
  alternarModoRefugio: () => void
}

const estadoInicial = {
  notas: [],
  modoRefugio: false,
  loading: true,
  error: null,
}

// Criação da store
export const useAutoconhecimentoStore = create<AutoconhecimentoState>()(
    (set) => ({
      ...estadoInicial,
      
      fetchNotas: async () => {
        try {
          set({ loading: true, error: null })
          const notas = await autoconhecimentoService.fetchNotas()
          set({ notas, loading: false })
        } catch (error) {
          set({ loading: false, error: (error as Error).message })
        }
      },
      
      adicionarNota: async (nota) => {
        const agora = new Date().toISOString();
        const notaCompleta = {
          ...nota,
          data_criacao: agora,
          data_atualizacao: agora,
        };
        const novaNota = await autoconhecimentoService.addNota(notaCompleta)
        set((state) => ({ notas: [...state.notas, novaNota] }))
      },
      
      atualizarNota: async (id, dados) => {
        const notaAtualizada = await autoconhecimentoService.updateNota(id, dados)
        set((state) => ({
          notas: state.notas.map((n) => (n.id === id ? notaAtualizada : n)),
        }))
      },
      
      removerNota: async (id) => {
        await autoconhecimentoService.deleteNota(id)
        set((state) => ({
          notas: state.notas.filter((n) => n.id !== id),
        }))
      },
      
      alternarModoRefugio: () => set((state) => ({
        modoRefugio: !state.modoRefugio
      })),
    })
)
