import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export interface Alternativa {
  id: number;
  texto: string;
  correta: boolean;
}

export interface Questao {
  id: number;
  concursoId: number;
  disciplina: string;
  topico: string;
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorretaId: number;
  justificativa?: string;
  nivelDificuldade?: 'facil' | 'medio' | 'dificil';
  ano?: number;
  banca?: string;
  tags?: string[];
}

// --- ESTADO DA STORE ---
interface QuestoesStore {
  questoes: Questao[];
  isLoading: boolean;
  isInitialized: boolean;
  currentConcursoId: number | null;
  initialize: (concursoId: number) => Promise<void>;
  adicionarQuestao: (concursoId: number, questao: Omit<Questao, 'id' | 'concursoId'>) => Promise<void>;
  atualizarQuestao: (concursoId: number, questaoId: number, questao: Partial<Questao>) => Promise<void>;
  removerQuestao: (concursoId: number, questaoId: number) => Promise<void>;
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

export const useQuestoesStore = create<QuestoesStore>((set, get) => ({
  questoes: [],
  isLoading: false,
  isInitialized: false,
  currentConcursoId: null,

  initialize: async (concursoId) => {
    // Evita recarregar se já for para o mesmo concurso
    if (get().isInitialized && get().currentConcursoId === concursoId) return;

    set({ isLoading: true, isInitialized: false, currentConcursoId: concursoId });
    try {
      const data = await apiCall(`/api/v1/concursos/${concursoId}/questoes`, 'GET');
      set({ questoes: data, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error("Failed to initialize questoes store:", error);
      set({ isLoading: false, isInitialized: true, questoes: [] });
    }
  },

  adicionarQuestao: async (concursoId, questao) => {
    const novaQuestao = await apiCall(`/api/v1/concursos/${concursoId}/questoes`, 'POST', questao);
    set(state => ({
      questoes: [...state.questoes, novaQuestao]
    }));
  },

  atualizarQuestao: async (concursoId, questaoId, questao) => {
    await apiCall(`/api/v1/concursos/${concursoId}/questoes/${questaoId}`, 'PUT', questao);
    set(state => ({
      questoes: state.questoes.map(q => q.id === questaoId ? { ...q, ...questao } : q)
    }));
  },

  removerQuestao: async (concursoId, questaoId) => {
    await apiCall(`/api/v1/concursos/${concursoId}/questoes/${questaoId}`, 'DELETE');
    set(state => ({
      questoes: state.questoes.filter(q => q.id !== questaoId)
    }));
  },
}));