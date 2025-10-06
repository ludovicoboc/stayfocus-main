import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID da atividade inválido.' });
  }

  // Verificar se a atividade pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM atividades_lazer WHERE id = ?');
  const atividade = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!atividade) {
    return res.status(404).json({ message: 'Atividade de lazer não encontrada.' });
  }

  if (atividade.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { concluida } = req.body;

        if (concluida === undefined) {
          return res.status(400).json({ message: 'O estado "concluida" é obrigatório.' });
        }

        const stmt = db.prepare(
          'UPDATE atividades_lazer SET concluida = ? WHERE id = ?'
        );
        stmt.run(concluida ? 1 : 0, id);

        res.status(200).json({ message: 'Atividade atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar atividade de lazer:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM atividades_lazer WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Atividade de lazer removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover atividade de lazer:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);