-- Migration: Pairing Workflow Updates
-- Description: Add tables and columns to support full dinner pairing workflow
-- Issue: #26
-- Date: 2026-02-19

-- ============================================================================
-- 1. CREATE availability_slots TABLE
-- ============================================================================
-- Stores user availability windows for dinner events

CREATE TABLE IF NOT EXISTS public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(userid) ON DELETE CASCADE,
  dinner_event_id uuid REFERENCES public.dinner_events(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  time_slot text NOT NULL CHECK (time_slot IN ('breakfast', 'lunch', 'dinner', 'late_night')),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent duplicate entries
  UNIQUE(user_id, dinner_event_id, available_date, time_slot)
);

-- Index for querying user availability
CREATE INDEX idx_availability_user_event ON public.availability_slots(user_id, dinner_event_id);

-- Index for finding available dates
CREATE INDEX idx_availability_date ON public.availability_slots(available_date);

COMMENT ON TABLE public.availability_slots IS 'User availability windows for dinner events';
COMMENT ON COLUMN public.availability_slots.time_slot IS 'breakfast, lunch, dinner, or late_night';

-- RLS Policies
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Users can view their own availability
CREATE POLICY "Users can view own availability"
  ON public.availability_slots
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own availability
CREATE POLICY "Users can insert own availability"
  ON public.availability_slots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own availability
CREATE POLICY "Users can update own availability"
  ON public.availability_slots
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own availability
CREATE POLICY "Users can delete own availability"
  ON public.availability_slots
  FOR DELETE
  USING (auth.uid() = user_id);

-- Group admins can view all member availability for their events
CREATE POLICY "Admins can view member availability"
  ON public.availability_slots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dinner_events de
      JOIN public.groups g ON de.circle_id = g.groupid
      WHERE de.id = availability_slots.dinner_event_id
        AND g.admin_id = auth.uid()
    )
  );


-- ============================================================================
-- 2. ADD COLUMNS TO dinner_invites
-- ============================================================================
-- Add deadline and auto-decline tracking

ALTER TABLE public.dinner_invites
  ADD COLUMN IF NOT EXISTS deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_declined boolean DEFAULT false;

COMMENT ON COLUMN public.dinner_invites.deadline_at IS 'Deadline for accepting/declining invite (default 5 days)';
COMMENT ON COLUMN public.dinner_invites.auto_declined IS 'True if invite was auto-declined after deadline';

-- Index for finding expired invites
CREATE INDEX IF NOT EXISTS idx_dinner_invites_deadline
  ON public.dinner_invites(deadline_at)
  WHERE status = 'pending';


-- ============================================================================
-- 3. ADD COLUMNS TO dinner_matches
-- ============================================================================
-- Add location assignment to matches

ALTER TABLE public.dinner_matches
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.dinner_locations(locationid);

COMMENT ON COLUMN public.dinner_matches.location_id IS 'Assigned restaurant location for this match';

-- Index for location assignments
CREATE INDEX IF NOT EXISTS idx_dinner_matches_location
  ON public.dinner_matches(location_id);


-- ============================================================================
-- 4. ADD COLUMN TO dinner_events
-- ============================================================================
-- Store pairing algorithm metadata

ALTER TABLE public.dinner_events
  ADD COLUMN IF NOT EXISTS pairing_algorithm_metadata jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.dinner_events.pairing_algorithm_metadata IS 'Metadata from pairing algorithm (e.g., who has paired with whom)';

-- Index for querying metadata
CREATE INDEX IF NOT EXISTS idx_dinner_events_metadata
  ON public.dinner_events USING gin(pairing_algorithm_metadata);


-- ============================================================================
-- 5. CREATE PERFORMANCE INDEXES
-- ============================================================================
-- Indexes on frequently queried fields

-- dinner_invites status (for filtering pending/accepted/declined)
CREATE INDEX IF NOT EXISTS idx_dinner_invites_status
  ON public.dinner_invites(status);

-- dinner_invites by event (for admin dashboard)
CREATE INDEX IF NOT EXISTS idx_dinner_invites_event
  ON public.dinner_invites(dinner_event_id);

-- dinner_matches status (for filtering pending/confirmed/completed)
CREATE INDEX IF NOT EXISTS idx_dinner_matches_status
  ON public.dinner_matches(status);

-- dinner_matches by event (for viewing all matches in an event)
CREATE INDEX IF NOT EXISTS idx_dinner_matches_event
  ON public.dinner_matches(dinner_event_id);

-- dinner_match_guests by match (for finding all guests in a match)
CREATE INDEX IF NOT EXISTS idx_dinner_match_guests_match
  ON public.dinner_match_guests(match_id);

-- dinner_match_guests by user (for finding user's matches)
CREATE INDEX IF NOT EXISTS idx_dinner_match_guests_user
  ON public.dinner_match_guests(user_id);


-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a date has conflicts (same location, same date)
CREATE OR REPLACE FUNCTION public.check_location_date_conflict(
  p_location_id uuid,
  p_date timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.dinner_matches dm
    JOIN public.dinner_events de ON dm.dinner_event_id = de.id
    WHERE dm.location_id = p_location_id
      AND de.scheduled_date::date = p_date::date
  );
END;
$$;

COMMENT ON FUNCTION public.check_location_date_conflict IS 'Check if a location is already assigned to another match on the same date';


-- ============================================================================
-- ROLLBACK SCRIPT (for reference, do not execute)
-- ============================================================================
/*
-- Drop tables
DROP TABLE IF EXISTS public.availability_slots CASCADE;

-- Remove columns
ALTER TABLE public.dinner_invites
  DROP COLUMN IF EXISTS deadline_at,
  DROP COLUMN IF EXISTS auto_declined;

ALTER TABLE public.dinner_matches
  DROP COLUMN IF EXISTS location_id;

ALTER TABLE public.dinner_events
  DROP COLUMN IF EXISTS pairing_algorithm_metadata;

-- Drop indexes
DROP INDEX IF EXISTS idx_availability_user_event;
DROP INDEX IF EXISTS idx_availability_date;
DROP INDEX IF EXISTS idx_dinner_invites_deadline;
DROP INDEX IF EXISTS idx_dinner_matches_location;
DROP INDEX IF EXISTS idx_dinner_events_metadata;
DROP INDEX IF EXISTS idx_dinner_invites_status;
DROP INDEX IF EXISTS idx_dinner_invites_event;
DROP INDEX IF EXISTS idx_dinner_matches_status;
DROP INDEX IF EXISTS idx_dinner_matches_event;
DROP INDEX IF EXISTS idx_dinner_match_guests_match;
DROP INDEX IF EXISTS idx_dinner_match_guests_user;

-- Drop functions
DROP FUNCTION IF EXISTS public.check_location_date_conflict;
*/
