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
        const stmt = db.prepare('SELECT * FROM registros_humor WHERE userId = ? ORDER BY data DESC');
        const registros = stmt.all(userId).map(reg => ({
          ...(reg as object),
          // Parse o JSON de volta para um array
          fatores: JSON.parse((reg as any).fatores || '[]'),
        }));
        res.status(200).json(registros);
      } catch (error) {
        console.error('Erro ao buscar registros de humor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { nivel, fatores, notas } = req.body;
        const data = new Date().toISOString().split('T')[0];

        if (nivel === undefined) {
          return res.status(400).json({ message: 'O nível de humor é obrigatório.' });
        }

        const fatoresJSON = JSON.stringify(fatores || []);

        const stmt = db.prepare(
          'INSERT INTO registros_humor (userId, data, nivel, fatores, notas) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, data, nivel, fatoresJSON, notas);

        res.status(201).json({
          id: result.lastInsertRowid,
          data,
          nivel,
          fatores: fatores || [],
          notas
        });
      } catch (error) {
        console.error('Erro ao criar registro de humor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);