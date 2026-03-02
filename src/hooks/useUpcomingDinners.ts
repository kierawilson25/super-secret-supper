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
  confirmedDate: string | null;
  confirmedSlot: string | null;
  matchStatus: 'waiting_for_partner' | 'no_match' | 'matched' | null;
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

        // 2b. Filter out orphaned invites from failed pairing runs.
        //     A valid invite always has a dinner_match_guest for this user.
        //     Orphaned events (created then errored before match guest insert) show
        //     as cards with "Dinner with your partner" and no partner revealed.
        let validInvites = invites;
        if (eventIds.length > 0) {
          const { data: matchesForEvents } = await supabase
            .from('dinner_matches')
            .select('id, dinner_event_id')
            .in('dinner_event_id', eventIds);

          if (matchesForEvents && matchesForEvents.length > 0) {
            const allMatchIds = matchesForEvents.map(m => m.id as string);
            const { data: myGuests } = await supabase
              .from('dinner_match_guests')
              .select('match_id')
              .eq('user_id', user.id)
              .in('match_id', allMatchIds);

            const myEventIds = new Set(
              (myGuests ?? [])
                .map(g => matchesForEvents.find(m => m.id === g.match_id)?.dinner_event_id as string)
                .filter(Boolean)
            );
            validInvites = invites.filter(i => myEventIds.has(i.dinner_event_id as string));
          } else {
            // No matches exist for any event — all invites are orphaned
            validInvites = [];
          }
        }

        if (validInvites.length === 0) {
          setDinners([]);
          setLoading(false);
          return;
        }

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
          validInvites.map(async (invite) => {
            const event = eventMap[invite.dinner_event_id as string];
            const group = event ? groupMap[event.circle_id as string] : null;

            const isAccepted = invite.status === 'accepted';
            let partner: { userid: string; username: string } | null = null;
            let userHasSetAvailability = false;
            let partnerHasSetAvailability: boolean | null = null;
            let confirmedDate: string | null = null;
            let confirmedSlot: string | null = null;

            if (isAccepted) {
              // Find all matches for this event, then check which one has this user
              const { data: eventMatches } = await supabase
                .from('dinner_matches')
                .select('id, confirmed_date, confirmed_slot')
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
                  const myMatch = eventMatches.find(m => m.id === matchId);
                  confirmedDate = (myMatch?.confirmed_date as string | null) ?? null;
                  confirmedSlot = (myMatch?.confirmed_slot as string | null) ?? null;

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

              // Check availability scoped to this dinner event
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

            const matchStatus: 'waiting_for_partner' | 'no_match' | 'matched' | null = isAccepted
              ? confirmedDate
                ? 'matched'
                : userHasSetAvailability && partnerHasSetAvailability === true
                  ? 'no_match'
                  : 'waiting_for_partner'
              : null;

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
              confirmedDate,
              confirmedSlot,
              matchStatus,
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
