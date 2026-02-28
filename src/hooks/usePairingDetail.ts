'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PairingDetailData {
  inviteId: string | null;
  inviteStatus: 'pending' | 'accepted' | 'declined' | null;
  scheduledDate: string | null;
  groupName: string | null;
  groupId: string | null;
  cadence: 'monthly' | 'biweekly' | 'quarterly' | null;
  partner: { userid: string; username: string } | null;
  location: { locationName: string; locationCity: string } | null;
  userHasSetAvailability: boolean;
  partnerHasSetAvailability: boolean | null;
}

export function usePairingDetail(eventId: string, refreshKey?: number) {
  const [detail, setDetail] = useState<PairingDetailData>({
    inviteId: null,
    inviteStatus: null,
    scheduledDate: null,
    groupName: null,
    groupId: null,
    cadence: null,
    partner: null,
    location: null,
    userHasSetAvailability: false,
    partnerHasSetAvailability: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch the event with group info
        const { data: event, error: eventError } = await supabase
          .from('dinner_events')
          .select(`
            id,
            scheduled_date,
            circle_id,
            groups!inner(
              groupid,
              groupname,
              dinner_cadence
            )
          `)
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        const group = event.groups as unknown as { groupid: string; groupname: string; dinner_cadence: string };

        // Fetch the user's invite for this event
        const { data: invite, error: inviteError } = await supabase
          .from('dinner_invites')
          .select('id, status')
          .eq('dinner_event_id', eventId)
          .eq('user_id', user.id)
          .single();

        if (inviteError) throw inviteError;

        const isAccepted = invite.status === 'accepted';

        let partner: { userid: string; username: string } | null = null;
        let location: { locationName: string; locationCity: string } | null = null;
        let userHasSetAvailability = false;
        let partnerHasSetAvailability: boolean | null = null;

        if (isAccepted) {
          // Find the user's match for this event
          const { data: myGuests } = await supabase
            .from('dinner_match_guests')
            .select(`
              match_id,
              dinner_matches!inner(
                dinner_event_id,
                location_id,
                dinner_locations:location_id(locationname, locationcity)
              )
            `)
            .eq('user_id', user.id)
            .eq('dinner_matches.dinner_event_id', eventId)
            .limit(1);

          if (myGuests && myGuests.length > 0) {
            const myGuest = myGuests[0];
            const matchData = myGuest.dinner_matches as unknown as {
              dinner_event_id: string;
              location_id: string | null;
              dinner_locations: { locationname?: string; locationcity?: string } | null;
            };

            if (matchData.dinner_locations) {
              location = {
                locationName: matchData.dinner_locations.locationname ?? '',
                locationCity: matchData.dinner_locations.locationcity ?? '',
              };
            }

            // Find partner
            const { data: partnerGuests } = await supabase
              .from('dinner_match_guests')
              .select('user_id, user_profiles:user_id(userid, username)')
              .eq('match_id', myGuest.match_id)
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

          // Check availability
          const { data: mySlots } = await supabase
            .from('availability_slots')
            .select('id')
            .eq('user_id', user.id)
            .eq('dinner_event_id', eventId)
            .limit(1);

          userHasSetAvailability = (mySlots?.length ?? 0) > 0;

          if (partner) {
            const { data: partnerSlots } = await supabase
              .from('availability_slots')
              .select('id')
              .eq('user_id', partner.userid)
              .eq('dinner_event_id', eventId)
              .limit(1);

            partnerHasSetAvailability = (partnerSlots?.length ?? 0) > 0;
          }
        }

        setDetail({
          inviteId: invite.id,
          inviteStatus: invite.status as 'pending' | 'accepted' | 'declined',
          scheduledDate: event.scheduled_date,
          groupName: group.groupname,
          groupId: group.groupid,
          cadence: group.dinner_cadence as 'monthly' | 'biweekly' | 'quarterly',
          partner,
          location,
          userHasSetAvailability,
          partnerHasSetAvailability,
        });

        setLoading(false);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching pairing detail:', err);
        setError(errorMessage);
        setLoading(false);
      }
    }

    if (eventId) {
      fetchDetail();
    }
  }, [eventId, refreshKey]);

  return { detail, loading, error };
}
