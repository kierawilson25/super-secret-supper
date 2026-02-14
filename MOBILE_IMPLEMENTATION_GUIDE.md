# Super Secret Supper - Mobile Implementation Guide

**Last Updated:** January 6, 2026
**Web App Version:** Next.js 16.0.8
**Prepared for:** Mobile Engineering Team

---

## Executive Summary

Super Secret Supper is a social dining application that intelligently pairs members of friend groups for monthly dinners at curated restaurants. The app ensures everyone gets to know each other by tracking pairing history and preventing repeat pairings until all possible combinations have been explored.

**Core Value Proposition:**
- Automated dinner pairing within friend groups
- Smart algorithm prevents repeat pairings
- Restaurant assignment based on location
- Group management with admin controls
- Shareable invite links for easy onboarding

---

## Technology Stack

### Current Web Implementation
- **Frontend:** Next.js 16.0.8, React 19.2.0, TypeScript 5, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Authentication)
- **Security:** Row Level Security (RLS) at database level
- **Validation:** Zod 4.2.1 for schema validation

### Mobile Recommendations
- **Supabase Client:** Use `@supabase/supabase-js` for iOS/Android
- **Authentication:** Supabase Auth (same as web)
- **Database:** Direct Supabase queries (same schema, same RLS policies)
- **Real-time:** Supabase Realtime for live updates (optional)

---

## Design System

### Color Palette
- **Primary Background:** `#460C58` (Deep purple)
- **Primary Text/Border:** `#FBE6A6` (Gold/cream)
- **Secondary Text:** `#F8F4F0` (Off-white)
- **Success:** Green tones (for alerts)
- **Error:** Red tones (for alerts)

### Typography
- **Logo/Branding:** Great Vibes (cursive)
- **Body Text:** System fonts (San Francisco, Roboto)

### Design Principles
- Elegant, sophisticated aesthetic
- High contrast for readability
- Gold accents on purple background
- Rounded corners, soft borders
- Minimal, focused UI

---

## Database Schema

### Core Tables

#### 1. **people** - User Profiles
```sql
userID         UUID PRIMARY KEY (references auth.users)
userName       VARCHAR(100)
isAdmin        BOOLEAN DEFAULT false
created_at     TIMESTAMP
updated_at     TIMESTAMP
```

