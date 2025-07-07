'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/Textarea';
import { Alert } from '@/app/components/ui/Alert';
import { Card } from '@/app/components/ui/Card';
import { Loader2, Wand2, UploadCloud, Search } from 'lucide-react';

// Estrutura da questão gerada pela LLM
interface QuestaoLLM {
  questao: string;
  alternativas: string[];
  correta: string; // Letra: "A", "B", "C", "D"
  disciplina: string;
  topico: string;
}

import { useQuestoesStore } from '@/app/stores/questoesStore';

interface GeradorQuestoesLLMProps {
  concursoId: string;
}

export function GeradorQuestoesLLM({ concursoId }: GeradorQuestoesLLMProps) {
  const [disciplina, setDisciplina] = useState('');
  const [topico, setTopico] = useState('');
  const [quantidade, setQuantidade] = useState(3);
  const [resumo, setResumo] = useState('');
  const [questoes, setQuestoes] = useState<QuestaoLLM[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [llmPerformance, setLlmPerformance] = useState<{ duration: number, prompt: string, rawResponse: any } | null>(null);
  const [dificuldade, setDificuldade] = useState<'facil' | 'medio' | 'dificil'>('facil');

  const { adicionarQuestoes } = useQuestoesStore();

  // Busca resumo via Perplexity MCP (simulado)
  const buscarResumo = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      // Aqui seria feita a chamada real ao MCP
      // Exemplo:
      // const response = await use_mcp_tool('perplexity-search', 'search', {
      //   query: `Resumo dos principais tópicos de ${disciplina} sobre ${topico} para concursos públicos`
      // });
      // setResumo(response.data[0]?.snippet || '');

      // Simulação:
      await new Promise(resolve => setTimeout(resolve, 1200));
      setResumo(`Resumo simulado para ${disciplina} - ${topico}: principais conceitos, legislação e interpretação de textos.`);
      setSuccessMessage('Resumo obtido via MCP (simulado).');
    } catch (err) {
      setError('Erro ao buscar resumo via MCP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gera questões via API
  const gerarQuestoes = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setQuestoes([]);
    setLlmPerformance(null);
    const start = performance.now();
    let prompt = '';
    let rawResponse = null;
    try {
      // Limites de tokens por dificuldade
      const tokensPorDificuldade = {
        facil: 2000,
        medio: 5000,
        dificil: 8000,
      };
      // Instrução extra para a LLM conforme dificuldade
      let instrucaoDificuldade = '';
      if (dificuldade === 'facil') {
        instrucaoDificuldade = 'As questões devem ser diretas, sem exigir raciocínio complexo. Use até 2000 tokens.';
      } else if (dificuldade === 'medio') {
        instrucaoDificuldade = 'As questões devem exigir reflexão moderada, com enunciados mais elaborados. Use até 5000 tokens e invista mais recursos computacionais para garantir qualidade e profundidade.';
      } else if (dificuldade === 'dificil') {
        instrucaoDificuldade = 'As questões devem ser desafiadoras, exigindo análise crítica e interpretação profunda. Use até 8000 tokens e utilize o máximo de recursos computacionais para garantir questões complexas e bem fundamentadas.';
      }
      // Monta prompt para log
      prompt = `
Gere ${quantidade} questões objetivas de múltipla escolha, cada uma com 4 alternativas e apenas uma correta, no formato JSON abaixo. Use apenas o contexto fornecido.
Nível de dificuldade: ${dificuldade.toUpperCase()}. ${instrucaoDificuldade}

{
  "questao": "Enunciado da questão",
  "alternativas": [
    "Alternativa A",
    "Alternativa B",
    "Alternativa C",
    "Alternativa D"
  ],
  "correta": "Letra da alternativa correta (A, B, C ou D)",
  "disciplina": "${disciplina}",
  "topico": "${topico || ''}"
}

Contexto:
${resumo}
      `.trim();

      const response = await fetch('/api/gerar-questao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disciplina,
          topico,
          resumo,
          quantidade,
          dificuldade,
          max_tokens: tokensPorDificuldade[dificuldade]
        }),
      });
      rawResponse = await response.clone().json();
      if (!response.ok) {
        throw new Error(rawResponse.error || 'Erro ao gerar questões.');
      }
      setQuestoes(rawResponse.questoes || []);
      setSuccessMessage('Questões geradas com sucesso!');
      setLlmPerformance({
        duration: performance.now() - start,
        prompt,
        rawResponse
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar questões.');
      setLlmPerformance(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Importa questões para o concurso/questoesStore
  const importarQuestoes = () => {
    setError(null);
    setSuccessMessage(null);
    if (!questoes.length) {
      setError('Nenhuma questão para importar.');
      return;
    }
    // Persiste as questões associadas ao concurso
    adicionarQuestoes(concursoId, questoes.map(q => {
      // Alternativas: transformar string[] em Alternativa[]
      const alternativas = q.alternativas.map((texto, idx) => {
        const letra = String.fromCharCode(65 + idx); // "A", "B", "C", "D"
        return {
          id: letra,
          texto,
          correta: letra === q.correta
        };
      });
      return {
        enunciado: q.questao,
        alternativas,
        respostaCorreta: q.correta,
        disciplina: q.disciplina,
        topico: q.topico
      };
    }));
    setSuccessMessage('Questões importadas para o concurso!');
  };

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Gerar Questões Automáticas (LLM + MCP)</h3>
      <div className="space-y-4">
        <Input
          label="Disciplina"
          value={disciplina}
          onChange={e => setDisciplina(e.target.value)}
          placeholder="Ex: Português"
          disabled={isLoading}
        />
        <Input
          label="Tópico"
          value={topico}
          onChange={e => setTopico(e.target.value)}
          placeholder="Ex: Interpretação de Texto"
          disabled={isLoading}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nível de Dificuldade</label>
          <select
            value={dificuldade}
            onChange={e => setDificuldade(e.target.value as 'facil' | 'medio' | 'dificil')}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm mb-2"
          >
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>
        <Input
          label="Quantidade de Questões"
          type="number"
          value={quantidade}
          min={1}
          max={5}
          onChange={e => setQuantidade(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
          disabled={isLoading}
        />
        <div className="flex gap-2 items-end">
          <Textarea
            label="Resumo/Contexto (opcional, pode ser preenchido manualmente ou via MCP)"
            value={resumo}
            onChange={e => setResumo(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
          <Button onClick={buscarResumo} disabled={isLoading || !disciplina || !topico} variant="outline" size="sm">
            <Search className="h-4 w-4 mr-1" />
            Buscar Resumo (MCP)
          </Button>
        </div>
        <Button
          onClick={gerarQuestoes}
          disabled={isLoading || !disciplina || !quantidade}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Gerar Questões
        </Button>

        {error && <Alert variant="error">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {questoes.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium">Questões Geradas:</h4>
            {questoes.map((q, i) => (
              <Card key={i} className="p-3 bg-gray-50 dark:bg-gray-800">
                <div className="mb-2 font-semibold">{q.questao}</div>
                <ol className="list-decimal ml-5">
                  {q.alternativas.map((alt, idx) => (
                    <li key={idx} className={q.correta === String.fromCharCode(65 + idx) ? 'font-bold text-green-700' : ''}>
                      {String.fromCharCode(65 + idx)}) {alt}
                    </li>
                  ))}
                </ol>
                <div className="mt-2 text-xs text-gray-500">
                  Disciplina: {q.disciplina} | Tópico: {q.topico}
                </div>
              </Card>
            ))}
            <Button onClick={importarQuestoes} variant="default" className="w-full mt-2">
              <UploadCloud className="h-4 w-4 mr-2" />
              Importar para Concurso
            </Button>
            {llmPerformance && (
              <div className="mt-4 text-xs text-gray-500">
                <div><b>Tempo de resposta LLM:</b> {llmPerformance.duration.toFixed(0)}ms</div>
                <details>
                  <summary className="cursor-pointer">Prompt usado</summary>
                  <pre className="whitespace-pre-wrap">{llmPerformance.prompt}</pre>
                </details>
                <details>
                  <summary className="cursor-pointer">Resposta bruta da LLM</summary>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(llmPerformance.rawResponse, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
