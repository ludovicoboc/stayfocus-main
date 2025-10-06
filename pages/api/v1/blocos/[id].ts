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
    return res.status(400).json({ message: 'ID do bloco inválido.' });
  }

  // Verificar se o bloco pertence ao usuário antes de qualquer operação
  const stmtCheckOwner = db.prepare('SELECT userId FROM blocos_tempo WHERE id = ?');
  const bloco = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!bloco) {
    return res.status(404).json({ message: 'Bloco de tempo não encontrado.' });
  }

  if (bloco.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para modificar este recurso.' });
  }

  switch (req.method) {
    // PUT: Atualizar um bloco de tempo existente
    case 'PUT':
      try {
        const { atividade, categoria } = req.body;

        if (!atividade && !categoria) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        // Constrói a query dinamicamente para atualizar apenas os campos fornecidos
        const fieldsToUpdate: string[] = [];
        const params: (string | number)[] = [];

        if (atividade) {
          fieldsToUpdate.push('atividade = ?');
          params.push(atividade);
        }
        if (categoria) {
          fieldsToUpdate.push('categoria = ?');
          params.push(categoria);
        }

        params.push(id, userId);

        const stmt = db.prepare(
          `UPDATE blocos_tempo SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND userId = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Bloco de tempo atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar bloco de tempo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // DELETE: Remover um bloco de tempo
    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM blocos_tempo WHERE id = ? AND userId = ?');
        stmt.run(id, userId);

        res.status(200).json({ message: 'Bloco de tempo removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover bloco de tempo:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);