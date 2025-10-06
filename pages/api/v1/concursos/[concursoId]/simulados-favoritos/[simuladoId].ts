import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { concursoId, simuladoId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!concursoId || typeof concursoId !== 'string' || !simuladoId || typeof simuladoId !== 'string') {
    return res.status(400).json({ message: 'IDs inválidos.' });
  }

  // Verificar se o simulado pertence ao usuário e ao concurso
  const stmtCheckOwner = db.prepare('SELECT id FROM simulados_favoritos WHERE id = ? AND concursoId = ? AND userId = ?');
  const simulado = stmtCheckOwner.get(simuladoId, concursoId, userId);

  if (!simulado) {
    return res.status(404).json({ message: 'Simulado favorito não encontrado ou acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { nome } = req.body;
        if (!nome) {
          return res.status(400).json({ message: 'O nome é obrigatório para atualização.' });
        }
        const stmt = db.prepare('UPDATE simulados_favoritos SET nome = ? WHERE id = ?');
        stmt.run(nome, simuladoId);
        res.status(200).json({ message: 'Simulado favorito atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar simulado favorito:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM simulados_favoritos WHERE id = ?');
        stmt.run(simuladoId);
        res.status(200).json({ message: 'Simulado favorito removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover simulado favorito:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);