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

        // Fetch non-declined invites for this user with event and group info
        const { data: invites, error: invitesError } = await supabase
          .from('dinner_invites')
          .select(`
            id,
            status,
            dinner_event_id,
            dinner_events!inner(
              id,
              scheduled_date,
              circle_id,
              groups!inner(
                groupid,
                groupname,
                dinner_cadence
              )
            )
          `)
          .eq('user_id', user.id)
          .neq('status', 'declined');

        if (invitesError) throw invitesError;

        if (!invites || invites.length === 0) {
          setDinners([]);
          setLoading(false);
          return;
        }

        // For accepted invites, find partner and availability
        const results: UpcomingDinner[] = await Promise.all(
          invites.map(async (invite) => {
            const event = invite.dinner_events as unknown as {
              id: string;
              scheduled_date: string | null;
              circle_id: string;
              groups: { groupid: string; groupname: string; dinner_cadence: string };
            };
            const group = event.groups;

            const isAccepted = invite.status === 'accepted';

            let partner: { userid: string; username: string } | null = null;
            let userHasSetAvailability = false;
            let partnerHasSetAvailability: boolean | null = null;

            if (isAccepted) {
              // Find which match this user belongs to for this event
              const { data: myGuests } = await supabase
                .from('dinner_match_guests')
                .select(`
                  match_id,
                  dinner_matches!inner(dinner_event_id)
                `)
                .eq('user_id', user.id)
                .eq('dinner_matches.dinner_event_id', invite.dinner_event_id)
                .limit(1);

              if (myGuests && myGuests.length > 0) {
                const matchId = myGuests[0].match_id;

                // Find partner in the same match
                const { data: partnerGuests } = await supabase
                  .from('dinner_match_guests')
                  .select('user_id, user_profiles:user_id(userid, username)')
                  .eq('match_id', matchId)
                  .neq('user_id', user.id)
                  .limit(1);

                if (partnerGuests && partnerGuests.length > 0) {
                  const pg = partnerGuests[0];
                  const profile = pg.user_profiles as { userid?: string; username?: string } | null;
                  partner = {
                    userid: pg.user_id,
                    username: profile?.username ?? 'Unknown',
                  };
                }
              }

              // Check user's availability for this event
              const { data: mySlots } = await supabase
                .from('availability_slots')
                .select('id')
                .eq('user_id', user.id)
                .eq('dinner_event_id', invite.dinner_event_id)
                .limit(1);

              userHasSetAvailability = (mySlots?.length ?? 0) > 0;

              // Check partner's availability
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
              inviteId: invite.id,
              eventId: invite.dinner_event_id,
              inviteStatus: invite.status as 'pending' | 'accepted' | 'declined',
              scheduledDate: event.scheduled_date,
              groupName: group.groupname,
              groupId: group.groupid,
              cadence: group.dinner_cadence as 'monthly' | 'biweekly' | 'quarterly',
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
