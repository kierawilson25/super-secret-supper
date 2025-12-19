'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, PageLoading, PageHeader, Footer } from '@/components';
import { supabase } from '@/lib/supabase';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [groupName, setGroupName] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('');
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    handleInviteRedemption();
  }, [code]);

  async function handleInviteRedemption() {
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        // Redirect to login with returnTo parameter
        router.push(`/login?returnTo=/invite/${code}`);
        return;
      }

      console.log('User authenticated, validating invite code:', code);

      // Fetch invite link with group info
      const { data: inviteData, error: inviteError } = await supabase
        .from('invite_links')
        .select(`
          id,
          code,
          group_id,
          expires_at,
          max_uses,
          used_count,
          groups:group_id (
            groupid,
            groupname
          )
        `)
        .eq('code', code)
        .single();

      if (inviteError || !inviteData) {
        console.error('Invite fetch error:', inviteError);
        setError('This invite link is invalid or doesn\'t exist');
        setLoading(false);
        return;
      }

      console.log('Invite data:', inviteData);

      // Check if expired
      if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
        setError('This invite link has expired');
        setLoading(false);
        return;
      }

      // Check if max uses reached
      if (inviteData.max_uses && inviteData.used_count >= inviteData.max_uses) {
        setError('This invite link has reached its maximum number of uses');
        setLoading(false);
        return;
      }

      // Get group name
      const group = (inviteData.groups as any);
      const fetchedGroupName = group?.groupname || 'the group';
      const fetchedGroupId = inviteData.group_id;

      setGroupName(fetchedGroupName);
      setGroupId(fetchedGroupId);

      // Check if user is already a member
      const { data: memberCheck } = await supabase
        .from('peoplegroup')
        .select('*')
        .eq('groups_groupid', fetchedGroupId)
        .eq('users_userid', user.id)
        .single();

      if (memberCheck) {
        console.log('User is already a member');
        setAlreadyMember(true);
        setLoading(false);
        return;
      }

      // Add user to group
      console.log('Adding user to group...');
      const { error: joinError } = await supabase
        .from('peoplegroup')
        .insert({
          groups_groupid: fetchedGroupId,
          users_userid: user.id,
        });

      if (joinError) {
        console.error('Error joining group:', joinError);
        throw new Error('Failed to join group. Please try again.');
      }

      // Increment used_count
      const { error: updateError } = await supabase
        .from('invite_links')
        .update({ used_count: inviteData.used_count + 1 })
        .eq('id', inviteData.id);

      if (updateError) {
        console.error('Error updating invite count:', updateError);
        // Don't throw - user was added successfully
      }

      console.log('Successfully joined group!');
      setSuccess(true);
      setLoading(false);

      // Redirect to group members page after 2 seconds
      setTimeout(() => {
        router.push(`/groups/${fetchedGroupId}/members`);
      }, 2000);

    } catch (err) {
      console.error('Error in invite redemption:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  }

  if (loading) {
    return <PageLoading message="Validating invite link..." />;
  }

  if (alreadyMember) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Already a Member</PageHeader>
          <p style={{ color: '#F8F4F0', textAlign: 'center', marginBottom: '24px' }}>
            You're already a member of {groupName}!
          </p>
          <Button onClick={() => router.push(`/groups/${groupId}/members`)}>
            View Group
          </Button>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (success) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Welcome!</PageHeader>
          <p style={{ color: '#10b981', textAlign: 'center', fontSize: '18px', marginBottom: '8px' }}>
            Successfully joined {groupName}!
          </p>
          <p style={{ color: '#F8F4F0', textAlign: 'center', marginBottom: '24px' }}>
            Redirecting to group page...
          </p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Invalid Invite</PageHeader>
          <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '24px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button onClick={() => router.push('/groups')}>
              View My Groups
            </Button>
            <Button variant="secondary" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return null;
}
