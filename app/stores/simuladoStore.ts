import { create } from 'zustand';
// Importar store e helper do histórico
import { useHistoricoSimuladosStore, criarIdentificadorSimulado } from './historicoSimuladosStore';

// Define a estrutura baseada no psimulado.json e nas necessidades da interface
export interface Questao {
  id: number;
  enunciado: string;
  alternativas: { [key: string]: string };
  gabarito: string;
  assunto?: string;
  dificuldade?: number;
  dicas?: string[];
  explicacao?: string;
}

export interface SimuladoMetadata {
  titulo: string;
  concurso?: string;
  ano?: number;
  area?: string;
  nivel?: string;
  totalQuestoes: number;
  tempoPrevisto?: number;
  autor?: string;
  dataGeracao?: string;
}

export interface SimuladoData {
  metadata: SimuladoMetadata;
  questoes: Questao[];
}

export type SimuladoStatus = 'idle' | 'loading' | 'reviewing' | 'results';

interface SimuladoState {
  simuladoData: SimuladoData | null;
  userAnswers: { [questaoId: number]: string }; // Armazena a alternativa selecionada pelo usuário (ex: 'a', 'b')
  currentQuestionIndex: number;
  status: SimuladoStatus;
  loadSimulado: (data: SimuladoData) => void;
  selectAnswer: (questaoId: number, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishReview: () => void;
  resetSimulado: () => void;
  setStatus: (status: SimuladoStatus) => void;
}

export const useSimuladoStore = create<SimuladoState>((set, get) => ({
  simuladoData: null,
  userAnswers: {},
  currentQuestionIndex: 0,
  status: 'idle', // Estado inicial

  loadSimulado: (data) => {
    // Validação básica dos dados carregados
    if (!data || !data.metadata || !data.questoes || !Array.isArray(data.questoes) || data.questoes.length === 0) {
      console.error('Erro: Dados do simulado inválidos ou vazios.');
      set({ simuladoData: null, userAnswers: {}, currentQuestionIndex: 0, status: 'idle' });
      // Poderia lançar um erro ou mostrar uma mensagem para o usuário aqui
      return;
    }
    set({
      simuladoData: data,
      userAnswers: {}, // Limpa respostas anteriores ao carregar novo simulado
      currentQuestionIndex: 0, // Começa da primeira questão
      status: 'reviewing', // Muda o status para indicar que a revisão começou
    });
  },

  selectAnswer: (questaoId, answer) => {
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questaoId]: answer, // Atualiza ou adiciona a resposta do usuário para a questão
      },
    }));
  },

  nextQuestion: () => {
    set((state) => {
      // Só avança se houver um simulado carregado e não estiver na última questão
      if (state.simuladoData && state.currentQuestionIndex < state.simuladoData.questoes.length - 1) {
        return { currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      // Se estiver na última questão, poderia mudar o status para 'results' ou habilitar um botão "Finalizar"
      return {}; // Não faz nada se já estiver na última ou não houver simulado
    });
  },

  prevQuestion: () => {
    set((state) => {
      // Só volta se não estiver na primeira questão
      if (state.currentQuestionIndex > 0) {
        return { currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return {}; // Não faz nada se já estiver na primeira
    });
  },

  finishReview: () => {
    const { simuladoData, userAnswers } = get(); // Obter estado atual

    if (!simuladoData) {
      console.error("Não é possível finalizar a revisão sem dados do simulado.");
      return;
    }

    // Calcular resultados aqui para registrar no histórico
    let correctCount = 0;
    const totalQuestions = simuladoData.questoes.length;
    console.log('--- Iniciando cálculo de resultados ---');
    console.log('Respostas do usuário:', userAnswers);
    simuladoData.questoes.forEach((questao) => {
      const userAnswer = userAnswers[questao.id];
      const correctAnswer = questao.gabarito;
      console.log(`Questão ID: ${questao.id}, Resposta Usuário: ${userAnswer} (tipo: ${typeof userAnswer}), Gabarito: ${correctAnswer} (tipo: ${typeof correctAnswer})`);
      if (userAnswer === correctAnswer) {
        console.log(` -> Acerto! Incrementando contagem.`);
        correctCount++;
      } else {
        console.log(` -> Erro!`);
      }
    });
    console.log(`Contagem final de acertos: ${correctCount}`);
    const percentageCorrect = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    console.log(`Porcentagem de acerto: ${percentageCorrect}%`);
    console.log('--- Fim do cálculo de resultados ---');

    // Criar identificador único
    const identificador = criarIdentificadorSimulado(simuladoData.metadata.titulo, totalQuestions);

    // Adicionar ao histórico
    useHistoricoSimuladosStore.getState().adicionarTentativa(
      identificador,
      simuladoData.metadata.titulo,
      totalQuestions,
      correctCount,
      percentageCorrect
    );

    // Mudar o status para exibir a tela de resultados
    set({ status: 'results' });
  },

  resetSimulado: () => {
    // Reseta todo o estado para o inicial
    set({
      simuladoData: null,
      userAnswers: {},
      currentQuestionIndex: 0,
      status: 'idle',
    });
  },

  setStatus: (status) => {
    // Permite definir o status manualmente se necessário
    set({ status });
  },
}));

// Exemplo de como usar o store em um componente:
// import { useSimuladoStore } from '@/app/stores/simuladoStore';
//
// const MeuComponente = () => {
//   const { simuladoData, currentQuestionIndex, nextQuestion, loadSimulado } = useSimuladoStore();
//   // ... lógica do componente
// }
