import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/CampaignService';

export class CampaignController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const campaigns = await CampaignService.getAll();
      res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await CampaignService.getById(req.params.id as string);
      if (!campaign) {
        return res.status(404).json({ success: false, error: 'Campaign not found', code: 404 });
      }
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await CampaignService.create(req.body);
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }
}
