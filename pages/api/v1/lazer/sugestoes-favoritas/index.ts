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
        const stmt = db.prepare('SELECT id, sugestao FROM sugestoes_favoritas WHERE userId = ?');
        const favoritas = stmt.all(userId);
        res.status(200).json(favoritas);
      } catch (error) {
        console.error('Erro ao buscar sugestões favoritas:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { sugestao } = req.body;

        if (!sugestao) {
          return res.status(400).json({ message: 'O texto da sugestão é obrigatório.' });
        }

        const stmt = db.prepare(
          'INSERT INTO sugestoes_favoritas (userId, sugestao) VALUES (?, ?) ON CONFLICT(userId, sugestao) DO NOTHING'
        );
        const result = stmt.run(userId, sugestao);

        // Se a inserção ocorreu (changes > 0), retorna o novo objeto
        if (result.changes > 0) {
            res.status(201).json({ id: result.lastInsertRowid, sugestao });
        } else {
            // Se já existia, retorna a sugestão existente sem criar uma nova
            const existingStmt = db.prepare('SELECT id, sugestao FROM sugestoes_favoritas WHERE userId = ? AND sugestao = ?');
            const existente = existingStmt.get(userId, sugestao);
            res.status(200).json(existente);
        }
      } catch (error) {
        console.error('Erro ao adicionar sugestão favorita:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
        try {
            const { sugestao } = req.body;

            if (!sugestao) {
                return res.status(400).json({ message: 'O texto da sugestão é obrigatório para remoção.' });
            }

            const stmt = db.prepare('DELETE FROM sugestoes_favoritas WHERE userId = ? AND sugestao = ?');
            const result = stmt.run(userId, sugestao);

            if (result.changes > 0) {
                res.status(200).json({ message: 'Sugestão favorita removida com sucesso.' });
            } else {
                res.status(404).json({ message: 'Sugestão não encontrada.' });
            }
        } catch (error) {
            console.error('Erro ao remover sugestão favorita:', error);
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
        break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);