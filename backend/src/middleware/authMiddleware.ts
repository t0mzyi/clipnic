import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';
import { LoggerService } from '../services/LoggerService';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    let userData: any = null;

    // 1. Try to verify with jsonwebtoken (Custom Backend Flow)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.sub) {
        userData = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          avatarUrl: decoded.avatar_url || decoded.picture,
          role: decoded.role || 'user'
        };
      }
    } catch (e) {
      // Not a local JWT, proceed to Supabase check
    }

    // 2. If not a local JWT, try to verify with Supabase
    if (!userData) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.given_name 
                ? `${user.user_metadata.given_name} ${user.user_metadata.family_name || ''}`.trim()
                : (user.user_metadata?.full_name || user.user_metadata?.name),
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          role: (user.user_metadata?.role as string) || 'user'
        };
      }
    }

    if (!userData) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token', code: 401 });
    }

    // 3. Fetch latest user data from database (Role & Block status)
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, is_blocked')
      .eq('id', userData.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database user fetch error:', dbError);
    }

    // CRITICAL FIX: If user exists in Auth but not in our 'users' table, sync them now.
    // This prevents "User not found" errors in controllers that follow.
    if (!dbUser && userData.email) {
        try {
            console.log(`[AuthMiddleware] User ${userData.id} not found in DB. Attempting auto-sync...`);
            const syncedUser = await AuthService.syncUser(
                userData.id,
                userData.email,
                userData.name,
                userData.avatarUrl,
                userData.role
            );
            userData.role = syncedUser.role;
            LoggerService.warn('Auto-Sync Triggered', `User **${userData.email}** was missing from database and was auto-synced during authentication.\nID: ${userData.id}`, false);
        } catch (syncErr) {
            console.error('[AuthMiddleware] Auto-sync failed:', syncErr);
        }
    } else if (dbUser) {
        userData.role = dbUser.role;
    }

    // Map to request object
    req.user = { ...userData };

    if (dbUser?.is_blocked) {
      return res.status(403).json({ success: false, error: 'Your account is blocked', code: 403 });
    }
    
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Verification failed:', error);
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
