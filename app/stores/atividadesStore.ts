import { create } from 'zustand';

// --- TIPO DE DADO ---
export type Atividade = {
  id: number;
  nome: string;
  categoria: string;
  duracao: number; // em minutos
  observacoes: string;
  data: string;
  concluida: boolean;
};

// --- ESTADO DA STORE ---
interface AtividadesState {
  atividades: Atividade[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarAtividade: (atividade: Omit<Atividade, 'id' | 'concluida'>) => Promise<void>;
  removerAtividade: (id: number) => Promise<void>;
  marcarConcluida: (id: number) => Promise<void>;
}

async function apiCall(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API call failed: ${method} ${endpoint}`);
  }
  return response.json();
}

export const useAtividadesStore = create<AtividadesState>((set, get) => ({
  atividades: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const data = await apiCall('/api/v1/lazer/atividades', 'GET');
      const atividadesFormatadas: Atividade[] = data.map((a: any) => ({ ...a, concluida: Boolean(a.concluida) }));
      set({ atividades: atividadesFormatadas, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize atividades store:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarAtividade: async (atividade) => {
    const novaAtividade = await apiCall('/api/v1/lazer/atividades', 'POST', atividade);
    set(state => ({
      atividades: [...state.atividades, { ...novaAtividade, concluida: Boolean(novaAtividade.concluida) }]
    }));
  },

  removerAtividade: async (id) => {
    const originalAtividades = get().atividades;
    set(state => ({ atividades: state.atividades.filter(a => a.id !== id) }));
    try {
      await apiCall(`/api/v1/lazer/atividades/${id}`, 'DELETE');
    } catch (error) {
      console.error(error);
      set({ atividades: originalAtividades });
    }
  },

  marcarConcluida: async (id) => {
    const originalAtividades = get().atividades;
    set(state => ({
      atividades: state.atividades.map(a => a.id === id ? { ...a, concluida: true } : a)
    }));
    try {
      await apiCall(`/api/v1/lazer/atividades/${id}`, 'PUT', { concluida: true });
    } catch (error) {
      console.error(error);
      set({ atividades: originalAtividades });
    }
  },
}));