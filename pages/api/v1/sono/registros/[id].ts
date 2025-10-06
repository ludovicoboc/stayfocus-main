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
    return res.status(400).json({ message: 'ID do registro de sono inválido.' });
  }

  // Verificar se o registro pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM registros_sono WHERE id = ?');
  const registro = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!registro) {
    return res.status(404).json({ message: 'Registro de sono não encontrado.' });
  }

  if (registro.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const body = req.body;
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        const fields = ['inicio', 'fim', 'qualidade', 'notas'];
        fields.forEach(field => {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(body[field]);
          }
        });

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE registros_sono SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Registro de sono atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar registro de sono:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM registros_sono WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Registro de sono removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover registro de sono:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);