'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type MatchStatus = 'waiting_for_partner' | 'no_match' | 'matched' | 'partner_skipped';

export interface AvailabilityMatchData {
  status: MatchStatus;
  confirmedDate: string | null;    // ISO string of the confirmed slot
  confirmedSlot: string | null;    // time slot label e.g. 'dinner'
  overlappingSlots: { date: string; slot: string }[];
  matchId: string | null;
  partnerId: string | null;
  partnerSkipped: boolean;
}

const SLOT_ORDER: Record<string, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  late_night: 3,
};

/** Returns the earliest overlapping (date, slot) pair, or null if none. */
export function computeEarliestOverlap(
  mySlots: { available_date: string; time_slot: string }[],
  partnerSlots: { available_date: string; time_slot: string }[]
): { date: string; slot: string } | null {
  const partnerSet = new Set(partnerSlots.map(s => `${s.available_date}|${s.time_slot}`));
  const overlaps = mySlots
    .filter(s => partnerSet.has(`${s.available_date}|${s.time_slot}`))
    .sort((a, b) => {
      if (a.available_date !== b.available_date) return a.available_date.localeCompare(b.available_date);
      return (SLOT_ORDER[a.time_slot] ?? 99) - (SLOT_ORDER[b.time_slot] ?? 99);
    });
  return overlaps.length > 0 ? { date: overlaps[0].available_date, slot: overlaps[0].time_slot } : null;
}

export function useAvailabilityMatch(eventId: string | null, refreshKey?: number): AvailabilityMatchData {
  const [data, setData] = useState<AvailabilityMatchData>({
    status: 'waiting_for_partner',
    confirmedDate: null,
    confirmedSlot: null,
    overlappingSlots: [],
    matchId: null,
    partnerId: null,
    partnerSkipped: false,
  });

  useEffect(() => {
    if (!eventId) return;

    async function compute() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Find this user's match for the event
      // NOTE: confirmed_date is fetched separately so this query works before migration runs
      const { data: eventMatches } = await supabase
        .from('dinner_matches')
        .select('id, status')
        .eq('dinner_event_id', eventId);

      if (!eventMatches || eventMatches.length === 0) return;

      const matchIds = eventMatches.map(m => m.id as string);
      const { data: myGuest } = await supabase
        .from('dinner_match_guests')
        .select('match_id')
        .eq('user_id', user.id)
        .in('match_id', matchIds)
        .limit(1);

      if (!myGuest || myGuest.length === 0) return;

      const matchId = myGuest[0].match_id as string;

      // 2. Find partner
      const { data: partnerGuest } = await supabase
        .from('dinner_match_guests')
        .select('user_id')
        .eq('match_id', matchId)
        .neq('user_id', user.id)
        .limit(1);

      const partnerId = partnerGuest?.[0]?.user_id as string | null ?? null;

      // 3. Check if partner skipped (declined their invite)
      let partnerSkipped = false;
      if (partnerId) {
        const { data: partnerInvite } = await supabase
          .from('dinner_invites')
          .select('status')
          .eq('dinner_event_id', eventId)
          .eq('invitee_id', partnerId)
          .single();
        partnerSkipped = partnerInvite?.status === 'declined';
      }

      // 4. If match already has a confirmed_date in DB, use it
      // (select separately so this is safe if migration hasn't run yet)
      const { data: matchDetails } = await supabase
        .from('dinner_matches')
        .select('confirmed_date, confirmed_slot')
        .eq('id', matchId)
        .single();

      if (matchDetails?.confirmed_date) {
        setData({
          status: 'matched',
          confirmedDate: matchDetails.confirmed_date as string,
          confirmedSlot: (matchDetails.confirmed_slot as string | null) ?? null,
          overlappingSlots: [],
          matchId,
          partnerId,
          partnerSkipped: false,
        });
        return;
      }

      if (partnerSkipped) {
        setData({ status: 'partner_skipped', confirmedDate: null, confirmedSlot: null, overlappingSlots: [], matchId, partnerId, partnerSkipped: true });
        return;
      }

      // 5. Load both users' slots — event-scoped first, fall back to general (null)
      //    for backward compat with availability saved before event-scoping was added
      const fetchSlots = async (userId: string) => {
        const { data: eventSlots } = await supabase
          .from('availability_slots')
          .select('available_date, time_slot')
          .eq('user_id', userId)
          .eq('dinner_event_id', eventId!);
        if (eventSlots && eventSlots.length > 0) return eventSlots;
        const { data: generalSlots } = await supabase
          .from('availability_slots')
          .select('available_date, time_slot')
          .eq('user_id', userId)
          .is('dinner_event_id', null);
        return generalSlots ?? [];
      };

      const mySlots = await fetchSlots(user.id);
      const partnerSlots = partnerId ? await fetchSlots(partnerId) : [];

      const hasPartnerSlots = partnerSlots.length > 0;

      if (!hasPartnerSlots) {
        setData({ status: 'waiting_for_partner', confirmedDate: null, confirmedSlot: null, overlappingSlots: [], matchId, partnerId, partnerSkipped: false });
        return;
      }

      // 6. Compute overlap
      const earliest = computeEarliestOverlap(mySlots, partnerSlots);

      if (!earliest) {
        setData({ status: 'no_match', confirmedDate: null, confirmedSlot: null, overlappingSlots: [], matchId, partnerId, partnerSkipped: false });
        return;
      }

      // Build full overlapping list for display
      const partnerSet = new Set(partnerSlots.map(s => `${s.available_date}|${s.time_slot}`));
      const overlappingSlots = mySlots
        .filter(s => partnerSet.has(`${s.available_date}|${s.time_slot}`))
        .map(s => ({ date: s.available_date, slot: s.time_slot }));

      setData({
        status: 'matched',
        confirmedDate: `${earliest.date}T00:00:00`,
        confirmedSlot: earliest.slot,
        overlappingSlots,
        matchId,
        partnerId,
        partnerSkipped: false,
      });
    }

    compute();
  }, [eventId, refreshKey]);

  return data;
}
