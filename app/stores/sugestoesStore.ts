import { create } from 'zustand';

// --- TIPO DE DADO ---
export type SugestaoFavorita = {
  id: number;
  sugestao: string;
};

// --- ESTADO DA STORE ---
interface SugestoesState {
  sugestoesFavoritas: SugestaoFavorita[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarFavorita: (sugestao: string) => Promise<void>;
  removerFavorita: (sugestao: string) => Promise<void>;
}

async function apiCall(endpoint: string, method: 'GET' | 'POST' | 'DELETE', body?: any) {
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API call failed: ${method} ${endpoint}`);
  }
  // DELETE pode não retornar corpo
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return;
  }
  return response.json();
}

export const useSugestoesStore = create<SugestoesState>((set, get) => ({
  sugestoesFavoritas: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const data = await apiCall('/api/v1/lazer/sugestoes-favoritas', 'GET');
      set({ sugestoesFavoritas: data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize sugestoes store:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarFavorita: async (sugestao) => {
    try {
      const novaFavorita = await apiCall('/api/v1/lazer/sugestoes-favoritas', 'POST', { sugestao });
      // Evitar duplicatas no estado local, caso a API retorne um item existente
      set(state => {
        if (state.sugestoesFavoritas.some(f => f.id === novaFavorita.id)) {
          return state;
        }
        return { sugestoesFavoritas: [...state.sugestoesFavoritas, novaFavorita] };
      });
    } catch (error) {
      console.error(error);
    }
  },

  removerFavorita: async (sugestao) => {
    const originalFavoritas = get().sugestoesFavoritas;
    set(state => ({ sugestoesFavoritas: state.sugestoesFavoritas.filter(s => s.sugestao !== sugestao) }));
    try {
      await apiCall('/api/v1/lazer/sugestoes-favoritas', 'DELETE', { sugestao });
    } catch (error) {
      console.error(error);
      set({ sugestoesFavoritas: originalFavoritas }); // Reverter
    }
  },
}));