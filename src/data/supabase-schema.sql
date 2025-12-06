-- Super Secret Supper Database Schema
-- Adapted from final_project.ddl for Supabase/PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for dinner cadence
CREATE TYPE dinner_cadence AS ENUM ('monthly', 'quarterly', 'biweekly');

-- ============================================================================
-- PEOPLE TABLE (Users)
-- ============================================================================
-- Integrates with Supabase Auth (auth.users)
CREATE TABLE People (
  userID UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  userName VARCHAR(100),
  isAdmin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE People IS 'Users/profiles table linked to Supabase authentication';
COMMENT ON COLUMN People.isAdmin IS 'System-wide admin flag for application management';

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================
CREATE TABLE Groups (
  GroupID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  GroupName VARCHAR(255) NOT NULL,
  GroupCity VARCHAR(255),
  admin_id UUID NOT NULL REFERENCES People(userID) ON DELETE CASCADE,
  dinner_cadence dinner_cadence DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE Groups IS 'Friend groups that organize dinners together';

-- ============================================================================
-- PEOPLEGROUP TABLE (Junction Table)
-- ============================================================================
-- Many-to-many relationship between People and Groups
CREATE TABLE PeopleGroup (
  Groups_GroupID UUID NOT NULL REFERENCES Groups(GroupID) ON DELETE CASCADE,
  Users_userID UUID NOT NULL REFERENCES People(userID) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Groups_GroupID, Users_userID)
);

COMMENT ON TABLE PeopleGroup IS 'Junction table linking people to their groups';

-- ============================================================================
-- DINNER_LOCATIONS TABLE
-- ============================================================================
CREATE TABLE Dinner_Locations (
  locationID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locationName VARCHAR(100),
  locationCity VARCHAR(100),
  locationPrice INTEGER CHECK (locationPrice IN (1, 2, 3)),
  cuisine VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN Dinner_Locations.locationPrice IS 'Price level: 1 (budget), 2 (moderate), 3 (expensive)';

-- ============================================================================
-- DINNERS TABLE
-- ============================================================================
CREATE TABLE dinners (
  dinnerID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dinner_date TIMESTAMP WITH TIME ZONE,
  Groups_GroupID UUID NOT NULL REFERENCES Groups(GroupID) ON DELETE CASCADE,
  Dinner_Locations_locationID UUID REFERENCES Dinner_Locations(locationID) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE dinners IS 'Scheduled dinners for groups';

-- ============================================================================
-- PEOPLEDINNER TABLE (Junction Table)
-- ============================================================================
-- Many-to-many relationship between People and dinners
CREATE TABLE PeopleDinner (
  Users_userID UUID NOT NULL REFERENCES People(userID) ON DELETE CASCADE,
  dinners_dinnerID UUID NOT NULL REFERENCES dinners(dinnerID) ON DELETE CASCADE,
  PRIMARY KEY (Users_userID, dinners_dinnerID)
);

COMMENT ON TABLE PeopleDinner IS 'Junction table linking people to dinners they attended';

-- ============================================================================
-- INVITE LINKS TABLE (Additional feature for sharing group invites)
-- ============================================================================
CREATE TABLE invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES Groups(GroupID) ON DELETE CASCADE,
  code VARCHAR(255) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES People(userID) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE invite_links IS 'Shareable invite links for joining groups';

-- ============================================================================
-- VIEW: Group Member Count (Computed)
-- ============================================================================
CREATE VIEW GroupMemberCounts AS
SELECT
  Groups_GroupID as GroupID,
  COUNT(Users_userID) as GroupMemberCount
FROM PeopleGroup
GROUP BY Groups_GroupID;

COMMENT ON VIEW GroupMemberCounts IS 'Computed member count for each group';

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE People ENABLE ROW LEVEL SECURITY;
ALTER TABLE Groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE PeopleGroup ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinners ENABLE ROW LEVEL SECURITY;
ALTER TABLE PeopleDinner ENABLE ROW LEVEL SECURITY;
ALTER TABLE Dinner_Locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - PEOPLE TABLE
-- ============================================================================

-- Users can view any user's profile (for group member lists)
CREATE POLICY "Anyone can view profiles" ON People
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile" ON People
  FOR INSERT WITH CHECK (auth.uid() = userID);

-- Users can update their own profile (but not isAdmin flag)
CREATE POLICY "Users can update own profile" ON People
  FOR UPDATE USING (auth.uid() = userID)
  WITH CHECK (
    auth.uid() = userID AND (
      -- Only admins can change the isAdmin flag
      (SELECT isAdmin FROM People WHERE userID = auth.uid()) = true
      OR isAdmin = (SELECT isAdmin FROM People WHERE userID = auth.uid())
    )
  );

-- ============================================================================
-- RLS POLICIES - GROUPS TABLE
-- ============================================================================

-- Members can view groups they're part of
CREATE POLICY "Members can view their groups" ON Groups
  FOR SELECT USING (
    auth.uid() IN (
      SELECT Users_userID FROM PeopleGroup WHERE Groups_GroupID = GroupID
    ) OR admin_id = auth.uid()
  );

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups" ON Groups
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND auth.uid() IS NOT NULL
  );

-- Only admin can update groups
CREATE POLICY "Admins can update groups" ON Groups
  FOR UPDATE USING (admin_id = auth.uid());

-- Only admin can delete groups
CREATE POLICY "Admins can delete groups" ON Groups
  FOR DELETE USING (admin_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - PEOPLEGROUP TABLE
-- ============================================================================

-- Members can view member lists of their groups
CREATE POLICY "Members can view group members" ON PeopleGroup
  FOR SELECT USING (
    Groups_GroupID IN (
      SELECT Groups_GroupID FROM PeopleGroup WHERE Users_userID = auth.uid()
    )
  );

-- Admins and users can add members to groups
CREATE POLICY "Can add members to groups" ON PeopleGroup
  FOR INSERT WITH CHECK (
    -- Either the group admin is adding someone
    EXISTS (
      SELECT 1 FROM Groups
      WHERE GroupID = Groups_GroupID AND admin_id = auth.uid()
    )
    -- Or users are adding themselves
    OR Users_userID = auth.uid()
  );

-- Users can remove themselves from groups, admins can remove anyone
CREATE POLICY "Can remove members from groups" ON PeopleGroup
  FOR DELETE USING (
    Users_userID = auth.uid() OR
    EXISTS (
      SELECT 1 FROM Groups
      WHERE GroupID = Groups_GroupID AND admin_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - DINNERS TABLE
-- ============================================================================

-- Users can view dinners for groups they're in
CREATE POLICY "Users can view dinners in their groups" ON dinners
  FOR SELECT USING (
    Groups_GroupID IN (
      SELECT Groups_GroupID FROM PeopleGroup WHERE Users_userID = auth.uid()
    )
  );

-- Group admins can create dinners
CREATE POLICY "Group admins can create dinners" ON dinners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM Groups
      WHERE GroupID = Groups_GroupID AND admin_id = auth.uid()
    )
  );

-- Group admins can update dinners
CREATE POLICY "Group admins can update dinners" ON dinners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM Groups
      WHERE GroupID = Groups_GroupID AND admin_id = auth.uid()
    )
  );

-- Group admins can delete dinners
CREATE POLICY "Group admins can delete dinners" ON dinners
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM Groups
      WHERE GroupID = Groups_GroupID AND admin_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - PEOPLEDINNER TABLE
-- ============================================================================

-- Users can view dinner attendance for dinners in their groups
CREATE POLICY "Users can view dinner attendance" ON PeopleDinner
  FOR SELECT USING (
    dinners_dinnerID IN (
      SELECT dinnerID FROM dinners
      WHERE Groups_GroupID IN (
        SELECT Groups_GroupID FROM PeopleGroup WHERE Users_userID = auth.uid()
      )
    )
  );

-- Group admins can add people to dinners
CREATE POLICY "Admins can add people to dinners" ON PeopleDinner
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dinners d
      JOIN Groups g ON d.Groups_GroupID = g.GroupID
      WHERE d.dinnerID = dinners_dinnerID AND g.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - DINNER_LOCATIONS TABLE
-- ============================================================================

-- Anyone can view dinner locations
CREATE POLICY "Anyone can view locations" ON Dinner_Locations
  FOR SELECT USING (true);

-- Authenticated users can add dinner locations
CREATE POLICY "Authenticated users can add locations" ON Dinner_Locations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- RLS POLICIES - INVITE_LINKS TABLE
-- ============================================================================

-- Group members can view invite links for their groups
CREATE POLICY "Group members can view invite links" ON invite_links
  FOR SELECT USING (
    group_id IN (
      SELECT Groups_GroupID FROM PeopleGroup WHERE Users_userID = auth.uid()
    )
  );

-- Group admins can create invite links
CREATE POLICY "Group admins can create invite links" ON invite_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM Groups
      WHERE GroupID = group_id AND admin_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Auto-create People profile on user signup
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.People (userID, userName, isAdmin, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,  -- Use email as default username
    false,      -- New users are not admins by default
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create People profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_peoplegroup_user ON PeopleGroup(Users_userID);
CREATE INDEX idx_peoplegroup_group ON PeopleGroup(Groups_GroupID);
CREATE INDEX idx_dinners_group ON dinners(Groups_GroupID);
CREATE INDEX idx_peopledinner_user ON PeopleDinner(Users_userID);
CREATE INDEX idx_peopledinner_dinner ON PeopleDinner(dinners_dinnerID);
CREATE INDEX idx_groups_admin ON Groups(admin_id);
