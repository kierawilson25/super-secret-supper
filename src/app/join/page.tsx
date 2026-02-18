'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Input, Footer, PageHeader, PageLoading } from '@/components';
import { joinGroupContent } from '@/content/joinGroup';
import { useJoinGroup } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function JoinGroupPage() {
  const router = useRouter();
  const { validateCode, joinGroup, reset, preview, error, isValidating, isJoining, isAlreadyMember } = useJoinGroup();
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnTo=/join');
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, [router]);

  // Focus management for error messages
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  // Countdown timer for success redirect
  useEffect(() => {
    if (success && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && redirectCountdown === 0 && preview) {
      router.push(`/groups/${preview.groupId}/members`);
    }
  }, [success, redirectCountdown, router, preview]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateCode(code);
  };

  const handleJoin = async () => {
    try {
      await joinGroup();
      setSuccess(true);
      // Focus management
      setTimeout(() => {
        successRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('Failed to join group:', err);
    }
  };

  const handleCancel = () => {
    reset();
    setCode('');
  };

  const handleSkipRedirect = () => {
    if (preview) {
      router.push(`/groups/${preview.groupId}/members`);
    }
  };

  if (isAuthenticated === null) {
    return <PageLoading message="Loading..." />;
  }

  // Success state
  if (success && preview) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <div ref={successRef} tabIndex={-1} className="focus:outline-none">
            <PageHeader>Welcome!</PageHeader>
            <div
              role="status"
              aria-live="polite"
              className="space-y-4"
            >
              <p className="text-emerald-400 text-center text-xl font-semibold mb-4">
                {joinGroupContent.messages.success}
              </p>
              <p className="text-[#F8F4F0] text-center text-lg mb-6">
                Successfully joined {preview.groupName}!
              </p>
              <p className="text-[#F8F4F0]/70 text-center text-base">
                Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
              </p>
            </div>
            <div className="mt-8">
              <Button onClick={handleSkipRedirect}>
                Go to Group Now
              </Button>
            </div>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // Already member state
  if (isAlreadyMember && preview) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Already a Member</PageHeader>
          <p className="text-[#F8F4F0] text-center text-base mb-8">
            You're already a member of {preview.groupName}!
          </p>
          <div className="space-y-4">
            <Button onClick={() => router.push(`/groups/${preview.groupId}/members`)}>
              View Group
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Try Another Code
            </Button>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // Preview state
  if (preview && !isAlreadyMember) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Join Group</PageHeader>
          <p className="text-[#F8F4F0] text-center text-base mb-8">
            You're about to join:
          </p>
          <div
            className="bg-[#460C58]/30 border-2 border-[#FBE6A6]/30 rounded-xl p-10 py-12 mb-8"
            role="region"
            aria-label="Group preview"
          >
            <p className="text-[#FBE6A6] text-3xl font-bold text-center leading-relaxed">
              {preview.groupName}
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              aria-label={isJoining ? 'Joining group, please wait' : 'Join this group'}
            >
              {isJoining ? joinGroupContent.messages.joining : joinGroupContent.buttons.join}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isJoining}
            >
              {joinGroupContent.buttons.cancel}
            </Button>
          </div>
          {error && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
              className="focus:outline-none mt-6"
            >
              <p className="text-red-400 text-center text-sm">
                {error}
              </p>
            </div>
          )}
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // Entry state
  const isCodeValid = code.length === 24;
  const remainingChars = 24 - code.length;

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>{joinGroupContent.title}</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          {joinGroupContent.subtitle}
        </p>

        <form onSubmit={handleValidate} className="w-full space-y-6">
          <div>
            <Input
              label={joinGroupContent.labels.inviteCode}
              name="inviteCode"
              placeholder={joinGroupContent.placeholders.inviteCode}
              value={code}
              onChange={handleCodeChange}
              required
              maxLength={24}
              aria-describedby="code-help code-length"
              aria-invalid={code.length > 0 && !isCodeValid}
            />
            {code.length > 0 && !isCodeValid && (
              <p
                id="code-length"
                className="text-[#FBE6A6]/70 text-center text-sm mt-2"
                role="status"
                aria-live="polite"
              >
                {remainingChars} more character{remainingChars !== 1 ? 's' : ''} needed
              </p>
            )}
          </div>

          <p
            id="code-help"
            className="text-[#F8F4F0]/70 text-center text-sm"
          >
            {joinGroupContent.instructions}
          </p>

          {error && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
              className="focus:outline-none"
            >
              <p className="text-red-400 text-center text-sm mb-4">
                {error}
              </p>
              <div className="space-y-2">
                <p className="text-[#F8F4F0]/60 text-center text-xs">
                  Need help? Ask your group admin for a new invite code.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/groups')}
                  className="text-[#FBE6A6] hover:underline text-sm block mx-auto focus-visible:ring-2 focus-visible:ring-[#FBE6A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#460C58] rounded px-2 py-1 transition-all"
                >
                  View My Groups
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 w-full">
            <Button
              type="submit"
              disabled={isValidating || !isCodeValid}
              aria-label={isValidating ? 'Validating code, please wait' : isCodeValid ? 'Check invite code' : 'Enter complete 24-character code to validate'}
            >
              {isValidating ? joinGroupContent.messages.validating : joinGroupContent.buttons.validate}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {joinGroupContent.buttons.cancel}
            </Button>
          </div>
        </form>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
