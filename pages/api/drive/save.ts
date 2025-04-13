import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { IronSession, IronSessionData } from 'iron-session';
import { withSessionRoute } from '@/app/lib/session';
import { getAuthenticatedClient } from '@/app/lib/googleDriveClient';
import { Readable } from 'stream';

// Define the handler function with standard types expected by withSessionRoute
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Cast req to include the session property
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };

  if (sessionReq.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${sessionReq.method} Not Allowed`);
  }

  try {
    const oauth2Client = await getAuthenticatedClient(sessionReq.session);
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Unauthorized or token refresh failed.' });
    }

    // Get data from request body - assume it's already a JSON string or object
    const dataToSave = sessionReq.body; 
    if (!dataToSave) {
      return res.status(400).json({ error: 'No data provided in request body.' });
    }

    // Ensure data is a string for upload
    const jsonDataString = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave, null, 2);
    
    // Convert string to a readable stream for upload
    const stream = new Readable();
    stream.push(jsonDataString);
    stream.push(null); // Signal end of stream

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Define file metadata
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `app_backup_${timestamp}.json`;
    const fileMetadata = {
      name: fileName,
      // If using drive.file scope, files are typically created in root or user selects location.
      // To store in a specific app folder requires drive.appdata scope or more complex folder management.
      // parents: ['appDataFolder'] // Use this if you have 'drive.appdata' scope instead of 'drive.file'
    };

    // Define media body
    const media = {
      mimeType: 'application/json',
      body: stream, // Use the readable stream
    };

    console.log(`Attempting to upload file: ${fileName}`);

    // Upload the file
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name', // Request the ID and name of the created file
    });

    console.log(`File uploaded successfully: ID: ${file.data.id}, Name: ${file.data.name}`);

    res.status(200).json({ success: true, fileId: file.data.id, fileName: file.data.name });

  } catch (error: any) {
    console.error('Error saving data to Google Drive:', error.message);
    // Provide more specific error messages if possible
    if (error.response?.data?.error?.message) {
       console.error('Google API Error Details:', error.response.data.error.message);
       res.status(500).json({ error: `Google Drive API error: ${error.response.data.error.message}` });
    } else {
       res.status(500).json({ error: 'Failed to save data to Google Drive.' });
    }
  }
};

export default withSessionRoute(handler);
