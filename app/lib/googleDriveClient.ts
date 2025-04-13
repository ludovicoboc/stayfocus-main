import { google, Auth } from 'googleapis'; // Import Auth explicitly
import { IronSession, IronSessionData } from 'iron-session';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Use the same redirect URI as in auth routes, although it might not be strictly needed for refresh
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://stayfocus-main.vercel.app/api/auth/google/callback' 
  : 'http://localhost:3000/api/auth/google/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}

/**
 * Creates an OAuth2 client and handles token refresh if necessary.
 * Updates the session with new tokens if refreshed.
 * @param session The IronSession object containing the tokens.
 * @returns An authenticated Auth.OAuth2Client instance or null if authentication fails.
 */
export async function getAuthenticatedClient(session: IronSession<IronSessionData>): Promise<Auth.OAuth2Client | null> {
  if (!session.tokens?.access_token) {
    console.error('No access token found in session.');
    return null;
  }

  const oauth2Client = new Auth.OAuth2Client( // Use Auth.OAuth2Client
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: session.tokens.access_token,
    refresh_token: session.tokens.refresh_token,
    expiry_date: session.tokens.expiry_date,
    token_type: session.tokens.token_type,
    scope: session.tokens.scope,
  });

  // Check if the token is expired or close to expiring (e.g., within 5 minutes)
  const expiryBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
  const isTokenExpired = session.tokens.expiry_date <= Date.now() + expiryBuffer;

  if (isTokenExpired) {
    if (!session.tokens.refresh_token) {
      console.error('Access token expired, but no refresh token available.');
      // Optionally destroy the session here if refresh is impossible
      // await session.destroy();
      return null; 
    }

    console.log('Access token expired, attempting refresh...');
    try {
      // Refresh the tokens
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (!credentials || !credentials.access_token || !credentials.expiry_date) {
         throw new Error('Failed to refresh tokens: Invalid credentials received.');
      }

      console.log('Tokens refreshed successfully.');

      // Update the client with new credentials
      oauth2Client.setCredentials(credentials);

      // Update the session with the new tokens
      // Ensure session.tokens exists before assigning (should exist based on checks above)
      if (!session.tokens) {
        throw new Error("Session tokens object is unexpectedly undefined during refresh update.");
      }

      // Construct a new tokens object with the correct types
      const updatedTokens = {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token === null 
                      ? undefined 
                      : credentials.refresh_token ?? session.tokens?.refresh_token,
        expiry_date: credentials.expiry_date,
        token_type: credentials.token_type,
        scope: credentials.scope === null ? undefined : credentials.scope ?? session.tokens?.scope
      } as IronSessionData['tokens'];

      // Assign the new object to the session
      session.tokens = updatedTokens; 

      await session.save();
      console.log('Session updated with refreshed tokens.');

    } catch (error: any) {
      console.error('Error refreshing access token:', error.message);
      // Optionally destroy the session if refresh fails permanently
      // await session.destroy();
      return null;
    }
  }

  return oauth2Client;
}
