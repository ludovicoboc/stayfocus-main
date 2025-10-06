import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

// Função para encontrar ou criar o registro de hidratação do dia
const getOrCreateHidratacaoHoje = (userId: number) => {
  const hoje = new Date().toISOString().split('T')[0];

  // Tenta encontrar o registro de hoje
  const stmtFind = db.prepare('SELECT * FROM hidratacao WHERE userId = ? AND data = ?');
  let hidratacaoHoje = stmtFind.get(userId, hoje);

  // Se não existir, cria um novo
  if (!hidratacaoHoje) {
    // Busca a meta padrão do perfil do usuário, se não houver, usa 8
    const stmtMeta = db.prepare('SELECT coposAgua FROM perfil_settings WHERE userId = ?');
    const metaPerfil = stmtMeta.get(userId) as { coposAgua: number } | undefined;
    const metaDiaria = metaPerfil?.coposAgua || 8;

    const stmtCreate = db.prepare(
      'INSERT INTO hidratacao (userId, data, metaDiaria, coposBebidos) VALUES (?, ?, ?, 0) ON CONFLICT(userId, data) DO NOTHING'
    );
    stmtCreate.run(userId, hoje, metaDiaria);

    // Busca novamente o registro recém-criado
    hidratacaoHoje = stmtFind.get(userId, hoje);
  }

  return hidratacaoHoje;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const hidratacaoHoje = getOrCreateHidratacaoHoje(userId);

    switch (req.method) {
      // GET: Retorna os dados de hidratação do dia
      case 'GET':
        res.status(200).json(hidratacaoHoje);
        break;

      // POST: Atualiza os dados de hidratação (adiciona/remove copo, ajusta meta)
      case 'POST':
        const { action, value } = req.body;
        const hoje = new Date().toISOString().split('T')[0];
        let stmt;

        switch (action) {
          case 'add_copo':
            stmt = db.prepare('UPDATE hidratacao SET coposBebidos = coposBebidos + 1 WHERE userId = ? AND data = ?');
            stmt.run(userId, hoje);
            break;
          case 'remove_copo':
            stmt = db.prepare('UPDATE hidratacao SET coposBebidos = MAX(0, coposBebidos - 1) WHERE userId = ? AND data = ?');
            stmt.run(userId, hoje);
            break;
          case 'ajustar_meta':
            if (typeof value !== 'number' || value < 1) {
              return res.status(400).json({ message: 'Valor da meta inválido.' });
            }
            stmt = db.prepare('UPDATE hidratacao SET metaDiaria = ? WHERE userId = ? AND data = ?');
            stmt.run(value, userId, hoje);
            break;
          default:
            return res.status(400).json({ message: 'Ação inválida.' });
        }

        const hidratacaoAtualizada = getOrCreateHidratacaoHoje(userId);
        res.status(200).json(hidratacaoAtualizada);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro ao gerenciar hidratação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

export default withSessionRoute(handler);