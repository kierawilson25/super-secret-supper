'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Group {
  id: string;
  name: string;
  admin_id: string;
  city?: string;
  dinner_cadence: 'monthly' | 'quarterly' | 'biweekly';
  created_at: string;
  updated_at: string;
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setGroups([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('group_members')
          .select('groups(*)')
          .eq('user_id', user.id);

        if (error) {
          setError(error.message);
        } else {
          const groupsData = data?.map(item => (item.groups as unknown as Group)).filter(Boolean) || [];
          setGroups(groupsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  const createGroup = async (name: string, city?: string, cadence: 'monthly' | 'quarterly' | 'biweekly' = 'monthly') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          city,
          dinner_cadence: cadence,
          admin_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as a member
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
        });

      setGroups([...groups, data]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return { groups, loading, error, createGroup };
}
