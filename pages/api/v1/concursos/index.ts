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
        const concursosStmt = db.prepare('SELECT * FROM concursos WHERE userId = ?');
        const concursos = concursosStmt.all(userId);

        const conteudosStmt = db.prepare('SELECT * FROM conteudos_programaticos WHERE concursoId = ?');
        const resultadoFinal = concursos.map(concurso => {
          const conteudoProgramatico = conteudosStmt.all((concurso as { id: number }).id).map(c => ({
            ...(c as object),
            topicos: JSON.parse((c as any).topicos || '[]'),
          }));
          return {
            ...(concurso as object),
            conteudoProgramatico,
          };
        });

        res.status(200).json(resultadoFinal);
      } catch (error) {
        console.error('Erro ao buscar concursos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { titulo, organizadora, dataInscricao, dataProva, edital, status, conteudoProgramatico } = req.body;

        if (!titulo || !dataProva || !status || !conteudoProgramatico) {
          return res.status(400).json({ message: 'Dados incompletos para criar o concurso.' });
        }

        const transacao = db.transaction((concursoData) => {
          const concursoStmt = db.prepare(
            `INSERT INTO concursos (userId, titulo, organizadora, dataInscricao, dataProva, edital, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          );
          const concursoResult = concursoStmt.run(
            userId, concursoData.titulo, concursoData.organizadora, concursoData.dataInscricao,
            concursoData.dataProva, concursoData.edital, concursoData.status
          );
          const concursoId = concursoResult.lastInsertRowid;

          const conteudoStmt = db.prepare(
            `INSERT INTO conteudos_programaticos (concursoId, disciplina, topicos, progresso)
             VALUES (?, ?, ?, ?)`
          );
          for (const conteudo of concursoData.conteudoProgramatico) {
            conteudoStmt.run(concursoId, conteudo.disciplina, JSON.stringify(conteudo.topicos || []), conteudo.progresso || 0);
          }

          return { id: concursoId };
        });

        const novoConcursoInfo = transacao({ titulo, organizadora, dataInscricao, dataProva, edital, status, conteudoProgramatico });

        res.status(201).json({
          id: novoConcursoInfo.id,
          titulo, organizadora, dataInscricao, dataProva, edital, status, conteudoProgramatico
        });
      } catch (error) {
        console.error('Erro ao criar concurso:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);