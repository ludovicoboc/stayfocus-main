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
    return res.status(400).json({ message: 'ID da categoria inválido.' });
  }

  // Verificar se a categoria pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM categorias_financas WHERE id = ?');
  const categoria = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!categoria) {
    return res.status(404).json({ message: 'Categoria não encontrada.' });
  }

  if (categoria.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { nome, cor, icone } = req.body;

        if (!nome || !cor) {
          return res.status(400).json({ message: 'Nome e cor são obrigatórios.' });
        }

        const stmt = db.prepare(
          'UPDATE categorias_financas SET nome = ?, cor = ?, icone = ? WHERE id = ?'
        );
        stmt.run(nome, cor, icone, id);

        res.status(200).json({ message: 'Categoria atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar categoria financeira:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        // A configuração ON DELETE CASCADE no DB cuidará de remover os itens associados
        const stmt = db.prepare('DELETE FROM categorias_financas WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Categoria removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover categoria financeira:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);