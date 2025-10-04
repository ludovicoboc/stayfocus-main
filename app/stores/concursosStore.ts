import { create } from 'zustand';

// Define API_BASE_URL inside the TypeScript file
const API_BASE_URL_TS = "/api/v1";

export interface ConteudoProgramatico { // Matches backend schema for reading
  id?: string; // Optional on create, present on read
  disciplina: string;
  topicos: string[];
  progresso: number;
}

export interface Concurso { // Matches backend schema for reading
  id: string;
  titulo: string;
  organizadora?: string | null; // Allow null from backend
  dataInscricao?: string | null; // Dates are strings from JSON
  dataProva?: string | null;
  edital?: string | null;
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudoProgramatico: ConteudoProgramatico[];
  // user_id is present in backend model but typically not needed in frontend store directly per user
}

// For creating a concurso (maps to ConcursoCreate schema on backend)
export interface ConcursoCreatePayload {
  titulo: string;
  organizadora?: string | null;
  dataInscricao?: string | null;
  dataProva?: string | null;
  edital?: string | null;
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudo_programatico: Omit<ConteudoProgramatico, 'id' | 'progresso'> & { progresso?: number }[];
}

// For updating a concurso (maps to ConcursoUpdate schema on backend)
export interface ConcursoUpdatePayload {
  titulo?: string;
  organizadora?: string | null;
  dataInscricao?: string | null;
  dataProva?: string | null;
  edital?: string | null;
  status?: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
}


interface ConcursosStoreState {
  concursos: Concurso[];
  isLoading: boolean;
  error: string | null;
  fetchConcursos: () => Promise<void>;
  adicionarConcurso: (concursoData: ConcursoCreatePayload) => Promise<Concurso | null>;
  removerConcurso: (id: string) => Promise<void>;
  atualizarConcurso: (id: string, concursoData: ConcursoUpdatePayload) => Promise<Concurso | null>;
  atualizarProgresso: (concursoId: string, disciplina: string, novoProgresso: number) => void;
}

const concursosApi = {
  getAll: async (): Promise<Concurso[]> => {
    const response = await fetch(\`\${API_BASE_URL_TS}/concursos\`);
    if (!response.ok) throw new Error('Failed to fetch concursos');
    return response.json();
  },
  create: async (data: ConcursoCreatePayload): Promise<Concurso> => {
    const response = await fetch(\`\${API_BASE_URL_TS}/concursos\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to create concurso' }));
      throw new Error(errorData.detail || 'Failed to create concurso');
    }
    return response.json();
  },
  update: async (id: string, data: ConcursoUpdatePayload): Promise<Concurso> => {
    const response = await fetch(\`\${API_BASE_URL_TS}/concursos/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update concurso' }));
      throw new Error(errorData.detail || 'Failed to update concurso');
    }
    return response.json();
  },
  delete: async (id: string): Promise<void> => {
    const response = await fetch(\`\${API_BASE_URL_TS}/concursos/\${id}\`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete concurso' }));
      throw new Error(errorData.detail || 'Failed to delete concurso');
    }
  },
};

export const useConcursosStore = create<ConcursosStoreState>((set, get) => ({
  concursos: [],
  isLoading: false,
  error: null,

  fetchConcursos: async () => {
    set({ isLoading: true, error: null });
    try {
      const concursos = await concursosApi.getAll();
      set({ concursos, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : String(error) });
    }
  },

  adicionarConcurso: async (concursoData) => {
    set({ isLoading: true, error: null });
    try {
      const novoConcurso = await concursosApi.create(concursoData);
      set((state) => ({
        concursos: [...state.concursos, novoConcurso],
        isLoading: false,
      }));
      return novoConcurso;
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },

  removerConcurso: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await concursosApi.delete(id);
      set((state) => ({
        concursos: state.concursos.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : String(error) });
    }
  },

  atualizarConcurso: async (id, concursoData) => {
    set({ isLoading: true, error: null });
    try {
      const concursoAtualizado = await concursosApi.update(id, concursoData);
      set((state) => ({
        concursos: state.concursos.map((c) => (c.id === id ? concursoAtualizado : c)),
        isLoading: false,
      }));
      return concursoAtualizado;
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },

  atualizarProgresso: (concursoId, disciplina, novoProgresso) => {
    set((state) => ({
      concursos: state.concursos.map((concurso) =>
        concurso.id === concursoId
          ? {
              ...concurso,
              conteudoProgramatico: concurso.conteudoProgramatico.map((c) =>
                c.disciplina === disciplina
                  ? { ...c, progresso: novoProgresso }
                  : c
              ),
            }
          : concurso
      ),
    }));
    console.warn(\`[ConcursosStore] atualizarProgresso for concurso '\${concursoId}' (disciplina '\${disciplina}') is local only. Backend sync needed.\`);
  },
}));
