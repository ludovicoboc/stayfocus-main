import { NextApiRequest, NextApiResponse } from 'next';
import { IronSession, IronSessionData } from 'iron-session';
import { withSessionRoute } from '@/app/lib/session';

// Define the handler function with standard types expected by withSessionRoute
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Cast req to include the session property
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };

  if (sessionReq.method !== 'POST') { // Use POST for actions that change state
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${sessionReq.method} Not Allowed`);
  }

  try {
    // Destroy the session (clears tokens)
    sessionReq.session.destroy();
    console.log('Session destroyed (Google Disconnected).');
    res.status(200).json({ success: true, message: 'Disconnected successfully.' });
  } catch (error: any) {
    console.error('Error destroying session:', error.message);
    res.status(500).json({ error: 'Failed to disconnect.' });
  }
};

export default withSessionRoute(handler);
