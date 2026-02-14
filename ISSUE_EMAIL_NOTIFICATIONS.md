# Feature Request: Email Notifications with AWS SES

## Overview
Implement email notifications for Super Secret Supper to keep users engaged and informed about dinner pairings, group invitations, and important updates.

## Priority
**Medium-High** - Enhances user engagement and reduces missed dinners

## User Stories

1. **As a group member**, I want to receive an email when I'm paired for a dinner, so I know when and where to meet my dinner partner
2. **As a user**, I want to receive an email when someone invites me to join a group, so I don't miss the invitation
3. **As a group admin**, I want to receive confirmation emails when I create pairings, so I have a record of the event
4. **As a user**, I want to receive a welcome email when I sign up, so I feel welcomed and know next steps

## Email Types to Implement

### Phase 1: Core Notifications (MVP)
1. **Welcome Email** - Sent immediately after signup
2. **Dinner Pairing Notification** - Sent when user is paired for a dinner
3. **Invite Link Email** - Sent when admin shares an invite link (optional, admin can manually share)

### Phase 2: Engagement Notifications
4. **Upcoming Dinner Reminder** - 2 days before scheduled dinner
5. **Group Joined Confirmation** - When user successfully joins a group via invite
6. **New Member Alert** - Notify admin when someone joins their group

### Phase 3: Advanced Notifications
7. **Dinner Feedback Request** - After dinner date passes, ask for feedback
8. **Inactive Group Alert** - Remind admin to generate pairings if no activity
9. **Monthly Summary** - Monthly recap of dinners and group activity

---

## AWS SES Setup Instructions

### Prerequisites
- AWS Account (free tier includes 62,000 emails/month when sending from EC2)
- Verified domain or email addresses
- AWS Access Keys with SES permissions

### Step 1: Set Up AWS SES

#### 1.1 Create AWS Account & Navigate to SES
```bash
1. Go to https://aws.amazon.com/
2. Sign in or create account
3. Navigate to AWS Console → SES (Simple Email Service)
4. Select your preferred region (e.g., us-east-1)
```

#### 1.2 Verify Email Address (For Testing)
```bash
1. In SES Console, go to "Verified identities"
2. Click "Create identity"
3. Select "Email address"
4. Enter your email (e.g., noreply@supersecretsupper.com)
5. Click "Create identity"
6. Check your inbox and click verification link
7. Status should change to "Verified"
```

#### 1.3 Request Production Access (Move out of Sandbox)
By default, SES is in "sandbox mode" and can only send to verified addresses.

```bash
1. In SES Console, click "Account dashboard"
2. Look for "Sending statistics" section
3. Click "Request production access" button
4. Fill out the form:
   - Mail Type: Transactional
   - Website URL: Your app URL
   - Use case description: "Transactional emails for dinner pairing app"
   - Compliance: Explain how users opt-in (account signup)
   - Bounce/complaint handling: Describe your plan
5. Submit request (usually approved within 24 hours)
```

#### 1.4 Create IAM User for Sending Emails
```bash
1. Go to IAM Console → Users → Create user
2. Username: "ses-email-sender"
3. Attach policy: "AmazonSESFullAccess" (or create custom policy)
4. Create user
5. Go to Security Credentials → Create access key
6. Select "Application running outside AWS"
7. Copy Access Key ID and Secret Access Key (save securely!)
```

**Custom IAM Policy (Recommended - More Restrictive):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 1.5 Configure DKIM (Optional but Recommended)
Improves email deliverability.

```bash
1. Go to SES → Verified identities
2. Select your verified email/domain
3. Click "DKIM" tab
4. Click "Edit" → Enable DKIM
5. If using a domain, add CNAME records to your DNS
```

### Step 2: Set Up Environment Variables

Add these to your `.env.local` file:

```bash
# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SES_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_SES_FROM_EMAIL=noreply@supersecretsupper.com
AWS_SES_FROM_NAME="Super Secret Supper"

# Email Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
EMAIL_ENABLED=true  # Set to false to disable emails in development
```

**IMPORTANT:** Add `.env.local` to `.gitignore` if not already there!

```bash
echo ".env.local" >> .gitignore
```

### Step 3: Install AWS SDK

```bash
npm install @aws-sdk/client-ses
```

---

## Implementation Plan

### File Structure
```
src/
├── lib/
│   ├── email/
│   │   ├── ses.ts                  # AWS SES client configuration
│   │   ├── templates/
│   │   │   ├── welcome.ts          # Welcome email template
│   │   │   ├── dinner-pairing.ts   # Dinner pairing notification
│   │   │   ├── invite.ts           # Invite link email
│   │   │   └── base.ts             # Base email template (layout)
│   │   └── send.ts                 # Email sending utility functions
```

