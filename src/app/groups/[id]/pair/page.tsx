'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Card, Footer, PageHeader } from '@/components';
import { usePairings, PairResult } from '@/hooks/usePairings';
import { supabase } from '@/lib/supabase';

export default function PairMembersPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { generatePairs, loading, error } = usePairings();
  const [message, setMessage] = useState('');
  const [pairs, setPairs] = useState<PairResult[]>([]);
  const [dinnerId, setDinnerId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    async function setup() {
      try {
        // Get member count
        const { data: members } = await supabase
          .from('peoplegroup')
          .select('users_userid')
          .eq('groups_groupid', groupId);

        setMemberCount(members?.length || 0);

        // Get or create a dinner for this group
        const { data: existingDinners } = await supabase
          .from('dinners')
          .select('dinnerid')
          .eq('groups_groupid', groupId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingDinners && existingDinners.length > 0) {
          setDinnerId(existingDinners[0].dinnerid);
        } else {
          // Create a new dinner
          const { data: newDinner } = await supabase
            .from('dinners')
            .insert({
              groups_groupid: groupId,
              dinner_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            })
            .select('dinnerid')
            .single();

          if (newDinner) {
            setDinnerId(newDinner.dinnerid);
          }
        }
      } catch (err) {
        console.error('Setup error:', err);
      }
    }

    setup();
  }, [groupId]);

  const handleGeneratePairs = async () => {
    if (!dinnerId) {
      setMessage('No dinner found. Please create a dinner first.');
      return;
    }

    if (memberCount < 2) {
      setMessage('You need at least 2 members to generate pairs.');
      return;
    }

    try {
      setMessage('');
      setPairs([]);

      console.log('🎯 Generating pairs for group:', groupId, 'dinner:', dinnerId);

      const generatedPairs = await generatePairs(groupId, dinnerId);
      setPairs(generatedPairs);
      setMessage(`Successfully generated ${generatedPairs.length} ${generatedPairs.length === 1 ? 'pair' : 'pairs'}!`);
    } catch (err) {
      console.error('Error generating pairs:', err);
      setMessage(error || 'Failed to generate pairs. Check console for details.');
    }
  };

  return (
    <PageContainer>
      <ContentContainer className="pt-12">
        <PageHeader>Generate Dinner Pairs</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          Create optimal pairings for your next dinner event
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
              🍽️ Dinner ID: {dinnerId ? dinnerId.substring(0, 8) + '...' : 'Loading...'}
            </p>
          </div>

          <Button
            onClick={handleGeneratePairs}
            disabled={loading || !dinnerId || memberCount < 2}
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
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-[#FBE6A6] font-bold text-lg mb-2">
                        Pair {index + 1} {pair.person3 ? '(Group of 3)' : ''}
                      </h3>
                      <div className="flex flex-col gap-1">
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
                    </div>
                    <div className="text-4xl">
                      {pair.person3 ? '👨‍👩‍👦' : '👥'}
                    </div>
                  </div>
                </Card>
              ))}

              <div className="bg-[#2A2A2A] rounded-lg p-4 mt-6">
                <p className="text-[#F8F4F0] text-sm text-center">
                  💡 These pairs have been saved to the database and won't be repeated in future pairings!
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
