'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PairedPartner {
  userId: string;
  username: string;
  availability: Record<string, string[]>; // date -> time slots
}

export interface PairedMemberAvailabilityData {
  partners: PairedPartner[];
  dinnerId: string | null;
  hasPairing: boolean;
  loading: boolean;
  error: boolean;
}

export function usePairedMemberAvailability(groupId: string, eventId: string | null = null): PairedMemberAvailabilityData {
  const [partners, setPartners] = useState<PairedPartner[]>([]);
  const [dinnerId, setDinnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let dinnerEventId: string;

        if (eventId) {
          // Event is known (coming from pairing detail page) — use it directly
          dinnerEventId = eventId;
        } else {
          // Find the current user's next accepted dinner in this group
          const { data: myInvites } = await supabase
            .from('dinner_invites')
            .select('id, dinner_event_id')
            .eq('invitee_id', user.id)
            .eq('status', 'accepted');

          if (!myInvites || myInvites.length === 0) return;

          const inviteEventIds = myInvites.map(i => i.dinner_event_id as string);
          const { data: groupEvents } = await supabase
            .from('dinner_events')
            .select('id, scheduled_date')
            .eq('circle_id', groupId)
            .gte('scheduled_date', new Date().toISOString())
            .in('id', inviteEventIds)
            .order('scheduled_date', { ascending: true })
            .limit(1);

          if (!groupEvents || groupEvents.length === 0) return;

          dinnerEventId = groupEvents[0].id as string;
        }

        // Find the match this user belongs to for this event (flat queries)
        const { data: eventMatches } = await supabase
          .from('dinner_matches')
          .select('id')
          .eq('dinner_event_id', dinnerEventId);

        if (!eventMatches || eventMatches.length === 0) return;

        const eventMatchIds = eventMatches.map(m => m.id as string);
        const { data: myGuests } = await supabase
          .from('dinner_match_guests')
          .select('match_id')
          .eq('user_id', user.id)
          .in('match_id', eventMatchIds)
          .limit(1);

        if (!myGuests || myGuests.length === 0) return;

        const matchId = myGuests[0].match_id;
        setDinnerId(matchId);

        // Find the other members of that match
        const { data: matchMembers } = await supabase
          .from('dinner_match_guests')
          .select('user_id, user_profiles:user_id(username)')
          .eq('match_id', matchId)
          .neq('user_id', user.id);

        if (!matchMembers || matchMembers.length === 0) return;

        const partnerIds = matchMembers.map(m => m.user_id);

        // Get partner availability slots scoped to this dinner event
        const { data: slots } = await supabase
          .from('availability_slots')
          .select('user_id, available_date, time_slot')
          .in('user_id', partnerIds)
          .eq('dinner_event_id', dinnerEventId);

        const availMap: Record<string, Record<string, string[]>> = {};
        for (const slot of slots ?? []) {
          if (!availMap[slot.user_id]) availMap[slot.user_id] = {};
          if (!availMap[slot.user_id][slot.available_date]) availMap[slot.user_id][slot.available_date] = [];
          availMap[slot.user_id][slot.available_date].push(slot.time_slot);
        }

        setPartners(
          matchMembers.map(m => ({
            userId: m.user_id,
            username: (m.user_profiles as { username?: string } | null)?.username ?? 'Unknown',
            availability: availMap[m.user_id] ?? {},
          }))
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [groupId, eventId]);

  return { partners, dinnerId, hasPairing: partners.length > 0, loading, error };
}
