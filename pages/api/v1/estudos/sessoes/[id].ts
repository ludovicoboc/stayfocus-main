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
    return res.status(400).json({ message: 'ID da sessão inválido.' });
  }

  // Verificar se a sessão pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM sessoes_estudo WHERE id = ?');
  const sessao = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!sessao) {
    return res.status(404).json({ message: 'Sessão de estudo não encontrada.' });
  }

  if (sessao.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    // PUT: Atualizar uma sessão de estudo
    case 'PUT':
      try {
        const { titulo, descricao, duracao, completo } = req.body;
        const updates: string[] = [];
        const params: (string | number | boolean)[] = [];

        if (titulo !== undefined) {
          updates.push('titulo = ?');
          params.push(titulo);
        }
        if (descricao !== undefined) {
          updates.push('descricao = ?');
          params.push(descricao);
        }
        if (duracao !== undefined) {
          updates.push('duracao = ?');
          params.push(duracao);
        }
        if (completo !== undefined) {
          updates.push('completo = ?');
          params.push(completo ? 1 : 0);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE sessoes_estudo SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Sessão de estudo atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar sessão de estudo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // DELETE: Remover uma sessão de estudo
    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM sessoes_estudo WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Sessão de estudo removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover sessão de estudo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);