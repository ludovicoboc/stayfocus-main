import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const REFEICOES_REGISTRADAS_FILE_PATH = path.resolve(process.cwd(), 'db/refeicoes_registradas.json');

export type RefeicaoRegistrada = {
  id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  descricao: string;
  tipoIcone?: string;
  fotoUrl?: string;
};

// --- Utility Functions ---
const readRegistrosFile = (): RefeicaoRegistrada[] | null => {
  try {
    if (!fs.existsSync(REFEICOES_REGISTRADAS_FILE_PATH)) {
      return [];
    }
    const fileContent = fs.readFileSync(REFEICOES_REGISTRADAS_FILE_PATH, 'utf-8');
    if (fileContent.trim() === '') {
      return [];
    }
    return JSON.parse(fileContent) as RefeicaoRegistrada[];
  } catch (error) {
    console.error('Error reading refeicoes_registradas.json:', error);
    return null;
  }
};

const writeRegistrosFile = (data: RefeicaoRegistrada[]): boolean => {
  try {
    fs.writeFileSync(REFEICOES_REGISTRADAS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing refeicoes_registradas.json:', error);
    return false;
  }
};

const isValidDate = (dateString: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(new Date(dateString).getTime());
};

const isValidTime = (timeString: string): boolean => {
  return /^\d{2}:\d{2}$/.test(timeString);
};

// --- API Handlers ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data: dateFilter } = req.query;

    const registros = readRegistrosFile();
    if (registros === null) {
      return res.status(500).json({ message: 'Error reading meal logs data.' });
    }

    if (dateFilter && typeof dateFilter === 'string') {
      if (!isValidDate(dateFilter)) {
        return res.status(400).json({ message: 'Invalid date format for filter. Expected YYYY-MM-DD.' });
      }
      const filteredRegistros = registros.filter(r => r.data === dateFilter);
      return res.status(200).json(filteredRegistros);
    }

    return res.status(200).json(registros);

  } else if (req.method === 'POST') {
    const { data, horario, descricao, tipoIcone, fotoUrl } = req.body;

    if (!data || typeof data !== 'string' || !isValidDate(data)) {
      return res.status(400).json({ message: 'Invalid or missing data field. Expected YYYY-MM-DD.' });
    }
    if (!horario || typeof horario !== 'string' || !isValidTime(horario)) {
      return res.status(400).json({ message: 'Invalid or missing horario field. Expected HH:MM.' });
    }
    if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
      return res.status(400).json({ message: 'Descricao is required and cannot be empty.' });
    }
    if (tipoIcone && typeof tipoIcone !== 'string') {
      return res.status(400).json({ message: 'tipoIcone must be a string if provided.' });
    }
    if (fotoUrl && typeof fotoUrl !== 'string') { // Basic check, could add URL validation
      return res.status(400).json({ message: 'fotoUrl must be a string if provided.' });
    }

    const registros = readRegistrosFile();
    if (registros === null) {
      return res.status(500).json({ message: 'Error reading meal logs data.' });
    }

    const newRegistro: RefeicaoRegistrada = {
      id: Date.now().toString(),
      data,
      horario,
      descricao: descricao.trim(),
      ...(tipoIcone && { tipoIcone: tipoIcone.trim() }),
      ...(fotoUrl && { fotoUrl: fotoUrl.trim() }),
    };

    registros.push(newRegistro);
    // Sort by date and time after adding, newest first might be good for logs
    registros.sort((a, b) => {
        const dateComparison = b.data.localeCompare(a.data);
        if (dateComparison !== 0) return dateComparison;
        return b.horario.localeCompare(a.horario);
    });


    if (writeRegistrosFile(registros)) {
      return res.status(201).json(newRegistro);
    } else {
      return res.status(500).json({ message: 'Error saving meal log.' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
