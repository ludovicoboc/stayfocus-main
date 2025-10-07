import { create } from 'zustand'
import * as hiperfocosService from '@/app/lib/services/hiperfocosService'

// Tipos
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  cor?: string
}

export type Hiperfoco = {
  id: string
  titulo: string
  descricao: string
  tarefas: Tarefa[]
  subTarefas: Record<string, Tarefa[]> // Id da tarefa pai -> lista de sub-tarefas
  cor: string
  data_criacao: string
  tempo_limite?: number // em minutos, opcional
}

export type SessaoAlternancia = {
  id: string
  titulo: string
  hiperfoco_atual: string | null // ID do hiperfoco ativo
  hiperfoco_anterior: string | null // ID do hiperfoco anterior
  inicio: string
  duracao_estimada: number // em minutos
  concluida: boolean
}

type HiperfocosState = {
  hiperfocos: Hiperfoco[]
  sessoes: SessaoAlternancia[]
  loading: boolean
  error: string | null

  fetchHiperfocosData: () => Promise<void>
  
  // Ações de Hiperfoco
  adicionarHiperfoco: (titulo: string, descricao: string, cor: string, tempoLimite?: number) => Promise<void>
  atualizarHiperfoco: (id: string, updates: Partial<Omit<Hiperfoco, 'id' | 'tarefas' | 'subTarefas' | 'data_criacao'>>) => Promise<void>
  removerHiperfoco: (id: string) => Promise<void>
  
  // Ações de Tarefa
  adicionarTarefa: (hiperfocoId: string, texto: string) => Promise<void>
  atualizarTarefa: (id: string, updates: Partial<Omit<Tarefa, 'id'>>) => Promise<void>
  toggleTarefaConcluida: (hiperfocoId: string, tarefaId: string) => Promise<void>
  removerTarefa: (hiperfocoId: string, tarefaId: string) => Promise<void>
  
  // Ações de Sub-tarefa
  adicionarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, texto: string) => Promise<void>
  atualizarSubTarefa: (id: string, updates: Partial<Omit<Tarefa, 'id'>>) => Promise<void>
  toggleSubTarefaConcluida: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => Promise<void>
  removerSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => Promise<void>

  // Ações de Sessão de Alternância
  adicionarSessao: (sessao: Omit<SessaoAlternancia, 'id'>) => Promise<void>
  atualizarSessao: (id: string, updates: Partial<Omit<SessaoAlternancia, 'id'>>) => Promise<void>
  removerSessao: (id: string) => Promise<void>
}

