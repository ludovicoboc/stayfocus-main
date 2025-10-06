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
    return res.status(400).json({ message: 'ID do registro inválido.' });
  }

  // Verificar se o registro pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM refeicoes_registradas WHERE id = ?');
  const registro = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!registro) {
    return res.status(404).json({ message: 'Registro de refeição não encontrado.' });
  }

  if (registro.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    // DELETE: Remover um registro de refeição
    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM refeicoes_registradas WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Registro de refeição removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover registro de refeição:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);