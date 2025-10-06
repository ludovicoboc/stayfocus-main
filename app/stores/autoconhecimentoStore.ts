import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export type Nota = {
  id: number;
  titulo: string;
  conteudo: string;
  secao: 'quem-sou' | 'meus-porques' | 'meus-padroes';
  tags: string[];
  dataCriacao: string;
  dataAtualizacao: string;
  imagemUrl?: string;
};

// --- ESTADO DA STORE ---
interface AutoconhecimentoState {
  notas: Nota[];
  modoRefugio: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarNota: (nota: Omit<Nota, 'id' | 'dataCriacao' | 'dataAtualizacao'>) => Promise<Nota>;
  atualizarNota: (id: number, dados: Partial<Omit<Nota, 'id' | 'dataCriacao' | 'dataAtualizacao'>>) => Promise<void>;
  removerNota: (id: number) => Promise<void>;
  alternarModoRefugio: () => void;
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

export const useAutoconhecimentoStore = create<AutoconhecimentoState>((set, get) => ({
  notas: [],
  modoRefugio: false,
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const data = await apiCall('/api/v1/autoconhecimento/notas', 'GET');
      set({ notas: data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize autoconhecimento store:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarNota: async (nota) => {
    const novaNota = await apiCall('/api/v1/autoconhecimento/notas', 'POST', nota);
    set(state => ({
      notas: [...state.notas, novaNota].sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime())
    }));
    return novaNota;
  },

  atualizarNota: async (id, dados) => {
    const originalNotas = get().notas;
    const notasAtualizadas = originalNotas.map(n => n.id === id ? { ...n, ...dados, dataAtualizacao: new Date().toISOString() } : n);
    set({ notas: notasAtualizadas });
    try {
      await apiCall(`/api/v1/autoconhecimento/notas/${id}`, 'PUT', dados);
    } catch (error) {
      console.error(error);
      set({ notas: originalNotas }); // Reverter
    }
  },

  removerNota: async (id) => {
    const originalNotas = get().notas;
    set(state => ({ notas: state.notas.filter(n => n.id !== id) }));
    try {
      await apiCall(`/api/v1/autoconhecimento/notas/${id}`, 'DELETE');
    } catch (error) {
      console.error(error);
      set({ notas: originalNotas }); // Reverter
    }
  },

  alternarModoRefugio: () => set(state => ({ modoRefugio: !state.modoRefugio })),
}));