import { promises as fs } from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const allowedMaterialTypes = [
  'summaries',
  'flashcards',
  'practice_exams',
  'tasks',
  'mind_maps',
  'infographics',
  'study_guide',
  'checklists',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { tipo } = req.query;

  if (typeof tipo !== 'string' || !tipo) {
    return res.status(400).json({ message: 'Missing or invalid "tipo" query parameter' });
  }

  if (!allowedMaterialTypes.includes(tipo)) {
    return res.status(403).json({ message: `Forbidden: Material type "${tipo}" is not allowed.` });
  }

  // Resolve the path from the project root, similar to ler.ts
  const projectRoot = path.resolve(process.cwd(), '..'); // Assuming stayf is one level down from project root
  const materialDirPath = path.resolve(projectRoot, '.ruru', tipo);

  try {
    const files = await fs.readdir(materialDirPath);

    const mdFiles = files.filter(file => file.endsWith('.md'));

    return res.status(200).json({ files: mdFiles });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Directory not found
      return res.status(404).json({ message: `Material directory not found for type "${tipo}".` });
    }
    // Other errors
    console.error(`Error reading material directory for type "${tipo}":`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}