#### 2. **groups** - Friend Groups
```sql
GroupID           UUID PRIMARY KEY
GroupName         VARCHAR(255)
GroupCity         VARCHAR(255)
admin_id          UUID (FK -> people.userID)
dinner_cadence    ENUM ('monthly', 'quarterly', 'biweekly')
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### 3. **peoplegroup** - Group Membership
```sql
Groups_GroupID    UUID (FK -> groups.GroupID)
Users_userID      UUID (FK -> people.userID)
joined_at         TIMESTAMP
PRIMARY KEY (Groups_GroupID, Users_userID)
```

#### 4. **dinner_locations** - Restaurants
```sql
locationID        UUID PRIMARY KEY
locationName      VARCHAR(100)
locationCity      VARCHAR(100)
locationPrice     INTEGER (1-3 for budget/moderate/expensive)
cuisine           VARCHAR(100)
created_at        TIMESTAMP
```

#### 5. **dinners** - Scheduled Dinners
```sql
dinnerID                      UUID PRIMARY KEY
dinner_date                   TIMESTAMP
Groups_GroupID                UUID (FK -> groups.GroupID)
Dinner_Locations_locationID   UUID (FK -> dinner_locations.locationID)
created_at                    TIMESTAMP
updated_at                    TIMESTAMP
```

#### 6. **peopledinner** - Dinner Attendance
```sql
Users_userID      UUID (FK -> people.userID)
dinners_dinnerID  UUID (FK -> dinners.dinnerID)
PRIMARY KEY (Users_userID, dinners_dinnerID)
```

#### 7. **invite_links** - Group Invitations
```sql
id            UUID PRIMARY KEY
group_id      UUID (FK -> groups.GroupID)
code          VARCHAR(255) UNIQUE
created_by    UUID (FK -> people.userID)
expires_at    TIMESTAMP (nullable)
max_uses      INTEGER (nullable)
used_count    INTEGER DEFAULT 0
created_at    TIMESTAMP
```

### Database Relationships
- **Users ↔ Groups:** Many-to-many via `peoplegroup`
- **Users ↔ Dinners:** Many-to-many via `peopledinner`
- **Groups → Dinners:** One-to-many (each dinner belongs to one group)
- **Dinners → Locations:** Many-to-one (each dinner at one location)
- **Groups → Admin:** Each group has one admin user

---

## Authentication & Security

### Supabase Authentication
- **Email/Password:** Primary authentication method
- **Session Management:** JWT tokens handled by Supabase
- **Password Reset:** Email-based reset flow

### Row Level Security (RLS) Policies

**Key Security Rules:**
- Users can only view/edit their own profile
- Users can only see groups they're members of
- Only group admins can generate pairings
- Only group admins can create invite links
- Users can view dinners/pairings only for their groups
- Admins see all group pairings; members see only their own

### Protected Operations
- **Admin-only:** Generate pairs, create invite links, update group settings
- **Member-only:** View group info, view members, view own pairings
- **Public:** Landing page, about, waitlist, login, signup

---

## Core Features & User Flows

### 1. User Onboarding

**Signup Flow:**
1. User enters email, username, password
2. Validation: Email format, username 3-50 chars, password ≥8 chars
3. Supabase creates auth user
4. Auto-creates profile in `people` table
5. Redirect to login

**Login Flow:**
1. User enters email and password
2. Supabase validates credentials
3. Session established
4. Redirect to profile or specified `returnTo` URL

**Password Reset:**
1. User clicks "Forgot Password" on login
2. Enters email
3. Supabase sends reset link via email
4. User clicks link → redirected to reset password page
5. User enters new password (validated)
6. Password updated, redirected to login

### 2. Group Management

**Creating a Group:**
1. User navigates to "Create Group"
2. Enters: Group name, City (Charlotte/New York), Cadence (monthly/quarterly/biweekly)
3. System creates group with user as admin
4. User automatically added as member

**Viewing Groups:**
- List all groups user is a member of
- Shows: Group name, city, member count
- Actions: View members, Manage (if admin)

**Admin Functions:**
- Update dinner cadence
- Generate dinner pairs
- Create invite links
- View all member pairings and statistics

**Member Functions:**
- View group details
- View member list
- View own pairing history

### 3. Invite System

**Creating Invite Links (Admin):**
1. Admin navigates to "Manage Group"
2. Clicks "Create Invite Link"
3. System generates cryptographically secure 24-character code
4. Link format: `{origin}/invite/{code}`
5. Admin can set expiration date and max uses (optional)
6. Admin copies link to share

**Redeeming Invite Links:**
1. New user receives link: `https://app.com/invite/ABC123...`
2. User clicks link
3. If not logged in → redirect to login with `returnTo=/invite/{code}`
4. After login, system:
   - Validates code (not expired, under max uses)
   - Checks user not already member
   - Adds user to group via `peoplegroup`
   - Increments `used_count`
5. Redirect to group members page

### 4. Pairing Algorithm

**Generating Pairs (Admin):**
1. Admin navigates to group's "Generate Pairs" page
2. System displays member count and expected pair count
3. Admin clicks "Generate Pairs"
4. Algorithm:
   - Fetches all group members
   - Fetches pairing history (who has eaten together)
   - Pairs people who haven't dined together
   - Creates separate `dinners` record for each pair
   - Assigns random restaurant from group's city
   - Sets dinner date to 7 days from now
   - Handles odd numbers by creating group of 3
5. Results displayed with:
   - Person 1 & Person 2 (or Person 3)
   - Restaurant name, city, cuisine, price level
6. Data saved to prevent repeat pairings

**Pairing Rules:**
- Minimum 2 members required
- Prioritizes people who haven't eaten together
- Random location assignment from group's city
- Separate dinner entry per pair (not one dinner for all)
- Prevents repeats by checking `peopledinner` history

