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
        const stmt = db.prepare('SELECT * FROM sessoes_alternancia WHERE userId = ? ORDER BY tempoInicio DESC');
        const sessoes = stmt.all(userId);
        res.status(200).json(sessoes);
      } catch (error) {
        console.error('Erro ao buscar sessões de alternância:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { titulo, hiperfocoAtualId, duracaoEstimada } = req.body;

        if (!titulo || !hiperfocoAtualId || duracaoEstimada === undefined) {
          return res.status(400).json({ message: 'Dados incompletos para criar a sessão.' });
        }

        const tempoInicio = new Date().toISOString();

        const stmt = db.prepare(
          `INSERT INTO sessoes_alternancia
           (userId, titulo, hiperfocoAtualId, hiperfocoAnteriorId, tempoInicio, duracaoEstimada, concluida)
           VALUES (?, ?, ?, NULL, ?, ?, ?)`
        );
        const result = stmt.run(userId, titulo, hiperfocoAtualId, tempoInicio, duracaoEstimada, false);

        res.status(201).json({
          id: result.lastInsertRowid,
          titulo,
          hiperfocoAtualId,
          hiperfocoAnteriorId: null,
          tempoInicio,
          duracaoEstimada,
          concluida: false
        });
      } catch (error) {
        console.error('Erro ao criar sessão de alternância:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);