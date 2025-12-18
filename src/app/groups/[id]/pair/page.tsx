'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Card, Footer, PageHeader, PageLoading } from '@/components';
import { usePairings, PairResult, useGroupAdmin } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function PairMembersPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;
  const { isAdmin, loading: adminLoading } = useGroupAdmin(groupId);
  const { generatePairs, loading, error } = usePairings();
  const [message, setMessage] = useState('');
  const [pairs, setPairs] = useState<PairResult[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    async function getMemberCount() {
      try {
        const { data: members } = await supabase
          .from('peoplegroup')
          .select('users_userid')
          .eq('groups_groupid', groupId);

        setMemberCount(members?.length || 0);
      } catch (err) {
        console.error('Error getting member count:', err);
      }
    }

    getMemberCount();
  }, [groupId]);

  const handleGeneratePairs = async () => {
    if (memberCount < 2) {
      setMessage('You need at least 2 members to generate pairs.');
      return;
    }

    try {
      setMessage('');
      setPairs([]);

      console.log('🎯 Generating pairs for group:', groupId);

      const generatedPairs = await generatePairs(groupId);
      setPairs(generatedPairs);
      setMessage(`Successfully generated ${generatedPairs.length} ${generatedPairs.length === 1 ? 'pair' : 'pairs'}!`);
    } catch (err) {
      console.error('Error generating pairs:', err);
      setMessage(error || 'Failed to generate pairs. Check console for details.');
    }
  };

  // Show loading state while checking admin status
  if (adminLoading) {
    return <PageLoading message="Loading..." />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <PageContainer>
        <ContentContainer className="pt-12">
          <PageHeader>Access Denied</PageHeader>
          <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '24px' }}>
            Only group admins can generate pairs.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button onClick={() => router.push(`/groups/${groupId}/pairs`)}>
              View Your Pairings
            </Button>
            <Button variant="secondary" onClick={() => router.push(`/groups/${groupId}/members`)}>
              View Members
            </Button>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-12">
        <PageHeader>Generate Dinner Pairs</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          Create optimal pairings for your next dinner event
          <br />
          <span className="text-sm">Each pair gets their own dinner at a random location!</span>
        </p>

        {message && (
          <p className={`text-center text-sm mb-6 ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <div className="w-full mb-8">
          <div className="bg-[#2A2A2A] rounded-lg p-6 mb-6">
            <h3 className="text-[#FBE6A6] font-bold text-lg mb-2">Group Info</h3>
            <p className="text-[#F8F4F0] text-sm mb-1">
              👥 Total Members: {memberCount}
            </p>
            <p className="text-[#F8F4F0] text-sm">
              🍽️ Expected Pairs: {Math.floor(memberCount / 2)}
            </p>
          </div>

          <Button
            onClick={handleGeneratePairs}
            disabled={loading || memberCount < 2}
            className="mb-8"
          >
            {loading ? 'Generating Pairs...' : '✨ Generate Pairs'}
          </Button>

          {pairs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#FBE6A6] mb-4 text-center">
                🎉 Generated Pairs
              </h2>

              {pairs.map((pair, index) => (
                <Card key={index}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[#FBE6A6] font-bold text-lg">
                        Pair {index + 1} {pair.person3 ? '(Group of 3)' : ''}
                      </h3>
                      <div className="text-4xl">
                        {pair.person3 ? '👨‍👩‍👦' : '👥'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[#F8F4F0] font-medium">
                          👤 {pair.person1.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#F8F4F0] font-medium">
                          👤 {pair.person2.username}
                        </span>
                      </div>
                      {pair.person3 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[#F8F4F0] font-medium">
                            👤 {pair.person3.username}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#444] pt-3 mt-2">
                      <div className="text-[#F8F4F0] text-sm">
                        {pair.location ? (
                          <>
                            <p className="mb-1">
                              📍 <strong>Location:</strong> {pair.location.locationName}
                            </p>
                            <p>
                              🏙️ <strong>City:</strong> {pair.location.locationCity}
                            </p>
                          </>
                        ) : (
                          <p className="text-yellow-400">
                            ⚠️ No location assigned yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <div className="bg-[#2A2A2A] rounded-lg p-4 mt-6">
                <p className="text-[#F8F4F0] text-sm text-center">
                  💡 Each pair has their own separate dinner! These pairings have been saved and won't be repeated.
                </p>
              </div>
            </div>
          )}
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
