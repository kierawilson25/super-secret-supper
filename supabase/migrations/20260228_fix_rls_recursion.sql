-- Migration: Fix infinite recursion in dinner_matches / dinner_match_guests RLS
-- Description: Policies that JOIN through dinner_events inside dinner_matches
--              (and vice-versa) cause PostgreSQL infinite recursion. The fix is
--              SECURITY DEFINER helper functions, which bypass RLS when running
--              their own queries and break the cycle.
-- Issue: #78

-- ============================================================================
-- Helper functions (SECURITY DEFINER = bypass RLS inside the function body)
-- ============================================================================

-- Returns the circle_id (group) for a given dinner event
CREATE OR REPLACE FUNCTION public.rls_event_circle_id(p_event_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT circle_id FROM public.dinner_events WHERE id = p_event_id;
$$;

-- Returns the circle_id for a given dinner match (via its event)
CREATE OR REPLACE FUNCTION public.rls_match_circle_id(p_match_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT de.circle_id
  FROM public.dinner_matches dm
  JOIN public.dinner_events de ON de.id = dm.dinner_event_id
  WHERE dm.id = p_match_id;
$$;

-- Returns true if the current user is an admin of a given group (circle)
CREATE OR REPLACE FUNCTION public.rls_is_circle_admin(p_circle_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE groupid = p_circle_id
      AND admin_id = auth.uid()
  );
$$;

-- Returns true if the current user is a member of a given group (circle)
CREATE OR REPLACE FUNCTION public.rls_is_circle_member(p_circle_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.peoplegroup
    WHERE groups_groupid = p_circle_id
      AND users_userid = auth.uid()
  );
$$;


-- ============================================================================
-- dinner_matches — drop old policies, recreate using helper functions
-- ============================================================================

DROP POLICY IF EXISTS "Group members can view dinner matches" ON public.dinner_matches;
CREATE POLICY "Group members can view dinner matches"
  ON public.dinner_matches
  FOR SELECT
  USING (rls_is_circle_member(rls_event_circle_id(dinner_event_id)));

DROP POLICY IF EXISTS "Group admins can create dinner matches" ON public.dinner_matches;
CREATE POLICY "Group admins can create dinner matches"
  ON public.dinner_matches
  FOR INSERT
  WITH CHECK (rls_is_circle_admin(rls_event_circle_id(dinner_event_id)));

DROP POLICY IF EXISTS "Group admins can update dinner matches" ON public.dinner_matches;
CREATE POLICY "Group admins can update dinner matches"
  ON public.dinner_matches
  FOR UPDATE
  USING (rls_is_circle_admin(rls_event_circle_id(dinner_event_id)));


-- ============================================================================
-- dinner_match_guests — drop old policies, recreate using helper functions
-- ============================================================================

DROP POLICY IF EXISTS "Group members can view match guests" ON public.dinner_match_guests;
CREATE POLICY "Group members can view match guests"
  ON public.dinner_match_guests
  FOR SELECT
  USING (rls_is_circle_member(rls_match_circle_id(match_id)));

DROP POLICY IF EXISTS "Group admins can add match guests" ON public.dinner_match_guests;
CREATE POLICY "Group admins can add match guests"
  ON public.dinner_match_guests
  FOR INSERT
  WITH CHECK (rls_is_circle_admin(rls_match_circle_id(match_id)));
