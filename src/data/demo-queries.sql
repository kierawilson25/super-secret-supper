-- ============================================================================
-- SUPER SECRET SUPPER - DEMO QUERIES
-- Database Design Final Project
-- ============================================================================
-- These queries demonstrate the core functionality of the dinner pairing system
-- Use these to show how the database supports the pairing algorithm

-- ============================================================================
-- QUERY 1: Get all members of a group
-- ============================================================================
-- Purpose: Show who belongs to each dinner group
-- Used by: Pairing algorithm to know who to match

SELECT
    g.groupname,
    p.username,
    pg.joined_at
FROM groups g
JOIN peoplegroup pg ON g.groupid = pg.groups_groupid
JOIN people p ON pg.users_userid = p.userid
WHERE g.groupname = 'Database Design Class - Fall 2025'
ORDER BY p.username;

-- ============================================================================
-- QUERY 2: Find who has eaten together before
-- ============================================================================
-- Purpose: Track pairing history to avoid repeat matchings
-- Used by: Pairing algorithm to ensure people meet new faces

-- Step 1: Get all dinners for a group
SELECT
    d.dinnerid,
    d.dinner_date,
    COUNT(pd.users_userid) as attendees
FROM dinners d
LEFT JOIN peopledinner pd ON d.dinnerid = pd.dinners_dinnerid
WHERE d.groups_groupid = (
    SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
)
GROUP BY d.dinnerid, d.dinner_date
ORDER BY d.dinner_date;

-- Step 2: Find all pairs who have eaten together
SELECT DISTINCT
    p1.username as person1,
    p2.username as person2,
    d.dinner_date
FROM peopledinner pd1
JOIN peopledinner pd2 ON pd1.dinners_dinnerid = pd2.dinners_dinnerid
JOIN people p1 ON pd1.users_userid = p1.userid
JOIN people p2 ON pd2.users_userid = p2.userid
JOIN dinners d ON pd1.dinners_dinnerid = d.dinnerid
WHERE pd1.users_userid < pd2.users_userid  -- Avoid duplicate pairs
  AND d.groups_groupid = (
      SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
  )
ORDER BY d.dinner_date, p1.username, p2.username;

-- ============================================================================
-- QUERY 3: Find people who have NEVER eaten together
-- ============================================================================
-- Purpose: Core of pairing algorithm - match new people
-- This is the key query that makes the system work!

WITH group_members AS (
    -- Get all members
    SELECT p.userid, p.username
    FROM peoplegroup pg
    JOIN people p ON pg.users_userid = p.userid
    WHERE pg.groups_groupid = (
        SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
    )
),
eaten_together AS (
    -- Get all pairs who have eaten together
    SELECT DISTINCT
        LEAST(pd1.users_userid, pd2.users_userid) as user1_id,
        GREATEST(pd1.users_userid, pd2.users_userid) as user2_id
    FROM peopledinner pd1
    JOIN peopledinner pd2 ON pd1.dinners_dinnerid = pd2.dinners_dinnerid
    JOIN dinners d ON pd1.dinners_dinnerid = d.dinnerid
    WHERE pd1.users_userid != pd2.users_userid
      AND d.groups_groupid = (
          SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
      )
),
all_possible_pairs AS (
    -- Generate all possible pairings
    SELECT
        m1.userid as user1_id,
        m1.username as user1_name,
        m2.userid as user2_id,
        m2.username as user2_name
    FROM group_members m1
    CROSS JOIN group_members m2
    WHERE m1.userid < m2.userid  -- Avoid duplicates and self-pairing
)
-- Find pairs that have NEVER eaten together
SELECT
    app.user1_name as person1,
    app.user2_name as person2
FROM all_possible_pairs app
LEFT JOIN eaten_together et ON (
    app.user1_id = et.user1_id AND app.user2_id = et.user2_id
)
WHERE et.user1_id IS NULL  -- They have never eaten together
ORDER BY app.user1_name, app.user2_name
LIMIT 10;  -- Show first 10 potential pairings

-- ============================================================================
-- QUERY 4: View dinner attendance for a specific dinner
-- ============================================================================
-- Purpose: See who attended which dinner
-- Used by: Displaying results, tracking history

SELECT
    d.dinnerid,
    d.dinner_date,
    p.username,
    pd.users_userid
FROM dinners d
JOIN peopledinner pd ON d.dinnerid = pd.dinners_dinnerid
JOIN people p ON pd.users_userid = p.userid
WHERE d.groups_groupid = (
    SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
)
ORDER BY d.dinner_date DESC, p.username;

-- ============================================================================
-- QUERY 5: Count how many dinners each person has attended
-- ============================================================================
-- Purpose: Analytics - track participation
-- Useful for: Ensuring everyone gets paired equally

SELECT
    p.username,
    COUNT(pd.dinners_dinnerid) as dinners_attended
FROM people p
LEFT JOIN peopledinner pd ON p.userid = pd.users_userid
LEFT JOIN dinners d ON pd.dinners_dinnerid = d.dinnerid
WHERE p.userid IN (
    SELECT users_userid FROM peoplegroup
    WHERE groups_groupid = (
        SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
    )
)
GROUP BY p.userid, p.username
ORDER BY dinners_attended DESC, p.username;

