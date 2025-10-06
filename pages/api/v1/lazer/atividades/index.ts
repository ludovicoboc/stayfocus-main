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
        const stmt = db.prepare('SELECT * FROM atividades_lazer WHERE userId = ? ORDER BY data DESC');
        const atividades = stmt.all(userId);
        res.status(200).json(atividades);
      } catch (error) {
        console.error('Erro ao buscar atividades de lazer:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { nome, categoria, duracao, observacoes, data } = req.body;

        if (!nome || !data) {
          return res.status(400).json({ message: 'Nome e data são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO atividades_lazer (userId, nome, categoria, duracao, observacoes, data, concluida) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, nome, categoria, duracao, observacoes, data, false);

        res.status(201).json({
          id: result.lastInsertRowid,
          nome, categoria, duracao, observacoes, data, concluida: false
        });
      } catch (error) {
        console.error('Erro ao criar atividade de lazer:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);