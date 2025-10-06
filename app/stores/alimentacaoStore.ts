import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export type RefeicaoPlanejada = {
  id: number;
  horario: string;
  descricao: string;
};

export type RegistroRefeicao = {
  id: number;
  data: string;
  horario: string;
  descricao: string;
  tipoIcone: string | null;
  foto: string | null;
};

export type Hidratacao = {
  id: number;
  data: string;
  coposBebidos: number;
  metaDiaria: number;
};

// --- ESTADO DA STORE ---
type AlimentacaoState = {
  // Estado de inicialização e carregamento
  isInitialized: boolean;
  isLoading: boolean;

  // Planejador de Refeições
  refeicoesPlanejadas: RefeicaoPlanejada[];
  // Registro de Refeições
  refeicoesRegistradas: RegistroRefeicao[];
  // Hidratação
  hidratacao: Hidratacao | null;

  // --- AÇÕES ---
  initialize: () => Promise<void>;

  // Ações para Refeições Planejadas
  adicionarRefeicaoPlanejada: (refeicao: Omit<RefeicaoPlanejada, 'id'>) => Promise<void>;
  atualizarRefeicaoPlanejada: (id: number, updates: Partial<RefeicaoPlanejada>) => Promise<void>;
  removerRefeicaoPlanejada: (id: number) => Promise<void>;

  // Ações para Registro de Refeições
  adicionarRegistroRefeicao: (registro: Omit<RegistroRefeicao, 'id' | 'data'>) => Promise<void>;
  removerRegistroRefeicao: (id: number) => Promise<void>;

  // Ações para Hidratação
  updateHidratacao: (action: 'add_copo' | 'remove_copo' | 'ajustar_meta', value?: number) => Promise<void>;
};

export const useAlimentacaoStore = create<AlimentacaoState>((set, get) => ({
  // Estado inicial
  isInitialized: false,
  isLoading: true,
  refeicoesPlanejadas: [],
  refeicoesRegistradas: [],
  hidratacao: null,

  // Ação de inicialização
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      // Busca todos os dados em paralelo
      const [planejadasRes, registradasRes, hidratacaoRes] = await Promise.all([
        fetch('/api/v1/alimentacao/refeicoes-planejadas'),
        fetch('/api/v1/alimentacao/refeicoes-registradas'),
        fetch('/api/v1/alimentacao/hidratacao'),
      ]);

      if (!planejadasRes.ok || !registradasRes.ok || !hidratacaoRes.ok) {
        throw new Error('Falha ao buscar dados de alimentação.');
      }

      const refeicoesPlanejadas = await planejadasRes.json();
      const refeicoesRegistradas = await registradasRes.json();
      const hidratacao = await hidratacaoRes.json();

      set({
        refeicoesPlanejadas,
        refeicoesRegistradas,
        hidratacao,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      set({ isInitialized: true, isLoading: false }); // Evita loops de carregamento
    }
  },

  // --- CRUD: Refeições Planejadas ---
  adicionarRefeicaoPlanejada: async (refeicao) => {
    const response = await fetch('/api/v1/alimentacao/refeicoes-planejadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refeicao),
    });
    const novaRefeicao = await response.json();
    set((state) => ({
      refeicoesPlanejadas: [...state.refeicoesPlanejadas, novaRefeicao].sort((a, b) => a.horario.localeCompare(b.horario)),
    }));
  },

  atualizarRefeicaoPlanejada: async (id, updates) => {
    set((state) => ({
      refeicoesPlanejadas: state.refeicoesPlanejadas.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    await fetch(`/api/v1/alimentacao/refeicoes-planejadas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  removerRefeicaoPlanejada: async (id) => {
    set((state) => ({
      refeicoesPlanejadas: state.refeicoesPlanejadas.filter((r) => r.id !== id),
    }));
    await fetch(`/api/v1/alimentacao/refeicoes-planejadas/${id}`, { method: 'DELETE' });
  },

  // --- CRUD: Registros de Refeição ---
  adicionarRegistroRefeicao: async (registro) => {
    const response = await fetch('/api/v1/alimentacao/refeicoes-registradas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro),
    });
    const novoRegistro = await response.json();
    set((state) => ({
      refeicoesRegistradas: [novoRegistro, ...state.refeicoesRegistradas],
    }));
  },

  removerRegistroRefeicao: async (id) => {
    set((state) => ({
      refeicoesRegistradas: state.refeicoesRegistradas.filter((r) => r.id !== id),
    }));
    await fetch(`/api/v1/alimentacao/refeicoes-registradas/${id}`, { method: 'DELETE' });
  },

  // --- Ações de Hidratação ---
  updateHidratacao: async (action, value) => {
    const response = await fetch('/api/v1/alimentacao/hidratacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value }),
    });
    const hidratacaoAtualizada = await response.json();
    set({ hidratacao: hidratacaoAtualizada });
  },
}));