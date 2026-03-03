'use client';

import { PageContainer, ContentContainer, Footer, PageHeader } from '@/components';

const EFFECTIVE_DATE = 'March 3, 2026';
const COMPANY = 'Full Circle Dining LLC';
const CONTACT_EMAIL = 'kiera.wilson025@gmail.com';
const APP_NAME = 'Circles';

const sectionHeading: React.CSSProperties = {
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  fontWeight: 700,
  marginBottom: '10px',
  marginTop: '32px',
  letterSpacing: '0.02em',
};

const subHeading: React.CSSProperties = {
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.95rem',
  fontWeight: 600,
  marginBottom: '6px',
  marginTop: '20px',
};

const body: React.CSSProperties = {
  color: 'rgba(248,244,240,0.85)',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.75,
  marginBottom: '12px',
};

const listStyle: React.CSSProperties = {
  ...body,
  paddingLeft: '20px',
  marginBottom: '12px',
};

const divider: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'rgba(251,230,166,0.15)',
  margin: '8px 0 16px',
};

const linkStyle: React.CSSProperties = {
  color: '#FBE6A6',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};

const thStyle: React.CSSProperties = {
  color: '#FBE6A6',
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '1px solid rgba(251,230,166,0.25)',
  fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  color: 'rgba(248,244,240,0.8)',
  padding: '8px 12px',
  borderBottom: '1px solid rgba(248,244,240,0.08)',
  verticalAlign: 'top',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  lineHeight: 1.6,
};


