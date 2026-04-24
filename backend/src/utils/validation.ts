import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'user']),
});

export const toggleBlockSchema = z.object({
  block: z.boolean(),
});

export const updateSubmissionStatusSchema = z.object({
  status: z.enum(['Pending', 'Verified', 'Rejected', 'Paid']),
  rejectionReason: z.string().optional(),
});

export const processPayoutSchema = z.object({
  userId: z.string().uuid(),
  notes: z.string().optional(),
});

export const campaignStatusSchema = z.object({
  status: z.enum(['Active', 'Paused', 'Completed', 'Coming Soon']),
});

export const campaignFeaturedSchema = z.object({
  is_featured: z.boolean(),
});

export const joinCampaignSchema = z.object({
  linkedHandle: z.string().optional(),
});
