import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      const result = await AuthService.loginMock(email, role);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
