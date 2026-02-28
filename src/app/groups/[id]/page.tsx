'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Footer, PageHeader, PageLoading } from '@/components';
import { useGroupAdmin, useMembers, usePairingHistory, useGroups } from '@/hooks';

const sectionCard: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

const statLabel: React.CSSProperties = {
  color: '#F8F4F0',
  fontSize: '12px',
  marginBottom: '4px',
};

const statValue: React.CSSProperties = {
  color: '#FBE6A6',
  fontSize: '28px',
  fontWeight: 'bold',
};

export default function GroupDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const { isAdmin, currentUserId, loading: adminLoading } = useGroupAdmin(groupId);
  const { members, loading: membersLoading } = useMembers(groupId);
  const { pairings, loading: pairingsLoading } = usePairingHistory(groupId);
  const { groups, loading: groupsLoading } = useGroups();

  const group = groups.find(g => g.groupid === groupId);

  useEffect(() => {
    if (!adminLoading && !currentUserId) {
      router.push(`/login?returnTo=/groups/${groupId}`);
    }
  }, [adminLoading, currentUserId, groupId, router]);

  const loading = adminLoading || membersLoading || pairingsLoading || groupsLoading;

  if (loading) {
    return <PageLoading message="Loading group..." />;
  }

  const dinnerCount = pairings.length;

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>{group?.groupname || 'Group'}</PageHeader>

        {group?.groupcity && (
          <p style={{ color: '#F8F4F0', textAlign: 'center', fontSize: '14px', marginBottom: '24px' }}>
            📍 {group.groupcity}
          </p>
        )}

        {/* Stats */}
        <div style={sectionCard}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={statLabel}>Members</p>
              <p style={statValue}>{members.length}</p>
            </div>
            <div>
              <p style={statLabel}>Dinners</p>
              <p style={statValue}>{dinnerCount}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Primary action */}
          <div style={{ marginBottom: '20px' }}>
            <Link href={`/groups/${groupId}/availability`} style={{ textDecoration: 'none' }}>
              <Button>Set My Availability</Button>
            </Link>
          </div>

          {/* Secondary navigation — 2-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <Link href={`/groups/${groupId}/members`} style={{ textDecoration: 'none' }}>
              <Button variant="secondary">View Members</Button>
            </Link>

            {isAdmin && (
              <Link href={`/groups/${groupId}/manage`} style={{ textDecoration: 'none' }}>
                <Button variant="secondary">Manage Group</Button>
              </Link>
            )}
          </div>

          {/* Back navigation link */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/groups"
              style={{
                color: '#F8F4F0',
                fontSize: '14px',
                textDecoration: 'none',
                opacity: 0.7,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: '1' }}>&#8592;</span>
              Back to My Groups
            </Link>
          </div>

        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
