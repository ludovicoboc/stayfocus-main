import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM pagamentos_recorrentes WHERE userId = ? ORDER BY dataVencimento');
        const pagamentos = stmt.all(userId);
        res.status(200).json(pagamentos);
      } catch (error) {
        console.error('Erro ao buscar pagamentos recorrentes:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { descricao, valor, dataVencimento, categoriaId } = req.body;

        if (!descricao || valor === undefined || !dataVencimento || !categoriaId) {
          return res.status(400).json({ message: 'Dados incompletos para criar pagamento recorrente.' });
        }

        // Simples lógica para calcular o próximo pagamento inicial
        const hoje = new Date();
        const diaVencimento = parseInt(dataVencimento);
        let proximoPagamento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
        if (proximoPagamento < hoje) {
            proximoPagamento.setMonth(proximoPagamento.getMonth() + 1);
        }

        const stmt = db.prepare(
          `INSERT INTO pagamentos_recorrentes
           (userId, descricao, valor, dataVencimento, categoriaId, proximoPagamento, pago)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(userId, descricao, valor, dataVencimento, categoriaId, proximoPagamento.toISOString().split('T')[0], false);

        res.status(201).json({
          id: result.lastInsertRowid,
          descricao, valor, dataVencimento, categoriaId,
          proximoPagamento: proximoPagamento.toISOString().split('T')[0],
          pago: false
        });
      } catch (error) {
        console.error('Erro ao criar pagamento recorrente:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);