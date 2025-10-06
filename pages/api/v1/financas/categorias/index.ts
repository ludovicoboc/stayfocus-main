import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM categorias_financas WHERE userId = ?');
        const categorias = stmt.all(userId);
        res.status(200).json(categorias);
      } catch (error) {
        console.error('Erro ao buscar categorias financeiras:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { nome, cor, icone } = req.body;

        if (!nome || !cor) {
          return res.status(400).json({ message: 'Nome e cor são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO categorias_financas (userId, nome, cor, icone) VALUES (?, ?, ?, ?)'
        );
        const result = stmt.run(userId, nome, cor, icone);

        res.status(201).json({ id: result.lastInsertRowid, nome, cor, icone });
      } catch (error) {
        console.error('Erro ao criar categoria financeira:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);