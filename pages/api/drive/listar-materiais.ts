import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { IronSession, IronSessionData } from 'iron-session';
import { withSessionRoute } from '@/app/lib/session';
import { getAuthenticatedClient } from '@/app/lib/googleDriveClient';

// Define the handler function with standard types expected by withSessionRoute
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Cast req to include the session property
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };

  if (sessionReq.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${sessionReq.method} Not Allowed`);
  }

  try {
    const oauth2Client = await getAuthenticatedClient(sessionReq.session);
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Unauthorized or token refresh failed.' });
    }

    const { folderId } = sessionReq.query;

    if (!folderId || typeof folderId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid folderId parameter.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    console.log(`Attempting to list files from Google Drive in folder: ${folderId}`);

    // List files created by this application with the specific name pattern
    // The 'drive.file' scope limits visibility to files created or opened by the app.
    // We filter by name pattern and mime type.
    const listResponse = await drive.files.list({
      // Query to find JSON files matching the backup name pattern
      // Note: Searching by name prefix might be slow on large drives.
      // Consider using appProperties if storing files in a specific folder isn't feasible with drive.file scope.
      q: `mimeType='text/markdown' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, createdTime, modifiedTime)', // Get relevant file details
      orderBy: 'modifiedTime desc', // Show most recent backups first
      pageSize: 50, // Limit the number of results if necessary
      // Use 'spaces: drive' if you only want files in the main Drive space (not appDataFolder)
      spaces: 'drive',
    });

    const files = listResponse.data.files || [];
    console.log(`Found ${files.length} backup files.`);

    res.status(200).json({ success: true, files });

  } catch (error: any) {
    console.error('Error listing files from Google Drive:', error.message);
    if (error.response?.data?.error?.message) {
       console.error('Google API Error Details:', error.response.data.error.message);
       res.status(500).json({ error: `Google Drive API error: ${error.response.data.error.message}` });
    } else {
       res.status(500).json({ error: 'Failed to list files from Google Drive.' });
    }
  }
};

export default withSessionRoute(handler);