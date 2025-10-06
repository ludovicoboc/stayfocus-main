import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.session.userId;

  // 1. Proteger a rota: verificar se o usuário está autenticado
  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado. Faça login para continuar.' });
  }

  switch (req.method) {
    // 2. Rota GET: Buscar dados do perfil
    case 'GET':
      try {
        // Buscar nome e email da tabela de usuários
        const userStmt = db.prepare('SELECT name, email FROM users WHERE id = ?');
        const user = userStmt.get(userId) as { name: string; email: string };

        // Buscar configurações do perfil
        const settingsStmt = db.prepare('SELECT * FROM perfil_settings WHERE userId = ?');
        const settings = settingsStmt.get(userId);

        if (!user || !settings) {
          return res.status(404).json({ message: 'Perfil não encontrado.' });
        }

        // Combinar os dados e enviá-los
        const profileData = {
          nome: user.name,
          email: user.email,
          preferenciasVisuais: {
            altoContraste: Boolean((settings as any).altoContraste),
            reducaoEstimulos: Boolean((settings as any).reducaoEstimulos),
            textoGrande: Boolean((settings as any).textoGrande),
          },
          metasDiarias: {
            horasSono: (settings as any).horasSono,
            tarefasPrioritarias: (settings as any).tarefasPrioritarias,
            coposAgua: (settings as any).coposAgua,
            pausasProgramadas: (settings as any).pausasProgramadas,
          },
          notificacoesAtivas: Boolean((settings as any).notificacoesAtivas),
          pausasAtivas: Boolean((settings as any).pausasAtivas),
        };

        res.status(200).json(profileData);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar perfil.' });
      }
      break;

    // 3. Rota POST: Atualizar dados do perfil
    case 'POST':
      try {
        const { nome, preferenciasVisuais, metasDiarias, notificacoesAtivas, pausasAtivas } = req.body;

        // Iniciar uma transação para garantir a atomicidade das atualizações
        db.transaction(() => {
          // Atualizar o nome na tabela 'users'
          if (nome) {
            const updateUserStmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
            updateUserStmt.run(nome, userId);
          }

          // Atualizar as configurações na tabela 'perfil_settings'
          const updateSettingsStmt = db.prepare(`
            UPDATE perfil_settings SET
              altoContraste = ?,
              reducaoEstimulos = ?,
              textoGrande = ?,
              horasSono = ?,
              tarefasPrioritarias = ?,
              coposAgua = ?,
              pausasProgramadas = ?,
              notificacoesAtivas = ?,
              pausasAtivas = ?
            WHERE userId = ?
          `);
          updateSettingsStmt.run(
            preferenciasVisuais?.altoContraste,
            preferenciasVisuais?.reducaoEstimulos,
            preferenciasVisuais?.textoGrande,
            metasDiarias?.horasSono,
            metasDiarias?.tarefasPrioritarias,
            metasDiarias?.coposAgua,
            metasDiarias?.pausasProgramadas,
            notificacoesAtivas,
            pausasAtivas,
            userId
          );
        })();

        res.status(200).json({ message: 'Perfil atualizado com sucesso.' });
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
      }
      break;

    // 4. Método não permitido
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withSessionRoute(handler);