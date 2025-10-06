import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export interface ConteudoProgramatico {
  id: number;
  concursoId: number;
  disciplina: string;
  topicos: string[];
  progresso: number;
}

export interface SimuladoFavorito {
  id: number;
  concursoId: number;
  nome: string;
  data: string;
  link: string;
}

export interface Concurso {
  id: number;
  titulo: string;
  organizadora: string;
  dataInscricao: string;
  dataProva: string;
  edital?: string;
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudoProgramatico: ConteudoProgramatico[];
  simuladosFavoritos?: SimuladoFavorito[]; // Adicionado para conter os simulados
}

// --- ESTADO DA STORE ---
interface ConcursosStore {
  concursos: Concurso[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;

  // Ações de Concurso
  adicionarConcurso: (concurso: Omit<Concurso, 'id' | 'simuladosFavoritos'>) => Promise<void>;
  removerConcurso: (id: number) => Promise<void>;
  atualizarConcurso: (id: number, concurso: Partial<Omit<Concurso, 'id' | 'conteudoProgramatico' | 'simuladosFavoritos'>>) => Promise<void>;

  // Ações de Conteúdo Programático
  atualizarProgresso: (concursoId: number, conteudoId: number, novoProgresso: number) => Promise<void>;

  // Ações de Simulados Favoritos
  fetchSimulados: (concursoId: number) => Promise<void>;
  adicionarSimulado: (concursoId: number, simulado: Omit<SimuladoFavorito, 'id' | 'concursoId'>) => Promise<void>;
  removerSimulado: (concursoId: number, simuladoId: number) => Promise<void>;
  atualizarSimulado: (concursoId: number, simuladoId: number, updates: Partial<SimuladoFavorito>) => Promise<void>;
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

export const useConcursosStore = create<ConcursosStore>((set, get) => ({
  concursos: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const data = await apiCall('/api/v1/concursos', 'GET');
      set({ concursos: data, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize concursos store:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarConcurso: async (concurso) => {
    const novoConcurso = await apiCall('/api/v1/concursos', 'POST', concurso);
    set(state => ({ concursos: [...state.concursos, novoConcurso] }));
  },

  removerConcurso: async (id) => {
    await apiCall(`/api/v1/concursos/${id}`, 'DELETE');
    set(state => ({ concursos: state.concursos.filter(c => c.id !== id) }));
  },

  atualizarConcurso: async (id, dadosAtualizados) => {
    await apiCall(`/api/v1/concursos/${id}`, 'PUT', dadosAtualizados);
    set(state => ({
      concursos: state.concursos.map(c => c.id === id ? { ...c, ...dadosAtualizados } : c),
    }));
  },

  atualizarProgresso: async (concursoId, conteudoId, novoProgresso) => {
    await apiCall(`/api/v1/concursos/${concursoId}/conteudos/${conteudoId}`, 'PUT', { progresso: novoProgresso });
    set(state => ({
      concursos: state.concursos.map(concurso =>
        concurso.id === concursoId ? {
          ...concurso,
          conteudoProgramatico: concurso.conteudoProgramatico.map(c =>
            c.id === conteudoId ? { ...c, progresso: novoProgresso } : c
          ),
        } : concurso
      ),
    }));
  },

  fetchSimulados: async (concursoId) => {
    const simulados = await apiCall(`/api/v1/concursos/${concursoId}/simulados-favoritos`, 'GET');
    set(state => ({
      concursos: state.concursos.map(c =>
        c.id === concursoId ? { ...c, simuladosFavoritos: simulados } : c
      ),
    }));
  },

  adicionarSimulado: async (concursoId, simulado) => {
    const novoSimulado = await apiCall(`/api/v1/concursos/${concursoId}/simulados-favoritos`, 'POST', simulado);
    set(state => ({
      concursos: state.concursos.map(c =>
        c.id === concursoId ? { ...c, simuladosFavoritos: [...(c.simuladosFavoritos || []), novoSimulado] } : c
      ),
    }));
  },

  removerSimulado: async (concursoId, simuladoId) => {
    await apiCall(`/api/v1/concursos/${concursoId}/simulados-favoritos/${simuladoId}`, 'DELETE');
    set(state => ({
      concursos: state.concursos.map(c =>
        c.id === concursoId ? { ...c, simuladosFavoritos: (c.simuladosFavoritos || []).filter(s => s.id !== simuladoId) } : c
      ),
    }));
  },

  atualizarSimulado: async (concursoId, simuladoId, updates) => {
      await apiCall(`/api/v1/concursos/${concursoId}/simulados-favoritos/${simuladoId}`, 'PUT', updates);
      set(state => ({
          concursos: state.concursos.map(c =>
              c.id === concursoId ? { ...c, simuladosFavoritos: (c.simuladosFavoritos || []).map(s => s.id === simuladoId ? {...s, ...updates} : s) } : c
          ),
      }));
  }
}));