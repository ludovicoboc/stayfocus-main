import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

export interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}

export interface Questao {
  id: string;
  concursoId?: string; // Para vincular a um concurso específico, se aplicável
  disciplina: string;
  topico: string;
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorreta: string; // ID da alternativa correta
  justificativa?: string;
  nivelDificuldade?: 'facil' | 'medio' | 'dificil';
  ano?: number;
  banca?: string;
  tags?: string[];
  respondida?: boolean; // Para controle em simulados
  respostaUsuario?: string; // ID da alternativa escolhida pelo usuário
  acertou?: boolean; // Resultado da resposta do usuário
}

interface QuestoesStore {
  questoes: Questao[];
  adicionarQuestao: (questao: Omit<Questao, 'id'>) => string; // Retorna o ID da nova questão
  adicionarQuestoes: (concursoId: string, questoes: Omit<Questao, 'id'>[]) => void;
  removerQuestao: (id: string) => void;
  atualizarQuestao: (id: string, questao: Partial<Questao>) => void;
  importarQuestoes: (novasQuestoes: Omit<Questao, 'id'>[]) => void;
  buscarQuestoesPorConcurso: (concursoId: string) => Questao[];
  buscarQuestoesPorDisciplina: (disciplina: string) => Questao[];
  // Adicionar mais métodos conforme necessário (ex: buscar por tag, tópico, etc.)
}

export const useQuestoesStore = create<QuestoesStore>()(
  persist(
    (set, get) => ({
      questoes: [],

      adicionarQuestao: (novaQuestao) => {
        const id = crypto.randomUUID();
        const questaoCompleta: Questao = {
          ...novaQuestao,
          id,
          // Preserva os IDs das alternativas vindos do formulário
          alternativas: novaQuestao.alternativas,
          // Definir valores padrão se necessário
          respondida: false,
        };
        set((state) => ({
          questoes: [...state.questoes, questaoCompleta]
        }));
        return id;
      },

      adicionarQuestoes: (concursoId, questoes) => {
        const questoesCompletas = questoes.map(q => ({
          ...q,
          id: crypto.randomUUID(),
          concursoId,
          alternativas: q.alternativas,
          respondida: false,
        }));
        set((state) => ({
          questoes: [...state.questoes, ...questoesCompletas]
        }));
      },

      removerQuestao: (id) => set((state) => ({
        questoes: state.questoes.filter((q) => q.id !== id)
      })),

      atualizarQuestao: (id, dadosAtualizados) => set((state) => ({
        questoes: state.questoes.map((questao) =>
          questao.id === id
            ? { ...questao, ...dadosAtualizados }
            : questao
        )
      })),

      importarQuestoes: (novasQuestoes) => {
        const questoesCompletas = novasQuestoes.map(q => ({
          ...q,
          id: crypto.randomUUID(),
          // Preserva os IDs das alternativas vindos da importação
          // Assume que o JSON importado já tem IDs únicos para alternativas,
          // ou que a estrutura importada não depende desses IDs internos.
          // Se o JSON importado não tiver IDs, eles precisariam ser gerados aqui.
          // Por simplicidade, vamos assumir que eles existem ou não são necessários para a lógica de gabarito.
          alternativas: q.alternativas,
          respondida: false,
        }));
        set((state) => ({
          questoes: [...state.questoes, ...questoesCompletas]
        }));
      },

      buscarQuestoesPorConcurso: (concursoId) => {
        return get().questoes.filter(q => q.concursoId === concursoId);
      },

      buscarQuestoesPorDisciplina: (disciplina) => {
        return get().questoes.filter(q => q.disciplina === disciplina);
      },

    }),
    {
      name: 'questoes-store', // Nome específico para este store
      storage: createJSONStorage(() => {
        // Reutiliza a lógica de storage, garantindo que funcione no client-side
        if (typeof window !== 'undefined') {
          const storage: StateStorage = {
            getItem: (name) => {
              const str = localStorage.getItem(name);
              if (!str) return null;
              // Adiciona try-catch para robustez na desserialização
              try {
                return JSON.parse(str);
              } catch (e) {
                console.error(`Erro ao parsear ${name} do localStorage`, e);
                return null;
              }
            },
            setItem: (name, value) => {
              localStorage.setItem(name, JSON.stringify(value));
            },
            removeItem: (name) => localStorage.removeItem(name),
          };
          return storage;
        }
        // Fallback para SSR ou ambientes sem window
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      })
    }
  )
);
