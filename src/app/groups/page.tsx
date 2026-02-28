'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, GroupCard, Footer, PageHeader, PageLoading } from '@/components';
import { useGroups } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, error } = useGroups();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnTo=/groups');
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, [router]);

  if (isAuthenticated === null || loading) {
    return <PageLoading message="Loading your groups..." />;
  }

  const twoColumnStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
    width: '100%',
    alignItems: 'start',
  };

  const sidebarStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0px',
  };

  const emptyCardStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: '2px solid #FBE6A6',
    borderRadius: '12px',
    padding: '32px 16px',
    textAlign: 'center',
  };

  const quietLinkStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    color: '#F8F4F0',
    fontSize: '0.9rem',
    textDecoration: 'underline',
    opacity: 0.7,
    padding: '8px 0',
    cursor: 'pointer',
  };

  return (
    <PageContainer>
      {/* Responsive grid: stacked on mobile, two columns at 700px+ */}
      <style>{`
        @media (min-width: 700px) {
          .groups-two-col { grid-template-columns: 1fr 260px !important; }
        }
      `}</style>

      <ContentContainer className="pt-20">
        <PageHeader>My Groups</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          View and manage your dinner groups
        </p>

        {error && (
          <p role="alert" className="text-red-400 text-center text-sm mb-6">
            Error loading groups: {error}
          </p>
        )}

        <div className="groups-two-col" style={twoColumnStyle}>
          {/* Left column: group cards or empty state */}
          <div>
            {groups.length === 0 ? (
              <div style={emptyCardStyle}>
                <p style={{ color: '#FBE6A6', fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>
                  No groups yet
                </p>
                <p style={{ color: '#F8F4F0', fontSize: '0.95rem', opacity: 0.8 }}>
                  Create a group or join one with an invite code to get started.
                </p>
              </div>
            ) : (
              groups.map(group => (
                <GroupCard key={group.groupid} group={group} />
              ))
            )}
          </div>

          {/* Right column: primary actions */}
          <div style={sidebarStyle}>
            <Link href="/create-group">
              <Button>Create New Group</Button>
            </Link>
            <Link href="/join">
              <Button variant="secondary">Join with Code</Button>
            </Link>
            <Link href="/" style={quietLinkStyle}>
              Back to Home
            </Link>
          </div>
        </div>
      </ContentContainer>

      <Footer />
    </PageContainer>
  );
}
