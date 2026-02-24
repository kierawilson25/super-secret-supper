'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type TimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'late_night';

// date string (YYYY-MM-DD) -> set of selected time slots
export type AvailabilityMap = Record<string, Set<TimeSlot>>;

export interface MemberAvailabilitySummary {
  userId: string;
  username: string;
  hasSubmitted: boolean;
  slotCount: number;
}

export function useAvailability(groupId: string) {
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [memberSummary, setMemberSummary] = useState<MemberAvailabilitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchMyAvailability = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('availability_slots')
      .select('available_date, time_slot')
      .eq('user_id', userId)
      .is('dinner_event_id', null);

    if (!data) return;

    const map: AvailabilityMap = {};
    for (const slot of data) {
      if (!map[slot.available_date]) map[slot.available_date] = new Set();
      map[slot.available_date].add(slot.time_slot as TimeSlot);
    }
    setAvailability(map);
  }, []);

  // Admin only — requires the "Group admins can view member availability" RLS policy
  const fetchMemberSummary = useCallback(async () => {
    const { data: members } = await supabase
      .from('peoplegroup')
      .select('users_userid, user_profiles:users_userid(username)')
      .eq('groups_groupid', groupId);

    if (!members) return;

    const summaries: MemberAvailabilitySummary[] = await Promise.all(
      members.map(async (m) => {
        const { count } = await supabase
          .from('availability_slots')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', m.users_userid)
          .is('dinner_event_id', null);

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
      // Replace all existing general availability slots for this user
      await supabase
        .from('availability_slots')
        .delete()
        .eq('user_id', currentUserId)
        .is('dinner_event_id', null);

      const slots: { user_id: string; dinner_event_id: null; available_date: string; time_slot: string }[] = [];
      for (const [date, timeSlots] of Object.entries(newAvailability)) {
        for (const slot of timeSlots) {
          slots.push({ user_id: currentUserId, dinner_event_id: null, available_date: date, time_slot: slot });
        }
      }

      if (slots.length > 0) {
        const { error } = await supabase.from('availability_slots').insert(slots);
        if (error) throw error;
      }

      setAvailability(newAvailability);
    } finally {
      setSaving(false);
    }
  };

  return { availability, memberSummary, loading, saving, currentUserId, saveAvailability, fetchMemberSummary };
}
