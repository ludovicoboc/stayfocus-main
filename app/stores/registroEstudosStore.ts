import { create } from 'zustand';

export type SessaoEstudo = {
  id: number; // ID numérico do banco de dados
  titulo: string;
  descricao: string;
  duracao: number; // em minutos
  data: string;
  completo: boolean;
};

interface RegistroEstudosState {
  sessoes: SessaoEstudo[];
  isInitialized: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  adicionarSessao: (sessao: Omit<SessaoEstudo, 'id' | 'data' | 'completo'>) => Promise<void>;
  removerSessao: (id: number) => Promise<void>;
  atualizarSessao: (id: number, dados: Partial<Pick<SessaoEstudo, 'titulo' | 'descricao' | 'duracao' | 'completo'>>) => Promise<void>;
}

export const useRegistroEstudosStore = create<RegistroEstudosState>((set, get) => ({
  sessoes: [],
  isInitialized: false,
  isLoading: true,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/estudos/sessoes');
      if (!response.ok) {
        throw new Error('Falha ao buscar sessões de estudo.');
      }
      const data = await response.json();
      const sessoesFormatadas: SessaoEstudo[] = data.map((s: any) => ({
        ...s,
        completo: Boolean(s.completo),
      }));
      set({ sessoes: sessoesFormatadas, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  adicionarSessao: async (sessao) => {
    try {
      const response = await fetch('/api/v1/estudos/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessao),
      });
      if (!response.ok) {
        throw new Error('Falha ao adicionar sessão.');
      }
      const novaSessao: SessaoEstudo = await response.json();
      set((state) => ({
        sessoes: [{ ...novaSessao, completo: Boolean(novaSessao.completo) }, ...state.sessoes],
      }));
    } catch (error) {
      console.error(error);
    }
  },

  removerSessao: async (id) => {
    const originalSessoes = get().sessoes;
    set((state) => ({
      sessoes: state.sessoes.filter((s) => s.id !== id),
    }));
    try {
      const response = await fetch(`/api/v1/estudos/sessoes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao remover sessão.');
    } catch (error) {
      console.error(error);
      set({ sessoes: originalSessoes });
    }
  },

  atualizarSessao: async (id, dados) => {
    const originalSessoes = get().sessoes;
    const sessoesAtualizadas = originalSessoes.map((s) =>
      s.id === id ? { ...s, ...dados } : s
    );
    set({ sessoes: sessoesAtualizadas });
    try {
      const response = await fetch(`/api/v1/estudos/sessoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!response.ok) throw new Error('Falha ao atualizar sessão.');
    } catch (error) {
      console.error(error);
      set({ sessoes: originalSessoes });
    }
  },
}));