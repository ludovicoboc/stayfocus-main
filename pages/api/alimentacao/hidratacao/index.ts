import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const HIDRATACAO_FILE_PATH = path.resolve(process.cwd(), 'db/hidratacao.json');

type HidratacaoData = {
  metaDiaria: number;
  ultimoReset: string; // YYYY-MM-DD
  registrosHoje: Array<{ id: number; hora: string }>;
};

// --- Utility Functions ---
const readHidratacaoFile = (): HidratacaoData | null => {
  try {
    if (!fs.existsSync(HIDRATACAO_FILE_PATH)) {
      // This case should ideally not happen if the file is pre-created.
      // For robustness, we could return a default structure or throw a specific error.
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
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Daily Reset Logic ---
// Modifies data in place if reset is needed.
// Returns true if a reset was performed (indicating data needs to be saved), false otherwise.
const performDailyResetLogic = (data: HidratacaoData): boolean => {
  const todayStr = getTodayDateString();
  if (data.ultimoReset !== todayStr) {
    data.ultimoReset = todayStr;
    data.registrosHoje = [];
    return true; // Reset was performed
  }
  return false; // No reset needed
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = readHidratacaoFile();
    if (!data) {
      return res.status(500).json({ message: 'Error reading hydration data file.' });
    }

    if (performDailyResetLogic(data)) {
      // If reset was performed, write the updated data.
      if (!writeHidratacaoFile(data)) {
        // If write fails, the response might be slightly inconsistent for this one request,
        // but the next request will try to reset and write again.
        // Log this error for monitoring.
        console.warn('Failed to write hydration data after daily reset during GET.');
      }
    }

    return res.status(200).json({
      metaDiaria: data.metaDiaria,
      coposBebidosHoje: data.registrosHoje.length,
      ultimoReset: data.ultimoReset,
    });

  } else if (req.method === 'PUT') {
    const { metaDiaria } = req.body;

    if (typeof metaDiaria !== 'number' || !Number.isInteger(metaDiaria) || metaDiaria <= 0) {
      return res.status(400).json({ message: 'metaDiaria must be a positive integer.' });
    }

    const data = readHidratacaoFile();
    if (!data) {
      return res.status(500).json({ message: 'Error reading hydration data file.' });
    }

    let modified = false;
    if (data.metaDiaria !== metaDiaria) {
        data.metaDiaria = metaDiaria;
        modified = true;
    }

    // Perform daily reset check even if metaDiaria hasn't changed,
    // as this endpoint might be hit on a new day before a GET.
    if (performDailyResetLogic(data)) {
        modified = true;
    }

    if (modified) {
        if (!writeHidratacaoFile(data)) {
            return res.status(500).json({ message: 'Error writing updated hydration data.' });
        }
    }

    return res.status(200).json({
        metaDiaria: data.metaDiaria,
        coposBebidosHoje: data.registrosHoje.length,
        ultimoReset: data.ultimoReset,
    });

  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
