import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Ensure this matches the one configured in Google Cloud Console
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

// Define the scopes needed. 'drive.file' allows access only to files created or opened by the app.
const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile', // Get basic profile info (optional)
  'https://www.googleapis.com/auth/userinfo.email',   // Get email address (optional)
  'https://www.googleapis.com/auth/drive.file'        // Per-file access to files created or opened by the app
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: scopes,
    include_granted_scopes: true,
    // Consider adding state parameter for CSRF protection if needed
    // state: 'some_random_string' 
  });

  res.redirect(authorizationUrl);
}
