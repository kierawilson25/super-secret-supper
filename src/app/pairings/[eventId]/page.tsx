'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Footer, PageHeader, PageLoading, Button } from '@/components';
import { usePairingDetail, usePairingResponse, useAvailabilityMatch } from '@/hooks';
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

const statusPillStyle = (set: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: set ? 'rgba(251,230,166,0.15)' : 'rgba(248,244,240,0.08)',
  color: set ? '#FBE6A6' : 'rgba(248,244,240,0.55)',
  border: `1px solid ${set ? 'rgba(251,230,166,0.45)' : 'rgba(248,244,240,0.2)'}`,
  borderRadius: '20px',
  padding: '3px 10px',
  fontSize: '12px',
  fontFamily: 'Inter, sans-serif',
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

const confirmedBannerStyle: React.CSSProperties = {
  backgroundColor: 'rgba(251,230,166,0.12)',
  border: '1px solid rgba(251,230,166,0.4)',
  borderRadius: '8px',
  padding: '12px 14px',
  marginBottom: '12px',
};

const noMatchBannerStyle: React.CSSProperties = {
  backgroundColor: 'rgba(248,244,240,0.06)',
  border: '1px solid rgba(248,244,240,0.2)',
  borderRadius: '8px',
  padding: '12px 14px',
  marginBottom: '12px',
};

const slotLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  late_night: 'Late Night',
};

export default function PairingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = (params?.eventId ?? '') as string;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { detail, loading, error } = usePairingDetail(eventId, refreshKey);
  const { respond, loading: responding, error: respondError } = usePairingResponse();
  const matchData = useAvailabilityMatch(eventId || null, refreshKey);

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
            ← Back to Home
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
            ← Back to Home
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

  const handleSkip = async () => {
    if (!detail.inviteId) return;
    await respond(detail.inviteId, 'declined');
    if (!respondError) {
      router.push('/home');
    }
  };

  const isPending = detail.inviteStatus === 'pending';
  const isAccepted = detail.inviteStatus === 'accepted';

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
              <p style={rowStyle}>Location: {detail.location?.locationName ?? 'TBD'}</p>

              <div style={dividerStyle} aria-hidden="true" />

              {/* Match status section */}
              {matchData.status === 'matched' ? (
                <div style={confirmedBannerStyle} role="status">
                  <p style={{ ...rowStyle, color: '#FBE6A6', fontWeight: 700, opacity: 1, marginBottom: '4px' }}>
                    Date confirmed
                  </p>
                  <p style={{ ...rowStyle, marginBottom: 0 }}>
                    {(matchData.confirmedDate || detail.confirmedDate)
                      ? new Date((matchData.confirmedDate || detail.confirmedDate)!).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                      : 'TBD'}
                    {(matchData.confirmedSlot || detail.confirmedSlot)
                      ? ` · ${slotLabels[(matchData.confirmedSlot || detail.confirmedSlot)!] ?? (matchData.confirmedSlot || detail.confirmedSlot)}`
                      : ''}
                  </p>
                </div>
              ) : matchData.status === 'no_match' ? (
                <div style={noMatchBannerStyle}>
                  <p style={{ ...rowStyle, fontWeight: 700, opacity: 1, marginBottom: '4px' }}>No overlap found</p>
                  <p style={{ ...rowStyle, marginBottom: '12px' }}>
                    Your availability doesn&apos;t overlap with {detail.partner?.username ?? 'your partner'}&apos;s.
                    Update your availability to find a time that works.
                  </p>
                  <div style={actionRowStyle}>
                    {detail.groupId && (
                      <Link
                        href={`/groups/${detail.groupId}/availability?from=${eventId}`}
                        style={{ ...ctaLinkStyle, marginTop: 0 }}
                        aria-label="Update your availability for this dinner"
                        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
                      >
                        {detail.userHasSetAvailability ? 'Edit Availability' : 'Set Availability'}
                      </Link>
                    )}
                    <Button variant="secondary" onClick={handleSkip} disabled={responding}>
                      {responding ? 'Saving…' : 'Skip this dinner'}
                    </Button>
                  </div>
                </div>
              ) : matchData.status === 'partner_skipped' ? (
                <div style={noMatchBannerStyle}>
                  <p style={{ ...rowStyle, fontWeight: 700, opacity: 1, marginBottom: '4px' }}>Partner opted out</p>
                  <p style={{ ...rowStyle, marginBottom: 0 }}>
                    {detail.partner?.username ?? 'Your partner'} declined this dinner.
                    You&apos;ll be included in the next pairing round.
                  </p>
                </div>
              ) : (
                /* waiting_for_partner or initial */
                <>
                  <p style={{ ...rowStyle, fontWeight: 700, opacity: 1, marginBottom: '8px' }}>Availability</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <span style={statusPillStyle(detail.userHasSetAvailability)}>
                      <span aria-hidden="true">{detail.userHasSetAvailability ? '✓' : '○'}</span>
                      You: {detail.userHasSetAvailability ? 'Ready' : 'Not set'}
                    </span>
                    <span style={statusPillStyle(detail.partnerHasSetAvailability === true)}>
                      <span aria-hidden="true">{detail.partnerHasSetAvailability ? '✓' : '○'}</span>
                      {detail.partner?.username ?? 'Partner'}: {detail.partnerHasSetAvailability ? 'Ready' : 'Not set'}
                    </span>
                  </div>
                  {!detail.userHasSetAvailability && detail.groupId && (
                    <p style={{ ...rowStyle, fontSize: '0.85rem', marginTop: '6px', opacity: 0.7 }}>
                      Submit your availability so we can find a time for your dinner.
                    </p>
                  )}
                  {detail.partnerHasSetAvailability === false && detail.userHasSetAvailability && (
                    <p style={{ ...rowStyle, fontSize: '0.85rem', marginTop: '6px', opacity: 0.7 }}>
                      Waiting for {detail.partner?.username ?? 'your partner'} to set their availability.
                    </p>
                  )}
                </>
              )}

              {matchData.status !== 'no_match' && matchData.status !== 'matched' && matchData.status !== 'partner_skipped' && detail.groupId && (
                <Link
                  href={`/groups/${detail.groupId}/availability?from=${eventId}`}
                  style={ctaLinkStyle}
                  aria-label={detail.userHasSetAvailability ? 'Edit your availability for this dinner' : 'Set your availability for this dinner'}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
                >
                  {detail.userHasSetAvailability ? 'Edit My Availability' : 'Set My Availability'} <span aria-hidden="true">→</span>
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
          ← Back to Home
        </Link>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
