ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS group_vibe text,
  ADD COLUMN IF NOT EXISTS group_hashtags text[] DEFAULT '{}';
