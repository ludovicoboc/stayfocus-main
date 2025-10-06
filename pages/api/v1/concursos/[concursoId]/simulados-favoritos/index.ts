import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { concursoId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!concursoId || typeof concursoId !== 'string') {
    return res.status(400).json({ message: 'ID do concurso inválido.' });
  }

  // Verificar se o concurso pertence ao usuário antes de qualquer operação
  const stmtCheckOwner = db.prepare('SELECT userId FROM concursos WHERE id = ?');
  const concurso = stmtCheckOwner.get(concursoId) as { userId: number } | undefined;

  if (!concurso || concurso.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM simulados_favoritos WHERE concursoId = ? AND userId = ?');
        const simulados = stmt.all(concursoId, userId);
        res.status(200).json(simulados);
      } catch (error) {
        console.error('Erro ao buscar simulados favoritos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { nome, data, link } = req.body;

        if (!nome || !data) {
          return res.status(400).json({ message: 'Nome e data são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO simulados_favoritos (userId, concursoId, nome, data, link) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, concursoId, nome, data, link);

        res.status(201).json({ id: result.lastInsertRowid, nome, data, link, concursoId });
      } catch (error) {
        console.error('Erro ao adicionar simulado favorito:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);