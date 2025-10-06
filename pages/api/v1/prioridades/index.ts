import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    // GET: Buscar prioridades, com filtro opcional por data
    case 'GET':
      try {
        const { data } = req.query; // data no formato 'YYYY-MM-DD'
        let prioridades;

        if (data && typeof data === 'string') {
          const stmt = db.prepare('SELECT * FROM prioridades WHERE userId = ? AND data = ? ORDER BY id');
          prioridades = stmt.all(userId, data);
        } else {
          const stmt = db.prepare('SELECT * FROM prioridades WHERE userId = ? ORDER BY data DESC, id');
          prioridades = stmt.all(userId);
        }

        res.status(200).json(prioridades);
      } catch (error) {
        console.error('Erro ao buscar prioridades:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // POST: Adicionar uma nova prioridade
    case 'POST':
      try {
        const { texto, tipo, origemId } = req.body;
        const data = new Date().toISOString().split('T')[0]; // Data atual

        if (!texto) {
          return res.status(400).json({ message: 'O texto da prioridade é obrigatório.' });
        }

        const stmt = db.prepare(
          'INSERT INTO prioridades (userId, texto, data, tipo, origemId) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, texto, data, tipo || 'geral', origemId);

        res.status(201).json({ id: result.lastInsertRowid, texto, data, concluida: false, tipo, origemId });
      } catch (error) {
        console.error('Erro ao criar prioridade:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);