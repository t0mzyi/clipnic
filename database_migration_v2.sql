-- Update Campaigns Table with new requirements and rules
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS allowed_platforms text[] DEFAULT '{youtube}',
ADD COLUMN IF NOT EXISTS requires_dedicated_social boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_discord boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rules text[] DEFAULT '{}';

-- Create Campaign Participants Table
CREATE TABLE IF NOT EXISTS campaign_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    linked_handle text,
    joined_at timestamp with time zone DEFAULT now(),
    UNIQUE(campaign_id, user_id)
);

-- Enable RLS
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_participants
CREATE POLICY "Users can see their own participations"
ON campaign_participants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all participations"
ON campaign_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can join campaigns"
ON campaign_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);
