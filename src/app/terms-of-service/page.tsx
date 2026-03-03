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

const tocLinkStyle: React.CSSProperties = {
  color: 'rgba(248,244,240,0.7)',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  textDecoration: 'none',
  display: 'block',
  padding: '3px 0',
};

const linkStyle: React.CSSProperties = {
  color: '#FBE6A6',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
};

const SECTIONS = [
  'Agreement to Terms',
  'Description of Service',
  'Eligibility',
  'User Accounts',
  'User Content',
  'Acceptable Use',
  'Privacy',
  'Account Deletion',
  'Intellectual Property',
  'Disclaimers',
  'Limitation of Liability',
  'Intellectual Property Claims',
  'Legal Compliance',
  'Scope of License',
  'Maintenance and Support',
  'Third-Party Terms',
  'Apple as Third-Party Beneficiary',
  'Changes to These Terms',
  'Governing Law',
  'Contact Us',
];

export default function TermsOfServicePage() {
  return (
    <PageContainer>
      <ContentContainer>
        <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 16px 120px' }}>
          <PageHeader>Terms of Service</PageHeader>

          <p style={{ ...body, textAlign: 'center', color: 'rgba(248,244,240,0.6)', marginBottom: '8px' }}>
            Effective {EFFECTIVE_DATE} &mdash; Last updated {EFFECTIVE_DATE}
          </p>

          <div style={divider} />

          {/* Table of Contents */}
          <nav aria-label="Table of contents" style={{ marginBottom: '40px' }}>
            <p style={{ ...body, color: '#FBE6A6', fontWeight: 700, marginBottom: '10px', fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Contents
            </p>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {SECTIONS.map((title, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>
                  <a
                    href={`#section-${i + 1}`}
                    style={tocLinkStyle}
                    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
                  >
                    {i + 1}. {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div style={divider} />

          {/* 1 */}
          <h2 id="section-1" style={sectionHeading}>1. Agreement to Terms</h2>
          <p style={body}>
            By downloading, installing, or using {APP_NAME} (the &quot;App&quot;), you agree to be bound by
            these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the App.
            These Terms constitute a legally binding agreement between you and {COMPANY}
            (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
          </p>
          <p style={body}>
            You acknowledge that these Terms are between you and {COMPANY} only, and not with Apple Inc.
            Apple is not responsible for the App or its content.
          </p>

          {/* 2 */}
          <h2 id="section-2" style={sectionHeading}>2. Description of Service</h2>
          <p style={body}>
            {APP_NAME} is a dinner matchmaking application that pairs members of friend groups for
            one-on-one dinners. The App allows users to create circles (dining groups), join circles via
            invite link, submit availability, and be matched with another member of their circle for a
            private dining experience.
          </p>

          {/* 3 */}
          <h2 id="section-3" style={sectionHeading}>3. Eligibility</h2>
          <p style={body}>
            You must be at least 18 years old to use {APP_NAME}. By using the App, you represent and
            warrant that you are 18 years of age or older. If we learn that a user is under 18, we will
            terminate their account and delete their data promptly.
          </p>

          {/* 4 */}
          <h2 id="section-4" style={sectionHeading}>4. User Accounts</h2>
          <p style={body}>
            To use {APP_NAME} you must create an account with a valid email address and a username. You
            are responsible for maintaining the confidentiality of your account credentials and for all
            activity that occurs under your account. You agree to notify us immediately at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={linkStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            if you suspect any unauthorized use of your account.
          </p>
          <p style={body}>
            You may not create an account on behalf of another person, impersonate any person or entity,
            or use a username that is offensive, misleading, or that violates any third-party rights.
          </p>

          {/* 5 */}
          <h2 id="section-5" style={sectionHeading}>5. User Content</h2>
          <p style={body}>
            You may upload a profile picture and choose a display username (&quot;User Content&quot;). You retain
            ownership of your User Content. By uploading User Content to {APP_NAME}, you grant {COMPANY}
            a limited, non-exclusive, royalty-free license to store, display, and use your User Content
            solely to operate the App.
          </p>
          <p style={body}>
            You represent and warrant that your User Content does not violate any applicable law and does
            not infringe the intellectual property rights or privacy rights of any third party.
          </p>

          {/* 6 */}
          <h2 id="section-6" style={sectionHeading}>6. Acceptable Use</h2>
          <p style={body}>You agree not to:</p>
          <ul style={listStyle}>
            <li>Use the App for any unlawful purpose</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Upload content that is illegal, obscene, or infringes third-party rights</li>
            <li>Attempt to gain unauthorized access to other accounts or our systems</li>
            <li>Reverse engineer, decompile, or disassemble the App</li>
            <li>Use automated means (bots, scrapers) to access or interact with the App</li>
            <li>Interfere with the proper functioning of the App or its servers</li>
          </ul>
          <p style={body}>
            We reserve the right to suspend or terminate accounts that violate these rules at our sole
            discretion, without prior notice.
          </p>

          {/* 7 */}
          <h2 id="section-7" style={sectionHeading}>7. Privacy</h2>
          <p style={body}>
            Your use of {APP_NAME} is also governed by our{' '}
            <a
              href="/privacy-policy"
              style={linkStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              Privacy Policy
            </a>
            , which is incorporated into these Terms by reference. Please review the Privacy Policy
            carefully before using the App.
          </p>

          {/* 8 */}
          <h2 id="section-8" style={sectionHeading}>8. Account Deletion</h2>
          <p style={body}>
            You may delete your account at any time from within the App by navigating to your Profile
            settings and selecting &quot;Delete Account.&quot; Upon deletion, your personal data will be removed
            from our systems within 30 days in accordance with our Privacy Policy. Some data may be
            retained for a limited period as required by law or for legitimate business purposes.
          </p>

          {/* 9 */}
          <h2 id="section-9" style={sectionHeading}>9. Intellectual Property</h2>
          <p style={body}>
            All content, features, and functionality of {APP_NAME} — including but not limited to its
            design, text, graphics, logos, and software — are owned by {COMPANY} and are protected by
            applicable intellectual property laws. You may not copy, modify, distribute, or create
            derivative works without our express written permission.
          </p>

          {/* 10 */}
          <h2 id="section-10" style={sectionHeading}>10. Disclaimers</h2>
          <p style={body}>
            THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. {COMPANY.toUpperCase()} DOES NOT
            WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>
          <p style={body}>
            {COMPANY} is solely responsible for any product warranties, whether express or implied by
            law, to the extent not effectively disclaimed above. In the event of any failure of the App
            to conform to any applicable warranty, you may notify Apple and Apple will refund the purchase
            price, if any, for the App. To the maximum extent permitted by applicable law, Apple will
            have no other warranty obligation with respect to the App.
          </p>

          {/* 11 */}
          <h2 id="section-11" style={sectionHeading}>11. Limitation of Liability</h2>
          <p style={body}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY.toUpperCase()} SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
            LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE APP.
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF THESE TERMS OR YOUR USE OF THE APP
            SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </p>
          <p style={body}>
            {COMPANY} is solely responsible for addressing any claims by you or any third party relating
            to the App or your use of it, including but not limited to product liability claims, claims
            that the App fails to conform to any applicable legal or regulatory requirement, and claims
            arising under consumer protection or similar legislation. Apple has no responsibility
            whatsoever for such claims.
          </p>

          {/* 12 */}
          <h2 id="section-12" style={sectionHeading}>12. Intellectual Property Claims</h2>
          <p style={body}>
            {COMPANY} is solely responsible for the investigation, defense, settlement, and discharge of
            any third-party intellectual property infringement claim related to the App or your possession
            and use of the App. Apple will not be responsible for any such claims.
          </p>

          {/* 13 */}
          <h2 id="section-13" style={sectionHeading}>13. Legal Compliance</h2>
          <p style={body}>
            You represent and warrant that (i) you are not located in a country that is subject to a U.S.
            Government embargo or that has been designated by the U.S. Government as a &quot;terrorist
            supporting&quot; country, and (ii) you are not listed on any U.S. Government list of prohibited
            or restricted parties.
          </p>

          {/* 14 */}
          <h2 id="section-14" style={sectionHeading}>14. Scope of License</h2>
          <p style={body}>
            {COMPANY} grants you a non-transferable license to use {APP_NAME} on any Apple-branded
            devices that you own or control, subject to the Usage Rules set forth in the Apple Media
            Services Terms and Conditions. You may not distribute or make the App available over a network
            where it could be used by multiple devices at the same time.
          </p>

          {/* 15 */}
          <h2 id="section-15" style={sectionHeading}>15. Maintenance and Support</h2>
          <p style={body}>
            {COMPANY} is solely responsible for providing maintenance and support services for {APP_NAME}.
            Apple has no obligation whatsoever to furnish any maintenance or support services with respect
            to the App.
          </p>

          {/* 16 */}
          <h2 id="section-16" style={sectionHeading}>16. Third-Party Terms</h2>
          <p style={body}>
            When using {APP_NAME}, you must comply with applicable third-party terms of service. By using
            the App on an Apple device, you agree to Apple&apos;s App Store Terms of Service.
          </p>

          {/* 17 */}
          <h2 id="section-17" style={sectionHeading}>17. Apple as Third-Party Beneficiary</h2>
          <p style={body}>
            You acknowledge and agree that Apple, and Apple&apos;s subsidiaries, are third-party beneficiaries
            of these Terms, and that upon your acceptance of these Terms, Apple will have the right (and
            will be deemed to have accepted the right) to enforce these Terms against you as a third-party
            beneficiary thereof.
          </p>

          {/* 18 */}
          <h2 id="section-18" style={sectionHeading}>18. Changes to These Terms</h2>
          <p style={body}>
            We may update these Terms from time to time. When we do, we will update the &quot;Last updated&quot;
            date at the top of this page and, where the changes are material, notify you through the App
            or by email. Your continued use of the App after any changes constitutes your acceptance of
            the updated Terms.
          </p>

          {/* 19 */}
          <h2 id="section-19" style={sectionHeading}>19. Governing Law</h2>
          <p style={body}>
            These Terms are governed by and construed in accordance with the laws of the State of North
            Carolina, without regard to its conflict of law principles. Any disputes arising under these
            Terms shall be subject to the exclusive jurisdiction of the courts located in North Carolina.
          </p>

          {/* 20 */}
          <h2 id="section-20" style={sectionHeading}>20. Contact Us</h2>
          <p style={body}>
            If you have any questions about these Terms, please contact us:
          </p>
          <p style={{ ...body, paddingLeft: '16px', borderLeft: '2px solid rgba(251,230,166,0.5)' }}>
            {COMPANY}<br />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={linkStyle}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              {CONTACT_EMAIL}
            </a>
          </p>

          {/* Bottom nav */}
          <div style={{ ...divider, marginTop: '48px' }} />
          <nav aria-label="Legal pages" style={{ display: 'flex', gap: '24px', justifyContent: 'center', padding: '20px 0 8px', flexWrap: 'wrap' }}>
            <a
              href="/"
              style={{ ...tocLinkStyle, color: 'rgba(248,244,240,0.55)' }}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              ← Home
            </a>
            <a
              href="/privacy-policy"
              style={{ ...tocLinkStyle, color: 'rgba(248,244,240,0.55)' }}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
            >
              Privacy Policy
            </a>
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
