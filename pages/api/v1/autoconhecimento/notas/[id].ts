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
    return res.status(400).json({ message: 'ID da nota inválido.' });
  }

  // Verificar se a nota pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM notas_autoconhecimento WHERE id = ?');
  const nota = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!nota) {
    return res.status(404).json({ message: 'Nota não encontrada.' });
  }

  if (nota.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const body = req.body;
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        const fields = ['titulo', 'conteudo', 'secao', 'imagemUrl'];
        fields.forEach(field => {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(body[field]);
          }
        });

        if (body.tags !== undefined && Array.isArray(body.tags)) {
          updates.push('tags = ?');
          params.push(JSON.stringify(body.tags));
        }

        // Sempre atualizar a data de modificação
        updates.push('dataAtualizacao = ?');
        params.push(new Date().toISOString());

        if (updates.length <= 1) { // Apenas a data de atualização
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE notas_autoconhecimento SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Nota atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM notas_autoconhecimento WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Nota removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover nota:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);