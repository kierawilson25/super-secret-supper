'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Input, Alert, Footer, PageHeader, PageLoading } from '@/components';

const previewCardStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};
import { joinGroupContent } from '@/content/joinGroup';
import { useJoinGroup } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function JoinGroupPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const { validateCode, joinGroup, reset, preview, error, validating, joining, joined } = useJoinGroup();

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

  useEffect(() => {
    if (joined && preview) {
      setTimeout(() => {
        router.push(`/groups/${preview.groupId}/members`);
      }, 2000);
    }
  }, [joined, preview, router]);

  const handleValidate = async () => {
    if (code.length !== 24) {
      setFormatError(joinGroupContent.messages.invalidFormat);
      return;
    }
    setFormatError(null);
    try {
      await validateCode(code);
    } catch {
      // hook surfaces errors via the `error` field
    }
  };

  const handleCancel = () => {
    setCode('');
    setFormatError(null);
    reset();
  };

  if (isAuthenticated === null) {
    return <PageLoading message="Loading..." />;
  }

  if (joined) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>{joinGroupContent.title}</PageHeader>
          <div role="status" aria-live="polite" aria-atomic="true" className="text-center">
            <p className="text-green-400 text-base mb-8">
              {joinGroupContent.messages.success}
            </p>
            <p className="text-[#F8F4F0] text-sm animate-pulse">
              Redirecting to group...
            </p>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>{joinGroupContent.title}</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          {joinGroupContent.subtitle}
        </p>

        {!preview ? (
          <div className="w-full space-y-6">
            <p className="text-[#F8F4F0] text-center text-sm">
              {joinGroupContent.instructions}
            </p>
            <Input
              label={joinGroupContent.labels.inviteCode}
              placeholder={joinGroupContent.placeholders.inviteCode}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setFormatError(null);
              }}
              maxLength={24}
            />
            {(formatError || error) && (
              <Alert type="error" message={formatError || error!} />
            )}
            <div className="space-y-4 pt-4 w-full">
              <Button
                onClick={handleValidate}
                disabled={validating || code.length === 0}
                aria-busy={validating}
              >
                {validating ? joinGroupContent.messages.validating : joinGroupContent.buttons.validate}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div style={{ ...previewCardStyle, opacity: joining ? 0.6 : 1 }}>
              <p style={{ color: '#F8F4F0', fontSize: '14px', marginBottom: '8px' }}>You&apos;re joining:</p>
              <p style={{ color: '#FBE6A6', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{preview.groupName}</p>
            </div>
            {error && <Alert type="error" message={error} />}
            <div className="space-y-4 pt-4 w-full">
              <Button onClick={joinGroup} disabled={joining} aria-busy={joining}>
                {joining ? joinGroupContent.messages.joining : joinGroupContent.buttons.join}
              </Button>
              <Button variant="secondary" onClick={handleCancel} disabled={joining}>
                {joinGroupContent.buttons.cancel}
              </Button>
            </div>
          </div>
        )}
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
