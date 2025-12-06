'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PairResult {
  person1: {
    userid: string;
    username: string;
  };
  person2: {
    userid: string;
    username: string;
  };
  person3?: {
    userid: string;
    username: string;
  };
}

export function usePairings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate dinner pairs for a group
   * Algorithm: Match people who have NOT eaten together before
   */
  const generatePairs = async (groupId: string, dinnerId: string): Promise<PairResult[]> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Starting pairing algorithm for group:', groupId);

      // Step 1: Get all group members
      const { data: members, error: membersError } = await supabase
        .from('peoplegroup')
        .select(`
          users_userid,
          people:userid (
            userid,
            username
          )
        `)
        .eq('groups_groupid', groupId);

      if (membersError) throw membersError;
      if (!members || members.length === 0) {
        throw new Error('No members found in group');
      }

      console.log('👥 Found', members.length, 'members');

      // Step 2: Get pairing history - who has eaten together before
      const { data: history, error: historyError } = await supabase
        .from('peopledinner')
        .select('users_userid, dinners_dinnerid, dinners!inner(groups_groupid)')
        .eq('dinners.groups_groupid', groupId);

      if (historyError) {
        console.warn('Error fetching history:', historyError);
        // Continue without history - first dinner
      }

      console.log('📜 Found', history?.length || 0, 'previous dinner attendances');

      // Step 3: Build pairing history map
      // Group history by dinner, then create pairs from each dinner
      const dinnerGroups = new Map<string, string[]>();
      history?.forEach(record => {
        const dinnerId = record.dinners_dinnerid;
        if (!dinnerGroups.has(dinnerId)) {
          dinnerGroups.set(dinnerId, []);
        }
        dinnerGroups.get(dinnerId)!.push(record.users_userid);
      });

      // Track who has eaten together
      const eatenTogether = new Set<string>();
      dinnerGroups.forEach(attendees => {
        // Everyone who attended the same dinner has eaten together
        for (let i = 0; i < attendees.length; i++) {
          for (let j = i + 1; j < attendees.length; j++) {
            const pair = [attendees[i], attendees[j]].sort().join('|');
            eatenTogether.add(pair);
          }
        }
      });

      console.log('🤝 Found', eatenTogether.size, 'existing pairings to avoid');

      // Step 4: Generate optimal pairs
      const userList = members.map(m => ({
        userid: m.users_userid,
        username: (m.people as any).username
      }));

      const pairs: PairResult[] = [];
      const paired = new Set<string>();

      // Simple greedy algorithm: pair people who haven't eaten together
      for (let i = 0; i < userList.length; i++) {
        if (paired.has(userList[i].userid)) continue;

        let bestMatch = null;
        for (let j = i + 1; j < userList.length; j++) {
          if (paired.has(userList[j].userid)) continue;

          const pairKey = [userList[i].userid, userList[j].userid].sort().join('|');
          if (!eatenTogether.has(pairKey)) {
            bestMatch = j;
            break;
          }
        }

        if (bestMatch !== null) {
          // Found a match!
          pairs.push({
            person1: userList[i],
            person2: userList[bestMatch]
          });
          paired.add(userList[i].userid);
          paired.add(userList[bestMatch].userid);
          console.log('✅ Paired:', userList[i].username, '↔️', userList[bestMatch].username);
        }
      }

      // Handle unpaired people (odd number)
      const unpaired = userList.filter(u => !paired.has(u.userid));
      if (unpaired.length > 0) {
        if (pairs.length > 0) {
          // Add unpaired person to last pair (group of 3)
          const lastPair = pairs[pairs.length - 1];
          lastPair.person3 = unpaired[0];
          console.log('➕ Added to group of 3:', unpaired[0].username);
        } else {
          // Edge case: only 1 person
          console.warn('⚠️ Only 1 person available, cannot create pairs');
        }
      }

      console.log('🎉 Generated', pairs.length, 'pairs');

      // Step 5: Insert pairs into peopledinner table
      const insertRecords = [];
      for (const pair of pairs) {
        insertRecords.push({
          users_userid: pair.person1.userid,
          dinners_dinnerid: dinnerId
        });
        insertRecords.push({
          users_userid: pair.person2.userid,
          dinners_dinnerid: dinnerId
        });
        if (pair.person3) {
          insertRecords.push({
            users_userid: pair.person3.userid,
            dinners_dinnerid: dinnerId
          });
        }
      }

      if (insertRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('peopledinner')
          .insert(insertRecords);

        if (insertError) {
          console.error('❌ Error inserting pairs:', insertError);
          throw insertError;
        }

        console.log('💾 Saved', insertRecords.length, 'dinner attendances');
      }

      setLoading(false);
      return pairs;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Pairing algorithm failed:', err);
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return { generatePairs, loading, error };
}
