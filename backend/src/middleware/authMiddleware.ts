import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
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

    // Fetch latest user data from database (Role & Block status)
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, is_blocked')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is 'not found'
      console.error('Database user fetch error:', dbError);
    }

    // Map Supabase user to our request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.given_name 
            ? `${user.user_metadata.given_name} ${user.user_metadata.family_name || ''}`.trim()
            : (user.user_metadata?.full_name || user.user_metadata?.name),
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      // DB role takes precedence over JWT metadata to prevent stale token issues
      role: dbUser?.role || (user.user_metadata?.role as string) || 'user'
    };

    if (dbUser?.is_blocked) {
      return res.status(403).json({ success: false, error: 'Your account is blocked', code: 403 });
    }
    
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
