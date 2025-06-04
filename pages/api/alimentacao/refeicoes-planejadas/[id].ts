import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const REFEICOES_PLANEJADAS_FILE_PATH = path.resolve(process.cwd(), 'db/refeicoes_planejadas.json');

export type RefeicaoPlanejada = {
  id: string;
  horario: string; // HH:MM
  descricao: string;
};

// --- Utility Functions (copied from index.ts) ---
const readRefeicoesFile = (): RefeicaoPlanejada[] | null => {
  try {
    if (!fs.existsSync(REFEICOES_PLANEJADAS_FILE_PATH)) {
      return [];
    }
    const fileContent = fs.readFileSync(REFEICOES_PLANEJADAS_FILE_PATH, 'utf-8');
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
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  if (req.method === 'PUT') {
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

    const refeicaoIndex = refeicoes.findIndex(r => r.id === id);
    if (refeicaoIndex === -1) {
      return res.status(404).json({ message: 'Planned meal not found.' });
    }

    refeicoes[refeicaoIndex] = {
      ...refeicoes[refeicaoIndex],
      horario,
      descricao: descricao.trim(),
    };

    if (writeRefeicoesFile(refeicoes)) {
      return res.status(200).json(refeicoes[refeicaoIndex]);
    } else {
      return res.status(500).json({ message: 'Error saving updated planned meal.' });
    }

  } else if (req.method === 'DELETE') {
    const refeicoes = readRefeicoesFile();
    if (refeicoes === null) {
      return res.status(500).json({ message: 'Error reading planned meals data.' });
    }

    const initialLength = refeicoes.length;
    const updatedRefeicoes = refeicoes.filter(r => r.id !== id);

    if (updatedRefeicoes.length === initialLength) {
      return res.status(404).json({ message: 'Planned meal not found for deletion.' });
    }

    if (writeRefeicoesFile(updatedRefeicoes)) {
      return res.status(200).json({ message: 'Planned meal deleted successfully.' });
    } else {
      return res.status(500).json({ message: 'Error deleting planned meal.' });
    }

  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
