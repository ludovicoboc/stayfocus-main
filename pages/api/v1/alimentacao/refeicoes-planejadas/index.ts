import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    // GET: Buscar todas as refeições planejadas do usuário
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM refeicoes_planejadas WHERE userId = ? ORDER BY horario');
        const refeicoes = stmt.all(userId);
        res.status(200).json(refeicoes);
      } catch (error) {
        console.error('Erro ao buscar refeições planejadas:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // POST: Adicionar uma nova refeição planejada
    case 'POST':
      try {
        const { horario, descricao } = req.body;

        if (!horario || !descricao) {
          return res.status(400).json({ message: 'Horário e descrição são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO refeicoes_planejadas (userId, horario, descricao) VALUES (?, ?, ?)'
        );
        const result = stmt.run(userId, horario, descricao);

        res.status(201).json({ id: result.lastInsertRowid, horario, descricao });
      } catch (error) {
        console.error('Erro ao criar refeição planejada:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);