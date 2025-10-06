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
    return res.status(400).json({ message: 'ID do hiperfoco inválido.' });
  }

  const stmtCheckOwner = db.prepare('SELECT userId FROM hiperfocos WHERE id = ?');
  const hiperfoco = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!hiperfoco) {
    return res.status(404).json({ message: 'Hiperfoco não encontrado.' });
  }

  if (hiperfoco.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { titulo, descricao, cor, tempoLimite } = req.body;

        if (!titulo || !cor) {
          return res.status(400).json({ message: 'Título e cor são obrigatórios.' });
        }

        const stmt = db.prepare(
          'UPDATE hiperfocos SET titulo = ?, descricao = ?, cor = ?, tempoLimite = ? WHERE id = ?'
        );
        stmt.run(titulo, descricao, cor, tempoLimite, id);

        res.status(200).json({ message: 'Hiperfoco atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar hiperfoco:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        // ON DELETE CASCADE irá remover tarefas associadas.
        // ON DELETE SET NULL irá limpar as referências em sessoes_alternancia.
        const stmt = db.prepare('DELETE FROM hiperfocos WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Hiperfoco removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover hiperfoco:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);