'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Footer, PageHeader, PageLoading, UpcomingDinnerCard } from '@/components';
import { useProfile, useGroups, useUpcomingDinners, usePairingResponse } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { profile } = useProfile();
  const { groups, loading: groupsLoading } = useGroups();
  const { dinners, loading: dinnersLoading } = useUpcomingDinners(refreshKey);
  const { respond } = usePairingResponse();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?returnTo=/home');
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [router]);

  if (isAuthenticated === null || (dinnersLoading && groupsLoading)) {
    return <PageLoading message="Loading your dashboard..." />;
  }

  const greeting = profile?.username ? `Welcome back, ${profile.username}` : 'Welcome back';

  const handleAccept = async (inviteId: string) => {
    await respond(inviteId, 'accepted');
    setRefreshKey(k => k + 1);
  };

  const handleDecline = async (inviteId: string) => {
    await respond(inviteId, 'declined');
    setRefreshKey(k => k + 1);
  };

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader>{greeting}</PageHeader>

        <UpcomingDinnersSection
          dinners={dinners}
          loading={dinnersLoading}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />

        <GroupsSummarySection groups={groups} loading={groupsLoading} />
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

import type { UpcomingDinner } from '@/hooks/useUpcomingDinners';
import type { Group } from '@/hooks/useGroups';

const sectionHeadingStyle: React.CSSProperties = {
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '12px',
  marginTop: '8px',
  opacity: 0.7,
};

const emptyTextStyle: React.CSSProperties = {
  color: '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  opacity: 0.8,
  lineHeight: 1.6,
  marginBottom: '16px',
};

const groupRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid rgba(251,230,166,0.15)',
  textDecoration: 'none',
};

const groupNameStyle: React.CSSProperties = {
  color: '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.95rem',
};

const groupCountStyle: React.CSSProperties = {
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.8rem',
  opacity: 0.8,
};

function UpcomingDinnersSection({
  dinners,
  loading,
  onAccept,
  onDecline,
}: {
  dinners: UpcomingDinner[];
  loading: boolean;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}) {
  return (
    <section>
      {/* Override globals.css h2 { font-family: 'Great Vibes' } for this label */}
      <h2 style={{ ...sectionHeadingStyle, fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
        Upcoming Dinners
      </h2>
      {loading ? (
        <p style={emptyTextStyle} role="status" aria-live="polite">Loading upcoming dinners…</p>
      ) : dinners.length === 0 ? (
        <p style={emptyTextStyle}>
          No upcoming dinners yet. Visit your groups to see when your next pairing is.
        </p>
      ) : (
        dinners.map(dinner => (
          <UpcomingDinnerCard
            key={dinner.inviteId}
            dinner={dinner}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        ))
      )}
    </section>
  );
}

function GroupsSummarySection({ groups, loading }: { groups: Group[]; loading: boolean }) {
  return (
    <section style={{ marginTop: '8px', marginBottom: '32px' }}>
      {/* Override globals.css h2 { font-family: 'Great Vibes' } for this label */}
      <h2 style={{ ...sectionHeadingStyle, fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
        Your Groups
      </h2>
      {loading ? (
        <p style={emptyTextStyle} role="status" aria-live="polite">Loading groups…</p>
      ) : groups.length === 0 ? (
        <p style={emptyTextStyle}>You're not in any groups yet.</p>
      ) : (
        groups.map(group => (
          <Link
            key={group.groupid}
            href={`/groups/${group.groupid}`}
            style={groupRowStyle}
          >
            <span style={groupNameStyle}>{group.groupname}</span>
            <span style={groupCountStyle}>{group.member_count ?? 0} members</span>
          </Link>
        ))
      )}
    </section>
  );
}