### 5. Viewing Pairing History

**Monthly View:**
1. User navigates to "Previous Pairs"
2. System groups dinners by month (YYYY-MM)
3. Displays list of months with pairing counts
4. User clicks month → month detail page

**Month Detail:**
- Shows all dinners from that month
- For each dinner: Date, Attendees (usernames), Location
- Admin sees all; members see only their own
- Breadcrumb navigation back to all months

### 6. Automated Pairing Generation

**Cron Job (Backend):**
- API endpoint: `GET /api/cron/generate-pairings`
- Authentication: Bearer token via `CRON_SECRET` header
- Frequency: Runs daily (recommended)
- Logic:
  1. Fetch all groups with cadence settings
  2. For each group, check last dinner date
  3. Calculate if cadence period elapsed:
     - Biweekly: ≥14 days
     - Monthly: ≥30 days
     - Quarterly: ≥90 days
  4. Generate pairs if due
  5. Return summary (success/skipped/error per group)

---

## API & Data Access Patterns

### Supabase Queries

All data operations use Supabase client. Examples:

**Fetch User Profile:**
```javascript
const { data, error } = await supabase
  .from('people')
  .select('*')
  .eq('userID', userId)
  .single();
```

**Fetch User's Groups:**
```javascript
const { data, error } = await supabase
  .from('groups')
  .select(`
    GroupID,
    GroupName,
    GroupCity,
    admin_id,
    dinner_cadence,
    peoplegroup!inner(joined_at)
  `)
  .eq('peoplegroup.Users_userID', userId);
```

**Fetch Group Members:**
```javascript
const { data, error } = await supabase
  .from('peoplegroup')
  .select(`
    Users_userID,
    people:Users_userID(userName, userID)
  `)
  .eq('Groups_GroupID', groupId);
```

**Fetch Pairing History:**
```javascript
const { data, error } = await supabase
  .from('dinners')
  .select(`
    dinnerID,
    dinner_date,
    Groups_GroupID,
    dinner_locations(locationName, locationCity, cuisine, locationPrice),
    peopledinner(
      people:Users_userID(userName, userID)
    )
  `)
  .eq('Groups_GroupID', groupId)
  .order('dinner_date', { ascending: false });
```

### Authentication State

**Check if User is Logged In:**
```javascript
const { data: { user }, error } = await supabase.auth.getUser();
```

