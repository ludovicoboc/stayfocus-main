import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export type RegistroSono = {
  id: number;
  inicio: string; // ISO date string
  fim: string | null;
  qualidade: number | null;
  notas: string;
};

export type ConfiguracaoLembrete = {
  id: number;
  tipo: 'dormir' | 'acordar';
  horario: string; // Formato HH:MM
  diasSemana: number[]; // 0-6
  ativo: boolean;
};

// --- ESTADO DA STORE ---
interface SonoState {
  registros: RegistroSono[];
  lembretes: ConfiguracaoLembrete[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarRegistroSono: (registro: Omit<RegistroSono, 'id'>) => Promise<void>;
  atualizarRegistroSono: (id: number, dados: Partial<Omit<RegistroSono, 'id'>>) => Promise<void>;
  removerRegistroSono: (id: number) => Promise<void>;
  adicionarLembrete: (lembrete: Omit<ConfiguracaoLembrete, 'id' | 'ativo'>) => Promise<void>;
  atualizarLembrete: (id: number, dados: Partial<Omit<ConfiguracaoLembrete, 'id'>>) => Promise<void>;
  removerLembrete: (id: number) => Promise<void>;
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

export const useSonoStore = create<SonoState>((set, get) => ({
  registros: [],
  lembretes: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const [registros, lembretes] = await Promise.all([
        apiCall('/api/v1/sono/registros', 'GET'),
        apiCall('/api/v1/sono/lembretes', 'GET'),
      ]);
      set({
        registros: registros.map((r: any) => ({ ...r, qualidade: r.qualidade === null ? null : Number(r.qualidade) })),
        lembretes: lembretes.map((l: any) => ({ ...l, ativo: Boolean(l.ativo) })),
        isInitialized: true,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to initialize sono store:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarRegistroSono: async (registro) => {
    const novoRegistro = await apiCall('/api/v1/sono/registros', 'POST', registro);
    set(state => ({ registros: [novoRegistro, ...state.registros] }));
  },

  atualizarRegistroSono: async (id, dados) => {
    await apiCall(`/api/v1/sono/registros/${id}`, 'PUT', dados);
    set(state => ({
      registros: state.registros.map(r => r.id === id ? { ...r, ...dados } : r)
    }));
  },

  removerRegistroSono: async (id) => {
    await apiCall(`/api/v1/sono/registros/${id}`, 'DELETE');
    set(state => ({ registros: state.registros.filter(r => r.id !== id) }));
  },

  adicionarLembrete: async (lembrete) => {
    const novoLembrete = await apiCall('/api/v1/sono/lembretes', 'POST', lembrete);
    set(state => ({ lembretes: [...state.lembretes, novoLembrete] }));
  },

  atualizarLembrete: async (id, dados) => {
    await apiCall(`/api/v1/sono/lembretes/${id}`, 'PUT', dados);
    set(state => ({
      lembretes: state.lembretes.map(l => l.id === id ? { ...l, ...dados } : l)
    }));
  },

  removerLembrete: async (id) => {
    await apiCall(`/api/v1/sono/lembretes/${id}`, 'DELETE');
    set(state => ({ lembretes: state.lembretes.filter(l => l.id !== id) }));
  },
}));