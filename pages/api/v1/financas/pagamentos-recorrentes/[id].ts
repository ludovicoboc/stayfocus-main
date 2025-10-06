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
    return res.status(400).json({ message: 'ID do pagamento inválido.' });
  }

  const stmtCheckOwner = db.prepare('SELECT userId FROM pagamentos_recorrentes WHERE id = ?');
  const pagamento = stmtCheckOwner.get(id) as { userId: number } | undefined;

  if (!pagamento) {
    return res.status(404).json({ message: 'Pagamento recorrente não encontrado.' });
  }

  if (pagamento.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const body = req.body;
        const updates: string[] = [];
        const params: (string | number | boolean)[] = [];

        const fields = ['descricao', 'valor', 'dataVencimento', 'categoriaId', 'proximoPagamento'];
        fields.forEach(field => {
          if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            params.push(body[field]);
          }
        });

        // Lógica para marcar como pago/não pago
        if (body.pago !== undefined) {
          updates.push('pago = ?');
          params.push(body.pago ? 1 : 0);

          // Se marcar como pago, recalcular a próxima data de vencimento
          if (body.pago) {
            const currentPaymentStmt = db.prepare('SELECT dataVencimento FROM pagamentos_recorrentes WHERE id = ?');
            const currentPayment = currentPaymentStmt.get(id) as { dataVencimento: string };
            const diaVencimento = parseInt(currentPayment.dataVencimento);

            const hoje = new Date();
            let proximoPagamento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, diaVencimento);

            updates.push('proximoPagamento = ?');
            params.push(proximoPagamento.toISOString().split('T')[0]);
          }
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }

        params.push(id);
        const stmt = db.prepare(
          `UPDATE pagamentos_recorrentes SET ${updates.join(', ')} WHERE id = ?`
        );
        stmt.run(...params);

        res.status(200).json({ message: 'Pagamento recorrente atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar pagamento recorrente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        const stmt = db.prepare('DELETE FROM pagamentos_recorrentes WHERE id = ?');
        stmt.run(id);
        res.status(200).json({ message: 'Pagamento recorrente removido com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover pagamento recorrente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);