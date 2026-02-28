'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Footer, PageHeader, PageLoading, Button } from '@/components';
import { usePairingDetail, usePairingResponse } from '@/hooks';
import { supabase } from '@/lib/supabase';

const cadenceCopy: Record<string, string> = {
  monthly: 'this month',
  biweekly: 'in the next two weeks',
  quarterly: 'this quarter',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1.1rem',
  fontWeight: 700,
  marginBottom: '8px',
};

const rowStyle: React.CSSProperties = {
  color: '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  marginBottom: '6px',
  opacity: 0.85,
};

const dividerStyle: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: '#FBE6A6',
  opacity: 0.2,
  margin: '14px 0',
};

const statusItemStyle = (set: boolean): React.CSSProperties => ({
  color: set ? '#FBE6A6' : '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  marginBottom: '4px',
  display: 'block',
  opacity: set ? 1 : 0.8,
});

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
};

const ctaLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '16px',
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.95rem',
  fontWeight: 600,
  textDecoration: 'none',
  border: '2px solid #FBE6A6',
  padding: '10px 20px',
};

const errorStyle: React.CSSProperties = {
  color: '#f87171',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  marginBottom: '16px',
};

const backLinkStyle: React.CSSProperties = {
  color: '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '8px',
  opacity: 0.65,
};

export default function PairingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = (params?.eventId ?? '') as string;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { detail, loading, error } = usePairingDetail(eventId, refreshKey);
  const { respond, loading: responding, error: respondError } = usePairingResponse();

  useEffect(() => {
    if (!eventId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?returnTo=/pairings/' + eventId);
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [router, eventId]);

  if (isAuthenticated === null || loading) {
    return <PageLoading message="Loading pairing details..." />;
  }

  if (error) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageHeader>Pairing Details</PageHeader>
          <p style={errorStyle}>Could not load pairing details. Please try again.</p>
          <Link href="/home" style={backLinkStyle}>
            ← Back to Dashboard
          </Link>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // No invite found for this event
  if (!detail.inviteStatus) {
    return (
      <PageContainer>
        <ContentContainer>
          <PageHeader>Pairing Details</PageHeader>
          <p style={errorStyle}>This pairing could not be found.</p>
          <Link href="/home" style={backLinkStyle}>
            ← Back to Dashboard
          </Link>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  const handleAccept = async () => {
    if (!detail.inviteId) return;
    await respond(detail.inviteId, 'accepted');
    setRefreshKey(k => k + 1);
  };

  const handleDecline = async () => {
    if (!detail.inviteId) return;
    await respond(detail.inviteId, 'declined');
    if (!respondError) {
      router.push('/home');
    }
  };

  const isPending = detail.inviteStatus === 'pending';
  const isAccepted = detail.inviteStatus === 'accepted';

  const formattedDate = detail.scheduledDate
    ? new Date(detail.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : 'TBD';

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader>
          {isAccepted && detail.partner ? `Dinner with ${detail.partner.username}` : 'Upcoming Dinner'}
        </PageHeader>

        <div style={cardStyle}>
          {isPending && (
            <>
              <p style={labelStyle}>You have a dinner pairing</p>
              <p style={rowStyle}>
                This dinner is scheduled {detail.cadence ? cadenceCopy[detail.cadence] ?? 'soon' : 'soon'} for the {detail.groupName} group.
              </p>
              <p style={rowStyle}>
                Accept to confirm your spot — your dining partner will be revealed once you respond.
              </p>
              {respondError && <p style={errorStyle} role="alert">{respondError}</p>}
              <div style={actionRowStyle}>
                <Button onClick={handleAccept} disabled={responding}>
                  {responding ? 'Saving…' : 'Accept'}
                </Button>
                <Button variant="secondary" onClick={handleDecline} disabled={responding}>
                  {responding ? 'Saving…' : 'Decline'}
                </Button>
              </div>
            </>
          )}

          {isAccepted && (
            <>
              <p style={rowStyle}>Group: {detail.groupName}</p>
              <p style={rowStyle}>Date: {formattedDate}</p>
              <p style={rowStyle}>Location: {detail.location?.locationName ?? 'TBD'}</p>

              <div style={dividerStyle} aria-hidden="true" />

              <p style={{ ...rowStyle, fontWeight: 700, opacity: 1, marginBottom: '8px' }}>Availability</p>
              <span style={statusItemStyle(detail.userHasSetAvailability)}>
                <span aria-hidden="true">{detail.userHasSetAvailability ? '✓ ' : '○ '}</span>
                You: {detail.userHasSetAvailability ? 'Submitted' : 'Not submitted yet'}
              </span>
              <span style={statusItemStyle(detail.partnerHasSetAvailability === true)}>
                <span aria-hidden="true">{detail.partnerHasSetAvailability ? '✓ ' : '○ '}</span>
                Partner: {detail.partnerHasSetAvailability ? 'Submitted' : 'Not submitted yet'}
              </span>

              {detail.groupId && (
                <Link
                  href={`/groups/${detail.groupId}/availability`}
                  style={ctaLinkStyle}
                  aria-label="Set your availability for this dinner"
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
                >
                  Set My Availability <span aria-hidden="true">→</span>
                </Link>
              )}

              {respondError && <p style={errorStyle} role="alert">{respondError}</p>}
            </>
          )}
        </div>

        <Link
          href="/home"
          style={backLinkStyle}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
        >
          ← Back to Dashboard
        </Link>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
