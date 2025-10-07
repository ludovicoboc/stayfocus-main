import { create } from 'zustand';

export interface ConteudoProgramatico {
  disciplina: string;
  topicos: string[];
  progresso: number;
}

export interface Concurso {
  id: string;
  titulo: string;
  organizadora: string;
  dataInscricao: string;
  dataProva: string;
  edital?: string;
  status: 'planejado' | 'inscrito' | 'estudando' | 'realizado' | 'aguardando_resultado';
  conteudoProgramatico: ConteudoProgramatico[];
}

interface ConcursosStore {
  concursos: Concurso[];
  adicionarConcurso: (concurso: Omit<Concurso, 'id'>) => void;
  removerConcurso: (id: string) => void;
  atualizarConcurso: (id: string, concurso: Partial<Concurso>) => void;
  atualizarProgresso: (concursoId: string, disciplina: string, novoProgresso: number) => void;
}

export const useConcursosStore = create<ConcursosStore>()(
    (set) => ({
      concursos: [],

      adicionarConcurso: (novoConcurso) => set((state) => ({
        concursos: [
          ...state.concursos,
          {
          ...novoConcurso,
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          status: novoConcurso.status || 'planejado',
          conteudoProgramatico: novoConcurso.conteudoProgramatico.map(c => ({
            ...c,
            progresso: c.progresso || 0
          }))
          }
        ]
      })),

      removerConcurso: (id) => set((state) => ({
        concursos: state.concursos.filter((c) => c.id !== id)
      })),

      atualizarConcurso: (id, dadosAtualizados) => set((state) => ({
        concursos: state.concursos.map((concurso) =>
          concurso.id === id
            ? { ...concurso, ...dadosAtualizados }
            : concurso
        )
      })),

      atualizarProgresso: (concursoId, disciplina, novoProgresso) => set((state) => ({
        concursos: state.concursos.map((concurso) =>
          concurso.id === concursoId
            ? {
                ...concurso,
                conteudoProgramatico: concurso.conteudoProgramatico.map((c) =>
                  c.disciplina === disciplina
                    ? { ...c, progresso: novoProgresso }
                    : c
                )
              }
            : concurso
        )
      }))
    })
);
