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

  const stmtCheckOwner = db.prepare('SELECT userId FROM sessoes_alternancia WHERE id = ?');
  const sessao = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!sessao) {
    return res.status(404).json({ message: 'Sessão de alternância não encontrada.' });
  }

  if (sessao.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const body = req.body;
        const updates: string[] = [];
        const params: (string | number | boolean | null)[] = [];

        const fields = ['titulo', 'duracaoEstimada', 'concluida'];
        fields.forEach(field => {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(body[field] ? (typeof body[field] === 'boolean' ? (body[field] ? 1 : 0) : body[field]) : body[field]);
          }
        });

        // Lógica para alternar hiperfoco
        if (body.novoHiperfocoId !== undefined) {
            const currentSessionStmt = db.prepare('SELECT hiperfocoAtualId FROM sessoes_alternancia WHERE id = ?');
            const currentSession = currentSessionStmt.get(id) as { hiperfocoAtualId: number };

            updates.push('hiperfocoAnteriorId = ?');
            params.push(currentSession.hiperfocoAtualId);
            updates.push('hiperfocoAtualId = ?');
            params.push(body.novoHiperfocoId);
            updates.push('tempoInicio = ?');
            params.push(new Date().toISOString());
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE sessoes_alternancia SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Sessão de alternância atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar sessão de alternância:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM sessoes_alternancia WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Sessão de alternância removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover sessão de alternância:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);