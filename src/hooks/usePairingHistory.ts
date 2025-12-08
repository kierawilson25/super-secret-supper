'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PairingHistoryItem {
  dinnerID: string;
  dinnerDate: string;
  location?: {
    locationName: string;
    locationCity: string;
  };
  attendees: {
    userid: string;
    username: string;
  }[];
}

export function usePairingHistory(groupId: string) {
  const [pairings, setPairings] = useState<PairingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPairingHistory() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dinners for this group with location info
        const { data: dinners, error: dinnersError } = await supabase
          .from('dinners')
          .select(`
            dinnerid,
            dinner_date,
            dinner_locations:dinner_locations_locationid (
              locationname,
              locationcity
            )
          `)
          .eq('groups_groupid', groupId)
          .order('dinner_date', { ascending: false });

        if (dinnersError) throw dinnersError;

        if (!dinners || dinners.length === 0) {
          setPairings([]);
          setLoading(false);
          return;
        }

        // For each dinner, fetch the attendees
        const pairingsWithAttendees = await Promise.all(
          dinners.map(async (dinner) => {
            const { data: attendees, error: attendeesError } = await supabase
              .from('peopledinner')
              .select(`
                users_userid,
                people:users_userid (
                  userid,
                  username
                )
              `)
              .eq('dinners_dinnerid', dinner.dinnerid);

            if (attendeesError) {
              console.error('Error fetching attendees:', attendeesError);
              return null;
            }

            return {
              dinnerID: dinner.dinnerid,
              dinnerDate: dinner.dinner_date,
              location: dinner.dinner_locations ? {
                locationName: (dinner.dinner_locations as any).locationname,
                locationCity: (dinner.dinner_locations as any).locationcity
              } : undefined,
              attendees: attendees?.map(a => ({
                userid: a.users_userid,
                username: (a.people as any)?.username || 'Unknown'
              })) || []
            };
          })
        );

        // Filter out any null results and set the data
        const validPairings = pairingsWithAttendees.filter(p => p !== null) as PairingHistoryItem[];
        setPairings(validPairings);
        setLoading(false);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching pairing history:', err);
        setError(errorMessage);
        setLoading(false);
      }
    }

    if (groupId) {
      fetchPairingHistory();
    }
  }, [groupId]);

  return { pairings, loading, error };
}
