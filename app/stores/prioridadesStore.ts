import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Prioridade = {
  id: string;
  texto: string;
  concluida: boolean;
  data: string; // formato ISO: YYYY-MM-DD
  tipo?: 'geral' | 'concurso'; // Novo campo para tipo de prioridade
  origemId?: string; // Novo campo para ID da origem (ex: concursoId)
}

interface PrioridadesState {
  prioridades: Prioridade[];
  // Atualiza a assinatura para aceitar os novos campos opcionais
  adicionarPrioridade: (prioridade: Omit<Prioridade, 'id' | 'data' | 'concluida'> & { concluida?: boolean }) => void;
  editarPrioridade: (id: string, texto: string) => void;
  removerPrioridade: (id: string) => void;
  toggleConcluida: (id: string) => void
  getHistoricoPorData: (data?: string) => Prioridade[]
  getDatasPrioridades: () => string[]
}

export const usePrioridadesStore = create<PrioridadesState>()(
  persist(
    (set, get) => ({
      prioridades: [],

      adicionarPrioridade: (novaPrioridade) => set((state) => {
        // Obter a data atual em formato ISO (YYYY-MM-DD)
        const dataAtual = new Date().toISOString().split('T')[0];
        const prioridadeCompleta: Prioridade = {
          id: crypto.randomUUID(),
          texto: novaPrioridade.texto,
          concluida: novaPrioridade.concluida ?? false, // Define concluida como false por padrão
          data: dataAtual,
          tipo: novaPrioridade.tipo || 'geral', // Define tipo como 'geral' por padrão
          origemId: novaPrioridade.origemId, // Adiciona origemId se fornecido
        };

        return {
          prioridades: [...state.prioridades, prioridadeCompleta],
        };
      }),

      editarPrioridade: (id, texto) => set((state) => ({
        prioridades: state.prioridades.map(p => 
          p.id === id ? { ...p, texto } : p
        )
      })),
      
      removerPrioridade: (id) => set((state) => ({
        prioridades: state.prioridades.filter(p => p.id !== id)
      })),
      
      toggleConcluida: (id) => set((state) => ({
        prioridades: state.prioridades.map(p => 
          p.id === id ? { ...p, concluida: !p.concluida } : p
        )
      })),
      
      getHistoricoPorData: (data) => {
        const dataFiltro = data || new Date().toISOString().split('T')[0]
        return get().prioridades.filter(p => p.data === dataFiltro)
      },
      
      getDatasPrioridades: () => {
        // Retorna array de datas únicas (sem repetições)
        const datas = get().prioridades.map(p => p.data)
        return Array.from(new Set(datas)).sort().reverse() // Mais recentes primeiro
      }
    }),
    {
      name: 'prioridades-diarias',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