**Sign Up:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { userName }
  }
});
```

**Login:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**Logout:**
```javascript
const { error } = await supabase.auth.signOut();
```

**Reset Password:**
```javascript
// Send reset email
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset-password`
});

// Update password
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

---

## Screen-by-Screen Breakdown

### Authentication Screens

#### 1. Login Screen
- **Route:** `/login`
- **Fields:** Email, Password
- **Actions:** Login, Forgot Password, Go to Signup
- **Validation:** Email format, required fields
- **Errors:** Display error message from Supabase
- **Success:** Redirect to profile or `returnTo` URL

#### 2. Signup Screen
- **Route:** `/signup`
- **Fields:** Email, Username, Password, Confirm Password
- **Validation:**
  - Email: RFC 5322 compliant
  - Username: 3-50 characters
  - Password: Min 8 characters
  - Passwords match
- **Actions:** Signup, Go to Login
- **Success:** Redirect to login with success message

#### 3. Forgot Password Screen
- **Route:** `/forgot-password`
- **Fields:** Email
- **Actions:** Send Reset Link, Back to Login
- **Success:** Show success message, prompt to check email

#### 4. Reset Password Screen
- **Route:** `/reset-password`
- **Fields:** New Password, Confirm Password
- **Validation:** Password requirements (8+ chars, uppercase, lowercase, number)
- **Actions:** Reset Password
- **Success:** Redirect to login

### Main App Screens

#### 5. Profile Screen
- **Route:** `/profile`
- **Protected:** Yes (redirect to login if not authenticated)
- **Display:** Username, Email (read-only), Group memberships
- **Actions:** Edit username, Save, Logout
- **Navigation:** Groups list, Create Group

#### 6. Groups List Screen
- **Route:** `/groups`
- **Protected:** Yes
- **Display:** Grid/list of groups with:
  - Group name
  - City
  - Member count
  - Manage button (if admin)
  - View Members button
- **Actions:** Create New Group, Select Group to view details
- **Empty State:** "You're not in any groups yet"

#### 7. Create Group Screen
- **Route:** `/create-group`
- **Protected:** Yes
- **Fields:**
  - Group Name (text input)
  - City (select: Charlotte, New York)
  - Cadence (select: monthly, quarterly, biweekly)
- **Actions:** Create Group, Cancel
- **Success:** Redirect to groups list

#### 8. Group Members Screen
- **Route:** `/groups/[id]/members`
- **Protected:** Yes (must be member)
- **Display:** List of all members with usernames
- **Header:** Member count
- **Actions:** Back to Groups

#### 9. Manage Group Screen (Admin Only)
- **Route:** `/groups/[id]/manage`
- **Protected:** Yes (must be admin)
- **Sections:**
  - **Cadence:** Update dinner frequency
  - **Pairing Stats:** Completed vs. total possible pairings
  - **Actions:**
    - Generate Pairs → link to pair page
    - View Previous Pairs → link to history
  - **Invite Links:**
    - List existing links with usage stats
    - Create New Invite Link
    - Copy link button
    - Show expiration and max uses
- **Actions:** Save changes, Back to Groups

#### 10. Generate Pairs Screen (Admin Only)
- **Route:** `/groups/[id]/pair`
- **Protected:** Yes (must be admin)
- **Display:**
  - Member count
  - Expected pair count
  - Generate Pairs button
- **After Generation:**
  - List of pairs with:
    - Person 1 & Person 2 names
    - Restaurant name, city, cuisine, price
    - Visual icons/emojis
- **Validation:** Minimum 2 members required
- **Actions:** Generate Pairs, Back to Manage

#### 11. Pairing History - All Months Screen
- **Route:** `/groups/[id]/pairs`
- **Protected:** Yes (must be member)
- **Display:** List of months with pairing counts
  - Format: "January 2026 (3 pairings)"
- **Permissions:**
  - Admin: See all pairings
  - Member: See only own pairings
- **Actions:** Click month to view details, Back to Groups

#### 12. Pairing History - Month Detail Screen
- **Route:** `/groups/[id]/pairs/[month]`
- **Protected:** Yes (must be member)
- **Display:** All dinners for selected month
  - Dinner date
  - Attendees (usernames)
  - Restaurant name, city, cuisine, price
  - Admin badge if viewing as admin
- **Actions:** Back to All Months, Back to Groups

#### 13. Invite Redemption Screen
- **Route:** `/invite/[code]`
- **Protected:** Yes (redirect to login with returnTo if not authenticated)
- **Flow:**
  1. Validate invite code
  2. Check if user already member → show "Already a Member" state
  3. Add user to group
  4. Show success message
  5. Auto-redirect to group members page after 2 seconds
- **Error States:**
  - Invalid code
  - Expired code
  - Max uses reached
  - Already a member

---

## Mobile-Specific Considerations

### Deep Linking
- **Invite Links:** Handle `supersecretsuppeR://invite/{code}` deep links
- **Universal Links:** Configure for `https://yourapp.com/invite/{code}`
- **Implementation:** Parse code, check auth, validate, join group

### Push Notifications (Future Enhancement)
- **New Pairing:** Notify when paired for upcoming dinner
- **Dinner Reminder:** Day-of reminder
- **Invite Accepted:** Notify admin when someone joins group
- **Implementation:** Requires backend push service (Firebase, APNs)

### Offline Mode
- **View History:** Cache pairing history for offline viewing
- **Profile:** Cache user profile
- **Groups List:** Cache group info
- **Sync Strategy:** Sync on app open and when network available

### Platform-Specific Features

