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
    return res.status(400).json({ message: 'ID da refeição inválido.' });
  }

  // Verificar se a refeição pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM refeicoes_planejadas WHERE id = ?');
  const refeicao = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!refeicao) {
    return res.status(404).json({ message: 'Refeição planejada não encontrada.' });
  }

  if (refeicao.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    // PUT: Atualizar uma refeição planejada
    case 'PUT':
      try {
        const { horario, descricao } = req.body;

        if (!horario || !descricao) {
          return res.status(400).json({ message: 'Horário e descrição são obrigatórios para atualização.' });
        }

        const stmt = db.prepare(
          'UPDATE refeicoes_planejadas SET horario = ?, descricao = ? WHERE id = ?'
        );
        stmt.run(horario, descricao, id);

        res.status(200).json({ message: 'Refeição planejada atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar refeição planejada:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // DELETE: Remover uma refeição planejada
    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM refeicoes_planejadas WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Refeição planejada removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover refeição planejada:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);