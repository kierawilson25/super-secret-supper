'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Card, Footer, PageHeader } from '@/components';
import { useMembers, usePairings, usePairingHistory } from '@/hooks';

export default function PairMembersPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { members } = useMembers(groupId);
  const { createPairings, loading: pairingLoading } = usePairings();
  const { history: pairingHistory } = usePairingHistory(groupId);
  const [message, setMessage] = useState('');

  const shouldPair = (user1Id: string, user2Id: string): boolean => {
    const pair = pairingHistory.find(
      p => (p.user_1_id === user1Id && p.user_2_id === user2Id) ||
           (p.user_1_id === user2Id && p.user_2_id === user1Id)
    );
    return !pair;
  };

  const generatePairings = () => {
    if (members.length < 2) {
      setMessage('You need at least 2 members to pair.');
      return;
    }

    const shuffled = [...members].sort(() => Math.random() - 0.5);
    const pairs: Array<{ user1Id: string; user2Id: string }> = [];

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const user1 = shuffled[i];
      const user2 = shuffled[i + 1];

      if (shouldPair(user1.id, user2.id)) {
        pairs.push({ user1Id: user1.id, user2Id: user2.id });
      }
    }

    return pairs;
  };

  const handlePairMembers = async () => {
    try {
      const pairs = generatePairings();
      if (pairs && pairs.length > 0) {
        await createPairings(groupId, pairs);
        setMessage('Members paired successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Could not generate pairings. All pairs may have already met.');
      }
    } catch (err) {
      setMessage('Error pairing members.');
    }
  };

  return (
    <PageContainer>
      <ContentContainer className="pt-12">
        <PageHeader>Pair Members</PageHeader>
        <p className="text-[#F8F4F0] text-base mb-8">
          Generate secret dinner pairings for your group
        </p>

        {message && (
          <p className={`text-center text-sm mb-4 ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <div className="w-full mb-8">
          <h2 className="text-xl font-bold text-[#FBE6A6] mb-4">
            Members ({members.length})
          </h2>
          <div className="space-y-2 mb-6">
            {members.map(member => (
              <Card key={member.id}>
                <div className="flex items-center gap-3">
                  {member.avatar_url && (
                    <Image
                      src={member.avatar_url}
                      alt={member.username || 'Member'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-[#F8F4F0]">
                    {member.username || 'Anonymous'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handlePairMembers}
            disabled={pairingLoading || members.length < 2}
          >
            {pairingLoading ? 'Pairing...' : 'Generate Pairings'}
          </Button>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
