import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/SettingsService';

export class SettingsController {
  /**
   * Fetches all global settings.
   */
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getAllSettings();
      // Settings are relatively static, cache for 5 minutes
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json({ success: true, settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates or creates a global setting. Admin only (checked by route middleware).
   */
  static async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ success: false, error: 'Setting key is required.' });
      }

      await SettingsService.updateSetting(key, value);
      res.json({ success: true, message: `Setting ${key} updated successfully.` });
    } catch (error) {
      next(error);
    }
  }
}
