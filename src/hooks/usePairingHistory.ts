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

export function usePairingHistory(groupId: string, userId?: string | null) {
  const [pairings, setPairings] = useState<PairingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPairingHistory() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dinner_events for this group
        const { data: events, error: eventsError } = await supabase
          .from('dinner_events')
          .select('id, scheduled_date')
          .eq('circle_id', groupId)
          .order('scheduled_date', { ascending: false });

        if (eventsError) throw eventsError;

        if (!events || events.length === 0) {
          setPairings([]);
          setLoading(false);
          return;
        }

        const eventIds = events.map(e => e.id);

        // Fetch all matches for these events (with location info)
        const { data: matches, error: matchesError } = await supabase
          .from('dinner_matches')
          .select(`
            id,
            dinner_event_id,
            location_id,
            dinner_locations:location_id (
              locationname,
              locationcity
            )
          `)
          .in('dinner_event_id', eventIds);

        if (matchesError) throw matchesError;

        if (!matches || matches.length === 0) {
          setPairings([]);
          setLoading(false);
          return;
        }

        const matchIds = matches.map(m => m.id);

        // Fetch all guests for these matches
        const { data: guests, error: guestsError } = await supabase
          .from('dinner_match_guests')
          .select(`
            match_id,
            user_id,
            user_profiles:user_id (
              userid,
              username
            )
          `)
          .in('match_id', matchIds);

        if (guestsError) throw guestsError;

        // Build a map of matchId → guests
        const guestsByMatch = new Map<string, { userid: string; username: string }[]>();
        guests?.forEach(g => {
          if (!guestsByMatch.has(g.match_id)) {
            guestsByMatch.set(g.match_id, []);
          }
          guestsByMatch.get(g.match_id)!.push({
            userid: g.user_id,
            username: (g.user_profiles as { username?: string } | null)?.username ?? 'Unknown'
          });
        });

        // Build a map of eventId → scheduledDate
        const dateByEvent = new Map<string, string>();
        events.forEach(e => dateByEvent.set(e.id, e.scheduled_date));

        // Assemble PairingHistoryItems — one per match
        let result: PairingHistoryItem[] = matches.map(match => ({
          dinnerID: match.id,
          dinnerDate: dateByEvent.get(match.dinner_event_id) ?? '',
          location: match.dinner_locations
            ? {
                locationName: (match.dinner_locations as { locationname?: string }).locationname ?? '',
                locationCity: (match.dinner_locations as { locationcity?: string }).locationcity ?? '',
              }
            : undefined,
          attendees: guestsByMatch.get(match.id) ?? [],
        }));

        // If userId is provided, filter to only pairings where user is an attendee
        if (userId) {
          result = result.filter(p =>
            p.attendees.some(a => a.userid === userId)
          );
        }

        setPairings(result);
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
  }, [groupId, userId]);

  return { pairings, loading, error };
}
