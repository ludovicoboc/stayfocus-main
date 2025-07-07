import { NextApiRequest, NextApiResponse } from 'next';
import { IronSession, IronSessionData } from 'iron-session';
import { withSessionRoute } from '@/app/lib/session';

// Define the handler function with standard types expected by withSessionRoute
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Cast req to include the session property
  const sessionReq = req as NextApiRequest & { session: IronSession<IronSessionData> };

  if (sessionReq.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${sessionReq.method} Not Allowed`);
  }

  const tokens = sessionReq.session.tokens;

  // Check if tokens exist and if the access token hasn't expired (or is close to expiring)
  // Add a buffer (e.g., 5 minutes) to the expiry check
  const isAuthenticated = !!tokens?.access_token && tokens.expiry_date > Date.now() + 5 * 60 * 1000;

  res.status(200).json({ isAuthenticated });
};

export default withSessionRoute(handler);
