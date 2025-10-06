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
    return res.status(400).json({ message: 'ID do envelope inválido.' });
  }

  const stmtCheckOwner = db.prepare('SELECT userId FROM envelopes_orcamento WHERE id = ?');
  const envelope = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!envelope) {
    return res.status(404).json({ message: 'Envelope não encontrado.' });
  }

  if (envelope.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const body = req.body;
        const updates: string[] = [];
        const params: (string | number)[] = [];

        const fields = ['nome', 'cor', 'valorAlocado'];
        fields.forEach(field => {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(body[field]);
          }
        });

        // Lógica para registrar um gasto
        if (body.gasto !== undefined && typeof body.gasto === 'number') {
          updates.push('valorUtilizado = valorUtilizado + ?');
          params.push(body.gasto);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE envelopes_orcamento SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Envelope atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar envelope:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM envelopes_orcamento WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Envelope removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover envelope:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);