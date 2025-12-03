'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from './useProfile';

export interface GroupMember extends Profile {
  joined_at: string;
}

export function useMembers(groupId: string) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    async function fetchMembers() {
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('user_id, joined_at, profiles(*)')
          .eq('group_id', groupId);

        if (error) {
          setError(error.message);
        } else {
          const membersList = data?.map(item => ({
            ...(item.profiles as unknown as Profile),
            joined_at: item.joined_at,
          })) || [];
          setMembers(membersList);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [groupId]);

  const addMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
        });

      if (error) throw error;

      // Refetch members
      const { data } = await supabase
        .from('group_members')
        .select('user_id, joined_at, profiles(*)')
        .eq('group_id', groupId);

      if (data) {
        const membersList = data?.map(item => ({
          ...(item.profiles as unknown as Profile),
          joined_at: item.joined_at,
        })) || [];
        setMembers(membersList);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return { members, loading, error, addMember };
}
