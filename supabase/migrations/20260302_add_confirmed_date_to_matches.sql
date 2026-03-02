-- Migration: Add confirmed_date and confirmed_slot to dinner_matches
-- When both guests submit availability with overlap, the earliest matching
-- slot is auto-saved here and status is set to 'confirmed'.

ALTER TABLE public.dinner_matches
  ADD COLUMN IF NOT EXISTS confirmed_date timestamptz;

ALTER TABLE public.dinner_matches
  ADD COLUMN IF NOT EXISTS confirmed_slot text;
