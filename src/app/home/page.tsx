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
      if (!user) router.push('/login?returnTo=/home');
      else setIsAuthenticated(true);
    });
  }, [router]);

  if (isAuthenticated === null || (dinnersLoading && groupsLoading)) {
    return <PageLoading message="Loading your dashboard..." />;
  }

  const greeting = profile?.username ? `Welcome back, ${profile.username}` : 'Welcome back';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
        <p style={{ color: '#F8F4F0', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', opacity: 0.5, margin: '-8px 0 32px', textAlign: 'center', letterSpacing: '0.03em' }}>
          {today}
        </p>
        <UpcomingDinnersSection dinners={dinners} loading={dinnersLoading} onAccept={handleAccept} onDecline={handleDecline} />
        <GroupsSummarySection groups={groups} loading={groupsLoading} />
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

import type { UpcomingDinner } from '@/hooks/useUpcomingDinners';
import type { Group } from '@/hooks/useGroups';

const S = {
  sectionHeading: {
    color: '#FBE6A6', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem',
    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
    marginBottom: '12px', marginTop: '0', opacity: 1,
  } satisfies React.CSSProperties,

  emptyCard: {
    width: '100%', backgroundColor: 'transparent',
    border: '1px solid rgba(251,230,166,0.25)', borderRadius: '12px',
    padding: '24px 20px', marginBottom: '16px', textAlign: 'center' as const,
  } satisfies React.CSSProperties,

  emptyHeading: {
    color: '#FBE6A6', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
    fontWeight: 600, margin: '0 0 6px',
  } satisfies React.CSSProperties,

  emptyBody: {
    color: '#F8F4F0', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
    opacity: 0.7, lineHeight: 1.6, margin: '0 0 16px',
  } satisfies React.CSSProperties,

  emptyCta: {
    display: 'inline-block', color: '#FBE6A6', fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
    borderBottom: '1px solid rgba(251,230,166,0.4)', paddingBottom: '1px',
  } satisfies React.CSSProperties,

  groupRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '13px 4px', borderBottom: '1px solid rgba(251,230,166,0.12)',
    textDecoration: 'none', minHeight: '44px', transition: 'background 0.15s',
  } satisfies React.CSSProperties,

  groupName: {
    color: '#F8F4F0', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 500,
  } satisfies React.CSSProperties,

  groupCount: {
    color: '#FBE6A6', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', opacity: 0.7,
  } satisfies React.CSSProperties,

  createLink: {
    display: 'block', color: '#F8F4F0', fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem', textDecoration: 'none', opacity: 0.5,
    marginTop: '14px', textAlign: 'right' as const,
  } satisfies React.CSSProperties,
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLAnchorElement>) => { e.currentTarget.style.outline = '2px solid #FBE6A6'; e.currentTarget.style.outlineOffset = '2px'; },
  onBlur: (e: React.FocusEvent<HTMLAnchorElement>) => { e.currentTarget.style.outline = 'none'; },
};

function UpcomingDinnersSection({ dinners, loading, onAccept, onDecline }: {
  dinners: UpcomingDinner[]; loading: boolean;
  onAccept: (id: string) => Promise<void>; onDecline: (id: string) => Promise<void>;
}) {
  return (
    <section style={{ width: '100%', marginBottom: '36px' }}>
      <h2 style={S.sectionHeading}>Upcoming Dinners</h2>
      {loading ? (
        <p style={{ ...S.emptyBody, margin: 0 }} role="status" aria-live="polite">Checking your calendar…</p>
      ) : dinners.length === 0 ? (
        <div style={S.emptyCard}>
          <p style={S.emptyHeading}>Nothing on the table yet</p>
          <p style={S.emptyBody}>When a pairing is ready, your dinner invite will appear here. Check back after your group&apos;s next pairing runs.</p>
          <Link href="/groups" style={S.emptyCta} {...focusHandlers}>Go to your groups</Link>
        </div>
      ) : (
        dinners.map(dinner => (
          <UpcomingDinnerCard key={dinner.inviteId} dinner={dinner} onAccept={onAccept} onDecline={onDecline} />
        ))
      )}
    </section>
  );
}

function GroupsSummarySection({ groups, loading }: { groups: Group[]; loading: boolean }) {
  return (
    <section style={{ width: '100%', marginBottom: '32px' }}>
      <h2 style={S.sectionHeading}>Your Groups</h2>
      {loading ? (
        <p style={{ ...S.emptyBody, margin: 0 }} role="status" aria-live="polite">Loading groups…</p>
      ) : groups.length === 0 ? (
        <div style={S.emptyCard}>
          <p style={S.emptyHeading}>No groups yet</p>
          <p style={S.emptyBody}>Create a dinner group with friends, or join one with an invite code. Your next secret supper is one step away.</p>
          <Link href="/create-group" style={S.emptyCta} {...focusHandlers}>Start a group</Link>
        </div>
      ) : (
        <>
          {groups.map(group => (
            <Link key={group.groupid} href={`/groups/${group.groupid}`} style={S.groupRow}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(251,230,166,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              {...focusHandlers}
            >
              <span style={S.groupName}>{group.groupname}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={S.groupCount}>{group.member_count ?? 0} members</span>
                <span style={{ color: '#FBE6A6', fontSize: '0.85rem', opacity: 0.5 }} aria-hidden="true">›</span>
              </span>
            </Link>
          ))}
          <Link href="/create-group" style={S.createLink}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}
            onFocus={e => { e.currentTarget.style.outline = '2px solid #FBE6A6'; e.currentTarget.style.outlineOffset = '3px'; e.currentTarget.style.opacity = '0.9'; }}
            onBlur={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.opacity = '0.5'; }}
          >
            + Create a group
          </Link>
        </>
      )}
    </section>
  );
}
