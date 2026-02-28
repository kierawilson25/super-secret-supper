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

        // 1. Fetch the event
        const { data: event, error: eventError } = await supabase
          .from('dinner_events')
          .select('id, scheduled_date, circle_id')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // 2. Fetch the group separately
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('groupid, groupname, dinner_cadence')
          .eq('groupid', event.circle_id)
          .single();

        if (groupError) throw groupError;

        // 3. Fetch the user's invite for this event
        const { data: invite, error: inviteError } = await supabase
          .from('dinner_invites')
          .select('id, status')
          .eq('dinner_event_id', eventId)
          .eq('invitee_id', user.id)
          .single();

        if (inviteError) throw inviteError;

        const isAccepted = invite.status === 'accepted';

        let partner: { userid: string; username: string } | null = null;
        let location: { locationName: string; locationCity: string } | null = null;
        let userHasSetAvailability = false;
        let partnerHasSetAvailability: boolean | null = null;

        if (isAccepted) {
          // 4. Find all matches for this event, then find which one has this user
          const { data: eventMatches } = await supabase
            .from('dinner_matches')
            .select('id, location_id')
            .eq('dinner_event_id', eventId);

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
              const match = eventMatches.find(m => m.id === matchId);

              // 5. Fetch location if assigned
              if (match?.location_id) {
                const { data: loc } = await supabase
                  .from('dinner_locations')
                  .select('locationname, locationcity')
                  .eq('locationid', match.location_id)
                  .single();

                if (loc) {
                  location = {
                    locationName: (loc.locationname as string | null) ?? '',
                    locationCity: (loc.locationcity as string | null) ?? '',
                  };
                }
              }

              // 6. Find partner's user_id
              const { data: partnerGuest } = await supabase
                .from('dinner_match_guests')
                .select('user_id')
                .eq('match_id', matchId)
                .neq('user_id', user.id)
                .limit(1);

              if (partnerGuest && partnerGuest.length > 0) {
                const partnerId = partnerGuest[0].user_id as string;

                // 7. Fetch partner profile
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

          // 8. Check availability scoped to this dinner event
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
          scheduledDate: event.scheduled_date as string | null,
          groupName: group.groupname as string | null,
          groupId: group.groupid as string,
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
