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
        const stmt = db.prepare('SELECT * FROM transacoes WHERE userId = ? ORDER BY data DESC');
        const transacoes = stmt.all(userId);
        res.status(200).json(transacoes);
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { data, valor, descricao, categoriaId, tipo } = req.body;

        if (!data || valor === undefined || !descricao || !categoriaId || !tipo) {
          return res.status(400).json({ message: 'Dados incompletos para criar a transação.' });
        }

        const stmt = db.prepare(
          'INSERT INTO transacoes (userId, data, valor, descricao, categoriaId, tipo) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, data, valor, descricao, categoriaId, tipo);

        res.status(201).json({ id: result.lastInsertRowid, data, valor, descricao, categoriaId, tipo });
      } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);