export const useHiperfocosStore = create<HiperfocosState>((set, get) => ({
  hiperfocos: [],
  sessoes: [],
  loading: true,
  error: null,

  fetchHiperfocosData: async () => {
    try {
      set({ loading: true, error: null });
      const { hiperfocos, sessoes } = await hiperfocosService.fetchHiperfocosData();
      set({ hiperfocos, sessoes, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  // --- Ações de Hiperfoco ---
  adicionarHiperfoco: async (titulo, descricao, cor, tempoLimite) => {
    const data_criacao = new Date().toISOString();
    const novoHiperfoco = await hiperfocosService.addHiperfoco({ titulo, descricao, cor, tempo_limite: tempoLimite, data_criacao });
    set((state) => ({ hiperfocos: [...state.hiperfocos, novoHiperfoco] }));
  },
  atualizarHiperfoco: async (id, updates) => {
    const hiperfocoAtualizado = await hiperfocosService.updateHiperfoco(id, updates);
    set((state) => ({
      hiperfocos: state.hiperfocos.map((h) => (h.id === id ? { ...h, ...hiperfocoAtualizado } : h)),
    }));
  },
  removerHiperfoco: async (id) => {
    await hiperfocosService.deleteHiperfoco(id);
    set((state) => ({
      hiperfocos: state.hiperfocos.filter((h) => h.id !== id),
    }));
  },

  // --- Ações de Tarefa ---
  adicionarTarefa: async (hiperfocoId, texto) => {
    const novaTarefa = await hiperfocosService.addTarefa({ texto, concluida: false }, hiperfocoId);
    set((state) => ({
      hiperfocos: state.hiperfocos.map((h) =>
        h.id === hiperfocoId ? { ...h, tarefas: [...h.tarefas, novaTarefa] } : h
      ),
    }));
  },
  atualizarTarefa: async (id, updates) => {
    const tarefaAtualizada = await hiperfocosService.updateTarefa(id, updates);
    set((state) => ({
      hiperfocos: state.hiperfocos.map((h) => ({
        ...h,
        tarefas: h.tarefas.map((t) => (t.id === id ? tarefaAtualizada : t)),
      })),
    }));
  },
  toggleTarefaConcluida: async (hiperfocoId, tarefaId) => {
    const { hiperfocos } = get();
    const hiperfoco = hiperfocos.find(h => h.id === hiperfocoId);
    const tarefa = hiperfoco?.tarefas.find(t => t.id === tarefaId);

    if (!tarefa) return;

    try {
      const tarefaAtualizada = await hiperfocosService.updateTarefa(tarefaId, { concluida: !tarefa.concluida });
      set((state) => ({
        hiperfocos: state.hiperfocos.map((h) => {
          if (h.id === hiperfocoId) {
            return {
              ...h,
              tarefas: h.tarefas.map((t) => (t.id === tarefaId ? tarefaAtualizada : t)),
            };
          }
          return h;
        }),
      }));
    } catch (error) {
      console.error("Erro ao alternar tarefa:", error);
    }
  },
  removerTarefa: async (hiperfocoId, tarefaId) => {
    await hiperfocosService.deleteTarefa(tarefaId);
    set((state) => ({
      hiperfocos: state.hiperfocos.map((h) =>
        h.id === hiperfocoId ? { ...h, tarefas: h.tarefas.filter((t) => t.id !== tarefaId) } : h
      ),
    }));
  },

  // --- Ações de Sub-tarefa ---
  adicionarSubTarefa: async (hiperfocoId, tarefaPaiId, texto) => {
    const novaSubtarefa = await hiperfocosService.addSubTarefa({ texto, concluida: false }, tarefaPaiId);
    set((state) => ({
        hiperfocos: state.hiperfocos.map((h) => {
            if (h.id === hiperfocoId) {
                const newSubTarefas = { ...h.subTarefas };
                newSubTarefas[tarefaPaiId] = [...(newSubTarefas[tarefaPaiId] || []), novaSubtarefa];
                return { ...h, subTarefas: newSubTarefas };
            }
            return h;
        }),
    }));
  },
  atualizarSubTarefa: async (id, updates) => {
    const subtarefaAtualizada = await hiperfocosService.updateSubTarefa(id, updates);
     set((state) => ({
      hiperfocos: state.hiperfocos.map((h) => ({
        ...h,
        subTarefas: Object.entries(h.subTarefas).reduce((acc, [key, value]) => {
          acc[key] = value.map(st => st.id === id ? subtarefaAtualizada : st);
          return acc;
        }, {} as Record<string, Tarefa[]>)
      })),
    }));
  },
  toggleSubTarefaConcluida: async (hiperfocoId, tarefaPaiId, subTarefaId) => {
    const { hiperfocos } = get();
    const hiperfoco = hiperfocos.find(h => h.id === hiperfocoId);
    const subTarefa = hiperfoco?.subTarefas[tarefaPaiId]?.find(st => st.id === subTarefaId);

    if (!subTarefa) return;

    try {
      const subtarefaAtualizada = await hiperfocosService.updateSubTarefa(subTarefaId, { concluida: !subTarefa.concluida });
      set((state) => ({
        hiperfocos: state.hiperfocos.map((h) => {
          if (h.id === hiperfocoId) {
            const newSubTarefas = { ...h.subTarefas };
            newSubTarefas[tarefaPaiId] = newSubTarefas[tarefaPaiId].map(st =>
              st.id === subTarefaId ? subtarefaAtualizada : st
            );
            return { ...h, subTarefas: newSubTarefas };
          }
          return h;
        }),
      }));
    } catch (error) {
      console.error("Erro ao alternar subtarefa:", error);
    }
  },
  removerSubTarefa: async (hiperfocoId, tarefaPaiId, subTarefaId) => {
    await hiperfocosService.deleteSubTarefa(subTarefaId);
    set((state) => ({
        hiperfocos: state.hiperfocos.map((h) => {
            if (h.id === hiperfocoId) {
                const newSubTarefas = { ...h.subTarefas };
                newSubTarefas[tarefaPaiId] = newSubTarefas[tarefaPaiId].filter(st => st.id !== subTarefaId);
                return { ...h, subTarefas: newSubTarefas };
            }
            return h;
        }),
    }));
  },

  // --- Ações de Sessão ---
  adicionarSessao: async (sessao) => {
    const novaSessao = await hiperfocosService.addSessao(sessao);
    set((state) => ({ sessoes: [...state.sessoes, novaSessao] }));
  },
  atualizarSessao: async (id, updates) => {
    const sessaoAtualizada = await hiperfocosService.updateSessao(id, updates);
    set((state) => ({
      sessoes: state.sessoes.map((s) => (s.id === id ? sessaoAtualizada : s)),
    }));
  },
  removerSessao: async (id) => {
    await hiperfocosService.deleteSessao(id);
    set((state) => ({
      sessoes: state.sessoes.filter((s) => s.id !== id),
    }));
  },
}))
