import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { hiperfocoId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!hiperfocoId || typeof hiperfocoId !== 'string') {
    return res.status(400).json({ message: 'ID do hiperfoco inválido.' });
  }

  // Verificar se o hiperfoco pertence ao usuário
  const stmtCheckOwner = db.prepare('SELECT userId FROM hiperfocos WHERE id = ?');
  const hiperfoco = stmtCheckOwner.get(hiperfocoId) as { userId: number } | undefined;

  if (!hiperfoco || hiperfoco.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { texto, tarefaPaiId } = req.body;

        if (!texto) {
          return res.status(400).json({ message: 'O texto da tarefa é obrigatório.' });
        }

        const stmt = db.prepare(
          'INSERT INTO tarefas (userId, hiperfocoId, tarefaPaiId, texto, concluida) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, hiperfocoId, tarefaPaiId || null, texto, 0); // concluida = false

        res.status(201).json({
          id: result.lastInsertRowid,
          texto,
          tarefaPaiId: tarefaPaiId || null,
          concluida: false
        });
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);