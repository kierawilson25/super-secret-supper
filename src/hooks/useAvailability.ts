'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { computeEarliestOverlap } from './useAvailabilityMatch';

export type TimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'late_night';

// date string (YYYY-MM-DD) -> set of selected time slots
export type AvailabilityMap = Record<string, Set<TimeSlot>>;

export interface MemberAvailabilitySummary {
  userId: string;
  username: string;
  hasSubmitted: boolean;
  slotCount: number;
}

export function useAvailability(groupId: string, eventId: string | null = null) {
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [memberSummary, setMemberSummary] = useState<MemberAvailabilitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchMyAvailability = useCallback(async (userId: string) => {
    const query = supabase
      .from('availability_slots')
      .select('available_date, time_slot')
      .eq('user_id', userId);

    const { data } = eventId
      ? await query.eq('dinner_event_id', eventId)
      : await query.is('dinner_event_id', null);

    if (!data) return;

    const map: AvailabilityMap = {};
    for (const slot of data) {
      if (!map[slot.available_date]) map[slot.available_date] = new Set();
      map[slot.available_date].add(slot.time_slot as TimeSlot);
    }
    setAvailability(map);
  }, [eventId]);

  // Admin only — requires the "Group admins can view member availability" RLS policy
  const fetchMemberSummary = useCallback(async () => {
    const { data: members } = await supabase
      .from('peoplegroup')
      .select('users_userid, user_profiles:users_userid(username)')
      .eq('groups_groupid', groupId);

    if (!members) return;

    const summaries: MemberAvailabilitySummary[] = await Promise.all(
      members.map(async (m) => {
        const q = supabase
          .from('availability_slots')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', m.users_userid);
        const { count } = eventId
          ? await q.eq('dinner_event_id', eventId)
          : await q.is('dinner_event_id', null);

        return {
          userId: m.users_userid,
          username: (m.user_profiles as { username?: string } | null)?.username ?? 'Unknown',
          hasSubmitted: (count ?? 0) > 0,
          slotCount: count ?? 0,
        };
      })
    );

    setMemberSummary(summaries);
  }, [groupId]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);
      await fetchMyAvailability(user.id);
      setLoading(false);
    }
    init();
  }, [fetchMyAvailability]);

  const saveAvailability = async (newAvailability: AvailabilityMap) => {
    if (!currentUserId) return;
    setSaving(true);
    try {
      // Replace all existing availability slots for this user + event scope
      const deleteQuery = supabase
        .from('availability_slots')
        .delete()
        .eq('user_id', currentUserId);
      if (eventId) {
        await deleteQuery.eq('dinner_event_id', eventId);
      } else {
        await deleteQuery.is('dinner_event_id', null);
      }

      const slots: { user_id: string; dinner_event_id: string | null; available_date: string; time_slot: string }[] = [];
      for (const [date, timeSlots] of Object.entries(newAvailability)) {
        for (const slot of timeSlots) {
          slots.push({ user_id: currentUserId, dinner_event_id: eventId, available_date: date, time_slot: slot });
        }
      }

      if (slots.length > 0) {
        const { error } = await supabase.from('availability_slots').insert(slots);
        if (error) throw error;
      }

      setAvailability(newAvailability);

      // Auto-confirm match: if event-scoped and partner has also submitted, write confirmed date
      if (eventId) {
        const { data: eventMatches } = await supabase
          .from('dinner_matches')
          .select('id')
          .eq('dinner_event_id', eventId);

        if (eventMatches && eventMatches.length > 0) {
          const matchIds = eventMatches.map(m => m.id as string);
          const { data: myGuest } = await supabase
            .from('dinner_match_guests')
            .select('match_id')
            .eq('user_id', currentUserId)
            .in('match_id', matchIds)
            .limit(1);

          if (myGuest && myGuest.length > 0) {
            const matchId = myGuest[0].match_id as string;
            const { data: partnerGuest } = await supabase
              .from('dinner_match_guests')
              .select('user_id')
              .eq('match_id', matchId)
              .neq('user_id', currentUserId)
              .limit(1);

            const partnerId = (partnerGuest?.[0]?.user_id as string | null) ?? null;
            if (partnerId) {
              const { data: partnerSlots } = await supabase
                .from('availability_slots')
                .select('available_date, time_slot')
                .eq('user_id', partnerId)
                .eq('dinner_event_id', eventId);

              if (partnerSlots && partnerSlots.length > 0) {
                const myFlatSlots = Object.entries(newAvailability).flatMap(([date, timeSlots]) =>
                  [...timeSlots].map(slot => ({ available_date: date, time_slot: slot }))
                );
                const earliest = computeEarliestOverlap(myFlatSlots, partnerSlots);
                if (earliest) {
                  await supabase
                    .from('dinner_matches')
                    .update({
                      confirmed_date: `${earliest.date}T00:00:00`,
                      confirmed_slot: earliest.slot,
                      status: 'confirmed',
                    })
                    .eq('id', matchId);
                }
              }
            }
          }
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return { availability, memberSummary, loading, saving, currentUserId, saveAvailability, fetchMemberSummary };
}
