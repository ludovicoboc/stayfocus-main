import { create } from 'zustand';

// Tipo de dado para um registro de humor
export type RegistroHumor = {
  id: number;
  data: string;
  nivel: number;
  fatores: string[];
  notas: string;
};

// Estado da store
interface HumorState {
  registros: RegistroHumor[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarRegistro: (registro: Omit<RegistroHumor, 'id' | 'data'>) => Promise<void>;
  atualizarRegistro: (id: number, updates: Partial<Omit<RegistroHumor, 'id' | 'data'>>) => Promise<void>;
  removerRegistro: (id: number) => Promise<void>;
}

export const useHumorStore = create<HumorState>((set, get) => ({
  registros: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/saude/humor');
      if (!response.ok) throw new Error('Falha ao buscar registros de humor.');
      const data: RegistroHumor[] = await response.json();
      set({ registros: data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarRegistro: async (registro) => {
    try {
      const response = await fetch('/api/v1/saude/humor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro),
      });
      if (!response.ok) throw new Error('Falha ao adicionar registro de humor.');
      const novoRegistro = await response.json();
      set((state) => ({
        registros: [novoRegistro, ...state.registros],
      }));
    } catch (error) {
      console.error(error);
    }
  },

  atualizarRegistro: async (id, updates) => {
    const originalRegistros = get().registros;
    const registrosAtualizados = originalRegistros.map((reg) =>
      reg.id === id ? { ...reg, ...updates } : reg
    );
    set({ registros: registrosAtualizados });
    try {
      const response = await fetch(`/api/v1/saude/humor/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Falha ao atualizar registro de humor.');
    } catch (error) {
      console.error(error);
      set({ registros: originalRegistros }); // Reverter
    }
  },

  removerRegistro: async (id) => {
    const originalRegistros = get().registros;
    set((state) => ({
      registros: state.registros.filter((reg) => reg.id !== id),
    }));
    try {
      const response = await fetch(`/api/v1/saude/humor/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao remover registro de humor.');
    } catch (error) {
      console.error(error);
      set({ registros: originalRegistros }); // Reverter
    }
  },
}));