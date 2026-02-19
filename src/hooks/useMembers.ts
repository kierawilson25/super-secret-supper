'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface GroupMember {
  id: string;
  username: string;
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
          .from('peoplegroup')
          .select(`
            users_userid,
            user_profiles:users_userid (
              userid,
              username
            )
          `)
          .eq('groups_groupid', groupId);

        if (error) {
          setError(error.message);
        } else {
          const membersList = data?.map(item => ({
            id: item.users_userid,
            username: (item.user_profiles as any)?.username || 'Unknown',
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
        .from('peoplegroup')
        .insert({
          groups_groupid: groupId,
          users_userid: userId,
        });

      if (error) throw error;

      // Refetch members
      const { data } = await supabase
        .from('peoplegroup')
        .select(`
          users_userid,
          user_profiles:users_userid (
            userid,
            username
          )
        `)
        .eq('groups_groupid', groupId);

      if (data) {
        const membersList = data?.map(item => ({
          id: item.users_userid,
          username: (item.user_profiles as any)?.username || 'Unknown',
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
