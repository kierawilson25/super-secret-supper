# Super Secret Supper - Testing & Improvement Plan

## Executive Summary
Based on comprehensive codebase analysis, this plan outlines critical testing, security hardening, and feature completion work organized by priority and assigned to specialized sub-agents.

---

## Available Sub-Agents

1. **nextjs-frontend-engineer** - Next.js/React/Tailwind development
2. **code-quality-reviewer** - Code review and refactoring
3. **Explore** - Codebase exploration and analysis
4. **Plan** - Architecture and implementation planning
5. **general-purpose** - Multi-step tasks and research

---

## Phase 1: Critical Security & Stability (Week 1)

### 1.1 Security Hardening 🔴 CRITICAL
**Sub-Agent:** code-quality-reviewer + nextjs-frontend-engineer

**Tasks:**
- [ ] Remove all debug console.log statements (66 instances)
- [ ] Replace Math.random() invite codes with crypto.randomBytes()
- [ ] Add server-side validation for all forms using Zod
- [ ] Configure Supabase Row Level Security (RLS) policies
- [ ] Add rate limiting to auth endpoints
- [ ] Implement CSRF protection
- [ ] Remove email addresses from pairing result displays

**Acceptance Criteria:**
- Zero console.log in production build
- All invite codes use cryptographic randomness
- RLS policies prevent unauthorized data access
- Login attempts limited to 5 per minute per IP

---

### 1.2 Error Handling & Boundaries 🔴 CRITICAL
**Sub-Agent:** nextjs-frontend-engineer

**Tasks:**
- [ ] Create global Error Boundary component
- [ ] Add error boundaries to all major page sections
- [ ] Implement graceful error messages for users
- [ ] Add Sentry or similar error tracking
- [ ] Handle network failures gracefully
- [ ] Add retry logic for failed Supabase queries

**Acceptance Criteria:**
- App never shows white screen on errors
- All errors logged to monitoring service
- Users see friendly error messages

---

### 1.3 Pairing Algorithm Edge Cases 🟡 HIGH
**Sub-Agent:** code-quality-reviewer + Plan

**Tasks:**
- [ ] Handle single member groups (show error)
- [ ] Handle empty groups (show error)
- [ ] Add maximum group size limit (prevent performance issues)
- [ ] Test duplicate location assignment prevention
- [ ] Optimize for groups >50 members
- [ ] Add progress indicator for large groups

**Acceptance Criteria:**
- Edge cases handled with clear error messages
- Algorithm runs in <5 seconds for 100 members
- No duplicate locations in same month

---

## Phase 2: Authentication & User Management (Week 2)

### 2.1 Complete Auth Flow 🟡 HIGH
**Sub-Agent:** nextjs-frontend-engineer

**Tasks:**
- [ ] Implement password reset flow
- [ ] Add email verification on signup
- [ ] Implement session refresh token rotation
- [ ] Add "Remember Me" functionality
- [ ] Implement OAuth providers (Google, GitHub)
- [ ] Add 2FA option for security-conscious users

**Acceptance Criteria:**
- Password reset works end-to-end
- Email verification required before group access
- Sessions auto-refresh without user logout

---

### 2.2 User Profile Enhancements 🟢 MEDIUM
**Sub-Agent:** nextjs-frontend-engineer

**Tasks:**
- [ ] Add profile photo upload
- [ ] Add bio/description field
- [ ] Add dietary restrictions field
- [ ] Add preferred locations preferences
- [ ] Add notification preferences
- [ ] Allow account deletion

**Acceptance Criteria:**
- Users can upload and crop profile photos
- Preferences saved and respected in pairings

---

## Phase 3: Testing Infrastructure (Week 2-3)

### 3.1 Unit Tests 🟡 HIGH
**Sub-Agent:** code-quality-reviewer

**Tasks:**
- [ ] Set up Jest and React Testing Library
- [ ] Write tests for all hooks (useProfile, useGroups, usePairings, etc.)
- [ ] Test pairing algorithm with various scenarios
- [ ] Test invite link validation logic
- [ ] Test form validation logic
- [ ] Aim for 80% code coverage

