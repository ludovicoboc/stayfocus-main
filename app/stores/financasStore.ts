import { create } from 'zustand';

// --- TIPOS DE DADOS ---
export type Categoria = {
  id: number;
  nome: string;
  cor: string;
  icone: string;
};

export type Transacao = {
  id: number;
  data: string;
  valor: number;
  descricao: string;
  categoriaId: number;
  tipo: 'receita' | 'despesa';
};

export type Envelope = {
  id: number;
  nome: string;
  cor: string;
  valorAlocado: number;
  valorUtilizado: number;
};

export type PagamentoRecorrente = {
  id: number;
  descricao: string;
  valor: number;
  dataVencimento: string;
  categoriaId: number;
  proximoPagamento: string | null;
  pago: boolean;
};

// --- ESTADO DA STORE ---
type FinancasState = {
  isInitialized: boolean;
  isLoading: boolean;
  categorias: Categoria[];
  transacoes: Transacao[];
  envelopes: Envelope[];
  pagamentosRecorrentes: PagamentoRecorrente[];
  initialize: () => Promise<void>;
  
  // Ações de Categoria
  adicionarCategoria: (cat: Omit<Categoria, 'id'>) => Promise<void>;
  atualizarCategoria: (id: number, cat: Omit<Categoria, 'id'>) => Promise<void>;
  removerCategoria: (id: number) => Promise<void>;
  
  // Ações de Transação
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => Promise<void>;
  removerTransacao: (id: number) => Promise<void>;
  
  // Ações de Envelope
  adicionarEnvelope: (envelope: Omit<Envelope, 'id' | 'valorUtilizado'>) => Promise<void>;
  atualizarEnvelope: (id: number, updates: Partial<Envelope>) => Promise<void>;
  removerEnvelope: (id: number) => Promise<void>;

  // Ações de Pagamento Recorrente
  adicionarPagamento: (pagamento: Omit<PagamentoRecorrente, 'id' | 'proximoPagamento' | 'pago'>) => Promise<void>;
  atualizarPagamento: (id: number, updates: Partial<PagamentoRecorrente>) => Promise<void>;
  removerPagamento: (id: number) => Promise<void>;
};

// Helper para fazer chamadas à API
async function apiCall(endpoint: string, method: string, body?: any) {
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Falha na operação ${method} para ${endpoint}`);
  }
  return response.json();
}

export const useFinancasStore = create<FinancasState>((set, get) => ({
  isInitialized: false,
  isLoading: true,
  categorias: [],
  transacoes: [],
  envelopes: [],
  pagamentosRecorrentes: [],

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const [categorias, transacoes, envelopes, pagamentos] = await Promise.all([
        apiCall('/api/v1/financas/categorias', 'GET'),
        apiCall('/api/v1/financas/transacoes', 'GET'),
        apiCall('/api/v1/financas/envelopes', 'GET'),
        apiCall('/api/v1/financas/pagamentos-recorrentes', 'GET'),
      ]);
      set({
        categorias: categorias,
        transacoes: transacoes,
        envelopes: envelopes,
        pagamentosRecorrentes: pagamentos.map((p: any) => ({ ...p, pago: Boolean(p.pago) })),
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erro ao inicializar financasStore:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // --- Implementação das Ações ---

  adicionarCategoria: async (cat) => {
    const novaCategoria = await apiCall('/api/v1/financas/categorias', 'POST', cat);
    set(state => ({ categorias: [...state.categorias, novaCategoria] }));
  },
  atualizarCategoria: async (id, cat) => {
    await apiCall(`/api/v1/financas/categorias/${id}`, 'PUT', cat);
    set(state => ({
      categorias: state.categorias.map(c => c.id === id ? { ...c, ...cat } : c)
    }));
  },
  removerCategoria: async (id) => {
    await apiCall(`/api/v1/financas/categorias/${id}`, 'DELETE');
    set(state => ({
      categorias: state.categorias.filter(c => c.id !== id),
      // O DB cuida da cascata, mas é bom limpar o estado local também
      transacoes: state.transacoes.filter(t => t.categoriaId !== id),
      pagamentosRecorrentes: state.pagamentosRecorrentes.filter(p => p.categoriaId !== id),
    }));
  },

  adicionarTransacao: async (transacao) => {
    const novaTransacao = await apiCall('/api/v1/financas/transacoes', 'POST', transacao);
    set(state => ({ transacoes: [novaTransacao, ...state.transacoes] }));
  },
  removerTransacao: async (id) => {
    await apiCall(`/api/v1/financas/transacoes/${id}`, 'DELETE');
    set(state => ({ transacoes: state.transacoes.filter(t => t.id !== id) }));
  },

  adicionarEnvelope: async (envelope) => {
    const novoEnvelope = await apiCall('/api/v1/financas/envelopes', 'POST', envelope);
    set(state => ({ envelopes: [...state.envelopes, novoEnvelope] }));
  },
  atualizarEnvelope: async (id, updates) => {
    await apiCall(`/api/v1/financas/envelopes/${id}`, 'PUT', updates);
    set(state => ({
      envelopes: state.envelopes.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  },
  removerEnvelope: async (id) => {
    await apiCall(`/api/v1/financas/envelopes/${id}`, 'DELETE');
    set(state => ({ envelopes: state.envelopes.filter(e => e.id !== id) }));
  },

  adicionarPagamento: async (pagamento) => {
    const novoPagamento = await apiCall('/api/v1/financas/pagamentos-recorrentes', 'POST', pagamento);
    set(state => ({ pagamentosRecorrentes: [...state.pagamentosRecorrentes, { ...novoPagamento, pago: Boolean(novoPagamento.pago) }] }));
  },
  atualizarPagamento: async (id, updates) => {
    await apiCall(`/api/v1/financas/pagamentos-recorrentes/${id}`, 'PUT', updates);
    set(state => ({
      pagamentosRecorrentes: state.pagamentosRecorrentes.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  },
  removerPagamento: async (id) => {
    await apiCall(`/api/v1/financas/pagamentos-recorrentes/${id}`, 'DELETE');
    set(state => ({ pagamentosRecorrentes: state.pagamentosRecorrentes.filter(p => p.id !== id) }));
  },
}));