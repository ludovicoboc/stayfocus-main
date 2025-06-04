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

// --- Utility Functions (copied) ---
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

// --- API Handlers ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  if (req.method === 'PUT') {
    const { descricao, tipoIcone, fotoUrl } = req.body;

    // Basic validation: at least one field to update must be provided.
    // More specific validation (e.g. non-empty descricao if provided) can be added.
    if (descricao === undefined && tipoIcone === undefined && fotoUrl === undefined) {
      return res.status(400).json({ message: 'No fields provided for update. Provide descricao, tipoIcone, or fotoUrl.' });
    }
    if (descricao !== undefined && (typeof descricao !== 'string' || descricao.trim() === '')) {
        return res.status(400).json({ message: 'Descricao cannot be empty if provided for update.' });
    }
    if (tipoIcone !== undefined && typeof tipoIcone !== 'string') {
        return res.status(400).json({ message: 'tipoIcone must be a string if provided.' });
    }
    if (fotoUrl !== undefined && typeof fotoUrl !== 'string') { // Add URL validation if needed
        return res.status(400).json({ message: 'fotoUrl must be a string if provided.' });
    }


    const registros = readRegistrosFile();
    if (registros === null) {
      return res.status(500).json({ message: 'Error reading meal logs data.' });
    }

    const registroIndex = registros.findIndex(r => r.id === id);
    if (registroIndex === -1) {
      return res.status(404).json({ message: 'Meal log not found.' });
    }

    const updatedRegistro = { ...registros[registroIndex] };

    if (descricao !== undefined) {
      updatedRegistro.descricao = descricao.trim();
    }
    // Allow setting tipoIcone to empty string (effectively removing it)
    if (tipoIcone !== undefined) {
      updatedRegistro.tipoIcone = tipoIcone.trim() || undefined;
    }
    // Allow setting fotoUrl to empty string (effectively removing it)
    if (fotoUrl !== undefined) {
      updatedRegistro.fotoUrl = fotoUrl.trim() || undefined;
    }

    registros[registroIndex] = updatedRegistro;
     // Re-sort if any data that affects sort order was changed (not in this PUT, but good practice if it were)
    registros.sort((a, b) => {
        const dateComparison = b.data.localeCompare(a.data);
        if (dateComparison !== 0) return dateComparison;
        return b.horario.localeCompare(a.horario);
    });


    if (writeRegistrosFile(registros)) {
      return res.status(200).json(registros[registroIndex]);
    } else {
      return res.status(500).json({ message: 'Error saving updated meal log.' });
    }

  } else if (req.method === 'DELETE') {
    const registros = readRegistrosFile();
    if (registros === null) {
      return res.status(500).json({ message: 'Error reading meal logs data.' });
    }

    const initialLength = registros.length;
    const updatedRegistros = registros.filter(r => r.id !== id);

    if (updatedRegistros.length === initialLength) {
      return res.status(404).json({ message: 'Meal log not found for deletion.' });
    }

    if (writeRegistrosFile(updatedRegistros)) {
      return res.status(200).json({ message: 'Meal log deleted successfully.' });
    } else {
      return res.status(500).json({ message: 'Error deleting meal log.' });
    }

  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