**iOS:**
- Calendar integration (EventKit) for dinner dates
- Apple Maps integration for restaurant locations
- Share sheet for invite links
- Biometric authentication (Face ID/Touch ID)

**Android:**
- Google Calendar integration for dinner dates
- Google Maps integration for restaurant locations
- Share intent for invite links
- Biometric authentication

### UI/UX Enhancements for Mobile

**Navigation:**
- Bottom tab bar: Groups, History, Profile
- Hamburger menu: Create Group, Logout, Settings
- Back buttons on detail pages

**Forms:**
- Native date pickers
- Native select dropdowns
- Input validation with inline errors
- Keyboard handling (dismiss on tap outside)

**Lists:**
- Pull-to-refresh on groups and history
- Swipe actions (e.g., swipe to leave group)
- Empty states with illustrations
- Loading skeletons

**Visual Polish:**
- Smooth transitions between screens
- Haptic feedback on actions
- Toast notifications for success/error
- Skeleton loaders during data fetch

### Real-time Updates (Optional)

**Supabase Realtime:**
```javascript
// Subscribe to new pairings
supabase
  .channel('dinners')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'dinners',
    filter: `Groups_GroupID=eq.${groupId}`
  }, payload => {
    // Refresh pairing list
  })
  .subscribe();
```

**Use Cases:**
- Live update when admin generates pairs
- New member joins group
- Invite link used

---

## State Management Recommendations

### Option 1: React Context + Hooks (Simple)
- Auth context for user session
- Groups context for user's groups
- Local state for form inputs

### Option 2: Redux/Zustand (Medium Complexity)
- Centralized store for auth, groups, pairings
- Better for larger team
- Middleware for Supabase syncing

### Option 3: React Query/SWR (Recommended)
- Automatic caching and refetching
- Optimistic updates
- Integrates well with Supabase
- Reduces boilerplate

---

## Testing Strategy

### Unit Tests
- Pairing algorithm logic
- Validation functions
- Utility functions (crypto, logging)

### Integration Tests
- Auth flows (signup, login, reset)
- Group creation and management
- Pairing generation
- Invite link redemption

### E2E Tests
- Complete user journey: signup → create group → invite member → generate pairs
- Admin and member permission flows
- Error handling and edge cases

### Test Data
- Seed database with test users, groups, locations
- Test with varying group sizes (2, 3, 5, 10 members)
- Test cadence triggering (mock dates)

---

## Performance Considerations

### Data Fetching
- Lazy load pairing history (paginate by month)
- Cache group member lists
- Debounce search inputs

### Images
- Optimize profile pictures (when implemented)
- Lazy load list images
- Use appropriate formats (WebP, AVIF)

### Bundle Size
- Code splitting by route
- Tree shaking unused Supabase features
- Minimize third-party libraries

---

## Future Enhancements

### Priority 1 (High Impact)
1. **Email/Push Notifications:** Alert users when paired
2. **Calendar Integration:** Add dinners to calendar
3. **RSVP System:** Confirm/decline dinner attendance
4. **User Preferences:** Dietary restrictions, location preferences

### Priority 2 (Medium Impact)
5. **Profile Pictures:** Avatar uploads
6. **Restaurant Recommendations:** Integrate Yelp/Google Places API
7. **In-app Messaging:** Chat between paired people
8. **Feedback System:** Rate dinners and locations

### Priority 3 (Nice to Have)
9. **Photo Sharing:** Upload dinner photos
10. **Location Voting:** Group votes on restaurant choices
11. **Expense Splitting:** Bill splitting feature
12. **Recurring Availability:** Set unavailable dates

---

## Environment Setup

### Required Environment Variables

```env
# Supabase (same for mobile)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cron Authentication (backend only)
CRON_SECRET=your-secret-for-cron-jobs

# Environment
NODE_ENV=development
```

### Development Setup
1. Install Supabase CLI: `npm install -g supabase`
2. Link to project: `supabase link --project-ref your-project-ref`
3. Run migrations: `supabase db push`
4. Seed data (optional): Create script to add test users, groups, locations

---

