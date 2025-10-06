import { create } from 'zustand';

// Tipos de dados (mantidos)
export type BlocoTempo = {
  id: number; // ID agora é numérico, vindo do banco de dados
  hora: string;
  atividade: string;
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma';
};

// Estado da store
interface PainelDiaState {
  blocos: BlocoTempo[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarBloco: (novoBloco: Omit<BlocoTempo, 'id'>) => Promise<void>;
  atualizarBloco: (id: number, updates: Partial<Pick<BlocoTempo, 'atividade' | 'categoria'>>) => Promise<void>;
  removerBloco: (id: number) => Promise<void>;
}

export const usePainelDiaStore = create<PainelDiaState>((set, get) => ({
  blocos: [],
  isInitialized: false,
  isLoading: true,

  // Ação para inicializar a store com dados do backend
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/blocos');
      if (!response.ok) {
        throw new Error('Falha ao buscar blocos de tempo.');
      }
      const data: BlocoTempo[] = await response.json();
      set({ blocos: data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // Adicionar um novo bloco
  adicionarBloco: async (novoBloco) => {
    try {
      const response = await fetch('/api/v1/blocos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoBloco),
      });
      if (!response.ok) {
        throw new Error('Falha ao adicionar bloco de tempo.');
      }
      const blocoCriado: BlocoTempo = await response.json();
      set((state) => ({
        blocos: [...state.blocos, blocoCriado].sort((a, b) => a.hora.localeCompare(b.hora)),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  // Atualizar um bloco existente
  atualizarBloco: async (id, updates) => {
    // Atualização otimista na UI
    const originalBlocos = get().blocos;
    const blocosAtualizados = originalBlocos.map(bloco =>
      bloco.id === id ? { ...bloco, ...updates } : bloco
    );
    set({ blocos: blocosAtualizados.sort((a, b) => a.hora.localeCompare(b.hora)) });

    try {
      const response = await fetch(`/api/v1/blocos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar bloco de tempo.');
      }
    } catch (error) {
      console.error(error);
      set({ blocos: originalBlocos }); // Reverter em caso de falha
    }
  },

  // Remover um bloco
  removerBloco: async (id) => {
    // Atualização otimista na UI
    const originalBlocos = get().blocos;
    set((state) => ({
      blocos: state.blocos.filter(bloco => bloco.id !== id),
    }));

    try {
      const response = await fetch(`/api/v1/blocos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao remover bloco de tempo.');
      }
    } catch (error) {
      console.error(error);
      set({ blocos: originalBlocos }); // Reverter em caso de falha
    }
  },
}));