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

        // Find the current user's next upcoming dinner in this group
        const { data: myDinnerRows } = await supabase
          .from('peopledinner')
          .select('dinners_dinnerid, dinners!inner(groups_groupid, dinner_date)')
          .eq('users_userid', user.id)
          .eq('dinners.groups_groupid', groupId)
          .gte('dinners.dinner_date', new Date().toISOString())
          .order('dinners.dinner_date', { ascending: true })
          .limit(1);

        if (!myDinnerRows || myDinnerRows.length === 0) return;

        const myDinner = myDinnerRows[0];
        setDinnerId(myDinner.dinners_dinnerid);

        // Find the other members of that dinner
        const { data: dinnerMembers } = await supabase
          .from('peopledinner')
          .select('users_userid, user_profiles:users_userid(username)')
          .eq('dinners_dinnerid', myDinner.dinners_dinnerid)
          .neq('users_userid', user.id);

        if (!dinnerMembers || dinnerMembers.length === 0) return;

        const partnerIds = dinnerMembers.map(m => m.users_userid);

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
          dinnerMembers.map(m => ({
            userId: m.users_userid,
            username: (m.user_profiles as { username?: string } | null)?.username ?? 'Unknown',
            availability: availMap[m.users_userid] ?? {},
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