-- ============================================================================
-- QUERY 6: Find people who haven't been paired yet
-- ============================================================================
-- Purpose: Identify members who need to be matched for the next dinner
-- Used by: Pairing algorithm to ensure everyone participates

SELECT
    p.username,
    COUNT(pd.dinners_dinnerid) as times_paired
FROM people p
LEFT JOIN peopledinner pd ON p.userid = pd.users_userid
WHERE p.userid IN (
    SELECT users_userid FROM peoplegroup
    WHERE groups_groupid = (
        SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
    )
)
GROUP BY p.userid, p.username
HAVING COUNT(pd.dinners_dinnerid) = 0
ORDER BY p.username;

-- ============================================================================
-- QUERY 7: Get pairing statistics
-- ============================================================================
-- Purpose: Overall stats for presentation
-- Shows: How many unique pairs, total dinners, average group size

SELECT
    COUNT(DISTINCT d.dinnerid) as total_dinners,
    COUNT(DISTINCT pd.users_userid) as unique_participants,
    COUNT(pd.users_userid) as total_attendances,
    ROUND(COUNT(pd.users_userid)::NUMERIC / NULLIF(COUNT(DISTINCT d.dinnerid), 0), 2) as avg_group_size
FROM dinners d
LEFT JOIN peopledinner pd ON d.dinnerid = pd.dinners_dinnerid
WHERE d.groups_groupid = (
    SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
);

-- ============================================================================
-- QUERY 8: Simulate the pairing algorithm
-- ============================================================================
-- Purpose: Demonstrate how pairs are generated step-by-step
-- This shows the actual logic used in the application

-- Step 1: Get available members
WITH available_members AS (
    SELECT p.userid, p.username
    FROM peoplegroup pg
    JOIN people p ON pg.users_userid = p.userid
    WHERE pg.groups_groupid = (
        SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
    )
    ORDER BY RANDOM()  -- Randomize for variety
),
-- Step 2: Find existing pairs to avoid
existing_pairs AS (
    SELECT DISTINCT
        LEAST(pd1.users_userid, pd2.users_userid) as user1_id,
        GREATEST(pd1.users_userid, pd2.users_userid) as user2_id
    FROM peopledinner pd1
    JOIN peopledinner pd2 ON pd1.dinners_dinnerid = pd2.dinners_dinnerid
    JOIN dinners d ON pd1.dinners_dinnerid = d.dinnerid
    WHERE pd1.users_userid != pd2.users_userid
      AND d.groups_groupid = (
          SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'
      )
),
-- Step 3: Generate optimal new pairs
numbered_members AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY username) as rn
    FROM available_members
)
SELECT
    m1.username as person1,
    m2.username as person2,
    CASE
        WHEN ep.user1_id IS NOT NULL THEN '❌ Already paired'
        ELSE '✅ New pairing'
    END as status
FROM numbered_members m1
JOIN numbered_members m2 ON m1.rn < m2.rn
LEFT JOIN existing_pairs ep ON (
    LEAST(m1.userid, m2.userid) = ep.user1_id
    AND GREATEST(m1.userid, m2.userid) = ep.user2_id
)
WHERE ep.user1_id IS NULL  -- Only show new pairings
LIMIT 25;  -- Show first 25 potential pairs

-- ============================================================================
-- HELPFUL VIEWS FOR PRESENTATION
-- ============================================================================

-- View: All groups with member counts
CREATE OR REPLACE VIEW group_summary AS
SELECT
    g.groupid,
    g.groupname,
    g.groupcity,
    g.dinner_cadence,
    COUNT(pg.users_userid) as member_count,
    COUNT(DISTINCT d.dinnerid) as total_dinners
FROM groups g
LEFT JOIN peoplegroup pg ON g.groupid = pg.groups_groupid
LEFT JOIN dinners d ON g.groupid = d.groups_groupid
GROUP BY g.groupid, g.groupname, g.groupcity, g.dinner_cadence;

-- View: Pairing history summary
CREATE OR REPLACE VIEW pairing_summary AS
SELECT
    p1.username as person1,
    p2.username as person2,
    COUNT(DISTINCT pd1.dinners_dinnerid) as times_together,
    MAX(d.dinner_date) as last_dinner
FROM peopledinner pd1
JOIN peopledinner pd2 ON pd1.dinners_dinnerid = pd2.dinners_dinnerid
JOIN people p1 ON pd1.users_userid = p1.userid
JOIN people p2 ON pd2.users_userid = p2.userid
JOIN dinners d ON pd1.dinners_dinnerid = d.dinnerid
WHERE pd1.users_userid < pd2.users_userid
GROUP BY p1.userid, p1.username, p2.userid, p2.username
ORDER BY times_together DESC, last_dinner DESC;

-- ============================================================================
-- END OF DEMO QUERIES
-- ============================================================================
-- These queries demonstrate the full functionality of the pairing system:
-- 1. Member management
-- 2. Pairing history tracking
-- 3. Optimal pair generation
-- 4. Statistics and analytics
-- ============================================================================