export default function PrivacyPolicyPage() {
  return (
    <PageContainer>
      <ContentContainer>
        <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 16px 120px' }}>
          <PageHeader>Privacy Policy</PageHeader>

          <p style={{ ...body, textAlign: 'center', color: 'rgba(248,244,240,0.6)', marginBottom: '8px' }}>
            Effective {EFFECTIVE_DATE} &mdash; Last updated {EFFECTIVE_DATE}
          </p>

          <div style={divider} />

          {/* Intro */}
          <p style={{ ...body, marginTop: '8px' }}>
            {COMPANY} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates {APP_NAME}, a dinner matchmaking app that
            pairs members of friend groups for one-on-one dinners. This Privacy Policy explains what
            personal information we collect, how we use it, and your rights regarding that information.
          </p>
          <p style={body}>
            By using {APP_NAME}, you agree to the collection and use of information in accordance with
            this policy.
          </p>


          {/* 1 */}
          <h2 id="section-1" style={sectionHeading}>1. Information We Collect</h2>
          <p style={body}>We collect the following categories of personal information:</p>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '16px' }} role="region" aria-label="Data collection table, scroll to see all columns">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }} aria-label="Types of personal data collected">
              <caption style={{ display: 'none' }}>Types of personal data collected by Circles</caption>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Data Type</th>
                  <th style={thStyle}>How Collected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Contact Info</td>
                  <td style={tdStyle}>Email address</td>
                  <td style={tdStyle}>Provided by you at registration</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Profile Info</td>
                  <td style={tdStyle}>Username / display name</td>
                  <td style={tdStyle}>Provided by you during profile setup</td>
                </tr>
                <tr>
                  <td style={tdStyle}>User Content</td>
                  <td style={tdStyle}>Profile picture</td>
                  <td style={tdStyle}>Uploaded by you (optional)</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Identifiers</td>
                  <td style={tdStyle}>User ID</td>
                  <td style={tdStyle}>Generated automatically when you create an account</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Usage Data</td>
                  <td style={tdStyle}>App interactions, feature usage, session data <em style={{ opacity: 0.65 }}>(not linked to your identity)</em></td>
                  <td style={tdStyle}>Collected automatically during app use</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={body}>
            We do not collect your precise location, financial information, health data, or any
            sensitive personal information.
          </p>

          {/* 2 */}
          <h2 id="section-2" style={sectionHeading}>2. How We Use Your Information</h2>
          <p style={body}>We use the information we collect to:</p>
          <ul style={listStyle}>
            <li>Create and maintain your account</li>
            <li>Display your profile (username and photo) to other members of your dinner circles</li>
            <li>Facilitate dinner pairings between circle members based on submitted availability</li>
            <li>Send transactional communications such as pairing notifications and account verification emails</li>
            <li>Improve the App&apos;s features, performance, and user experience using aggregated, anonymized analytics</li>
            <li>Respond to support requests and inquiries</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p style={body}>
            We do not use your personal information for targeted advertising, and we do not build
            advertising profiles based on your data.
          </p>

          {/* 3 */}
          <h2 id="section-3" style={sectionHeading}>3. How We Share Your Information</h2>
          <p style={body}>
            We do not sell your personal information. We share your information only in the following
            limited circumstances:
          </p>

          <h3 style={subHeading}>Within the App</h3>
          <p style={body}>
            Your username and profile picture are visible to other members of circles you join or
            create. Your dinner partner&apos;s identity is revealed only after both parties have accepted a
            pairing invite.
          </p>

          <h3 style={subHeading}>Service Providers</h3>
          <p style={body}>
            We share data with trusted third-party service providers who assist us in operating the App:
          </p>
          <ul style={listStyle}>
            <li>
              <strong style={{ color: '#F8F4F0' }}>Supabase</strong> — our database and authentication
              provider. Your account data, profile information, and availability data are stored in
              Supabase&apos;s hosted infrastructure. Supabase processes data in accordance with their{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Supabase Privacy Policy (opens in new tab)"
                style={linkStyle}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
              >
                Privacy Policy ↗
              </a>
              .
            </li>
            <li>
              <strong style={{ color: '#F8F4F0' }}>Analytics</strong> — we use a third-party analytics
              provider to understand how users interact with the App in aggregate. Analytics data is
              anonymized and is not linked to your name or email address. We do not share your personal
              data with any analytics provider in a form that identifies you individually.
            </li>
          </ul>

          <h3 style={subHeading}>Legal Requirements</h3>
          <p style={body}>
            We may disclose your information if required to do so by law or in response to valid legal
            process (e.g., a subpoena or court order).
          </p>

          <p style={body}>
            We do not share your personal data with third-party artificial intelligence systems for
            training or processing purposes.
          </p>

          {/* 4 */}
          <h2 id="section-4" style={sectionHeading}>4. Data Linked to You</h2>
          <p style={body}>
            The following data types are collected and linked to your identity within {APP_NAME}:
          </p>
          <ul style={listStyle}>
            <li>Email address</li>
            <li>Username / display name</li>
            <li>Profile picture</li>
            <li>User ID</li>
          </ul>
          <p style={body}>
            Usage data (app interactions, session data) is collected in aggregate and is not linked to
            your personal identity. It is used solely to improve the App.
          </p>

          {/* 5 */}
          <h2 id="section-5" style={sectionHeading}>5. Data Security</h2>
          <p style={body}>
            We take reasonable measures to protect your personal information. Your data is:
          </p>
          <ul style={listStyle}>
            <li>Transmitted over encrypted HTTPS/TLS connections</li>
            <li>Stored in Supabase&apos;s infrastructure with encryption at rest</li>
            <li>Protected by Row-Level Security (RLS) policies that ensure users can only access data they are authorized to see</li>
          </ul>
          <p style={body}>
            No method of transmission over the internet or electronic storage is 100% secure. We cannot
            guarantee absolute security.
          </p>

          {/* 6 */}
          <h2 id="section-6" style={sectionHeading}>6. Data Retention</h2>
          <p style={body}>
            We retain your personal information for as long as your account is active or as needed to
            provide the App&apos;s services. If you delete your account, we will delete or anonymize your
            personal data within 30 days, except where we are required to retain certain information for
            legal compliance purposes.
          </p>

          {/* 7 */}
          <h2 id="section-7" style={sectionHeading}>7. Your Rights</h2>
          <p style={body}>You have the right to:</p>
          <ul style={listStyle}>
            <li><strong style={{ color: '#F8F4F0' }}>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong style={{ color: '#F8F4F0' }}>Correct</strong> — update or correct inaccurate information via your profile settings in the App</li>
            <li><strong style={{ color: '#F8F4F0' }}>Delete</strong> — request deletion of your account and all associated personal data</li>
          </ul>
          <p style={body}>
            To exercise any of these rights, you may delete your account directly in the App (Profile →
            Delete Account) or contact us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={linkStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          {/* 8 */}
          <h2 id="section-8" style={sectionHeading}>8. Account Deletion</h2>
          <p style={body}>
            You can delete your account at any time from within the App by going to your Profile settings
            and selecting &quot;Delete Account.&quot; This will permanently remove your profile, email address,
            profile picture, and associated data from our systems within 30 days. Anonymized aggregate
            data with no personal identifiers may be retained.
          </p>

          {/* 9 */}
          <h2 id="section-9" style={sectionHeading}>9. Children&apos;s Privacy</h2>
          <p style={body}>
            {APP_NAME} is intended for users who are 18 years of age or older. We do not knowingly
            collect personal information from anyone under the age of 18. If we become aware that a user
            is under 18, we will terminate their account and delete their data promptly. If you believe a
            minor has provided us with personal information, please contact us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={linkStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          {/* 10 */}
          <h2 id="section-10" style={sectionHeading}>10. Tracking and Advertising</h2>
          <p style={body}>
            {APP_NAME} does not track users across third-party apps or websites for advertising purposes.
            We do not use your data to serve targeted advertisements. Analytics data we collect is
            anonymized and used solely to improve the App&apos;s functionality and user experience.
          </p>

          {/* 11 */}
          <h2 id="section-11" style={sectionHeading}>11. Changes to This Policy</h2>
          <p style={body}>
            We may update this Privacy Policy from time to time. When we do, we will update the
            &quot;Last updated&quot; date at the top of this page. For material changes, we will notify you
            through the App or by email. Your continued use of {APP_NAME} after any changes constitutes
            your acceptance of the updated Privacy Policy.
          </p>

          {/* 12 */}
          <h2 id="section-12" style={sectionHeading}>12. Contact Us</h2>
          <p style={body}>
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal
            data, please contact us:
          </p>
          <address style={{ ...body, paddingLeft: '16px', borderLeft: '2px solid rgba(251,230,166,0.5)', fontStyle: 'normal' }}>
            {COMPANY}<br />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={linkStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              {CONTACT_EMAIL}
            </a>
          </address>

          {/* Bottom nav */}
          <div style={{ ...divider, marginTop: '48px' }} />
          <nav aria-label="Legal pages" style={{ display: 'flex', gap: '24px', justifyContent: 'center', padding: '20px 0 8px', flexWrap: 'wrap' }}>
            <a href="/" style={{ ...linkStyle, color: 'rgba(248,244,240,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', textDecoration: 'none' }} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]">← Home</a>
            <a href="/terms-of-service" style={{ ...linkStyle, color: 'rgba(248,244,240,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', textDecoration: 'none' }} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]">Terms of Service</a>
          </nav>

          <p style={{ ...body, textAlign: 'center', color: 'rgba(248,244,240,0.35)', marginTop: '8px', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} {COMPANY}. All rights reserved.
          </p>
        </main>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
