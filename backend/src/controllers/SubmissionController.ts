import { SubmissionService } from '../services/SubmissionService';
import { paginationSchema } from '../utils/validation';
import { supabase } from '../config/supabase';

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
      const { page, limit } = paginationSchema.parse(req.query);
      
      console.log(`[getAllMySubmissions] Fetching for user: ${userId}, page: ${page}, limit: ${limit}`);
      const { data, total } = await SubmissionService.getAllUserSubmissions(userId, page, limit);
      
      res.json({ 
        success: true, 
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
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

  static async getBrandCampaignSubmissions(req: Request, res: Response) {
    try {
      const brandId = (req as any).user.id;
      const campaignId = req.params.campaignId;
      
      console.log(`[SubmissionController] Brand ${brandId} checking access for Campaign ${campaignId}`);

      const { data: assignment, error: assignErr } = await supabase
        .from('brand_campaigns')
        .select('id')
        .eq('brand_id', brandId)
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (assignErr) {
          console.error(`[SubmissionController] Assignment check error:`, assignErr);
          throw assignErr;
      }

      if (!assignment) {
        console.warn(`[SubmissionController] Unauthorized access attempt: Brand ${brandId} -> Campaign ${campaignId}`);
        return res.status(403).json({ success: false, error: 'Not authorized for this campaign' });
      }

      const { page, limit } = paginationSchema.parse(req.query);
      const { data, total } = await SubmissionService.adminGetAllSubmissions(page, limit, campaignId);
      
      console.log(`[SubmissionController] Successfully fetched ${data.length} submissions for brand.`);
      res.json({ 
          success: true, 
          data: data, // This is the array
          pagination: { page, limit, total, pages: Math.ceil(total/limit) } 
      });
    } catch (err: any) {
      console.error(`[SubmissionController] Error in getBrandCampaignSubmissions:`, err);
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteSubmission(req: Request, res: Response) {
      try {
          const userId = (req as any).user.id;
          const id = req.params.id;
          await SubmissionService.deleteSubmission(userId, id as string);
          res.json({ success: true, message: 'Submission deleted successfully' });
      } catch (err: any) {
          res.status(400).json({ success: false, error: err.message });
      }
  }

  static async refreshSubmission(req: Request, res: Response) {
      try {
          const userId = (req as any).user.id;
          const id = req.params.id;
          const updated = await SubmissionService.refreshSubmission(userId, id as string);
          res.json({ success: true, data: updated });
      } catch (err: any) {
          res.status(400).json({ success: false, error: err.message });
      }
  }

  static async getEarningsSummary(req: Request, res: Response) {
      try {
          const userId = (req as any).user.id;
          const data = await SubmissionService.getUserEarningsSummary(userId);
          res.json({ success: true, data });
      } catch (err: any) {
          res.status(400).json({ success: false, error: err.message });
      }
  }

  static async checkUrlAvailability(req: Request, res: Response) {
    try {
      const url = req.query.url as string;
      const result = await SubmissionService.checkUrlAvailability(url);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateSubmission(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = req.params.id;
      const updated = await SubmissionService.update(userId, id as string, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      if (err.message.includes('already submitted')) {
          res.status(409).json({ success: false, error: err.message });
      } else {
          res.status(400).json({ success: false, error: err.message });
      }
    }
  }
}
