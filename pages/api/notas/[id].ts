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

// Helper function to read notes from the JSON file
const readNotes = (): Note[] | null => {
  try {
    if (!fs.existsSync(NOTAS_FILE_PATH)) {
      return []; // Should not happen if initialized, but good for robustness
    }
    const fileContent = fs.readFileSync(NOTAS_FILE_PATH, 'utf-8');
    if (fileContent.trim() === '') {
        return [];
    }
    return JSON.parse(fileContent) as Note[];
  } catch (error) {
    console.error('Error reading or parsing notes file:', error);
    return null; // Indicate error
  }
};

// Helper function to write notes to the JSON file
const writeNotes = (notes: Note[]): boolean => {
  try {
    fs.writeFileSync(NOTAS_FILE_PATH, JSON.stringify(notes, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing notes file:', error);
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const noteId = parseInt(id as string, 10);

  if (isNaN(noteId)) {
    return res.status(400).json({ message: 'Invalid note ID.' });
  }

  if (req.method === 'GET') {
    const notes = readNotes();
    if (notes === null) {
      return res.status(500).json({ message: 'Error reading notes data.' });
    }

    const note = notes.find(n => n.id === noteId);
    if (note) {
      return res.status(200).json(note);
    } else {
      return res.status(404).json({ message: 'Note not found.' });
    }
  } else if (req.method === 'PUT') {
    const { title, content } = req.body;

    if (!title && !content) { // Allow partial updates, but at least one field must be present
      return res.status(400).json({ message: 'Title or content must be provided for update.' });
    }

    const notes = readNotes();
    if (notes === null) {
      return res.status(500).json({ message: 'Error reading notes data.' });
    }

    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Update fields if provided
    if (title) {
      notes[noteIndex].title = title;
    }
    if (content) {
      notes[noteIndex].content = content;
    }
    notes[noteIndex].timestamp = Date.now(); // Update timestamp on any change

    if (writeNotes(notes)) {
      return res.status(200).json(notes[noteIndex]);
    } else {
      return res.status(500).json({ message: 'Error writing notes data.' });
    }
  } else if (req.method === 'DELETE') {
    const notes = readNotes();
    if (notes === null) {
      return res.status(500).json({ message: 'Error reading notes data.' });
    }

    const initialLength = notes.length;
    const updatedNotes = notes.filter(n => n.id !== noteId);

    if (updatedNotes.length === initialLength) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (writeNotes(updatedNotes)) {
      return res.status(200).json({ message: 'Note deleted successfully.' });
    } else {
      return res.status(500).json({ message: 'Error writing notes data.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
