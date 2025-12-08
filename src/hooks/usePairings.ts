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
  dinnerID: string;
  location?: {
    locationID: string;
    locationName: string;
    locationCity: string;
  };
}

export function usePairings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate dinner pairs for a group
   * Algorithm: Match people who have NOT eaten together before
   * Creates a separate dinner with location for each pair
   */
  const generatePairs = async (groupId: string): Promise<PairResult[]> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Starting pairing algorithm for group:', groupId);

      // Step 1: Get group details to find the city
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('groupcity')
        .eq('groupid', groupId)
        .single();

      if (groupError) throw groupError;
      const groupCity = groupData?.groupcity;

      console.log('📍 Group city:', groupCity);

      // Step 2: Get all group members
      const { data: members, error: membersError } = await supabase
        .from('peoplegroup')
        .select(`
          users_userid,
          people:users_userid (
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

      // Step 3: Get available dinner locations (filtered by group city)
      let locationsQuery = supabase
        .from('dinner_locations')
        .select('locationid, locationname, locationcity');

      // Only filter by city if the group has a city set
      if (groupCity) {
        locationsQuery = locationsQuery.eq('locationcity', groupCity);
      }

      const { data: locations, error: locationsError } = await locationsQuery;

      if (locationsError) {
        console.warn('Error fetching locations:', locationsError);
      }

      console.log('🏪 Found', locations?.length || 0, 'dinner locations in', groupCity || 'all cities');

      // Step 4: Get pairing history - who has eaten together before
      const { data: history, error: historyError } = await supabase
        .from('peopledinner')
        .select('users_userid, dinners_dinnerid, dinners!inner(groups_groupid)')
        .eq('dinners.groups_groupid', groupId);

      if (historyError) {
        console.warn('Error fetching history:', historyError);
      }

      console.log('📜 Found', history?.length || 0, 'previous dinner attendances');

      // Step 4: Build pairing history map
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
        for (let i = 0; i < attendees.length; i++) {
          for (let j = i + 1; j < attendees.length; j++) {
            const pair = [attendees[i], attendees[j]].sort().join('|');
            eatenTogether.add(pair);
          }
        }
      });

      console.log('🤝 Found', eatenTogether.size, 'existing pairings to avoid');

      // Step 5: Generate optimal pairs
      const userList = members.map(m => ({
        userid: m.users_userid,
        username: (m.people as any).username
      }));

      const pairs: PairResult[] = [];
      const paired = new Set<string>();

      // Greedy algorithm: pair people who haven't eaten together
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
          // Create a dinner for this pair
          const dinnerDate = new Date();
          dinnerDate.setDate(dinnerDate.getDate() + 7); // 1 week from now

          const { data: newDinner, error: dinnerError } = await supabase
            .from('dinners')
            .insert({
              groups_groupid: groupId,
              dinner_date: dinnerDate.toISOString(),
              dinner_locations_locationid: locations && locations.length > 0
                ? locations[Math.floor(Math.random() * locations.length)].locationid
                : null
            })
            .select('dinnerid, dinner_locations_locationid')
            .single();

          if (dinnerError) {
            console.error('Error creating dinner:', dinnerError);
            throw dinnerError;
          }

          // Get location details if assigned
          let locationDetails = undefined;
          if (newDinner.dinner_locations_locationid && locations) {
            const loc = locations.find(l => l.locationid === newDinner.dinner_locations_locationid);
            if (loc) {
              locationDetails = {
                locationID: loc.locationid,
                locationName: loc.locationname,
                locationCity: loc.locationcity
              };
            }
          }

          const pairResult: PairResult = {
            person1: userList[i],
            person2: userList[bestMatch],
            dinnerID: newDinner.dinnerid,
            location: locationDetails
          };

          pairs.push(pairResult);
          paired.add(userList[i].userid);
          paired.add(userList[bestMatch].userid);

          console.log('✅ Paired:', userList[i].username, '↔️', userList[bestMatch].username,
                      'at', locationDetails?.locationName || 'TBD');

          // Insert into peopledinner
          await supabase
            .from('peopledinner')
            .insert([
              {
                users_userid: userList[i].userid,
                dinners_dinnerid: newDinner.dinnerid
              },
              {
                users_userid: userList[bestMatch].userid,
                dinners_dinnerid: newDinner.dinnerid
              }
            ]);
        }
      }

      // Handle unpaired people (odd number)
      const unpaired = userList.filter(u => !paired.has(u.userid));
      if (unpaired.length > 0 && pairs.length > 0) {
        // Add unpaired person to last pair's dinner
        const lastPair = pairs[pairs.length - 1];
        lastPair.person3 = unpaired[0];

        await supabase
          .from('peopledinner')
          .insert({
            users_userid: unpaired[0].userid,
            dinners_dinnerid: lastPair.dinnerID
          });

        console.log('➕ Added to group of 3:', unpaired[0].username);
      }

      console.log('🎉 Generated', pairs.length, 'pairs with separate dinners');

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
