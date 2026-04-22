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
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: error.errors[0]?.message || 'Validation failed' });
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await CampaignService.update(req.params.id as string, req.body);
      res.json({ success: true, data: campaign });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: error.errors[0]?.message || 'Validation failed' });
      }
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await CampaignService.updateStatus(req.params.id as string, req.body.status);
      res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async joinCampaign(req: Request, res: Response, next: NextFunction) {
      try {
          const { id } = req.params;
          const { linkedHandle } = req.body;
          const userId = (req as any).user.id;
          const data = await CampaignService.joinCampaign(userId, id, linkedHandle);
          res.json({ success: true, data });
      } catch (error) {
          next(error);
      }
  }

  static async getJoined(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = (req as any).user.id;
          const campaigns = await CampaignService.getJoinedCampaigns(userId);
          res.json({ success: true, data: campaigns });
      } catch (error) {
          next(error);
      }
  }

  static async getParticipations(req: Request, res: Response, next: NextFunction) {
      try {
          const userId = (req as any).user.id;
          const campaignIds = await CampaignService.getParticipations(userId);
          res.json({ success: true, data: campaignIds });
      } catch (error) {
          next(error);
      }
  }

  static async deleteCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      await CampaignService.delete(req.params.id as string);
      res.json({ success: true, message: 'Campaign deleted' });
    } catch (error) {
      next(error);
    }
  }
}
