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
    return res.status(400).json({ message: 'ID da transação inválido.' });
  }

  // Verificar se a transação pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM transacoes WHERE id = ?');
  const transacao = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!transacao) {
    return res.status(404).json({ message: 'Transação não encontrada.' });
  }

  if (transacao.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM transacoes WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Transação removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);