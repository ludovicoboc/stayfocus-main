import { create } from 'zustand';

// Tipos de dados
export type Prioridade = {
  id: number; // ID numérico do banco de dados
  texto: string;
  concluida: boolean;
  data: string; // formato ISO: YYYY-MM-DD
  tipo?: 'geral' | 'concurso';
  origemId?: string;
};

// Estado da store
interface PrioridadesState {
  prioridades: Prioridade[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarPrioridade: (novaPrioridade: Omit<Prioridade, 'id' | 'data' | 'concluida'>) => Promise<void>;
  atualizarPrioridade: (id: number, updates: Partial<Pick<Prioridade, 'texto' | 'concluida'>>) => Promise<void>;
  removerPrioridade: (id: number) => Promise<void>;
  getHistoricoPorData: (data?: string) => Prioridade[];
  getDatasPrioridades: () => string[];
}

export const usePrioridadesStore = create<PrioridadesState>((set, get) => ({
  prioridades: [],
  isInitialized: false,
  isLoading: true,

  // Ação para inicializar a store com dados do backend
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/prioridades');
      if (!response.ok) {
        throw new Error('Falha ao buscar prioridades.');
      }
      const data = await response.json();
      // Garantir que 'concluida' seja sempre um booleano
      const prioridadesFormatadas: Prioridade[] = data.map((p: any) => ({
        ...p,
        concluida: Boolean(p.concluida),
      }));
      set({ prioridades: prioridadesFormatadas, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // Adicionar uma nova prioridade
  adicionarPrioridade: async (novaPrioridade) => {
    try {
      const response = await fetch('/api/v1/prioridades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaPrioridade),
      });
      if (!response.ok) {
        throw new Error('Falha ao adicionar prioridade.');
      }
      const prioridadeCriada: Prioridade = await response.json();
      set((state) => ({
        prioridades: [...state.prioridades, { ...prioridadeCriada, concluida: Boolean(prioridadeCriada.concluida) }],
      }));
    } catch (error) {
      console.error(error);
    }
  },

  // Atualizar uma prioridade existente
  atualizarPrioridade: async (id, updates) => {
    const originalPrioridades = get().prioridades;
    const prioridadesAtualizadas = originalPrioridades.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ prioridades: prioridadesAtualizadas });

    try {
      const response = await fetch(`/api/v1/prioridades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Falha ao atualizar prioridade.');
      }
    } catch (error) {
      console.error(error);
      set({ prioridades: originalPrioridades }); // Reverter em caso de falha
    }
  },

  // Remover uma prioridade
  removerPrioridade: async (id) => {
    const originalPrioridades = get().prioridades;
    set((state) => ({
      prioridades: state.prioridades.filter(p => p.id !== id),
    }));

    try {
      const response = await fetch(`/api/v1/prioridades/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao remover prioridade.');
      }
    } catch (error) {
      console.error(error);
      set({ prioridades: originalPrioridades }); // Reverter em caso de falha
    }
  },

  // Funções de filtro (operam no estado local)
  getHistoricoPorData: (data) => {
    const dataFiltro = data || new Date().toISOString().split('T')[0];
    return get().prioridades.filter(p => p.data === dataFiltro);
  },

  getDatasPrioridades: () => {
    const datas = get().prioridades.map(p => p.data);
    return Array.from(new Set(datas)).sort().reverse();
  },
}));