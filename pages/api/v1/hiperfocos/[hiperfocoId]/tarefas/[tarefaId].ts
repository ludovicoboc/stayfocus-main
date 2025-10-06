import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { hiperfocoId, tarefaId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!hiperfocoId || typeof hiperfocoId !== 'string' || !tarefaId || typeof tarefaId !== 'string') {
    return res.status(400).json({ message: 'IDs inválidos.' });
  }

  // Verificar se a tarefa e o hiperfoco pertencem ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM tarefas WHERE id = ? AND hiperfocoId = ?');
  const tarefa = stmtCheckOwner.get(tarefaId, hiperfocoId) as { userId: number } | undefined;

  if (!tarefa || tarefa.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { texto, concluida } = req.body;
        const updates: string[] = [];
        const params: (string | number | boolean)[] = [];

        if (texto !== undefined) {
          updates.push('texto = ?');
          params.push(texto);
        }
        if (concluida !== undefined) {
          updates.push('concluida = ?');
          params.push(concluida ? 1 : 0);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(tarefaId);
        const stmt = db.prepare(`UPDATE tarefas SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...params);

        res.status(200).json({ message: 'Tarefa atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        // ON DELETE CASCADE cuidará das subtarefas
        const stmt = db.prepare('DELETE FROM tarefas WHERE id = ?');
        stmt.run(tarefaId);
        res.status(200).json({ message: 'Tarefa removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover tarefa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);