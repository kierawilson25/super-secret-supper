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

export function usePairedMemberAvailability(groupId: string): PairedMemberAvailabilityData {
  const [partners, setPartners] = useState<PairedPartner[]>([]);
  const [dinnerId, setDinnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Find the current user's next upcoming accepted dinner_invite in this group
        const { data: myInvites } = await supabase
          .from('dinner_invites')
          .select(`
            id,
            dinner_event_id,
            dinner_events!inner(circle_id, scheduled_date)
          `)
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .eq('dinner_events.circle_id', groupId)
          .gte('dinner_events.scheduled_date', new Date().toISOString())
          .order('dinner_events.scheduled_date', { ascending: true })
          .limit(1);

        if (!myInvites || myInvites.length === 0) return;

        const myInvite = myInvites[0];
        const dinnerEventId = myInvite.dinner_event_id;

        // Find the match this user belongs to for this event
        const { data: myGuests } = await supabase
          .from('dinner_match_guests')
          .select(`
            match_id,
            dinner_matches!inner(dinner_event_id)
          `)
          .eq('user_id', user.id)
          .eq('dinner_matches.dinner_event_id', dinnerEventId)
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

        // Get their general availability slots
        const { data: slots } = await supabase
          .from('availability_slots')
          .select('user_id, available_date, time_slot')
          .in('user_id', partnerIds)
          .is('dinner_event_id', null);

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
  }, [groupId]);

  return { partners, dinnerId, hasPairing: partners.length > 0, loading, error };
}
