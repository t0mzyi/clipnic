import { z } from 'zod';

const createCampaignSchema = z.object({
  title: z.string().min(1),
  sourceLink: z.string().url(),
  cpmRate: z.number().positive(),
  totalBudget: z.number().positive(),
  minViews: z.number().int().positive(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)) && new Date(val) > new Date(), { message: "endDate must be a future date" }),
});

export class CampaignService {
  static mockCampaigns = [
    {
      id: 'c1',
      title: 'Summer Skincare Launch',
      sourceLink: 'https://youtube.com/watch?v=mock',
      cpmRate: 0.40,
      totalBudget: 18134,
      budgetUsed: 11468.46,
      minViews: 10000,
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: 'Active',
      viewProgress: 28805919,
      targetViews: 45335000,
    },
    {
      id: 'c2',
      title: 'Tech Gadget Review',
      sourceLink: 'https://youtube.com/watch?v=mock2',
      cpmRate: 0.50,
      totalBudget: 10000,
      budgetUsed: 5000,
      minViews: 5000,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'Active',
      viewProgress: 10000000,
      targetViews: 20000000,
    }
  ];

  static async getAll() {
    return this.mockCampaigns;
  }

  static async getById(id: string) {
    return this.mockCampaigns.find(c => c.id === id) || null;
  }

  static async create(data: any) {
    const validated = createCampaignSchema.parse(data);
    const newCampaign = {
      id: `c${Date.now()}`,
      ...validated,
      budgetUsed: 0,
      status: 'Active',
      endDate: new Date(validated.endDate),
      viewProgress: 0,
      targetViews: validated.totalBudget / (validated.cpmRate / 1000)
    };
    this.mockCampaigns.push(newCampaign);
    return newCampaign;
  }
}