**Test Scenarios:**
```
usePairings:
- ✓ Even number of members (2, 4, 10, 50)
- ✓ Odd number of members (3, 5, 11, 51)
- ✓ Single member (should error)
- ✓ No members (should error)
- ✓ All members already paired (force re-pairing)
- ✓ Duplicate location prevention
- ✓ City filtering for locations
```

**Acceptance Criteria:**
- All hooks have >80% test coverage
- Pairing algorithm tests cover all edge cases
- Tests run in <30 seconds

---

### 3.2 Integration Tests 🟡 HIGH
**Sub-Agent:** general-purpose

**Tasks:**
- [ ] Test complete signup → create group → invite → pair flow
- [ ] Test admin vs non-admin permissions
- [ ] Test invite link expiration and max uses
- [ ] Test concurrent pairing generation (race conditions)
- [ ] Test Supabase connection failures

**Acceptance Criteria:**
- Happy path flows tested end-to-end
- Permission tests prevent unauthorized actions
- Race condition tests pass 100 consecutive runs

---

### 3.3 E2E Tests with Playwright 🟢 MEDIUM
**Sub-Agent:** general-purpose

**Tasks:**
- [ ] Create Playwright test suite structure
- [ ] Write signup/login flow tests
- [ ] Write group creation and management tests
- [ ] Write pairing generation tests
- [ ] Write mobile responsive tests
- [ ] Set up CI/CD to run tests on PR

**Test Files:**
```
tests/
├── auth.spec.ts (login, signup, logout)
├── groups.spec.ts (create, view, join)
├── invites.spec.ts (create, redeem, expire)
├── pairings.spec.ts (generate, view history)
├── profile.spec.ts (view, edit)
└── mobile.spec.ts (responsive tests)
```

**Acceptance Criteria:**
- Critical user flows tested in real browser
- Tests run on every PR in CI/CD
- Screenshot comparison for visual regression

---

## Phase 4: Email Notifications (Week 3)

### 4.1 AWS SES Integration 🟡 HIGH
**Sub-Agent:** Plan + general-purpose

**Tasks:**
- [ ] Complete AWS SES setup per ISSUE_EMAIL_NOTIFICATIONS.md
- [ ] Create email template system (use React Email or MJML)
- [ ] Implement queue system (use AWS SQS or BullMQ)
- [ ] Add email preferences to user profile
- [ ] Test email deliverability

**Email Templates:**
- Welcome email on signup
- Group invitation received
- New pairing generated
- Dinner reminder (1 day before)
- Weekly digest of upcoming dinners

**Acceptance Criteria:**
- All emails rendered properly in Gmail, Outlook, Apple Mail
- Users can opt-out of specific email types
- Email queue handles 1000+ emails without delays

---

## Phase 5: Performance & UX (Week 4)

### 5.1 Loading States & Skeletons 🟢 MEDIUM
**Sub-Agent:** nextjs-frontend-engineer

**Tasks:**
- [ ] Replace PageLoading with skeleton loaders
- [ ] Add optimistic UI updates (instant feedback)
- [ ] Implement React Query for caching and refetch
- [ ] Add stale-while-revalidate pattern
- [ ] Lazy load images with blur placeholder

**Acceptance Criteria:**
- No full-page loading spinners
- UI feels instant with optimistic updates
- Data caches for 5 minutes, revalidates in background

---

### 5.2 Accessibility (WCAG 2.1 AA) 🟢 MEDIUM
**Sub-Agent:** code-quality-reviewer + nextjs-frontend-engineer

**Tasks:**
- [ ] Add ARIA labels to all interactive elements
- [ ] Improve color contrast (audit with Lighthouse)
- [ ] Implement keyboard navigation for all features
- [ ] Add screen reader testing
- [ ] Add focus management to modals and menus
- [ ] Test with axe DevTools

**Acceptance Criteria:**
- Lighthouse accessibility score >95
- All actions accessible via keyboard
- Screen reader testing passes

---

### 5.3 Mobile Polish 🟢 MEDIUM
**Sub-Agent:** nextjs-frontend-engineer

**Tasks:**
- [ ] Optimize forms for mobile (autocomplete, input types)
- [ ] Add pull-to-refresh on list pages
- [ ] Improve hamburger menu animation and UX
- [ ] Test on real devices (iOS Safari, Android Chrome)
- [ ] Add PWA manifest and service worker

