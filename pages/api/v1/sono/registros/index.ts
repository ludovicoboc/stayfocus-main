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
        const stmt = db.prepare('SELECT * FROM registros_sono WHERE userId = ? ORDER BY inicio DESC');
        const registros = stmt.all(userId);
        res.status(200).json(registros);
      } catch (error) {
        console.error('Erro ao buscar registros de sono:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { inicio, fim, qualidade, notas } = req.body;

        if (!inicio) {
          return res.status(400).json({ message: 'A data de início do sono é obrigatória.' });
        }

        const stmt = db.prepare(
          'INSERT INTO registros_sono (userId, inicio, fim, qualidade, notas) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, inicio, fim || null, qualidade, notas);

        res.status(201).json({
          id: result.lastInsertRowid,
          inicio,
          fim: fim || null,
          qualidade,
          notas
        });
      } catch (error) {
        console.error('Erro ao criar registro de sono:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);