import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;
  const { concursoId, questaoId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (!concursoId || typeof concursoId !== 'string' || !questaoId || typeof questaoId !== 'string') {
    return res.status(400).json({ message: 'IDs inválidos.' });
  }

  // Verificar se a questão pertence ao usuário e ao concurso
  const stmtCheckOwner = db.prepare('SELECT userId FROM questoes WHERE id = ? AND concursoId = ?');
  const questao = stmtCheckOwner.get(questaoId, concursoId) as { userId: number } | undefined;

  if (!questao || questao.userId !== userId) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { enunciado, alternativas, respostaCorreta, ...outrosDados } = req.body;

        const transacao = db.transaction((data) => {
            // Atualizar os dados principais da questão
            const questaoFields = ['enunciado', 'disciplina', 'topico', 'justificativa', 'nivelDificuldade', 'ano', 'banca'];
            const updates: string[] = [];
            const params: any[] = [];

            questaoFields.forEach(field => {
                if(data[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });
             if (data.tags !== undefined) {
                updates.push('tags = ?');
                params.push(JSON.stringify(data.tags));
            }

            if (updates.length > 0) {
                params.push(questaoId);
                const updateQuestaoStmt = db.prepare(`UPDATE questoes SET ${updates.join(', ')} WHERE id = ?`);
                updateQuestaoStmt.run(...params);
            }

            // Atualizar alternativas se fornecidas
            if (data.alternativas && Array.isArray(data.alternativas) && data.alternativas.length > 0) {
                const deleteAltStmt = db.prepare('DELETE FROM alternativas WHERE questaoId = ?');
                deleteAltStmt.run(questaoId);

                const insertAltStmt = db.prepare('INSERT INTO alternativas (questaoId, texto) VALUES (?, ?)');
                let novaRespostaCorretaId: number | null = null;

                for (const alt of data.alternativas) {
                    const altResult = insertAltStmt.run(questaoId, alt.texto);
                    const altId = altResult.lastInsertRowid as number;
                    if (alt.correta) {
                        novaRespostaCorretaId = altId;
                    }
                }

                if (!novaRespostaCorretaId) throw new Error("Nenhuma alternativa correta fornecida na atualização.");

                const updateRespostaStmt = db.prepare('UPDATE questoes SET respostaCorretaId = ? WHERE id = ?');
                updateRespostaStmt.run(novaRespostaCorretaId, questaoId);
            }
        });

        transacao({ enunciado, alternativas, ...outrosDados });

        res.status(200).json({ message: 'Questão atualizada com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar questão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'DELETE':
      try {
        // ON DELETE CASCADE cuidará das alternativas
        const stmt = db.prepare('DELETE FROM questoes WHERE id = ?');
        stmt.run(questaoId);
        res.status(200).json({ message: 'Questão removida com sucesso.' });
      } catch (error) {
        console.error('Erro ao remover questão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);