**Acceptance Criteria:**
- App installable as PWA
- Works offline for viewing history
- Touch targets meet minimum size (44x44px)

---

## Phase 6: Feature Completion (Week 5)

### 6.1 Group Management Features 🟡 HIGH
**Sub-Agent:** Plan + nextjs-frontend-engineer

**Tasks:**
- [ ] Implement edit group (name, city, cadence)
- [ ] Add remove member functionality (admin only)
- [ ] Add pause/resume group (stop pairing generation)
- [ ] Add archive group (hide from list)
- [ ] Add group photo upload
- [ ] Add admin transfer

**Acceptance Criteria:**
- All group management features tested
- Only admins can perform destructive actions
- Confirmation dialogs before destructive actions

---

### 6.2 Pairing Enhancements 🟢 MEDIUM
**Sub-Agent:** Plan + nextjs-frontend-engineer

**Tasks:**
- [ ] Add manual pairing override (admin can force pairs)
- [ ] Add "exclude from next pairing" flag per member
- [ ] Add notes field to dinners
- [ ] Add photo upload to dinner results
- [ ] Add RSVP confirmation (yes/no/maybe)
- [ ] Export pairing history to CSV

**Acceptance Criteria:**
- Admin can override algorithm results
- Members can mark unavailability
- Pairing history exportable

---

### 6.3 Search & Filters 🟢 LOW
**Sub-Agent:** nextjs-frontend-engineer

**Tasks:**
- [ ] Add search for groups (by name, city)
- [ ] Filter groups by city or cadence
- [ ] Search pairing history by member name
- [ ] Filter pairing history by date range
- [ ] Add sorting options (recent, oldest, name)

**Acceptance Criteria:**
- Search and filters work instantly
- Results update as user types (debounced)

---

## Phase 7: Analytics & Monitoring (Week 6)

### 7.1 Event Tracking 🟢 MEDIUM
**Sub-Agent:** general-purpose

**Tasks:**
- [ ] Set up PostHog or Mixpanel
- [ ] Track key events:
  - User signup
  - Group creation
  - Invite link creation/redemption
  - Pairing generation
  - Profile updates
- [ ] Create analytics dashboard
- [ ] Set up funnel analysis (signup → create group → generate pairing)

**Acceptance Criteria:**
- All key events tracked
- Dashboard shows conversion rates
- Can identify drop-off points in user journey

---

### 7.2 Application Monitoring 🟡 HIGH
**Sub-Agent:** general-purpose

**Tasks:**
- [ ] Set up Sentry for error tracking
- [ ] Add performance monitoring (Web Vitals)
- [ ] Set up uptime monitoring (UptimeRobot or Better Uptime)
- [ ] Create alerts for critical errors
- [ ] Monitor Supabase query performance

**Acceptance Criteria:**
- Errors reported within 1 minute
- Performance metrics tracked (LCP, FID, CLS)
- Alerts sent to team Slack/email

---

## Phase 8: Code Quality & Maintenance (Ongoing)

### 8.1 Code Review & Refactoring 🟡 HIGH
**Sub-Agent:** code-quality-reviewer

**Tasks:**
- [ ] Review all components for consistency
- [ ] Consolidate styling (remove inline styles)
- [ ] Create design system documentation
- [ ] Extract magic numbers to constants
- [ ] Improve TypeScript strict mode compliance
- [ ] Add JSDoc comments to complex functions

**Acceptance Criteria:**
- All components follow same patterns
- Zero inline styles (Tailwind only)
- Design system documented in Storybook

---

### 8.2 Documentation 🟢 MEDIUM
**Sub-Agent:** general-purpose

**Tasks:**
- [ ] Write developer onboarding guide
- [ ] Document database schema and relationships
- [ ] Create API documentation (if building API layer)
- [ ] Document deployment process
- [ ] Create user help documentation
- [ ] Write contribution guidelines

**Acceptance Criteria:**
- New developer can set up project in <30 minutes
- All database tables documented
- Deployment process automated

---

## Testing Checklist (from TESTING_PROGRESS.md)

### Completed ✅
- [x] Login/logout flow
- [x] Profile page viewing

### In Progress 🔄
- [ ] Create group flow
  - [ ] Form validation
  - [ ] City selection
  - [ ] Success redirect

