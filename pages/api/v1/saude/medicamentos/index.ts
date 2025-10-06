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
        const stmt = db.prepare('SELECT * FROM medicamentos WHERE userId = ? ORDER BY nome');
        const medicamentos = stmt.all(userId).map(med => ({
          ...(med as object),
          // Parse o JSON de volta para um array
          horarios: JSON.parse((med as any).horarios || '[]'),
        }));
        res.status(200).json(medicamentos);
      } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { nome, dosagem, frequencia, horarios, observacoes, dataInicio, intervalo } = req.body;

        if (!nome || !horarios || !Array.isArray(horarios)) {
          return res.status(400).json({ message: 'Nome e horários são obrigatórios.' });
        }

        const horariosJSON = JSON.stringify(horarios);

        const stmt = db.prepare(
          `INSERT INTO medicamentos
           (userId, nome, dosagem, frequencia, horarios, observacoes, dataInicio, intervalo, ultimaTomada)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`
        );
        const result = stmt.run(userId, nome, dosagem, frequencia, horariosJSON, observacoes, dataInicio, intervalo);

        res.status(201).json({
          id: result.lastInsertRowid,
          nome, dosagem, frequencia, horarios, observacoes, dataInicio, intervalo, ultimaTomada: null
        });
      } catch (error) {
        console.error('Erro ao criar medicamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);