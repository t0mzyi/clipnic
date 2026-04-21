import { Request, Response } from 'express';
import { SubmissionService } from '../services/SubmissionService';

export class SubmissionController {
  static async submitClip(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const submission = await SubmissionService.create(userId, req.body);
      res.status(201).json({ success: true, data: submission });
    } catch (err: any) {
      if (err.message.includes('already submitted')) {
          res.status(409).json({ success: false, error: err.message });
      } else {
          res.status(400).json({ success: false, error: err.message });
      }
    }
  }

  static async getMySubmissions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const campaignId = req.params.campaignId as string;
      const data = await SubmissionService.getUserSubmissions(userId, campaignId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getAllMySubmissions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      console.log(`[getAllMySubmissions] Fetching for user: ${userId}`);
      const data = await SubmissionService.getAllUserSubmissions(userId);
      console.log(`[getAllMySubmissions] Found ${data?.length} submissions`);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error(`[getAllMySubmissions] Error:`, err);
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getLeaderboard(req: Request, res: Response) {
    try {
      const campaignId = req.params.campaignId as string;
      const data = await SubmissionService.getCampaignLeaderboard(campaignId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async refreshSubmission(req: Request, res: Response) {
      try {
          const userId = (req as any).user.id;
          const id = req.params.id;
          const updated = await SubmissionService.refreshSubmission(userId, id);
          res.json({ success: true, data: updated });
      } catch (err: any) {
          res.status(400).json({ success: false, error: err.message });
      }
  }
}