### Pending ❌
- [ ] View groups page
- [ ] Group management page
- [ ] Invite link creation
- [ ] Invite link redemption
- [ ] Member management
- [ ] Pairing generation
- [ ] Pairing history viewing
- [ ] Pairing history by month

---

## Sub-Agent Assignment Summary

| Phase | Primary Agent | Support Agent | Estimated Hours |
|-------|--------------|---------------|-----------------|
| 1.1 Security Hardening | code-quality-reviewer | nextjs-frontend-engineer | 16 hours |
| 1.2 Error Boundaries | nextjs-frontend-engineer | - | 8 hours |
| 1.3 Algorithm Edge Cases | code-quality-reviewer | Plan | 12 hours |
| 2.1 Auth Flow | nextjs-frontend-engineer | - | 20 hours |
| 2.2 Profile Enhancements | nextjs-frontend-engineer | - | 12 hours |
| 3.1 Unit Tests | code-quality-reviewer | - | 24 hours |
| 3.2 Integration Tests | general-purpose | - | 16 hours |
| 3.3 E2E Tests | general-purpose | - | 20 hours |
| 4.1 Email Notifications | Plan | general-purpose | 24 hours |
| 5.1 Loading States | nextjs-frontend-engineer | - | 12 hours |
| 5.2 Accessibility | code-quality-reviewer | nextjs-frontend-engineer | 16 hours |
| 5.3 Mobile Polish | nextjs-frontend-engineer | - | 12 hours |
| 6.1 Group Management | Plan | nextjs-frontend-engineer | 20 hours |
| 6.2 Pairing Enhancements | Plan | nextjs-frontend-engineer | 16 hours |
| 6.3 Search & Filters | nextjs-frontend-engineer | - | 8 hours |
| 7.1 Event Tracking | general-purpose | - | 12 hours |
| 7.2 Monitoring | general-purpose | - | 8 hours |
| 8.1 Code Review | code-quality-reviewer | - | 16 hours |
| 8.2 Documentation | general-purpose | - | 12 hours |

**Total Estimated Effort:** ~284 hours (~7 weeks @ 40 hours/week)

---

## Priority Quick Reference

🔴 **CRITICAL (Do First):**
- Security hardening (remove console.logs, secure invite codes, RLS)
- Error boundaries
- Algorithm edge cases

🟡 **HIGH (Do Soon):**
- Complete auth flow (password reset, email verification)
- Unit and integration tests
- Email notifications
- Group management features
- Application monitoring

🟢 **MEDIUM (Nice to Have):**
- User profile enhancements
- E2E tests
- Loading states and performance
- Accessibility
- Mobile polish
- Pairing enhancements
- Analytics
- Code quality improvements
- Documentation

⚪ **LOW (Future):**
- Search and filters
- Advanced features

---

## Next Steps

1. **Immediate:** Run code-quality-reviewer on entire codebase to identify security issues
2. **This Week:** Implement Phase 1 (Security & Stability)
3. **Next Week:** Set up testing infrastructure (Phase 3)
4. **Ongoing:** Use sub-agents for each phase as outlined above

---

## Notes for Sub-Agent Usage

### When to use each agent:

**nextjs-frontend-engineer:**
- Building new pages or components
- Implementing UI/UX features
- Tailwind CSS work
- React hooks and state management

**code-quality-reviewer:**
- Code reviews before merging
- Refactoring messy code
- TypeScript improvements
- Security audits
- Testing strategy

**Plan:**
- Architecture decisions
- Database schema changes
- Complex feature planning
- API design

**Explore:**
- Understanding codebase areas
- Finding related code
- Investigating bugs

**general-purpose:**
- Research (best practices, libraries)
- Multi-step workflows
- Documentation writing
- DevOps tasks
- Testing setup

---

## Success Metrics

**Code Quality:**
- TypeScript strict mode: 100% compliance
- Test coverage: >80%
- Lighthouse score: >90 (all categories)
- Zero critical security issues

**User Experience:**
- Page load time: <2 seconds
- Time to interactive: <3 seconds
- Mobile usability score: >95
- Zero critical bugs in production

**Business:**
- User signup conversion: >40%
- Group creation rate: >50% of signups
- Pairing generation success: >95%
- User retention (30 day): >60%
