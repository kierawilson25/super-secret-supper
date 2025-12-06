-- Test Data: Database Class Classmates
-- This script populates the database with test data for final project demonstration

-- ============================================================================
-- IMPORTANT: Temporarily disable foreign key constraint for testing
-- ============================================================================
-- The People table normally references auth.users, but for testing we need to
-- insert users without creating actual Supabase auth accounts

ALTER TABLE people DROP CONSTRAINT IF EXISTS people_userid_fkey;

-- ============================================================================
-- STEP 1: Insert test users into People table
-- ============================================================================
-- Note: In production, these would be created via Supabase Auth signup
-- For testing, we're inserting them directly with generated UUIDs

INSERT INTO people (userid, username, isadmin, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Godwill Afolabi', false, NOW(), NOW()),
  (gen_random_uuid(), 'Samia Ahmed', false, NOW(), NOW()),
  (gen_random_uuid(), 'Omar Alshaali', false, NOW(), NOW()),
  (gen_random_uuid(), 'Mike Amelchenko', false, NOW(), NOW()),
  (gen_random_uuid(), 'Francy Aruldoss', false, NOW(), NOW()),
  (gen_random_uuid(), 'Kishanth Arumugam Balamurugan', false, NOW(), NOW()),
  (gen_random_uuid(), 'Milka Ayalew', false, NOW(), NOW()),
  (gen_random_uuid(), 'Caroline Ayieko', false, NOW(), NOW()),
  (gen_random_uuid(), 'Anamika Barua', false, NOW(), NOW()),
  (gen_random_uuid(), 'Rue Bastimar', false, NOW(), NOW()),
  (gen_random_uuid(), 'Brian Beahan', false, NOW(), NOW()),
  (gen_random_uuid(), 'Isabel Bennett', false, NOW(), NOW()),
  (gen_random_uuid(), 'Morgan Burden', false, NOW(), NOW()),
  (gen_random_uuid(), 'Tony Challeen', false, NOW(), NOW()),
  (gen_random_uuid(), 'Chen Chen', false, NOW(), NOW()),
  (gen_random_uuid(), 'Sara Crader', false, NOW(), NOW()),
  (gen_random_uuid(), 'Priyanka Dogra', false, NOW(), NOW()),
  (gen_random_uuid(), 'Ellie Erickson', false, NOW(), NOW()),
  (gen_random_uuid(), 'Emily Freedland', false, NOW(), NOW()),
  (gen_random_uuid(), 'Kyunghoon Han', false, NOW(), NOW()),
  (gen_random_uuid(), 'Herbert Junior', false, NOW(), NOW()),
  (gen_random_uuid(), 'Edward Kiawoin', false, NOW(), NOW()),
  (gen_random_uuid(), 'Nick Kiminski', false, NOW(), NOW()),
  (gen_random_uuid(), 'Adam Levonian', false, NOW(), NOW()),
  (gen_random_uuid(), 'Tania Martinez', false, NOW(), NOW()),
  (gen_random_uuid(), 'August Mcdowell', false, NOW(), NOW()),
  (gen_random_uuid(), 'Cally Minner', false, NOW(), NOW()),
  (gen_random_uuid(), 'Olivia Nalwoga', false, NOW(), NOW()),
  (gen_random_uuid(), 'Tessa Nowlan', false, NOW(), NOW()),
  (gen_random_uuid(), 'Lucky Onyemaobi', false, NOW(), NOW()),
  (gen_random_uuid(), 'Josiah Passe', false, NOW(), NOW()),
  (gen_random_uuid(), 'Oriana Penaloza Ortega', false, NOW(), NOW()),
  (gen_random_uuid(), 'Spriha Prajapati', false, NOW(), NOW()),
  (gen_random_uuid(), 'Mohammad Qasem', false, NOW(), NOW()),
  (gen_random_uuid(), 'Brandon Ratsamy', false, NOW(), NOW()),
  (gen_random_uuid(), 'Carley Saeger', false, NOW(), NOW()),
  (gen_random_uuid(), 'Joao Saraiva', false, NOW(), NOW()),
  (gen_random_uuid(), 'Kadiatou Sidibe', false, NOW(), NOW()),
  (gen_random_uuid(), 'Michael Socha', false, NOW(), NOW()),
  (gen_random_uuid(), 'Salma Tahlil', false, NOW(), NOW()),
  (gen_random_uuid(), 'Adam Taylor', false, NOW(), NOW()),
  (gen_random_uuid(), 'Isaiah Thao', false, NOW(), NOW()),
  (gen_random_uuid(), 'Matthew Tibesar', false, NOW(), NOW()),
  (gen_random_uuid(), 'Vy Truong', false, NOW(), NOW()),
  (gen_random_uuid(), 'Daniel Wang', false, NOW(), NOW()),
  (gen_random_uuid(), 'Ryan Wilkus', false, NOW(), NOW()),
  (gen_random_uuid(), 'Kiera Wilson', true, NOW(), NOW()),  -- Set as admin for testing
  (gen_random_uuid(), 'Debisa Woyessa', false, NOW(), NOW()),
  (gen_random_uuid(), 'Danny Xiong', false, NOW(), NOW()),
  (gen_random_uuid(), 'David Yang', false, NOW(), NOW());

-- ============================================================================
-- STEP 2: Create a test group for the database class
-- ============================================================================

INSERT INTO groups (groupid, groupname, groupcity, admin_id, dinner_cadence, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Database Design Class - Fall 2025',
  'Charlotte',
  (SELECT userid FROM people WHERE username = 'Kiera Wilson'),  -- Kiera as admin
  'monthly',
  NOW(),
  NOW()
);

-- ============================================================================
-- STEP 3: Add all classmates to the group
-- ============================================================================

INSERT INTO peoplegroup (groups_groupid, users_userid, joined_at)
SELECT
  (SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'),
  userid,
  NOW()
FROM people;

-- ============================================================================
-- STEP 4: Create a test dinner event for pairing demonstration
-- ============================================================================

INSERT INTO dinners (dinnerid, dinner_date, groups_groupid, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  NOW() + INTERVAL '7 days',  -- Dinner scheduled for next week
  (SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025'),
  NOW(),
  NOW()
);

-- ============================================================================
-- STEP 5: Add some sample dinner locations
-- ============================================================================

INSERT INTO dinner_locations (locationid, locationname, locationcity, locationprice, cuisine, created_at)
VALUES
  (gen_random_uuid(), 'Amélie''s French Bakery', 'Charlotte', 2, 'French', NOW()),
  (gen_random_uuid(), 'Soul Gastrolounge', 'Charlotte', 3, 'American', NOW()),
  (gen_random_uuid(), 'Ink N Ivy', 'Charlotte', 2, 'American', NOW()),
  (gen_random_uuid(), 'Yafo Kitchen', 'Charlotte', 2, 'Mediterranean', NOW()),
  (gen_random_uuid(), 'Seoul Food Meat Company', 'Charlotte', 2, 'Korean BBQ', NOW());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check how many people were added
SELECT COUNT(*) as total_people FROM people;

-- Check the group was created
SELECT * FROM groups WHERE groupname = 'Database Design Class - Fall 2025';

-- Check how many people are in the group
SELECT COUNT(*) as group_members
FROM peoplegroup
WHERE groups_groupid = (SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025');

-- Check the dinner was created
SELECT * FROM dinners
WHERE groups_groupid = (SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025');

-- List all group members
SELECT p.username, pg.joined_at
FROM people p
JOIN peoplegroup pg ON p.userid = pg.users_userid
WHERE pg.groups_groupid = (SELECT groupid FROM groups WHERE groupname = 'Database Design Class - Fall 2025')
ORDER BY p.username;

-- ============================================================================
-- NOTE: Foreign key constraint has been removed for testing
-- In production, all users would be in auth.users table
-- ============================================================================
