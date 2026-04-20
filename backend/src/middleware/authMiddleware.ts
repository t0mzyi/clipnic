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

    // Map Supabase user to our request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.given_name 
            ? `${user.user_metadata.given_name} ${user.user_metadata.family_name || ''}`.trim()
            : (user.user_metadata?.full_name || user.user_metadata?.name),
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
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
