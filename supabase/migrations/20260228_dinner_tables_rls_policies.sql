-- Migration: RLS Policies for Dinner Workflow Tables
-- Description: Add missing SELECT/INSERT/UPDATE policies for dinner_events,
--              dinner_matches, dinner_match_guests, and dinner_invites.
--              Without these, all client-side operations (pairing generation,
--              invite responses, dashboard queries) are blocked by RLS.
-- Issue: #78

-- ============================================================================
-- dinner_events
-- ============================================================================

-- SELECT: Group members can view dinner events for their groups
DROP POLICY IF EXISTS "Group members can view dinner events" ON public.dinner_events;
CREATE POLICY "Group members can view dinner events"
  ON public.dinner_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.peoplegroup
      WHERE groups_groupid = circle_id
        AND users_userid = auth.uid()
    )
  );

-- INSERT: Only group admins can create dinner events
DROP POLICY IF EXISTS "Group admins can create dinner events" ON public.dinner_events;
CREATE POLICY "Group admins can create dinner events"
  ON public.dinner_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groupid = circle_id
        AND admin_id = auth.uid()
    )
  );

-- UPDATE: Only group admins can update dinner events
DROP POLICY IF EXISTS "Group admins can update dinner events" ON public.dinner_events;
CREATE POLICY "Group admins can update dinner events"
  ON public.dinner_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groupid = circle_id
        AND admin_id = auth.uid()
    )
  );


-- ============================================================================
-- dinner_matches
-- ============================================================================

-- SELECT: Group members can view matches for events in their groups
DROP POLICY IF EXISTS "Group members can view dinner matches" ON public.dinner_matches;
CREATE POLICY "Group members can view dinner matches"
  ON public.dinner_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dinner_events de
      JOIN public.peoplegroup pg ON pg.groups_groupid = de.circle_id
      WHERE de.id = dinner_event_id
        AND pg.users_userid = auth.uid()
    )
  );

-- INSERT: Only group admins can create dinner matches
DROP POLICY IF EXISTS "Group admins can create dinner matches" ON public.dinner_matches;
CREATE POLICY "Group admins can create dinner matches"
  ON public.dinner_matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dinner_events de
      JOIN public.groups g ON g.groupid = de.circle_id
      WHERE de.id = dinner_event_id
        AND g.admin_id = auth.uid()
    )
  );

-- UPDATE: Group admins can update match status
DROP POLICY IF EXISTS "Group admins can update dinner matches" ON public.dinner_matches;
CREATE POLICY "Group admins can update dinner matches"
  ON public.dinner_matches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dinner_events de
      JOIN public.groups g ON g.groupid = de.circle_id
      WHERE de.id = dinner_event_id
        AND g.admin_id = auth.uid()
    )
  );


-- ============================================================================
-- dinner_match_guests
-- ============================================================================

-- SELECT: Group members can view guests in matches for their groups
DROP POLICY IF EXISTS "Group members can view match guests" ON public.dinner_match_guests;
CREATE POLICY "Group members can view match guests"
  ON public.dinner_match_guests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dinner_matches dm
      JOIN public.dinner_events de ON de.id = dm.dinner_event_id
      JOIN public.peoplegroup pg ON pg.groups_groupid = de.circle_id
      WHERE dm.id = match_id
        AND pg.users_userid = auth.uid()
    )
  );

-- INSERT: Group admins can add guests to matches
DROP POLICY IF EXISTS "Group admins can add match guests" ON public.dinner_match_guests;
CREATE POLICY "Group admins can add match guests"
  ON public.dinner_match_guests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dinner_matches dm
      JOIN public.dinner_events de ON de.id = dm.dinner_event_id
      JOIN public.groups g ON g.groupid = de.circle_id
      WHERE dm.id = match_id
        AND g.admin_id = auth.uid()
    )
  );


-- ============================================================================
-- dinner_invites
-- ============================================================================

-- SELECT: Users can view their own invites; admins can view all for their groups
DROP POLICY IF EXISTS "Users can view own dinner invites" ON public.dinner_invites;
CREATE POLICY "Users can view own dinner invites"
  ON public.dinner_invites
  FOR SELECT
  USING (
    invitee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.dinner_events de
      JOIN public.groups g ON g.groupid = de.circle_id
      WHERE de.id = dinner_event_id
        AND g.admin_id = auth.uid()
    )
  );

-- INSERT: Group admins can create invites
DROP POLICY IF EXISTS "Group admins can create dinner invites" ON public.dinner_invites;
CREATE POLICY "Group admins can create dinner invites"
  ON public.dinner_invites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dinner_events de
      JOIN public.groups g ON g.groupid = de.circle_id
      WHERE de.id = dinner_event_id
        AND g.admin_id = auth.uid()
    )
  );

-- UPDATE: Users can accept or decline their own invites
DROP POLICY IF EXISTS "Users can respond to own dinner invites" ON public.dinner_invites;
CREATE POLICY "Users can respond to own dinner invites"
  ON public.dinner_invites
  FOR UPDATE
  USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid());
