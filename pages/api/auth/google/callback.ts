import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { IronSession, IronSessionData } from 'iron-session';
import { withSessionRoute } from '@/app/lib/session';
import db from '@/app/lib/db';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://stayfocus-main.vercel.app/api/auth/google/callback' 
  : 'http://localhost:3000/api/auth/google/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };
  const { code, error } = sessionReq.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (error) {
    console.error('Google OAuth Error:', error);
    return res.status(400).redirect('/perfil?error=google_auth_failed');
  }

  if (typeof code !== 'string') {
    console.error('Invalid code received from Google');
    return res.status(400).redirect('/perfil?error=invalid_code');
  }

  try {
    // 1. Trocar o código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens || !tokens.access_token || !tokens.expiry_date) {
      throw new Error('Failed to retrieve valid tokens from Google');
    }
    
    // Define as credenciais do OAuth2 para fazer chamadas à API
    oauth2Client.setCredentials(tokens);

    // 2. Buscar informações do perfil do usuário no Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.id || !userInfo.email) {
      throw new Error('Failed to retrieve user information from Google');
    }

    // 3. Lógica de "Encontrar ou Criar" o usuário
    let user;
    const findUserStmt = db.prepare('SELECT id FROM users WHERE googleId = ?');
    const existingUser = findUserStmt.get(userInfo.id);

    if (existingUser) {
      user = { id: (existingUser as { id: number }).id };
      console.log(`Usuário existente encontrado: ID ${user.id}`);
    } else {
      console.log('Criando novo usuário...');
      const insertUserStmt = db.prepare('INSERT INTO users (googleId, email, name) VALUES (?, ?, ?)');
      const result = insertUserStmt.run(userInfo.id, userInfo.email, userInfo.name || 'Usuário');
      const newUserId = result.lastInsertRowid;

      // Criar perfil padrão para o novo usuário
      const insertProfileStmt = db.prepare('INSERT INTO perfil_settings (userId) VALUES (?)');
      insertProfileStmt.run(newUserId);

      user = { id: Number(newUserId) };
      console.log(`Novo usuário criado com ID: ${user.id}`);
    }

    // 4. Salvar userId e tokens na sessão
    sessionReq.session.userId = user.id;
    sessionReq.session.tokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope || undefined,
    };
    await sessionReq.session.save();

    console.log(`Sessão salva para o usuário ID: ${user.id}`);

    res.redirect('/perfil?google_auth=success');

  } catch (err: any) {
    console.error('Falha no callback do Google OAuth:', err.message);
    res.status(500).redirect('/perfil?error=token_exchange_failed');
  }
};

export default withSessionRoute(handler);