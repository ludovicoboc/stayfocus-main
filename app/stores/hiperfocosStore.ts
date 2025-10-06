import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export type Tarefa = {
  id: number;
  texto: string;
  concluida: boolean;
  hiperfocoId: number;
  tarefaPaiId: number | null;
};

export type Hiperfoco = {
  id: number;
  titulo: string;
  descricao: string;
  tarefas: Tarefa[];
  subTarefas: Record<string, Tarefa[]>;
  cor: string;
  dataCriacao: string;
  tempoLimite?: number;
};

export type SessaoAlternancia = {
  id: number;
  titulo: string;
  hiperfocoAtualId: number | null;
  hiperfocoAnteriorId: number | null;
  tempoInicio: string;
  duracaoEstimada: number;
  concluida: boolean;
};

// --- ESTADO DA STORE ---
type HiperfocosState = {
  isInitialized: boolean;
  isLoading: boolean;
  hiperfocos: Hiperfoco[];
  sessoes: SessaoAlternancia[];
  initialize: () => Promise<void>;
  
  // Ações de Hiperfoco
  adicionarHiperfoco: (data: Omit<Hiperfoco, 'id' | 'dataCriacao' | 'tarefas' | 'subTarefas'>) => Promise<Hiperfoco>;
  atualizarHiperfoco: (id: number, data: Omit<Hiperfoco, 'id' | 'dataCriacao' | 'tarefas' | 'subTarefas'>) => Promise<void>;
  removerHiperfoco: (id: number) => Promise<void>;
  
  // Ações de Tarefa/Subtarefa
  adicionarTarefa: (hiperfocoId: number, texto: string, tarefaPaiId?: number) => Promise<void>;
  atualizarTarefa: (hiperfocoId: number, tarefaId: number, updates: Partial<Pick<Tarefa, 'texto' | 'concluida'>>) => Promise<void>;
  removerTarefa: (hiperfocoId: number, tarefaId: number) => Promise<void>;

  // Ações de Sessão de Alternância
  adicionarSessao: (data: Omit<SessaoAlternancia, 'id' | 'tempoInicio' | 'concluida' | 'hiperfocoAnteriorId'>) => Promise<void>;
  atualizarSessao: (id: number, updates: Partial<SessaoAlternancia>) => Promise<void>;
  removerSessao: (id: number) => Promise<void>;
};

// Helper para chamadas de API
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

export const useHiperfocosStore = create<HiperfocosState>((set, get) => ({
  isInitialized: false,
  isLoading: true,
  hiperfocos: [],
  sessoes: [],

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const [hiperfocos, sessoes] = await Promise.all([
        apiCall('/api/v1/hiperfocos', 'GET'),
        apiCall('/api/v1/hiperfocos/sessoes-alternancia', 'GET'),
      ]);
      set({ hiperfocos, sessoes, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize hiperfocos store:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // --- Ações ---

  adicionarHiperfoco: async (data) => {
    const novoHiperfoco = await apiCall('/api/v1/hiperfocos', 'POST', data);
    set(state => ({ hiperfocos: [...state.hiperfocos, novoHiperfoco] }));
    return novoHiperfoco; // Retornar o objeto criado
  },
  atualizarHiperfoco: async (id, data) => {
    await apiCall(`/api/v1/hiperfocos/${id}`, 'PUT', data);
    set(state => ({
      hiperfocos: state.hiperfocos.map(h => h.id === id ? { ...h, ...data } : h)
    }));
  },
  removerHiperfoco: async (id) => {
    await apiCall(`/api/v1/hiperfocos/${id}`, 'DELETE');
    set(state => ({ hiperfocos: state.hiperfocos.filter(h => h.id !== id) }));
  },

  adicionarTarefa: async (hiperfocoId, texto, tarefaPaiId) => {
    const novaTarefa = await apiCall(`/api/v1/hiperfocos/${hiperfocoId}/tarefas`, 'POST', { texto, tarefaPaiId });
    set(state => ({
      hiperfocos: state.hiperfocos.map(h => {
        if (h.id === hiperfocoId) {
          const tarefasAtualizadas = [...h.tarefas, novaTarefa];
          return { ...h, tarefas: tarefasAtualizadas };
        }
        return h;
      })
    }));
    get().initialize(); // Recarregar para garantir consistência de subtarefas
  },
  atualizarTarefa: async (hiperfocoId, tarefaId, updates) => {
    await apiCall(`/api/v1/hiperfocos/${hiperfocoId}/tarefas/${tarefaId}`, 'PUT', updates);
    get().initialize(); // Recarregar para garantir consistência
  },
  removerTarefa: async (hiperfocoId, tarefaId) => {
    await apiCall(`/api/v1/hiperfocos/${hiperfocoId}/tarefas/${tarefaId}`, 'DELETE');
    get().initialize(); // Recarregar para garantir consistência
  },

  adicionarSessao: async (data) => {
    const novaSessao = await apiCall('/api/v1/hiperfocos/sessoes-alternancia', 'POST', data);
    set(state => ({ sessoes: [...state.sessoes, novaSessao] }));
  },
  atualizarSessao: async (id, updates) => {
    await apiCall(`/api/v1/hiperfocos/sessoes-alternancia/${id}`, 'PUT', updates);
    set(state => ({
      sessoes: state.sessoes.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  },
  removerSessao: async (id) => {
    await apiCall(`/api/v1/hiperfocos/sessoes-alternancia/${id}`, 'DELETE');
    set(state => ({ sessoes: state.sessoes.filter(s => s.id !== id) }));
  },
}));