## API Endpoints Summary

### Web App Endpoints
- **GET** `/api/cron/generate-pairings` - Automated pairing generation (cron job)

### Supabase Endpoints (via SDK)
All CRUD operations go through Supabase client with RLS:
- `people` - User profiles
- `groups` - Friend groups
- `peoplegroup` - Group memberships
- `dinners` - Scheduled dinners
- `peopledinner` - Dinner attendance
- `dinner_locations` - Restaurant data
- `invite_links` - Group invitations

---

## Contact & Resources

### Documentation Links
- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

### Code Repository
- Web app source code: [Link to GitHub repo]
- Database migrations: `/supabase/migrations/`
- Useful utilities: `/src/lib/`

### Support
- For questions about business logic or features, contact: [Your contact info]
- For database schema questions, reference: This document + `/supabase/migrations/`

---

## Appendix A: Pairing Algorithm Detailed Logic

```
FUNCTION generatePairs(groupId):
  1. Fetch all members in group
  2. Fetch all historical pairings from peopledinner where group = groupId
  3. Build map of "who has eaten with whom"

  4. Create empty pairs array
  5. Create copy of members list (availableMembers)

  6. WHILE availableMembers.length > 1:
       a. Take first person from availableMembers
       b. Find person in availableMembers who hasn't eaten with first person
       c. If found:
            - Create pair [person1, person2]
            - Remove both from availableMembers
          Else:
            - Pair with next available person (allows repeat)
            - Remove both from availableMembers

  7. IF availableMembers.length == 1 (odd number):
       - Add leftover person to last pair (make it a trio)

  8. FOR EACH pair:
       a. Select random location from group's city
       b. Create dinner record with date = now + 7 days
       c. Link pair members to dinner via peopledinner

  9. Return pairs with location details
```

---

## Appendix B: RLS Policy Examples

**People Table - View Own Profile:**
```sql
CREATE POLICY "Users can view own profile"
ON people FOR SELECT
USING (auth.uid() = userID);
```

**Groups Table - View Own Groups:**
```sql
CREATE POLICY "Users can view own groups"
ON groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM peoplegroup
    WHERE peoplegroup.Groups_GroupID = groups.GroupID
    AND peoplegroup.Users_userID = auth.uid()
  )
);
```

**Dinners Table - Admin Can Create:**
```sql
CREATE POLICY "Admins can create dinners"
ON dinners FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups
    WHERE groups.GroupID = dinners.Groups_GroupID
    AND groups.admin_id = auth.uid()
  )
);
```

---

## Appendix C: Sample Data Structures

### User Profile Response
```json
{
  "userID": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "johndoe",
  "isAdmin": false,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T00:00:00Z"
}
```

### Group Response
```json
{
  "GroupID": "660e8400-e29b-41d4-a716-446655440001",
  "GroupName": "Downtown Foodies",
  "GroupCity": "Charlotte",
  "admin_id": "550e8400-e29b-41d4-a716-446655440000",
  "dinner_cadence": "monthly",
  "member_count": 8,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Pairing Response
```json
{
  "dinnerID": "770e8400-e29b-41d4-a716-446655440002",
  "dinner_date": "2025-02-15T19:00:00Z",
  "location": {
    "locationName": "The Fig Tree",
    "locationCity": "Charlotte",
    "cuisine": "Mediterranean",
    "locationPrice": 2
  },
  "attendees": [
    {
      "userID": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "johndoe"
    },
    {
      "userID": "550e8400-e29b-41d4-a716-446655440003",
      "userName": "janedoe"
    }
  ]
}
```

### Invite Link Response
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "group_id": "660e8400-e29b-41d4-a716-446655440001",
  "code": "AbC123XyZ789qWeRtY098765",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2025-12-31T23:59:59Z",
  "max_uses": 10,
  "used_count": 3,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

**End of Mobile Implementation Guide**

This document provides a complete technical specification for implementing the Super Secret Supper mobile application. All features, flows, and data structures are documented to enable accurate mobile development that maintains feature parity with the web application.
