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
        const stmt = db.prepare('SELECT * FROM envelopes_orcamento WHERE userId = ? ORDER BY nome');
        const envelopes = stmt.all(userId);
        res.status(200).json(envelopes);
      } catch (error) {
        console.error('Erro ao buscar envelopes:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { nome, cor, valorAlocado } = req.body;

        if (!nome || valorAlocado === undefined) {
          return res.status(400).json({ message: 'Nome e valor alocado são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO envelopes_orcamento (userId, nome, cor, valorAlocado, valorUtilizado) VALUES (?, ?, ?, ?, 0)'
        );
        const result = stmt.run(userId, nome, cor, valorAlocado);

        res.status(201).json({
          id: result.lastInsertRowid,
          nome,
          cor,
          valorAlocado,
          valorUtilizado: 0
        });
      } catch (error) {
        console.error('Erro ao criar envelope:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);