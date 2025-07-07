import { getIronSession } from 'iron-session';
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from 'next';

// Ensure SESSION_SECRET is set and is strong
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET || SESSION_SECRET === 'replace_this_with_a_real_random_32_byte_hex_string' || SESSION_SECRET.length < 32) {
  console.warn(
    'WARNING: SESSION_SECRET is not set or is weak in .env.local. Please generate a strong secret.'
  );
  // In a real app, you might throw an error here in production
}

// Extend NextApiRequest with session
declare module "next" {
  interface NextApiRequest {
    session: any;
  }
}

// Define the structure of your session data
declare module "iron-session" {
  interface IronSessionData {
    tokens?: {
      access_token: string;
      refresh_token: string | null | undefined; // Explicitly allow string, null, or undefined
      expiry_date: number;
      token_type?: string;
      scope?: string;
    };
  }
}

export const sessionOptions = {
  password: SESSION_SECRET || 'fallback_secret_for_dev_only_change_this', // Fallback only for type safety, real check above
  cookieName: 'myapp-session', // Choose a unique name
  cookieOptions: {
    // Settings recommended for security
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true,
    sameSite: 'lax' as const, // Protection against CSRF
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// Helper function to wrap API routes with session handling
export function withSessionRoute(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    req.session = await getIronSession(req, res, sessionOptions);
    return handler(req, res);
  };
}

// Helper function to wrap getServerSideProps with session handling
export function withSessionSsr<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  handler: (
    context: GetServerSidePropsContext & { req: { session: any } },
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return async (context: GetServerSidePropsContext) => {
    const session = await getIronSession(context.req, context.res, sessionOptions);
    
    // Assign the session to the request object
    (context.req as any).session = session;
    
    return handler(context as GetServerSidePropsContext & { req: { session: any } });
  };
}