### Step 4: Create Email Service

#### 4.1 Create SES Client (`src/lib/email/ses.ts`)

```typescript
import { SESClient } from '@aws-sdk/client-ses';

// Initialize AWS SES client
export const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
  },
});

export const EMAIL_CONFIG = {
  fromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@supersecretsupper.com',
  fromName: process.env.AWS_SES_FROM_NAME || 'Super Secret Supper',
  enabled: process.env.EMAIL_ENABLED !== 'false',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
```

#### 4.2 Create Base Email Template (`src/lib/email/templates/base.ts`)

```typescript
export function baseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Secret Supper</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f4f0;
">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="
          width: 600px;
          max-width: 90%;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <!-- Header -->
          <tr>
            <td style="
              background-color: #460C58;
              padding: 32px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            ">
              <h1 style="
                margin: 0;
                color: #FBE6A6;
                font-size: 32px;
                font-weight: bold;
              ">Super Secret Supper</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background-color: #f8f4f0;
              padding: 24px 32px;
              text-align: center;
              border-radius: 0 0 8px 8px;
            ">
              <p style="
                margin: 0 0 8px 0;
                color: #666;
                font-size: 14px;
              ">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #460C58; text-decoration: none;">
                  supersecretsupper.com
                </a>
              </p>
              <p style="
                margin: 0;
                color: #999;
                font-size: 12px;
              ">
                You're receiving this email because you're part of Super Secret Supper.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
```

#### 4.3 Create Welcome Email Template (`src/lib/email/templates/welcome.ts`)

```typescript
import { baseEmailTemplate } from './base';

export interface WelcomeEmailData {
  username: string;
  email: string;
}

export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  const content = `
    <h2 style="color: #460C58; margin: 0 0 16px 0;">Welcome to Super Secret Supper, ${data.username}! 🎉</h2>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
      We're thrilled to have you join our community! Super Secret Supper is all about turning casual acquaintances into genuine friends through meaningful dinner connections.
    </p>

    <h3 style="color: #460C58; margin: 24px 0 12px 0;">What's Next?</h3>

    <ul style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">
      <li><strong>Join a Group:</strong> Ask a friend for an invite link to their dinner group</li>
      <li><strong>Create Your Own:</strong> Start a group and invite your friends</li>
      <li><strong>Get Paired:</strong> We'll match you with someone for a one-on-one dinner each month</li>
    </ul>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/groups" style="
        display: inline-block;
        background-color: #460C58;
        color: #FBE6A6;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 16px;
      ">Get Started</a>
    </div>

    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
      Have questions? Just reply to this email – we'd love to hear from you!
    </p>
  `;

  return baseEmailTemplate(content);
}

export function welcomeEmailSubject(username: string): string {
  return `Welcome to Super Secret Supper, ${username}! 🍽️`;
}
```

#### 4.4 Create Dinner Pairing Email Template (`src/lib/email/templates/dinner-pairing.ts`)

```typescript
import { baseEmailTemplate } from './base';

export interface DinnerPairingEmailData {
  username: string;
  partnerName: string;
  partnerNames?: string[]; // For groups of 3
  groupName: string;
  locationName?: string;
  locationCity?: string;
  dinnerDate: string; // ISO date string
  pairingsPageUrl: string;
}

export function dinnerPairingEmailTemplate(data: DinnerPairingEmailData): string {
  const isGroupOfThree = data.partnerNames && data.partnerNames.length > 1;
  const partnersText = isGroupOfThree
    ? data.partnerNames!.join(' and ')
    : data.partnerName;

  const dinnerDateFormatted = new Date(data.dinnerDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <h2 style="color: #460C58; margin: 0 0 16px 0;">You've Been Paired! 🎉</h2>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Great news, ${data.username}! You've been matched for your next ${data.groupName} dinner.
    </p>

    <div style="
      background-color: #f8f4f0;
      padding: 24px;
      border-radius: 8px;
      margin: 0 0 24px 0;
      border-left: 4px solid #460C58;
    ">
      <p style="color: #460C58; font-weight: bold; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase;">
        Dinner Details
      </p>

      <p style="color: #333; font-size: 16px; margin: 0 0 8px 0;">
        <strong>👥 Dining with:</strong> ${partnersText}
      </p>

      ${data.locationName ? `
        <p style="color: #333; font-size: 16px; margin: 0 0 8px 0;">
          <strong>📍 Location:</strong> ${data.locationName}${data.locationCity ? `, ${data.locationCity}` : ''}
        </p>
      ` : ''}

      <p style="color: #333; font-size: 16px; margin: 0;">
        <strong>📅 Month:</strong> ${dinnerDateFormatted}
      </p>
    </div>

    <h3 style="color: #460C58; margin: 24px 0 12px 0;">What's Next?</h3>

    <ol style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">
      <li>Reach out to your dinner partner${isGroupOfThree ? 's' : ''} to pick a date this month</li>
      <li>Make a reservation at the suggested location (or choose your own!)</li>
      <li>Show up, have a great conversation, and build a real connection 🍽️</li>
    </ol>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.pairingsPageUrl}" style="
        display: inline-block;
        background-color: #460C58;
        color: #FBE6A6;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 16px;
      ">View Pairing Details</a>
    </div>

    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; font-style: italic;">
      💡 Pro tip: Don't overthink it! The goal is to get to know each other – conversation will flow naturally.
    </p>
  `;

  return baseEmailTemplate(content);
}

