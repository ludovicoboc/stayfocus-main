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
    return res.status(400).json({ message: 'ID do medicamento inválido.' });
  }

  // Verificar se o medicamento pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM medicamentos WHERE id = ?');
  const medicamento = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!medicamento) {
    return res.status(404).json({ message: 'Medicamento não encontrado.' });
  }

  if (medicamento.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const body = req.body;
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        // Mapeia o corpo da requisição para os campos do banco de dados
        const fields = ['nome', 'dosagem', 'frequencia', 'observacoes', 'dataInicio', 'ultimaTomada', 'intervalo'];
        fields.forEach(field => {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(body[field]);
          }
        });

        // Trata o array de horários separadamente
        if (body.horarios !== undefined && Array.isArray(body.horarios)) {
          updates.push('horarios = ?');
          params.push(JSON.stringify(body.horarios));
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE medicamentos SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Medicamento atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM medicamentos WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Medicamento removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover medicamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);