import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token', code: 401 });
    }

    // Map Supabase user to our request object
    // Note: We can expand this to fetch the role from our public.users table if needed
    req.user = {
      id: user.id,
      email: user.email,
      role: (user.user_metadata?.role as string) || 'user'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Authentication failed', code: 401 });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions', code: 403 });
    }
    next();
  };
};
