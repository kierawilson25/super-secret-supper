-- ============================================================================
-- Supabase Row Level Security (RLS) Policies
-- Super Secret Supper - Security Hardening
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE peoplegroup ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinners ENABLE ROW LEVEL SECURITY;
ALTER TABLE peopledinner ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_locations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PEOPLE TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON people;
CREATE POLICY "Users can view their own profile"
  ON people FOR SELECT
  USING (auth.uid() = userid);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON people;
CREATE POLICY "Users can update their own profile"
  ON people FOR UPDATE
  USING (auth.uid() = userid)
  WITH CHECK (auth.uid() = userid);

-- Users can view profiles of people in their groups
DROP POLICY IF EXISTS "Users can view group members profiles" ON people;
CREATE POLICY "Users can view group members profiles"
  ON people FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peoplegroup pg1
      JOIN peoplegroup pg2 ON pg1.groups_groupid = pg2.groups_groupid
      WHERE pg1.users_userid = auth.uid()
      AND pg2.users_userid = people.userid
    )
  );

-- ============================================================================
-- GROUPS TABLE POLICIES
-- ============================================================================

-- Users can view groups they're members of
DROP POLICY IF EXISTS "Users can view their groups" ON groups;
CREATE POLICY "Users can view their groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peoplegroup
      WHERE groups_groupid = groupid
      AND users_userid = auth.uid()
    )
  );

-- Only admins can update their groups
DROP POLICY IF EXISTS "Admins can update their groups" ON groups;
CREATE POLICY "Admins can update their groups"
  ON groups FOR UPDATE
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

-- Authenticated users can create groups (they become admin)
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

-- Admins can delete their groups
DROP POLICY IF EXISTS "Admins can delete their groups" ON groups;
CREATE POLICY "Admins can delete their groups"
  ON groups FOR DELETE
  USING (auth.uid() = admin_id);

-- ============================================================================
-- PEOPLEGROUP (MEMBERSHIPS) TABLE POLICIES
-- ============================================================================

-- Users can view memberships for their groups
DROP POLICY IF EXISTS "Users can view group memberships" ON peoplegroup;
CREATE POLICY "Users can view group memberships"
  ON peoplegroup FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peoplegroup pg
      WHERE pg.groups_groupid = groups_groupid
      AND pg.users_userid = auth.uid()
    )
  );

-- Group admins can add members
DROP POLICY IF EXISTS "Admins can add members to their groups" ON peoplegroup;
CREATE POLICY "Admins can add members to their groups"
  ON peoplegroup FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = groups_groupid
      AND admin_id = auth.uid()
    )
  );

-- Users can join groups via invite link (handled by invite redemption)
DROP POLICY IF EXISTS "Users can join groups via invite" ON peoplegroup;
CREATE POLICY "Users can join groups via invite"
  ON peoplegroup FOR INSERT
  WITH CHECK (
    users_userid = auth.uid()
  );

-- Group admins can remove members
DROP POLICY IF EXISTS "Admins can remove members from their groups" ON peoplegroup;
CREATE POLICY "Admins can remove members from their groups"
  ON peoplegroup FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = groups_groupid
      AND admin_id = auth.uid()
    )
  );

-- Users can leave groups (remove themselves)
DROP POLICY IF EXISTS "Users can leave groups" ON peoplegroup;
CREATE POLICY "Users can leave groups"
  ON peoplegroup FOR DELETE
  USING (users_userid = auth.uid());

-- ============================================================================
-- INVITE LINKS TABLE POLICIES
-- ============================================================================

-- Anyone (authenticated or not) can read valid invite links by code
DROP POLICY IF EXISTS "Anyone can read valid invite links" ON invite_links;
CREATE POLICY "Anyone can read valid invite links"
  ON invite_links FOR SELECT
  USING (
    (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR used_count < max_uses)
  );

-- Group admins can create invite links for their groups
DROP POLICY IF EXISTS "Admins can create invite links" ON invite_links;
CREATE POLICY "Admins can create invite links"
  ON invite_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = group_id
      AND admin_id = auth.uid()
    )
  );

-- Group admins can view all invite links for their groups
DROP POLICY IF EXISTS "Admins can view their group invite links" ON invite_links;
CREATE POLICY "Admins can view their group invite links"
  ON invite_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = group_id
      AND admin_id = auth.uid()
    )
  );

-- Group admins can update invite links (e.g., increment used_count)
DROP POLICY IF EXISTS "Admins can update invite links" ON invite_links;
CREATE POLICY "Admins can update invite links"
  ON invite_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = group_id
      AND admin_id = auth.uid()
    )
  );

-- System can update invite links (for used_count increment)
DROP POLICY IF EXISTS "System can update invite link usage" ON invite_links;
CREATE POLICY "System can update invite link usage"
  ON invite_links FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Group admins can delete invite links
DROP POLICY IF EXISTS "Admins can delete invite links" ON invite_links;
CREATE POLICY "Admins can delete invite links"
  ON invite_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = group_id
      AND admin_id = auth.uid()
    )
  );

-- ============================================================================
-- DINNERS TABLE POLICIES
-- ============================================================================

-- Users can view dinners for their groups
DROP POLICY IF EXISTS "Users can view group dinners" ON dinners;
CREATE POLICY "Users can view group dinners"
  ON dinners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM peoplegroup
      WHERE groups_groupid = groups_groupid
      AND users_userid = auth.uid()
    )
  );

