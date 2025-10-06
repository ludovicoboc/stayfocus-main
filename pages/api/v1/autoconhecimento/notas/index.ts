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
        const stmt = db.prepare('SELECT * FROM notas_autoconhecimento WHERE userId = ? ORDER BY dataAtualizacao DESC');
        const notas = stmt.all(userId).map(nota => ({
          ...(nota as object),
          tags: JSON.parse((nota as any).tags || '[]'),
        }));
        res.status(200).json(notas);
      } catch (error) {
        console.error('Erro ao buscar notas de autoconhecimento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    case 'POST':
      try {
        const { titulo, conteudo, secao, tags, imagemUrl } = req.body;

        if (!titulo || !secao) {
          return res.status(400).json({ message: 'Título e seção são obrigatórios.' });
        }

        const agora = new Date().toISOString();
        const tagsJSON = JSON.stringify(tags || []);

        const stmt = db.prepare(
          `INSERT INTO notas_autoconhecimento
           (userId, titulo, conteudo, secao, tags, dataCriacao, dataAtualizacao, imagemUrl)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const result = stmt.run(userId, titulo, conteudo, secao, tagsJSON, agora, agora, imagemUrl);

        res.status(201).json({
          id: result.lastInsertRowid,
          titulo, conteudo, secao, tags: tags || [], dataCriacao: agora, dataAtualizacao: agora, imagemUrl
        });
      } catch (error) {
        console.error('Erro ao criar nota de autoconhecimento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);