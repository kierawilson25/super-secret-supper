'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UpcomingDinner {
  inviteId: string;
  eventId: string;
  inviteStatus: 'pending' | 'accepted' | 'declined';
  scheduledDate: string | null;
  groupName: string;
  groupId: string;
  cadence: 'monthly' | 'biweekly' | 'quarterly';
  partner: { userid: string; username: string } | null; // null until accepted
  userHasSetAvailability: boolean;
  partnerHasSetAvailability: boolean | null; // null until accepted
}

export function useUpcomingDinners(refreshKey?: number) {
  const [dinners, setDinners] = useState<UpcomingDinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcomingDinners() {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setDinners([]);
          setLoading(false);
          return;
        }

        // 1. Fetch non-declined invites
        const { data: invites, error: invitesError } = await supabase
          .from('dinner_invites')
          .select('id, status, dinner_event_id')
          .eq('invitee_id', user.id)
          .neq('status', 'declined');

        if (invitesError) throw invitesError;
        if (!invites || invites.length === 0) {
          setDinners([]);
          setLoading(false);
          return;
        }

        // 2. Fetch events
        const eventIds = invites.map(i => i.dinner_event_id as string);
        const { data: events, error: eventsError } = await supabase
          .from('dinner_events')
          .select('id, scheduled_date, circle_id')
          .in('id', eventIds);

        if (eventsError) throw eventsError;

        // 3. Fetch groups
        const circleIds = [...new Set((events ?? []).map(e => e.circle_id as string))];
        const { data: groupRows, error: groupsError } = await supabase
          .from('groups')
          .select('groupid, groupname, dinner_cadence')
          .in('groupid', circleIds);

        if (groupsError) throw groupsError;

        const eventMap = Object.fromEntries((events ?? []).map(e => [e.id as string, e]));
        const groupMap = Object.fromEntries((groupRows ?? []).map(g => [g.groupid as string, g]));

        // 4. Build each UpcomingDinner
        const results: UpcomingDinner[] = await Promise.all(
          invites.map(async (invite) => {
            const event = eventMap[invite.dinner_event_id as string];
            const group = event ? groupMap[event.circle_id as string] : null;

            const isAccepted = invite.status === 'accepted';
            let partner: { userid: string; username: string } | null = null;
            let userHasSetAvailability = false;
            let partnerHasSetAvailability: boolean | null = null;

            if (isAccepted) {
              // Find all matches for this event, then check which one has this user
              const { data: eventMatches } = await supabase
                .from('dinner_matches')
                .select('id')
                .eq('dinner_event_id', invite.dinner_event_id);

              if (eventMatches && eventMatches.length > 0) {
                const matchIds = eventMatches.map(m => m.id as string);

                const { data: myMatchGuest } = await supabase
                  .from('dinner_match_guests')
                  .select('match_id')
                  .eq('user_id', user.id)
                  .in('match_id', matchIds)
                  .limit(1);

                if (myMatchGuest && myMatchGuest.length > 0) {
                  const matchId = myMatchGuest[0].match_id as string;

                  // Find partner's user_id
                  const { data: partnerGuest } = await supabase
                    .from('dinner_match_guests')
                    .select('user_id')
                    .eq('match_id', matchId)
                    .neq('user_id', user.id)
                    .limit(1);

                  if (partnerGuest && partnerGuest.length > 0) {
                    const partnerId = partnerGuest[0].user_id as string;

                    const { data: partnerProfile } = await supabase
                      .from('user_profiles')
                      .select('userid, username')
                      .eq('userid', partnerId)
                      .single();

                    if (partnerProfile) {
                      partner = {
                        userid: partnerProfile.userid as string,
                        username: (partnerProfile.username as string | null) ?? 'Unknown',
                      };
                    }
                  }
                }
              }

              // Check user's availability
              const { data: mySlots } = await supabase
                .from('availability_slots')
                .select('id')
                .eq('user_id', user.id)
                .eq('dinner_event_id', invite.dinner_event_id)
                .limit(1);

              userHasSetAvailability = (mySlots?.length ?? 0) > 0;

              if (partner) {
                const { data: partnerSlots } = await supabase
                  .from('availability_slots')
                  .select('id')
                  .eq('user_id', partner.userid)
                  .eq('dinner_event_id', invite.dinner_event_id)
                  .limit(1);

                partnerHasSetAvailability = (partnerSlots?.length ?? 0) > 0;
              }
            }

            return {
              inviteId: invite.id as string,
              eventId: invite.dinner_event_id as string,
              inviteStatus: invite.status as 'pending' | 'accepted' | 'declined',
              scheduledDate: (event?.scheduled_date as string | null) ?? null,
              groupName: (group?.groupname as string | null) ?? '',
              groupId: (group?.groupid as string | null) ?? '',
              cadence: ((group?.dinner_cadence as string | null) ?? 'monthly') as 'monthly' | 'biweekly' | 'quarterly',
              partner,
              userHasSetAvailability,
              partnerHasSetAvailability,
            };
          })
        );

        setDinners(results);
        setLoading(false);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching upcoming dinners:', err);
        setError(errorMessage);
        setLoading(false);
      }
    }

    fetchUpcomingDinners();
  }, [refreshKey]);

  return { dinners, loading, error };
}