-- Only group admins can create dinners (via pairing generation)
DROP POLICY IF EXISTS "Admins can create dinners" ON dinners;
CREATE POLICY "Admins can create dinners"
  ON dinners FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = groups_groupid
      AND admin_id = auth.uid()
    )
  );

-- Group admins can update dinners
DROP POLICY IF EXISTS "Admins can update dinners" ON dinners;
CREATE POLICY "Admins can update dinners"
  ON dinners FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = groups_groupid
      AND admin_id = auth.uid()
    )
  );

-- Group admins can delete dinners
DROP POLICY IF EXISTS "Admins can delete dinners" ON dinners;
CREATE POLICY "Admins can delete dinners"
  ON dinners FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groupid = groups_groupid
      AND admin_id = auth.uid()
    )
  );

-- ============================================================================
-- PEOPLEDINNER (DINNER ATTENDEES) TABLE POLICIES
-- ============================================================================

-- Users can view attendees for dinners in their groups
DROP POLICY IF EXISTS "Users can view dinner attendees" ON peopledinner;
CREATE POLICY "Users can view dinner attendees"
  ON peopledinner FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dinners d
      JOIN peoplegroup pg ON d.groups_groupid = pg.groups_groupid
      WHERE d.dinnerid = dinners_dinnerid
      AND pg.users_userid = auth.uid()
    )
  );

-- Group admins can add attendees to dinners
DROP POLICY IF EXISTS "Admins can add dinner attendees" ON peopledinner;
CREATE POLICY "Admins can add dinner attendees"
  ON peopledinner FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dinners d
      JOIN groups g ON d.groups_groupid = g.groupid
      WHERE d.dinnerid = dinners_dinnerid
      AND g.admin_id = auth.uid()
    )
  );

-- Group admins can remove attendees from dinners
DROP POLICY IF EXISTS "Admins can remove dinner attendees" ON peopledinner;
CREATE POLICY "Admins can remove dinner attendees"
  ON peopledinner FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dinners d
      JOIN groups g ON d.groups_groupid = g.groupid
      WHERE d.dinnerid = dinners_dinnerid
      AND g.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- DINNER LOCATIONS TABLE POLICIES
-- ============================================================================

-- Everyone can view dinner locations (public data)
DROP POLICY IF EXISTS "Anyone can view dinner locations" ON dinner_locations;
CREATE POLICY "Anyone can view dinner locations"
  ON dinner_locations FOR SELECT
  USING (true);

-- Only authenticated users can suggest locations (future feature)
DROP POLICY IF EXISTS "Authenticated users can suggest locations" ON dinner_locations;
CREATE POLICY "Authenticated users can suggest locations"
  ON dinner_locations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Add database constraints for data validation
-- Note: These constraints only apply to NEW/UPDATED rows to avoid breaking existing data

-- Drop existing constraints if they exist
ALTER TABLE people DROP CONSTRAINT IF EXISTS username_length;
ALTER TABLE people DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groupname_length;
ALTER TABLE groups DROP CONSTRAINT IF EXISTS dinner_cadence_valid;

-- Add constraints with NOT VALID to skip existing data validation
ALTER TABLE people ADD CONSTRAINT username_length
  CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 50)) NOT VALID;

ALTER TABLE people ADD CONSTRAINT username_format
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]+$') NOT VALID;

ALTER TABLE groups ADD CONSTRAINT groupname_length
  CHECK (char_length(groupname) >= 3 AND char_length(groupname) <= 100) NOT VALID;

ALTER TABLE groups ADD CONSTRAINT dinner_cadence_valid
  CHECK (dinner_cadence IN ('monthly', 'quarterly', 'biweekly')) NOT VALID;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Add indexes for common queries to improve performance
CREATE INDEX IF NOT EXISTS idx_peoplegroup_userid ON peoplegroup(users_userid);
CREATE INDEX IF NOT EXISTS idx_peoplegroup_groupid ON peoplegroup(groups_groupid);
CREATE INDEX IF NOT EXISTS idx_dinners_groupid ON dinners(groups_groupid);
CREATE INDEX IF NOT EXISTS idx_peopledinner_dinnerid ON peopledinner(dinners_dinnerid);
CREATE INDEX IF NOT EXISTS idx_peopledinner_userid ON peopledinner(users_userid);
CREATE INDEX IF NOT EXISTS idx_invite_links_groupid ON invite_links(group_id);
CREATE INDEX IF NOT EXISTS idx_invite_links_code ON invite_links(code);
CREATE INDEX IF NOT EXISTS idx_groups_adminid ON groups(admin_id);

-- ============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function to check if user is group admin
CREATE OR REPLACE FUNCTION is_group_admin(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM groups
    WHERE groupid = group_id
    AND admin_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM peoplegroup
    WHERE groups_groupid = group_id
    AND users_userid = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTES
-- ============================================================================

-- To apply this migration:
-- 1. Log in to Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Run the query
-- 6. Verify all policies are created in Database > Policies

-- To test RLS policies:
-- 1. Try accessing data as different users
-- 2. Verify non-members can't see group data
-- 3. Verify non-admins can't modify groups
-- 4. Test invite link redemption flow

-- WARNING: This will immediately restrict access to all tables.
-- Ensure your application code uses proper authentication before applying!
