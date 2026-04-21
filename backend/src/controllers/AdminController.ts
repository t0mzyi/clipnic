import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export class AdminController {
  /**
   * GET /admin/users
   * Returns a list of all users with optional search query.
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query as { q?: string };
      let query = supabase.from('users').select('id, email, name, avatar_url, role, discord_id, discord_verified, youtube_verified, instagram_verified, is_blocked');
      if (q) {
        query = query.ilike('email', `%${q}%`).or(`name.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/users/:id
   * Returns detailed info for a single user.
   */
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/users/:id/block
   * Toggles the is_blocked flag for a user.
   */
  static async toggleBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { block } = req.body as { block: boolean };
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: block })
        .eq('id', id);
      if (error) throw error;
      res.json({ success: true, message: `User ${block ? 'blocked' : 'unblocked'}` });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /admin/users/:id/role
   * Updates a user's role in both the database and auth metadata.
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body as { role: 'admin' | 'user' };

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
      }

      // 1. Update public.users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id);
      
      if (dbError) throw dbError;

      // 2. Update Supabase Auth Metadata (Requires service role)
      const { error: authError } = await supabase.auth.admin.updateUserById(id as string, {
        user_metadata: { role }
      });

      if (authError) throw authError;

      res.json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
      next(error);
    }
  }
}

