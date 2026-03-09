-- Migration: Create support_requests table
-- Used by the /support page to collect user support submissions.

CREATE TABLE IF NOT EXISTS public.support_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  category    text NOT NULL,
  subject     text NOT NULL,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'open',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated users) can submit a support request.
-- No public read access — only service role / admin can view submissions.
CREATE POLICY "support_requests_insert_anon"
  ON public.support_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
