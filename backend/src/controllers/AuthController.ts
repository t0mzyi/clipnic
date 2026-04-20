import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  /**
   * Syncs the current session's user with the database.
   * Expects the user object to be already attached by the authenticate middleware.
   */
  static async sync(req: any, res: Response, next: NextFunction) {
    try {
      const { id, email, name, avatarUrl, role } = req.user;
      const user = await AuthService.syncUser(id, email, name, avatarUrl, role);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
