'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from './useProfile';

export interface Pairing {
  id: string;
  dinner_id: string;
  user_1_id: string;
  user_2_id: string;
  user_1?: Profile;
  user_2?: Profile;
  created_at: string;
}

export function usePairings(dinnerIdOrGroupId?: string, isGroupId: boolean = false) {
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dinnerIdOrGroupId) {
      setPairings([]);
      setLoading(false);
      return;
    }

    async function fetchPairings() {
      try {
        let query = supabase
          .from('pairings')
          .select(`
            id,
            dinner_id,
            user_1_id,
            user_2_id,
            created_at,
            dinners(group_id)
          `);

        if (isGroupId) {
          // Fetch pairings for all dinners in a group
          const { data: dinnerIds, error: dinnerError } = await supabase
            .from('dinners')
            .select('id')
            .eq('group_id', dinnerIdOrGroupId);

          if (dinnerError) throw dinnerError;
          const ids = dinnerIds?.map(d => d.id) || [];
          if (ids.length === 0) {
            setPairings([]);
            setLoading(false);
            return;
          }
          query = query.in('dinner_id', ids);
        } else {
          // Fetch pairings for a specific dinner
          query = query.eq('dinner_id', dinnerIdOrGroupId);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
        } else {
          setPairings(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPairings();
  }, [dinnerIdOrGroupId, isGroupId]);

  const createPairings = async (dinnerIdParam: string, pairingData: Array<{ user1Id: string; user2Id: string }>) => {
    try {
      const pairingInserts = pairingData.map(p => ({
        dinner_id: dinnerIdParam,
        user_1_id: p.user1Id < p.user2Id ? p.user1Id : p.user2Id,
        user_2_id: p.user1Id < p.user2Id ? p.user2Id : p.user1Id,
      }));

      const { data, error } = await supabase
        .from('pairings')
        .insert(pairingInserts)
        .select();

      if (error) throw error;

      // Add to pairing history
      const historyInserts = pairingData.map(p => ({
        user_1_id: p.user1Id < p.user2Id ? p.user1Id : p.user2Id,
        user_2_id: p.user1Id < p.user2Id ? p.user2Id : p.user1Id,
      }));

      await supabase
        .from('pairing_history')
        .upsert(historyInserts);

      setPairings(data || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return { pairings, loading, error, createPairings };
}
