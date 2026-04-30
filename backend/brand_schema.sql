-- Create a table to link brands to campaigns they can view
CREATE TABLE IF NOT EXISTS brand_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, campaign_id)
);

-- Ensure RLS is disabled or appropriate policies exist
ALTER TABLE brand_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands can view their assignments" ON brand_campaigns FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "Admins have full access" ON brand_campaigns FOR ALL USING (true); -- Assuming backend bypasses RLS or has service role

-- Add 'brand' to role enum if applicable or just rely on text constraints if role is text.
-- If role is a simple text field in public.users:
-- No change needed.
