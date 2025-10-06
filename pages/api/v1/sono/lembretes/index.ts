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
        const stmt = db.prepare('SELECT * FROM lembretes_sono WHERE userId = ?');
        const lembretes = stmt.all(userId).map(lembrete => ({
          ...(lembrete as object),
          diasSemana: JSON.parse((lembrete as any).diasSemana || '[]'),
          ativo: Boolean((lembrete as any).ativo),
        }));
        res.status(200).json(lembretes);
      } catch (error) {
        console.error('Erro ao buscar lembretes de sono:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { tipo, horario, diasSemana } = req.body;

        if (!tipo || !horario || !Array.isArray(diasSemana)) {
          return res.status(400).json({ message: 'Dados incompletos para criar o lembrete.' });
        }

        const diasSemanaJSON = JSON.stringify(diasSemana);

        const stmt = db.prepare(
          'INSERT INTO lembretes_sono (userId, tipo, horario, diasSemana, ativo) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, tipo, horario, diasSemanaJSON, true);

        res.status(201).json({
          id: result.lastInsertRowid,
          tipo,
          horario,
          diasSemana,
          ativo: true
        });
      } catch (error) {
        console.error('Erro ao criar lembrete de sono:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);