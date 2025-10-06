import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    // GET: Buscar todas as sessões de estudo do usuário
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM sessoes_estudo WHERE userId = ? ORDER BY data DESC');
        const sessoes = stmt.all(userId);
        res.status(200).json(sessoes);
      } catch (error) {
        console.error('Erro ao buscar sessões de estudo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // POST: Adicionar uma nova sessão de estudo
    case 'POST':
      try {
        const { titulo, descricao, duracao } = req.body;
        const data = new Date().toISOString().split('T')[0]; // Data atual

        if (!titulo || !duracao) {
          return res.status(400).json({ message: 'Título e duração são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO sessoes_estudo (userId, titulo, descricao, duracao, data, completo) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, titulo, descricao, duracao, data, 0); // completo = false

        res.status(201).json({
          id: result.lastInsertRowid,
          titulo,
          descricao,
          duracao,
          data,
          completo: false
        });
      } catch (error) {
        console.error('Erro ao criar sessão de estudo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);