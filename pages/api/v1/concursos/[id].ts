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
    return res.status(400).json({ message: 'ID do concurso inválido.' });
  }

  const stmtCheckOwner = db.prepare('SELECT userId FROM concursos WHERE id = ?');
  const concurso = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!concurso) {
    return res.status(404).json({ message: 'Concurso não encontrado.' });
  }

  if (concurso.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { titulo, organizadora, dataInscricao, dataProva, edital, status } = req.body;

        // Esta rota atualiza apenas os dados principais do concurso.
        // O conteúdo programático será gerenciado por um endpoint dedicado.
        if (!titulo || !dataProva || !status) {
            return res.status(400).json({ message: 'Título, data da prova e status são obrigatórios.' });
        }

        const stmt = db.prepare(
          `UPDATE concursos
           SET titulo = ?, organizadora = ?, dataInscricao = ?, dataProva = ?, edital = ?, status = ?
           WHERE id = ?`
        );
        stmt.run(titulo, organizadora, dataInscricao, dataProva, edital, status, id);

        res.status(200).json({ message: 'Concurso atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar concurso:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        // ON DELETE CASCADE cuidará do conteúdo programático
        const stmt = db.prepare('DELETE FROM concursos WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Concurso removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover concurso:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);