export function dinnerPairingEmailSubject(groupName: string): string {
  return `Your ${groupName} dinner pairing is ready! 🍽️`;
}
```

#### 4.5 Create Email Sending Utility (`src/lib/email/send.ts`)

```typescript
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient, EMAIL_CONFIG } from './ses';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  // Skip sending if emails are disabled (e.g., in development)
  if (!EMAIL_CONFIG.enabled) {
    console.log('📧 Email sending is disabled. Would have sent:');
    console.log('  To:', params.to);
    console.log('  Subject:', params.subject);
    return true;
  }

  const toAddresses = Array.isArray(params.to) ? params.to : [params.to];

  const command = new SendEmailCommand({
    Source: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: params.htmlBody,
          Charset: 'UTF-8',
        },
        ...(params.textBody && {
          Text: {
            Data: params.textBody,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    console.log('✅ Email sent successfully:', response.MessageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Convenience functions for specific email types
export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const { welcomeEmailTemplate, welcomeEmailSubject } = await import('./templates/welcome');

  const htmlBody = welcomeEmailTemplate({ email, username });
  const subject = welcomeEmailSubject(username);

  return sendEmail({
    to: email,
    subject,
    htmlBody,
  });
}

export async function sendDinnerPairingEmail(
  email: string,
  data: import('./templates/dinner-pairing').DinnerPairingEmailData
): Promise<boolean> {
  const { dinnerPairingEmailTemplate, dinnerPairingEmailSubject } = await import('./templates/dinner-pairing');

  const htmlBody = dinnerPairingEmailTemplate(data);
  const subject = dinnerPairingEmailSubject(data.groupName);

  return sendEmail({
    to: email,
    subject,
    htmlBody,
  });
}
```

### Step 5: Integrate Email Sending

#### 5.1 Send Welcome Email on Signup

Modify `/src/app/signup/page.tsx`:

```typescript
import { sendWelcomeEmail } from '@/lib/email/send';

// In handleSignUp function, after successful signup:
if (authData.user) {
  console.log('Auth account created, updating username...');

  // Update username in people table
  const { error: updateError } = await supabase
    .from('people')
    .update({ username: username })
    .eq('userid', authData.user.id);

  if (updateError) {
    console.error('Error updating username:', updateError);
  }

  // Send welcome email (don't block on this)
  sendWelcomeEmail(email, username).catch(err => {
    console.error('Failed to send welcome email:', err);
    // Don't fail signup if email fails
  });
}
```

#### 5.2 Send Pairing Notifications

Modify `/src/hooks/usePairings.ts` or create an API route to send emails after pairing:

```typescript
// After generating pairs successfully, send emails to each person
for (const pair of generatedPairs) {
  const person1Email = await getUserEmail(pair.person1.userid);
  const person2Email = await getUserEmail(pair.person2.userid);

  if (person1Email) {
    await sendDinnerPairingEmail(person1Email, {
      username: pair.person1.username,
      partnerName: pair.person2.username,
      partnerNames: pair.person3 ? [pair.person2.username, pair.person3.username] : undefined,
      groupName: groupName,
      locationName: pair.location?.locationName,
      locationCity: pair.location?.locationCity,
      dinnerDate: new Date().toISOString(),
      pairingsPageUrl: `${EMAIL_CONFIG.appUrl}/groups/${groupId}/pairs`
    });
  }

  // Send to person2 and person3 if exists...
}
```

### Step 6: Create API Route for Email Testing

Create `/src/app/api/test-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json();

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username are required' },
        { status: 400 }
      );
    }

    const success = await sendWelcomeEmail(email, username);

    if (success) {
      return NextResponse.json({ message: 'Test email sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test email route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Testing Checklist

### Local Testing (Before AWS SES)
- [ ] Set `EMAIL_ENABLED=false` in `.env.local`
- [ ] Test signup flow - check console logs for "would have sent" messages
- [ ] Test pairing generation - verify email logic runs without errors

### AWS SES Testing (Sandbox Mode)
- [ ] Verify your email address in AWS SES
- [ ] Set `EMAIL_ENABLED=true` and add AWS credentials to `.env.local`
- [ ] Send test email via API route: `POST /api/test-email`
- [ ] Check inbox for test email
- [ ] Verify email formatting looks good (open in Gmail, Outlook, etc.)
- [ ] Check AWS SES Console for sent email metrics

### Production Testing (After SES Approval)
- [ ] Request production access from AWS
- [ ] Wait for approval (usually 24 hours)
- [ ] Test sending to non-verified email addresses
- [ ] Monitor bounce and complaint rates in SES dashboard
- [ ] Set up bounce/complaint handling (optional but recommended)

### Email Template Testing
- [ ] Test welcome email with different usernames
- [ ] Test dinner pairing email (2-person pair)
- [ ] Test dinner pairing email (3-person group)
- [ ] Test email with and without location data
- [ ] Test on mobile devices
- [ ] Test in dark mode (if applicable)

---

## Cost Estimates

### AWS SES Pricing (as of 2024)
- **First 62,000 emails/month:** FREE (when sent from EC2, Lambda, or Elastic Beanstalk)
- **Outside free tier:** $0.10 per 1,000 emails
- **Received emails:** $0.10 per 1,000 emails

### Example Scenarios
- **100 users, 2 emails/month each:** 200 emails = FREE
- **1,000 users, 4 emails/month each:** 4,000 emails = FREE
- **10,000 users, 5 emails/month each:** 50,000 emails = FREE
- **100,000 users, 3 emails/month each:** 300,000 emails = ~$24/month

---

## Security Best Practices

### 1. Protect AWS Credentials
```bash
# NEVER commit these to Git
AWS_SES_ACCESS_KEY_ID=xxx
AWS_SES_SECRET_ACCESS_KEY=xxx

# Use environment variables
# Consider AWS Secrets Manager for production
```

### 2. Rate Limiting
Implement rate limiting to prevent email spam:

```typescript
// Example: Limit welcome emails to 1 per email address per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const emailRateLimits = new Map<string, number>();

function canSendEmail(email: string): boolean {
  const lastSent = emailRateLimits.get(email);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_WINDOW) {
    return false;
  }
  return true;
}
```

### 3. Email Validation
Always validate email addresses before sending:

```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 4. Unsubscribe Links (For Marketing Emails)
If you add marketing emails later, include unsubscribe links:

```typescript
<p style="text-align: center; margin: 16px 0;">
  <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #999; font-size: 12px;">
    Unsubscribe from these emails
  </a>
</p>
```

---

## Future Enhancements

### Email Analytics
- Track open rates (add tracking pixel)
- Track click-through rates (add UTM parameters)
- Monitor bounce and complaint rates

### Email Scheduling
- Schedule reminder emails (e.g., 2 days before dinner)
- Queue emails for batch sending
- Use AWS EventBridge or a cron job

### Advanced Templates
- Use a template engine (Handlebars, EJS)
- Support for multi-language emails
- Personalized content based on user preferences

### Email Preferences
- Allow users to opt out of certain email types
- Email frequency settings (daily digest vs immediate)
- Preference center in user profile

---

## Success Metrics

Track these metrics to measure email effectiveness:

- [ ] Email delivery rate (should be >95%)
- [ ] Open rate (aim for >20% for transactional emails)
- [ ] Click-through rate
- [ ] Bounce rate (should be <5%)
- [ ] Complaint rate (should be <0.1%)
- [ ] User engagement after receiving pairing emails

---

## Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/)
- [Email Best Practices](https://docs.aws.amazon.com/ses/latest/dg/send-email-best-practices.html)
- [HTML Email Templates](https://www.campaignmonitor.com/css/)
- [Can I Email?](https://www.caniemail.com/) - CSS support in email clients

---

## Acceptance Criteria

This feature is complete when:

- [ ] AWS SES is configured and verified
- [ ] Welcome emails are sent on signup
- [ ] Dinner pairing emails are sent when pairs are generated
- [ ] All emails are mobile-responsive
- [ ] Email sending is logged and monitored
- [ ] Error handling is in place (failed sends don't break the app)
- [ ] Documentation is updated with setup instructions
- [ ] All tests pass

---

## Estimated Effort

- **AWS SES Setup:** 1-2 hours
- **Email Templates:** 3-4 hours
- **Integration:** 2-3 hours
- **Testing:** 2 hours
- **Total:** ~8-11 hours

---

## Dependencies

- AWS Account with SES access
- @aws-sdk/client-ses npm package
- Environment variables configured
- Production access approved (for non-sandbox use)

---

## Labels
`enhancement` `email` `aws` `infrastructure` `user-engagement`

## Assignee
TBD

## Milestone
v1.1 - User Engagement Features
