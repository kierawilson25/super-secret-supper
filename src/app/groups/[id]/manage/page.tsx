'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, Button, Card, Select, Footer, PageHeader, PageLoading } from '@/components';
import { manageGroupContent } from '@/content/manageGroup';
import { createGroupContent } from '@/content/createGroup';
import { useInviteLinks, useGroups, usePairingHistory } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function ManageGroupPage() {
  const params = useParams();
  const groupId = params?.id as string;
  const { inviteLinks, createInviteLink, loading } = useInviteLinks(groupId);
  const { groups, loading: groupsLoading } = useGroups();
  const { pairings } = usePairingHistory(groupId);
  const [message, setMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setUserLoading(false);
    }
    getCurrentUser();
  }, []);

  const group = groups.find(g => g.groupid === groupId);
  const isAdmin = group && currentUserId && group.admin_id === currentUserId;
  const [cadence, setCadence] = useState(group?.dinner_cadence || 'monthly');

  const handleCreateLink = async () => {
    try {
      await createInviteLink();
      setMessage(manageGroupContent.messages.linkCopied);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage(manageGroupContent.messages.linkError);
    }
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCadenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCadence(e.target.value as 'monthly' | 'quarterly' | 'biweekly');
    setMessage('Cadence updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Calculate pairing statistics
  const memberCount = group?.member_count || 0;

  // Count unique pairing events (each unique date is one pairing event)
  const uniqueDates = new Set<string>();
  pairings.forEach(pairing => {
    if (pairing.dinnerDate) {
      const date = new Date(pairing.dinnerDate);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      uniqueDates.add(dateKey);
    }
  });

  const totalPairingsCompleted = uniqueDates.size;

  // To get everyone paired with everyone else once, you need (n-1) pairing rounds
  // where n is the number of members
  const totalPairingsNeeded = memberCount > 1 ? memberCount - 1 : 0;
  const pairingsLeft = Math.max(0, totalPairingsNeeded - totalPairingsCompleted);

  // Debug logging
  console.log('Pairing Statistics:', {
    memberCount,
    totalPairingsCompleted,
    totalPairingsNeeded,
    pairingsLeft,
    uniqueDates: Array.from(uniqueDates),
    totalDinners: pairings.length
  });

  // Reusable styles
  const sectionCard: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: '2px solid #FBE6A6',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FBE6A6',
    marginBottom: '12px',
  };

  const sectionText: React.CSSProperties = {
    color: '#F8F4F0',
    fontSize: '14px',
    marginBottom: '16px',
  };

  const inviteLinkCard: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '1px solid #FBE6A6',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
  };

  // Show loading state while fetching user and group data
  if (userLoading || groupsLoading) {
    return <PageLoading message="Loading group..." />;
  }

  // After loading, check if user is admin
  if (!isAdmin) {
    return (
      <PageContainer>
        <div style={{ padding: '48px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={sectionCard}>
            <p style={{ color: '#f87171' }}>{manageGroupContent.messages.adminOnly}</p>
          </div>
        </div>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '48px 16px 150px 16px',
          boxSizing: 'border-box',
        }}
      >
        <PageHeader>{manageGroupContent.title}</PageHeader>

        {message && (
          <div
            style={{
              ...sectionCard,
              borderColor: message.includes('success') || message.includes('copied') ? '#4ade80' : '#f87171',
              padding: '12px 16px',
            }}
          >
            <p
              style={{
                color: message.includes('success') || message.includes('copied') ? '#4ade80' : '#f87171',
                fontSize: '14px',
                textAlign: 'center',
                margin: 0,
              }}
            >
              {message}
            </p>
          </div>
        )}

        {/* Group Settings Section */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>Group Settings</h2>
          <Select
            label="Dinner Cadence"
            name="cadence"
            value={cadence}
            onChange={handleCadenceChange}
            options={createGroupContent.cadenceOptions}
          />
        </div>

        {/* Pairing Statistics Section */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>Pairing Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ color: '#F8F4F0', fontSize: '12px', marginBottom: '4px' }}>
                Total Pairings Completed
              </p>
              <p style={{ color: '#FBE6A6', fontSize: '24px', fontWeight: 'bold' }}>
                {totalPairingsCompleted}
              </p>
            </div>
            <div>
              <p style={{ color: '#F8F4F0', fontSize: '12px', marginBottom: '4px' }}>
                Pairings Left
              </p>
              <p style={{ color: '#FBE6A6', fontSize: '24px', fontWeight: 'bold' }}>
                {pairingsLeft}
              </p>
            </div>
          </div>
          {memberCount > 1 && (
            <p style={{ color: '#F8F4F0', fontSize: '12px', marginTop: '12px', opacity: 0.7 }}>
              {memberCount} members • {totalPairingsNeeded} pairing events needed
            </p>
          )}
        </div>

        {/* Pairing Section */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>{manageGroupContent.sections.pairings.title}</h2>
          <p style={sectionText}>{manageGroupContent.sections.pairings.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href={`/groups/${groupId}/pair`} style={{ textDecoration: 'none' }}>
              <Button>{manageGroupContent.sections.pairings.button}</Button>
            </Link>
            <Link href={`/groups/${groupId}/pairs`} style={{ textDecoration: 'none' }}>
              <Button variant="secondary">View Previous Pairs</Button>
            </Link>
          </div>
        </div>

        {/* Invite Links Section */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>{manageGroupContent.sections.inviteLinks.title}</h2>
          <p style={sectionText}>{manageGroupContent.sections.inviteLinks.description}</p>

          <div style={{ marginBottom: '16px' }}>
            <Button onClick={handleCreateLink} disabled={loading}>
              {manageGroupContent.sections.inviteLinks.button}
            </Button>
          </div>

          {inviteLinks.length > 0 && (
            <div>
              {inviteLinks.map(link => (
                <div key={link.id} style={inviteLinkCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <code style={{ color: '#FBE6A6', fontSize: '13px', wordBreak: 'break-all' }}>
                      {link.code}
                    </code>
                    <Button onClick={() => handleCopyLink(link.code)} variant="secondary">
                      {copiedLink === link.code ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p style={{ color: '#F8F4F0', fontSize: '12px', marginTop: '8px', margin: '8px 0 0 0' }}>
                    Uses: {link.used_count}{link.max_uses ? ` / ${link.max_uses}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </PageContainer>
  );
}