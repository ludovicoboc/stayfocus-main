import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { IronSession, IronSessionData } from 'iron-session'; // Keep IronSessionData for casting
import { withSessionRoute } from '@/app/lib/session';

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

// Define the handler function with standard types expected by withSessionRoute
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Cast req to include the session property for use within the handler
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };

  if (sessionReq.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${sessionReq.method} Not Allowed`);
  }

  const { code, error, state } = sessionReq.query;

  // Handle potential errors from Google
  if (error) {
    console.error('Google OAuth Error:', error);
    // Redirect to an error page or show an error message
    return res.status(400).redirect('/perfil?error=google_auth_failed'); // Redirect to profile page with error query param
  }

  // Ensure we received a code
  if (typeof code !== 'string') {
    console.error('Invalid code received from Google');
    return res.status(400).redirect('/perfil?error=invalid_code'); 
  }

  // Optional: Validate state parameter here if you implemented CSRF protection

  try {
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens || !tokens.access_token || !tokens.expiry_date) {
      throw new Error('Failed to retrieve valid tokens from Google');
    }
    
    // Store tokens in the session using the casted request object
    sessionReq.session.tokens = {
      access_token: tokens.access_token,
      // Handle potential null refresh_token explicitly
      refresh_token: tokens.refresh_token ?? undefined, 
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type, 
      scope: tokens.scope || undefined,
    };

    // Save the session using the casted request object
    await sessionReq.session.save();

    console.log('Google OAuth successful, tokens saved to session.'); 

    // Redirect user back to the application (e.g., profile page)
    // You might want to redirect to the specific page where the user initiated the auth
    res.redirect('/perfil?google_auth=success'); 

  } catch (err: any) {
    console.error('Error exchanging Google OAuth code for tokens:', err.message);
    // Redirect to an error page or show an error message
    res.status(500).redirect('/perfil?error=token_exchange_failed');
  }
}; // End of handler function definition

// Wrap the explicitly typed handler function
export default withSessionRoute(handler);
