'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Card, Select, Footer, PageHeader } from '@/components';
import { manageGroupContent } from '@/content/manageGroup';
import { createGroupContent } from '@/content/createGroup';
import { useInviteLinks, useGroups, usePairings } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function ManageGroupPage() {
  const params = useParams();
  const groupId = params?.id as string;
  const { inviteLinks, createInviteLink, loading } = useInviteLinks(groupId);
  const { groups } = useGroups();
  const { createPairings } = usePairings();
  const [message, setMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
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

  const handlePairMembers = async () => {
    try {
      await createPairings(groupId, []);
      setMessage(manageGroupContent.messages.pairingSuccess);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage(manageGroupContent.messages.pairingError);
    }
  };

  const handleCadenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCadence(e.target.value as 'monthly' | 'quarterly' | 'biweekly');
    // TODO: Add API call to update group cadence
    setMessage('Cadence updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!isAdmin) {
    return (
      <PageContainer>
        <ContentContainer>
          <p className="text-red-400">{manageGroupContent.messages.adminOnly}</p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-12">
        <PageHeader>{manageGroupContent.title}</PageHeader>

        {message && (
          <p className={`text-center text-sm mb-4 ${message.includes('success') || message.includes('copied') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        {/* Group Settings Section */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold text-[#FBE6A6] mb-2">
            Group Settings
          </h2>
          <Select
            label="Dinner Cadence"
            name="cadence"
            value={cadence}
            onChange={handleCadenceChange}
            options={createGroupContent.cadenceOptions}
          />
        </div>

        {/* Invite Links Section */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold text-[#FBE6A6] mb-2">
            {manageGroupContent.sections.inviteLinks.title}
          </h2>
          <p className="text-[#F8F4F0] text-base mb-4">
            {manageGroupContent.sections.inviteLinks.description}
          </p>

          <Button onClick={handleCreateLink} disabled={loading} className="mb-4">
            {manageGroupContent.sections.inviteLinks.button}
          </Button>

          <div className="space-y-2">
            {inviteLinks.map(link => (
              <Card key={link.id}>
                <div className="flex justify-between items-center">
                  <code className="text-[#FBE6A6] text-sm break-all">
                    {link.code}
                  </code>
                  <Button
                    onClick={() => handleCopyLink(link.code)}
                    variant="secondary"
                    className="text-xs px-4 py-2"
                  >
                    {copiedLink === link.code ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-[#F8F4F0] text-xs mt-2">
                  Uses: {link.used_count}{link.max_uses ? ` / ${link.max_uses}` : ''}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Pairing Section */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-[#FBE6A6] mb-2">
            {manageGroupContent.sections.pairings.title}
          </h2>
          <p className="text-[#F8F4F0] text-base mb-4">
            {manageGroupContent.sections.pairings.description}
          </p>

          <Button onClick={handlePairMembers}>
            {manageGroupContent.sections.pairings.button}
          </Button>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
