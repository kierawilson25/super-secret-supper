-- Waitlist Table for Beta User Signups
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- WAITLIST TABLE
-- ============================================================================
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE waitlist IS 'Email signups for beta access';

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - WAITLIST TABLE
-- ============================================================================

-- Anyone can insert their email to join the waitlist
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Admins can view all waitlist emails
CREATE POLICY "Admins can view waitlist" ON waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM People WHERE userID = auth.uid() AND isAdmin = true
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
