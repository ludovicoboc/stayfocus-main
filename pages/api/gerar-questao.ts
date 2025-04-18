import type { NextApiRequest, NextApiResponse } from 'next';

// Estrutura do JSON de questão esperado
interface QuestaoLLM {
  questao: string;
  alternativas: string[];
  correta: string; // Letra: "A", "B", "C", "D"
  disciplina: string;
  topico: string;
}

interface GerarQuestaoRequest {
  disciplina: string;
  topico?: string;
  resumo?: string;
  quantidade: number;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  max_tokens?: number;
}

import fetch from 'node-fetch';

// Chave e modelo Perplexity
const PPLX_API_KEY = process.env.PPLX_API_KEY;
if (!PPLX_API_KEY) {
  throw new Error('A variável de ambiente PPLX_API_KEY não está definida.');
}
const PPLX_MODEL = 'sonar-pro';

// Chamada real à Perplexity API
async function gerarQuestoesPerplexity({ disciplina, topico, resumo, quantidade, dificuldade, max_tokens }: GerarQuestaoRequest): Promise<QuestaoLLM[]> {
  // Instrução extra para a LLM conforme dificuldade
  let instrucaoDificuldade = '';
  if (dificuldade === 'facil') {
    instrucaoDificuldade = 'As questões devem ser diretas, sem exigir raciocínio complexo. Use até 2000 tokens.';
  } else if (dificuldade === 'medio') {
    instrucaoDificuldade = 'As questões devem exigir reflexão moderada, com enunciados mais elaborados. Use até 5000 tokens e invista mais recursos computacionais para garantir qualidade e profundidade.';
  } else if (dificuldade === 'dificil') {
    instrucaoDificuldade = 'As questões devem ser desafiadoras, exigindo análise crítica e interpretação profunda. Use até 8000 tokens e utilize o máximo de recursos computacionais para garantir questões complexas e bem fundamentadas.';
  }
  const prompt = `
Gere ${quantidade} questões objetivas de múltipla escolha, cada uma com 4 alternativas e apenas uma correta, no formato JSON abaixo. Use apenas o contexto fornecido.
Nível de dificuldade: ${dificuldade ? dificuldade.toUpperCase() : 'FÁCIL'}. ${instrucaoDificuldade}

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
${resumo || '[Resumo não fornecido]'}
  `;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PPLX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: PPLX_MODEL,
      messages: [
        { role: 'system', content: 'Você é um gerador de questões para concursos públicos. Responda sempre no formato JSON especificado.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: max_tokens || 2000,
      temperature: 0.0
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro Perplexity: ${errorText}`);
  }

  const data = await response.json();
  // A resposta vem em data.choices[0].message.content (string JSON)
  let questoes: QuestaoLLM[] = [];
  try {
    const content = data.choices?.[0]?.message?.content;
    // Remove blocos markdown ```json ... ``` ou ```
    let jsonString = content;
    if (typeof jsonString === 'string') {
      const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match && match[1]) {
        jsonString = match[1];
      }
    }
    questoes = JSON.parse(jsonString);
    if (!Array.isArray(questoes)) {
      throw new Error('Formato inesperado: não é um array de questões.');
    }
  } catch (err) {
    throw new Error('Erro ao parsear resposta da LLM: ' + (err instanceof Error ? err.message : String(err)));
  }
  return questoes;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { disciplina, topico, resumo, quantidade, dificuldade, max_tokens } = req.body as GerarQuestaoRequest;

  if (!disciplina || !quantidade) {
    return res.status(400).json({ error: "Disciplina e quantidade são obrigatórios." });
  }

  // Monta o prompt enxuto (apenas para log/debug)
  const prompt = `
Gere ${quantidade} questões objetivas de múltipla escolha, cada uma com 4 alternativas e apenas uma correta, no formato JSON abaixo. Use apenas o contexto fornecido.
Nível de dificuldade: ${dificuldade ? dificuldade.toUpperCase() : 'FÁCIL'}.

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
${resumo || '[Resumo não fornecido]'}
  `;

  console.log("Prompt enviado à LLM/MCP:", prompt);

  try {
    const questoes = await gerarQuestoesPerplexity({ disciplina, topico, resumo, quantidade, dificuldade, max_tokens });
    res.status(200).json({ questoes });
  } catch (err) {
    console.error('Erro ao gerar questões via Perplexity:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro desconhecido ao gerar questões.' });
  }
}
