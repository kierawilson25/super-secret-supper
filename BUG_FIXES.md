# Bug Fixes for Phase 1 Security QA Issues

This document provides exact code changes needed to address the issues found during QA testing.

---

## Bug #1: Console Logging - Production Safety

**Severity:** HIGH (Monitoring Required)
**File:** `src/lib/logger.ts`
**Status:** Code is already correct, but add extra safety

### Current Code (Lines 27-52)

The current implementation already disables debug logs in production:

```typescript
private log(level: LogLevel, message: string, context?: LogContext): void {
  if (this.isProduction && level === 'debug') return;

  const sanitizedContext = context ? this.sanitize(context) : undefined;

  if (this.isProduction) {
    // TODO: Send to logging service (e.g., Sentry, LogRocket, Datadog)
    // this.sendToLoggingService(level, message, sanitizedContext);
    return;
  }

  // Development only - log to console
  const timestamp = new Date().toISOString();
  const logData = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

  switch (level) {
    case 'error':
      console.error(logData, sanitizedContext || '');
      break;
    case 'warn':
      console.warn(logData, sanitizedContext || '');
      break;
    default:
      console.log(logData, sanitizedContext || '');
  }
}
```

### Verification Steps

1. **Check NODE_ENV in production:**
   ```bash
   # In production, ensure NODE_ENV=production
   echo $NODE_ENV
   ```

2. **Test production build locally:**
   ```bash
   npm run build
   NODE_ENV=production npm start
   # Open browser console - should see NO app logs
   ```

3. **Optional: Add explicit console override for extra safety**

   If you want to be extra cautious, add this to the top of `logger.ts`:

   ```typescript
   // At the top of the file, after imports
   if (process.env.NODE_ENV === 'production') {
     // Override console methods in production
     const noop = () => {};
     console.log = noop;
     console.debug = noop;
     console.info = noop;
     // Keep console.error and console.warn for critical issues
   }
   ```

   **⚠️ WARNING:** This is aggressive and will disable ALL console logs, including from libraries. Only use if you're certain.

### Recommended Action

✅ **No code changes needed** - Current implementation is secure.

**Action Items:**
1. Verify `NODE_ENV=production` in deployment
2. Test production build to confirm no logs appear
3. Plan integration with logging service (Sentry, LogRocket)

---

## Bug #2: Email Validation Regex

**Severity:** MEDIUM
**File:** `src/app/signup/page.tsx`
**Status:** Needs fix
**Time to Fix:** 30 minutes

### Current Code (Lines 28-37)

```typescript
const validateForm = (): boolean => {
  const newErrors: typeof errors = {};

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    newErrors.email = 'Please enter a valid email';
  }
```

### Problem

The current regex accepts invalid emails like:
- `notanemail` (no @)
- `@example.com` (no local part)
- `user@` (no domain)
- `a@b.c` (too short, but technically valid)

### Fix: Replace the regex

```typescript
const validateForm = (): boolean => {
  const newErrors: typeof errors = {};

  // Email validation - improved regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    newErrors.email = 'Please enter a valid email';
  }
```

### What This Regex Does

- `^[a-zA-Z0-9._%+-]+` - Local part (before @) must have alphanumeric and common special chars
- `@` - Literal @ symbol
- `[a-zA-Z0-9.-]+` - Domain name must have alphanumeric, dots, and hyphens
- `\.` - Literal dot before TLD
- `[a-zA-Z]{2,}$` - TLD must be at least 2 letters (e.g., .com, .io, .museum)

### Test Cases

After fixing, test with these values:

**Should REJECT:**
- `notanemail` ✅
- `@example.com` ✅
- `user@` ✅
- `user@domain` ✅
- `user@domain.` ✅
- `user @domain.com` ✅
- `user@domain .com` ✅

**Should ACCEPT:**
- `user@example.com` ✅
- `test.user@example.com` ✅
- `user+tag@example.co.uk` ✅
- `user123@test-domain.io` ✅

### Complete Fixed Function

```typescript
const validateForm = (): boolean => {
  const newErrors: typeof errors = {};

  // Email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    newErrors.email = 'Please enter a valid email';
  }

  // Username validation
  if (!username) {
    newErrors.username = 'Username is required';
  } else if (username.length < 3) {
    newErrors.username = 'Username must be at least 3 characters';
  } else if (username.length > 50) {
    newErrors.username = 'Username must be less than 50 characters';
  }

  // Password validation
  if (!password) {
    newErrors.password = 'Password is required';
  } else if (password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }

  // Confirm password validation
  if (!confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Testing the Fix

1. **Manual Test:**
   ```bash
   npm run dev
   # Navigate to http://localhost:3002/signup
   # Try invalid emails:
   # - "notanemail" → Should show error
   # - "@example.com" → Should show error
   # - "user@" → Should show error
   # - "valid@email.com" → Should NOT show error
   ```

2. **Automated Test:**
   ```bash
   npx playwright test qa-security-test.spec.ts -g "email validation"
   # All 4 invalid emails should now be rejected
   ```

---

## Optional Enhancement: Add Password Strength Indicator

**Priority:** Low (Future enhancement)
**File:** `src/app/signup/page.tsx`

If you want to add a visual password strength indicator:

```typescript
// Add this helper function
const getPasswordStrength = (pwd: string): { strength: string; color: string } => {
  if (pwd.length === 0) return { strength: '', color: '' };
  if (pwd.length < 8) return { strength: 'Too short', color: 'text-red-400' };

  let score = 0;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  if (score <= 2) return { strength: 'Weak', color: 'text-yellow-400' };
  if (score === 3) return { strength: 'Medium', color: 'text-blue-400' };
  return { strength: 'Strong', color: 'text-green-400' };
};

// In your component
const [passwordStrength, setPasswordStrength] = useState({ strength: '', color: '' });

// When password changes
const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newPassword = e.target.value;
  setPassword(newPassword);
  setPasswordStrength(getPasswordStrength(newPassword));
  setErrors({ ...errors, password: undefined });
};

// In your JSX, after password input
{password && passwordStrength.strength && (
  <p className={`text-sm mt-1 ${passwordStrength.color}`}>
    Password strength: {passwordStrength.strength}
  </p>
)}
```

---

## Verification Checklist

After applying fixes:

- [ ] Email validation rejects "notanemail"
- [ ] Email validation rejects "@example.com"
- [ ] Email validation rejects "user@"
- [ ] Email validation accepts "valid@email.com"
- [ ] Production build has no console logs
- [ ] All Playwright tests pass
- [ ] Manual testing of signup form complete

---

## Deployment Checklist

Before deploying to production:

- [ ] NODE_ENV=production is set
- [ ] Email validation fix is applied
- [ ] Production build tested locally
- [ ] No console logs in production build
- [ ] Security headers verified
- [ ] Error boundary tested
- [ ] All QA tests pass

---

## Need Help?

If you encounter issues applying these fixes:

1. **Email validation not working:**
   - Make sure you're editing `src/app/signup/page.tsx`
   - Clear browser cache and refresh
   - Check browser console for React errors

2. **Console logs still appearing:**
   - Check `process.env.NODE_ENV`
   - Rebuild the application: `npm run build`
   - Clear Next.js cache: `rm -rf .next`

3. **Tests failing:**
   - Run `npm run dev` first
   - Wait for server to be fully ready
   - Run tests: `npx playwright test`

---

**Last Updated:** December 18, 2025
**Version:** 1.0
