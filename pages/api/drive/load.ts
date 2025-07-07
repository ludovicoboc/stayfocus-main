import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { IronSession, IronSessionData } from 'iron-session';
import { withSessionRoute } from '@/app/lib/session';
import { getAuthenticatedClient } from '@/app/lib/googleDriveClient';
import { WritableStreamBuffer } from 'stream-buffers'; // Need to install stream-buffers

// Define the handler function with standard types expected by withSessionRoute
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Cast req to include the session property
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };

  if (sessionReq.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${sessionReq.method} Not Allowed`);
  }

  const { fileId } = sessionReq.query;

  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid fileId query parameter.' });
  }

  try {
    const oauth2Client = await getAuthenticatedClient(sessionReq.session);
    if (!oauth2Client) {
      return res.status(401).json({ error: 'Unauthorized or token refresh failed.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    console.log(`Attempting to download file with ID: ${fileId}`);

    // Get the file content
    const fileResponse = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' } // Request response as a stream
    );

    // Pipe the stream to a buffer to get the full content
    const dest = new WritableStreamBuffer();
    // Correctly handle the promise for stream completion/error
    await new Promise<void>((resolve, reject) => { // Add void type parameter for clarity
      const stream = fileResponse.data as NodeJS.ReadableStream; // Cast to NodeJS stream type
      stream.on('end', () => resolve());
      stream.on('error', (err) => reject(err)); // Pass error to reject
      stream.pipe(dest);
    }); // Correct closing parenthesis and semicolon placement

    const fileContent = dest.getContentsAsString('utf8');
    
    if (!fileContent) {
       throw new Error('Downloaded file content is empty.');
    }

    console.log(`File ${fileId} downloaded successfully.`);

    // Attempt to parse JSON to ensure it's valid before sending
    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch (parseError: any) {
      console.error(`Error parsing JSON content for file ${fileId}:`, parseError.message);
      return res.status(500).json({ error: 'Downloaded file is not valid JSON.' });
    }

    // Send the parsed JSON data back
    res.status(200).json({ success: true, data: jsonData });

  } catch (error: any) {
    console.error(`Error loading file ${fileId} from Google Drive:`, error.message);
    if (error.response?.data?.error?.message) {
       console.error('Google API Error Details:', error.response.data.error.message);
       res.status(500).json({ error: `Google Drive API error: ${error.response.data.error.message}` });
    } else if (error.response?.status === 404) {
       res.status(404).json({ error: 'File not found on Google Drive.' });
    } else {
       res.status(500).json({ error: 'Failed to load file from Google Drive.' });
    }
  }
};

export default withSessionRoute(handler);
