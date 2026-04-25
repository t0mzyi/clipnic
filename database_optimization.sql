-- CLIPNIC DATABASE OPTIMIZATION SCRIPT
-- Run these in your Supabase SQL Editor to significantly speed up your application.

-- 1. Optimize Submissions Lookups
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- 2. Optimize Campaign Participations
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user_id ON campaign_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);

-- 3. Optimize Campaign Queries
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_featured ON campaigns(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);

-- 4. Optimize User lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. ANALYZE TABLES to update statistics
ANALYZE submissions;
ANALYZE campaigns;
ANALYZE users;
ANALYZE campaign_participants;
