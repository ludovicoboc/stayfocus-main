import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { concursoId, conteudoId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!concursoId || typeof concursoId !== 'string' || !conteudoId || typeof conteudoId !== 'string') {
    return res.status(400).json({ message: 'IDs inválidos.' });
  }

  // Verificar se o concurso pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM concursos WHERE id = ?');
  const concurso = stmtCheckOwner.get(concursoId) as { userId: number } | undefined;

  if (!concurso || concurso.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { progresso } = req.body;

        if (progresso === undefined || typeof progresso !== 'number' || progresso < 0 || progresso > 100) {
          return res.status(400).json({ message: 'Progresso inválido. Deve ser um número entre 0 e 100.' });
        }

        const stmt = db.prepare(
          'UPDATE conteudos_programaticos SET progresso = ? WHERE id = ? AND concursoId = ?'
        );
        const result = stmt.run(progresso, conteudoId, concursoId);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Conteúdo programático não encontrado para este concurso.' });
        }

        res.status(200).json({ message: 'Progresso atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);