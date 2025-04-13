'use client';

import React, { useMemo } from 'react';
import { useSimuladoStore } from '@/app/stores/simuladoStore';
import { Card } from '@/app/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell, // Para cores personalizadas nas barras
} from 'recharts';

const SimuladoResults: React.FC = () => {
  const { simuladoData, userAnswers } = useSimuladoStore();

  // Calcula os resultados apenas quando os dados mudarem
  const results = useMemo(() => {
    if (!simuladoData) {
      return { correctCount: 0, totalQuestions: 0, percentageCorrect: 0, percentageIncorrect: 0 };
    }

    let correctCount = 0;
    const totalQuestions = simuladoData.questoes.length;

    simuladoData.questoes.forEach((questao) => {
      if (userAnswers[questao.id] === questao.gabarito) {
        correctCount++;
      }
    });

    const percentageCorrect = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const percentageIncorrect = 100 - percentageCorrect;

    return {
      correctCount,
      totalQuestions,
      percentageCorrect,
      percentageIncorrect,
    };
  }, [simuladoData, userAnswers]);

  if (!simuladoData) {
    return <div>Erro: Dados do simulado não encontrados para exibir resultados.</div>;
  }

  // Dados para o gráfico
  const chartData = [
    { name: 'Acertos', value: results.percentageCorrect },
    { name: 'Erros', value: results.percentageIncorrect },
  ];

  // Cores para as barras
  const COLORS = ['#10B981', '#EF4444']; // Verde para acertos, Vermelho para erros (Tailwind colors)

  // Corrigindo a estrutura JSX
  return (
    <Card className="w-full max-w-xl mx-auto" title="Resultado da Conferência">
      {/* Seção de Texto com Resultados */}
      <div className="text-center mb-6">
        <p className="text-lg">
          Você acertou{' '}
          <span className="font-bold text-green-600 dark:text-green-400">{results.correctCount}</span> de{' '}
          <span className="font-bold">{results.totalQuestions}</span> questões.
        </p>
        <p className="text-2xl font-bold mt-1">
          {results.percentageCorrect.toFixed(1)}% de acerto
        </p>
      </div>

      {/* Seção do Gráfico */}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Bar dataKey="value" barSize={40} radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comentário sobre futuras adições */}
      {/* Poderia adicionar um botão para "Ver Gabarito Detalhado" ou "Refazer" aqui no futuro */}
    </Card>
  );
};

export default SimuladoResults;
