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
        // Buscar todos os hiperfocos do usuário
        const hiperfocosStmt = db.prepare('SELECT * FROM hiperfocos WHERE userId = ?');
        const hiperfocos = hiperfocosStmt.all(userId);

        // Para cada hiperfoco, buscar suas tarefas e subtarefas
        const tarefasStmt = db.prepare('SELECT * FROM tarefas WHERE hiperfocoId = ?');
        const resultadoFinal = hiperfocos.map(hiperfoco => {
          const todasTarefas = tarefasStmt.all((hiperfoco as { id: number }).id);
          const tarefasPrincipais = todasTarefas.filter(t => !(t as { tarefaPaiId: number | null }).tarefaPaiId);
          const subTarefas: Record<string, any[]> = {};

          todasTarefas.forEach(t => {
            const tarefa = t as { tarefaPaiId: number | null };
            if (tarefa.tarefaPaiId) {
              if (!subTarefas[tarefa.tarefaPaiId]) {
                subTarefas[tarefa.tarefaPaiId] = [];
              }
              subTarefas[tarefa.tarefaPaiId].push(t);
            }
          });

          return {
            ...(hiperfoco as object),
            tarefas: tarefasPrincipais,
            subTarefas: subTarefas,
          };
        });

        res.status(200).json(resultadoFinal);
      } catch (error) {
        console.error('Erro ao buscar hiperfocos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { titulo, descricao, cor, tempoLimite } = req.body;

        if (!titulo || !cor) {
          return res.status(400).json({ message: 'Título e cor são obrigatórios.' });
        }

        const dataCriacao = new Date().toISOString();
        const stmt = db.prepare(
          'INSERT INTO hiperfocos (userId, titulo, descricao, cor, dataCriacao, tempoLimite) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(userId, titulo, descricao, cor, dataCriacao, tempoLimite);

        res.status(201).json({
          id: result.lastInsertRowid,
          titulo, descricao, cor, dataCriacao, tempoLimite,
          tarefas: [], subTarefas: {}
        });
      } catch (error) {
        console.error('Erro ao criar hiperfoco:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);