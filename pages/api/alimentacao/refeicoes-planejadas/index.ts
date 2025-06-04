import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const REFEICOES_PLANEJADAS_FILE_PATH = path.resolve(process.cwd(), 'db/refeicoes_planejadas.json');

export type RefeicaoPlanejada = {
  id: string;
  horario: string; // HH:MM
  descricao: string;
};

// --- Utility Functions ---
const readRefeicoesFile = (): RefeicaoPlanejada[] | null => {
  try {
    if (!fs.existsSync(REFEICOES_PLANEJADAS_FILE_PATH)) {
      // If file doesn't exist (e.g. first run or deleted), return empty array as per initial content
      return [];
    }
    const fileContent = fs.readFileSync(REFEICOES_PLANEJADAS_FILE_PATH, 'utf-8');
    // Handle empty file, which is valid for an empty array
    if (fileContent.trim() === '') {
        return [];
    }
    return JSON.parse(fileContent) as RefeicaoPlanejada[];
  } catch (error) {
    console.error('Error reading refeicoes_planejadas.json:', error);
    return null;
  }
};

const writeRefeicoesFile = (data: RefeicaoPlanejada[]): boolean => {
  try {
    fs.writeFileSync(REFEICOES_PLANEJADAS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing refeicoes_planejadas.json:', error);
    return false;
  }
};

// --- API Handlers ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const refeicoes = readRefeicoesFile();
    if (refeicoes === null) {
      return res.status(500).json({ message: 'Error reading planned meals data.' });
    }
    return res.status(200).json(refeicoes);

  } else if (req.method === 'POST') {
    const { horario, descricao } = req.body;

    if (!horario || typeof horario !== 'string' || !/^\d{2}:\d{2}$/.test(horario)) {
      return res.status(400).json({ message: 'Invalid or missing horario. Expected format HH:MM.' });
    }
    if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
      return res.status(400).json({ message: 'Descricao is required and cannot be empty.' });
    }

    const refeicoes = readRefeicoesFile();
    if (refeicoes === null) {
      return res.status(500).json({ message: 'Error reading planned meals data.' });
    }

    const newRefeicao: RefeicaoPlanejada = {
      id: Date.now().toString(), // Simple unique ID
      horario,
      descricao: descricao.trim(),
    };

    refeicoes.push(newRefeicao);

    if (writeRefeicoesFile(refeicoes)) {
      return res.status(201).json(newRefeicao);
    } else {
      return res.status(500).json({ message: 'Error saving planned meal.' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
