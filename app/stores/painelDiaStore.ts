import { create } from 'zustand'

export type BlocoTempo = {
  id: string
  hora: string
  atividade: string
  categoria: 'inicio' | 'alimentacao' | 'saude' | 'lazer' | 'nenhuma'
}

// Dados de exemplo para demonstração
const blocosIniciais: BlocoTempo[] = [
  { id: '1', hora: '08:00', atividade: 'Café da manhã', categoria: 'alimentacao' },
  { id: '3', hora: '10:00', atividade: 'Pausa para alongamento', categoria: 'saude' },
  { id: '5', hora: '12:00', atividade: 'Almoço', categoria: 'alimentacao' },
  { id: '6', hora: '13:00', atividade: 'Descanso breve', categoria: 'lazer' },
  { id: '8', hora: '15:00', atividade: 'Exercício físico', categoria: 'saude' },
  { id: '9', hora: '16:00', atividade: 'Leitura', categoria: 'lazer' },
  { id: '11', hora: '18:00', atividade: 'Jantar', categoria: 'alimentacao' },
  { id: '12', hora: '19:00', atividade: 'Tempo livre', categoria: 'lazer' },
]

interface PainelDiaState {
  blocos: BlocoTempo[]
  editarAtividade: (id: string, atividade: string) => void
  editarCategoria: (id: string, categoria: BlocoTempo['categoria']) => void
  adicionarBloco: (bloco: BlocoTempo) => void
  removerBloco: (id: string) => void
}

export const usePainelDiaStore = create<PainelDiaState>()(
    (set) => ({
      blocos: blocosIniciais,
      
      // Editar a atividade de um bloco
      editarAtividade: (id, atividade) => set((state) => ({
        blocos: state.blocos.map(bloco => 
          bloco.id === id ? { ...bloco, atividade } : bloco
        )
      })),
      
      // Editar a categoria de um bloco
      editarCategoria: (id, categoria) => set((state) => ({
        blocos: state.blocos.map(bloco => 
          bloco.id === id ? { ...bloco, categoria } : bloco
        )
      })),
      
      // Adicionar um novo bloco
      adicionarBloco: (bloco) => set((state) => ({
        blocos: [...state.blocos, bloco]
      })),
      
      // Remover um bloco
      removerBloco: (id) => set((state) => ({
        blocos: state.blocos.filter(bloco => bloco.id !== id)
      })),
    })
)
