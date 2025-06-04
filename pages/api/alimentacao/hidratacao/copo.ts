import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const HIDRATACAO_FILE_PATH = path.resolve(process.cwd(), 'db/hidratacao.json');

type HidratacaoData = {
  metaDiaria: number;
  ultimoReset: string; // YYYY-MM-DD
  registrosHoje: Array<{ id: number; hora: string }>;
};

// --- Utility Functions (Duplicated from index.ts for simplicity in this context) ---
const readHidratacaoFile = (): HidratacaoData | null => {
  try {
    if (!fs.existsSync(HIDRATACAO_FILE_PATH)) {
      console.error('Error: hidratacao.json not found!');
      return null;
    }
    const fileContent = fs.readFileSync(HIDRATACAO_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as HidratacaoData;
  } catch (error) {
    console.error('Error reading hidratacao.json:', error);
    return null;
  }
};

const writeHidratacaoFile = (data: HidratacaoData): boolean => {
  try {
    fs.writeFileSync(HIDRATACAO_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing hidratacao.json:', error);
    return false;
  }
};

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const performDailyResetLogic = (data: HidratacaoData): boolean => {
  const todayStr = getTodayDateString();
  if (data.ultimoReset !== todayStr) {
    data.ultimoReset = todayStr;
    data.registrosHoje = [];
    return true; // Reset was performed
  }
  return false; // No reset needed
};

// --- API Handlers ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data = readHidratacaoFile();
    if (!data) {
      return res.status(500).json({ message: 'Error reading hydration data file.' });
    }

    let needsWrite = performDailyResetLogic(data);

    // Add new record
    const newRecord = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    data.registrosHoje.push(newRecord);
    needsWrite = true; // Data has changed, needs to be written

    if (needsWrite) {
      if (!writeHidratacaoFile(data)) {
        return res.status(500).json({ message: 'Error writing updated hydration data.' });
      }
    }

    return res.status(200).json({
      coposBebidosHoje: data.registrosHoje.length,
      registrosHoje: data.registrosHoje, // Return the actual records for potential UI update
      ultimoReset: data.ultimoReset,
    });

  } else if (req.method === 'DELETE') {
    const data = readHidratacaoFile();
    if (!data) {
      return res.status(500).json({ message: 'Error reading hydration data file.' });
    }

    let needsWrite = performDailyResetLogic(data);

    if (data.registrosHoje.length > 0) {
      data.registrosHoje.pop(); // Remove the last element
      needsWrite = true; // Data has changed
    } else {
      // No cups to delete, but maybe a reset happened.
      // If no reset and no cups, no write is strictly needed unless an explicit "no change" response is desired.
      // For simplicity, we'll proceed, and if needsWrite is false, we just return current state.
    }

    if (needsWrite) {
      if (!writeHidratacaoFile(data)) {
        return res.status(500).json({ message: 'Error writing updated hydration data.' });
      }
    }

    return res.status(200).json({
      coposBebidosHoje: data.registrosHoje.length,
      registrosHoje: data.registrosHoje,
      ultimoReset: data.ultimoReset,
    });

  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
