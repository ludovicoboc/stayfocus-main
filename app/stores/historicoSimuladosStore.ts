import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Importar persist middleware

// --- Tipos ---
interface Tentativa {
  timestamp: string; // ISO string
  acertos: number;
  percentual: number;
}

interface SimuladoHistoricoEntry {
  titulo: string;
  totalQuestoes: number;
  tentativas: Tentativa[];
}

// O estado principal será um objeto onde a chave é o identificador único
// Ex: "Simulado X|40"
type HistoricoSimuladosStateData = Record<string, SimuladoHistoricoEntry>;

interface HistoricoSimuladosState {
  historico: HistoricoSimuladosStateData;
  adicionarTentativa: (
    identificador: string,
    titulo: string,
    totalQuestoes: number,
    acertos: number,
    percentual: number
  ) => void;
  // Adicionar mais seletores/ações conforme necessário (ex: getMelhorPontuacao, getUltimaPontuacao)
}

// --- Store ---
// Usaremos persistência local para o histórico também, alinhado com as regras
export const useHistoricoSimuladosStore = create<HistoricoSimuladosState>()(
  persist(
    (set, get) => ({
      historico: {},

      adicionarTentativa: (identificador, titulo, totalQuestoes, acertos, percentual) => {
        set((state) => {
          const historicoAtual = { ...state.historico };
          const novaTentativa: Tentativa = {
            timestamp: new Date().toISOString(),
            acertos,
            percentual,
          };

          // Se o simulado já existe no histórico, adiciona a nova tentativa
          if (historicoAtual[identificador]) {
            historicoAtual[identificador] = {
              ...historicoAtual[identificador],
              tentativas: [...historicoAtual[identificador].tentativas, novaTentativa],
            };
          } else {
            // Se é a primeira vez, cria a entrada
            historicoAtual[identificador] = {
              titulo,
              totalQuestoes,
              tentativas: [novaTentativa],
            };
          }

          return { historico: historicoAtual };
        });
      },

      // --- Exemplo de Seletores (podem ser adicionados depois, na criação da UI) ---
      /*
      getMelhorPontuacao: (identificador: string): number | null => {
        const entry = get().historico[identificador];
        if (!entry || entry.tentativas.length === 0) return null;
        return Math.max(...entry.tentativas.map(t => t.percentual));
      },

      getUltimaPontuacao: (identificador: string): number | null => {
        const entry = get().historico[identificador];
        if (!entry || entry.tentativas.length === 0) return null;
        // Assume que as tentativas são adicionadas em ordem cronológica
        return entry.tentativas[entry.tentativas.length - 1].percentual;
      },
      */
    }),
    {
      name: 'historico-simulados-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage), // Usar localStorage
    }
  )
);

// --- Helper para criar o identificador ---
export const criarIdentificadorSimulado = (titulo: string, totalQuestoes: number): string => {
  // Simples concatenação, pode ser melhorado se necessário (ex: hash)
  return `${titulo}|${totalQuestoes}`;
};
