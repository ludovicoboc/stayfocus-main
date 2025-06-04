import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const NOTAS_FILE_PATH = path.resolve(process.cwd(), 'db/notas.json');

type Note = {
  id: number;
  title: string;
  content: string;
  timestamp: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(NOTAS_FILE_PATH)) {
        // If the file doesn't exist, return an empty array, as per previous setup.
        return res.status(200).json([]);
      }
      const fileContent = fs.readFileSync(NOTAS_FILE_PATH, 'utf-8');
      const notes = JSON.parse(fileContent) as Note[];
      return res.status(200).json(notes);
    } catch (error) {
      console.error('Error reading notes file:', error);
      return res.status(500).json({ message: 'Error reading notes data.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
      }

      let notes: Note[] = [];
      if (fs.existsSync(NOTAS_FILE_PATH)) {
        const fileContent = fs.readFileSync(NOTAS_FILE_PATH, 'utf-8');
        // Allow empty file or valid JSON
        if (fileContent.trim() !== '') {
          try {
            notes = JSON.parse(fileContent) as Note[];
          } catch (parseError) {
            console.error('Error parsing notes file:', parseError);
            return res.status(500).json({ message: 'Error parsing notes data.' });
          }
        }
      }

      const newNote: Note = {
        id: Date.now(), // Simple unique ID
        title,
        content,
        timestamp: Date.now(),
      };

      notes.push(newNote);

      fs.writeFileSync(NOTAS_FILE_PATH, JSON.stringify(notes, null, 2), 'utf-8');

      return res.status(201).json(newNote);
    } catch (error) {
      console.error('Error processing POST request for notes:', error);
      return res.status(500).json({ message: 'Error creating note.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
