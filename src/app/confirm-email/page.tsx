'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Footer, PageHeader } from '@/components';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>Check Your Email</PageHeader>

        <div className="w-full max-w-md mx-auto space-y-6 text-center">
          <div className="bg-[#FBE6A6]/10 border-2 border-[#FBE6A6] rounded-lg p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl" aria-hidden="true">
                ✉️
              </div>
              <div className="space-y-3">
                {email && (
                  <p className="text-[#F8F4F0] text-base">
                    We've sent a confirmation email to:
                  </p>
                )}
                {email && (
                  <p className="text-[#FBE6A6] text-lg font-semibold break-all">
                    {email}
                  </p>
                )}
                {!email && (
                  <p className="text-[#F8F4F0] text-base">
                    We've sent a confirmation email to your inbox.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 text-[#F8F4F0]">
            <p className="text-base">
              Click the confirmation link in the email to activate your account.
            </p>
            <p className="text-sm text-[#F8F4F0]/80">
              The link will expire in 24 hours.
            </p>
          </div>

          <div className="bg-[#460C58]/50 border border-[#FBE6A6]/30 rounded-lg p-4">
            <p className="text-sm text-[#F8F4F0]/90 mb-2">
              Didn't receive the email?
            </p>
            <ul className="text-sm text-[#F8F4F0]/80 space-y-1 text-left list-disc list-inside">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <div className="pt-4">
            <Link href="/login">
              <Button>
                Back to Login
              </Button>
            </Link>
          </div>

          <p className="text-sm text-[#F8F4F0]/70">
            Need help?{' '}
            <Link
              href="/forgot-password"
              className="text-[#FBE6A6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FBE6A6] focus:ring-offset-2 focus:ring-offset-[#460C58] rounded px-1"
            >
              Contact support
            </Link>
          </p>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Loading...</PageHeader>
        </ContentContainer>
        <Footer />
      </PageContainer>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
