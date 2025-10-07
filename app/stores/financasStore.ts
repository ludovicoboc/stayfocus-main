import { create } from 'zustand'
import * as financasService from '@/app/lib/services/financasService'

// Tipos
export type Categoria = {
  id: string
  nome: string
  cor: string
  icone: string
}

export type Transacao = {
  id: string
  data: string
  valor: number
  descricao: string
  categoria_id: string
  tipo: 'receita' | 'despesa'
}

export type Envelope = {
  id: string
  nome: string
  cor: string
  valor_alocado: number
  valor_utilizado: number
}

export type PagamentoRecorrente = {
  id: string
  descricao: string
  valor: number
  data_vencimento: string // dia do mês (1-31)
  categoria_id: string
  proximo_pagamento: string | null // data do próximo pagamento (YYYY-MM-DD)
  pago: boolean
}

type FinancasState = {
  categorias: Categoria[]
  transacoes: Transacao[]
  envelopes: Envelope[]
  pagamentosRecorrentes: PagamentoRecorrente[]
  loading: boolean
  error: string | null

  fetchFinancasData: () => Promise<void>

  // Ações de Categoria
  adicionarCategoria: (nome: string, cor: string, icone: string) => Promise<void>
  atualizarCategoria: (id: string, updates: Partial<Omit<Categoria, 'id'>>) => Promise<void>
  removerCategoria: (id: string) => Promise<void>

  // Ações de Transação
  adicionarTransacao: (transacao: Omit<Transacao, 'id'>) => Promise<void>
  removerTransacao: (id: string) => Promise<void>

  // Ações de Envelope
  adicionarEnvelope: (envelope: Omit<Envelope, 'id'>) => Promise<void>
  atualizarEnvelope: (id: string, updates: Partial<Omit<Envelope, 'id'>>) => Promise<void>
  removerEnvelope: (id: string) => Promise<void>

  // Ações de Pagamento Recorrente
  adicionarPagamentoRecorrente: (pagamento: Omit<PagamentoRecorrente, 'id'>) => Promise<void>
  atualizarPagamentoRecorrente: (id: string, updates: Partial<Omit<PagamentoRecorrente, 'id'>>) => Promise<void>
  removerPagamentoRecorrente: (id: string) => Promise<void>
}

export const useFinancasStore = create<FinancasState>((set) => ({
  categorias: [],
  transacoes: [],
  envelopes: [],
  pagamentosRecorrentes: [],
  loading: true,
  error: null,

  fetchFinancasData: async () => {
    try {
      set({ loading: true, error: null })
      const data = await financasService.fetchFinancasData()
      set({ ...data, loading: false })
    } catch (error) {
      set({ loading: false, error: (error as Error).message })
    }
  },

  // --- Ações de Categoria ---
  adicionarCategoria: async (nome, cor, icone) => {
    const novaCategoria = await financasService.addCategoria({ nome, cor, icone })
    set((state) => ({ categorias: [...state.categorias, novaCategoria] }))
  },
  atualizarCategoria: async (id, updates) => {
    const categoriaAtualizada = await financasService.updateCategoria(id, updates)
    set((state) => ({
      categorias: state.categorias.map((c) => (c.id === id ? categoriaAtualizada : c)),
    }))
  },
  removerCategoria: async (id) => {
    await financasService.deleteCategoria(id)
    set((state) => ({
      categorias: state.categorias.filter((c) => c.id !== id),
    }))
  },

  // --- Ações de Transação ---
  adicionarTransacao: async (transacao) => {
    const novaTransacao = await financasService.addTransacao(transacao)
    set((state) => ({ transacoes: [...state.transacoes, novaTransacao] }))
  },
  removerTransacao: async (id) => {
    await financasService.deleteTransacao(id)
    set((state) => ({
      transacoes: state.transacoes.filter((t) => t.id !== id),
    }))
  },

  // --- Ações de Envelope ---
  adicionarEnvelope: async (envelope) => {
    const novoEnvelope = await financasService.addEnvelope(envelope)
    set((state) => ({ envelopes: [...state.envelopes, novoEnvelope] }))
  },
  atualizarEnvelope: async (id, updates) => {
    const envelopeAtualizado = await financasService.updateEnvelope(id, updates)
    set((state) => ({
      envelopes: state.envelopes.map((e) => (e.id === id ? envelopeAtualizado : e)),
    }))
  },
  removerEnvelope: async (id) => {
    await financasService.deleteEnvelope(id)
    set((state) => ({
      envelopes: state.envelopes.filter((e) => e.id !== id),
    }))
  },

  // --- Ações de Pagamento Recorrente ---
  adicionarPagamentoRecorrente: async (pagamento) => {
    const novoPagamento = await financasService.addPagamentoRecorrente(pagamento)
    set((state) => ({ pagamentosRecorrentes: [...state.pagamentosRecorrentes, novoPagamento] }))
  },
  atualizarPagamentoRecorrente: async (id, updates) => {
    const pagamentoAtualizado = await financasService.updatePagamentoRecorrente(id, updates)
    set((state) => ({
      pagamentosRecorrentes: state.pagamentosRecorrentes.map((p) => (p.id === id ? pagamentoAtualizado : p)),
    }))
  },
  removerPagamentoRecorrente: async (id) => {
    await financasService.deletePagamentoRecorrente(id)
    set((state) => ({
      pagamentosRecorrentes: state.pagamentosRecorrentes.filter((p) => p.id !== id),
    }))
  },
}))
