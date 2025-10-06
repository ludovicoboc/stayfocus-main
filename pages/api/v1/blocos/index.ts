import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    // GET: Buscar todos os blocos de tempo do usuário
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM blocos_tempo WHERE userId = ? ORDER BY hora');
        const blocos = stmt.all(userId);
        res.status(200).json(blocos);
      } catch (error) {
        console.error('Erro ao buscar blocos de tempo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // POST: Adicionar um novo bloco de tempo
    case 'POST':
      try {
        const { hora, atividade, categoria } = req.body;

        if (!hora || !atividade || !categoria) {
          return res.status(400).json({ message: 'Dados incompletos para criar bloco de tempo.' });
        }

        const stmt = db.prepare(
          'INSERT INTO blocos_tempo (userId, hora, atividade, categoria) VALUES (?, ?, ?, ?)'
        );
        const result = stmt.run(userId, hora, atividade, categoria);

        res.status(201).json({ id: result.lastInsertRowid, hora, atividade, categoria });
      } catch (error) {
        console.error('Erro ao criar bloco de tempo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);