import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { concursoId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!concursoId || typeof concursoId !== 'string') {
    return res.status(400).json({ message: 'ID do concurso inválido.' });
  }

  const stmtCheckOwner = db.prepare('SELECT userId FROM concursos WHERE id = ?');
  const concurso = stmtCheckOwner.get(concursoId) as { userId: number } | undefined;

  if (!concurso || concurso.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const questoesStmt = db.prepare('SELECT * FROM questoes WHERE concursoId = ? AND userId = ?');
        const questoes = questoesStmt.all(concursoId, userId);

        const alternativasStmt = db.prepare('SELECT * FROM alternativas WHERE questaoId = ?');
        const resultadoFinal = questoes.map(q => {
          const questao = q as { id: number, respostaCorretaId: number };
          const alternativas = alternativasStmt.all(questao.id).map(alt => ({
            ...(alt as object),
            correta: (alt as { id: number }).id === questao.respostaCorretaId,
          }));
          return { ...questao, alternativas };
        });

        res.status(200).json(resultadoFinal);
      } catch (error) {
        console.error('Erro ao buscar questões:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { enunciado, alternativas, respostaCorreta, ...outrosDados } = req.body;

        if (!enunciado || !alternativas || !Array.isArray(alternativas) || alternativas.length === 0 || !respostaCorreta) {
          return res.status(400).json({ message: 'Dados incompletos para criar a questão.' });
        }

        const transacao = db.transaction((data) => {
          const questaoStmt = db.prepare(
            `INSERT INTO questoes (userId, concursoId, enunciado, disciplina, topico, justificativa, nivelDificuldade, ano, banca, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          );
          const questaoResult = questaoStmt.run(
            userId, concursoId, data.enunciado, data.disciplina, data.topico,
            data.justificativa, data.nivelDificuldade, data.ano, data.banca, JSON.stringify(data.tags || [])
          );
          const questaoId = questaoResult.lastInsertRowid;

          const alternativaStmt = db.prepare('INSERT INTO alternativas (questaoId, texto) VALUES (?, ?)');
          let respostaCorretaId: number | null = null;
          const alternativasInseridas = [];

          for (const alt of data.alternativas) {
            const altResult = alternativaStmt.run(questaoId, alt.texto);
            const altId = altResult.lastInsertRowid as number;
            alternativasInseridas.push({ id: altId, texto: alt.texto, correta: alt.correta });
            if (alt.correta) {
              respostaCorretaId = altId;
            }
          }

          if (!respostaCorretaId) {
            throw new Error("Nenhuma alternativa marcada como correta.");
          }

          const updateStmt = db.prepare('UPDATE questoes SET respostaCorretaId = ? WHERE id = ?');
          updateStmt.run(respostaCorretaId, questaoId);

          return { id: questaoId, alternativas: alternativasInseridas, respostaCorretaId: respostaCorretaId };
        });

        const novaQuestaoInfo = transacao({ enunciado, alternativas, ...outrosDados });

        res.status(201).json({
          id: novaQuestaoInfo.id,
          enunciado,
          alternativas: novaQuestaoInfo.alternativas,
          respostaCorreta: novaQuestaoInfo.respostaCorretaId,
          ...outrosDados
        });
      } catch (error) {
        console.error('Erro ao criar questão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);