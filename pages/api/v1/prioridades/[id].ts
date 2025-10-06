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
    return res.status(400).json({ message: 'ID da prioridade inválido.' });
  }

  // Verificar se a prioridade pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM prioridades WHERE id = ?');
  const prioridade = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!prioridade) {
    return res.status(404).json({ message: 'Prioridade não encontrada.' });
  }

  if (prioridade.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    // PUT: Atualizar uma prioridade (texto ou status de conclusão)
    case 'PUT':
      try {
        const { texto, concluida } = req.body;

        if (texto === undefined && concluida === undefined) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        if (texto !== undefined) {
          const stmt = db.prepare('UPDATE prioridades SET texto = ? WHERE id = ?');
          stmt.run(texto, id);
        }

        if (concluida !== undefined) {
          const stmt = db.prepare('UPDATE prioridades SET concluida = ? WHERE id = ?');
          stmt.run(concluida ? 1 : 0, id);
        }

        res.status(200).json({ message: 'Prioridade atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar prioridade:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // DELETE: Remover uma prioridade
    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM prioridades WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Prioridade removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover prioridade:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);