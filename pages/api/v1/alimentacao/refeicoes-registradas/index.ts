import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  switch (req.method) {
    // GET: Buscar todos os registros de refeições do usuário
    case 'GET':
      try {
        const stmt = db.prepare('SELECT * FROM refeicoes_registradas WHERE userId = ? ORDER BY data DESC, horario DESC');
        const registros = stmt.all(userId);
        res.status(200).json(registros);
      } catch (error) {
        console.error('Erro ao buscar registros de refeições:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    // POST: Adicionar um novo registro de refeição
    case 'POST':
      try {
        const { horario, descricao, tipoIcone, foto } = req.body;
        const data = new Date().toISOString().split('T')[0]; // Data atual

        if (!horario || !descricao) {
          return res.status(400).json({ message: 'Horário e descrição são obrigatórios.' });
        }

        const stmt = db.prepare(
          'INSERT INTO refeicoes_registradas (userId, data, horario, descricao, tipoIcone, foto) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, data, horario, descricao, tipoIcone, foto);

        res.status(201).json({ id: result.lastInsertRowid, data, horario, descricao, tipoIcone, foto });
      } catch (error) {
        console.error('Erro ao criar registro de refeição:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);