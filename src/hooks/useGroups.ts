'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Group {
  groupid: string;
  groupname: string;
  admin_id: string;
  groupcity?: string;
  dinner_cadence: 'monthly' | 'quarterly' | 'biweekly';
  created_at: string;
  updated_at: string;
  member_count?: number;
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

        // First, get the groups the user is a member of
        const { data: userGroups, error: groupError } = await supabase
          .from('peoplegroup')
          .select('groups_groupid')
          .eq('users_userid', user.id);

        if (groupError) {
          console.error('Error fetching user groups:', groupError);
          setError(groupError.message);
          return;
        }

        const groupIds = userGroups?.map(ug => ug.groups_groupid) || [];

        if (groupIds.length === 0) {
          setGroups([]);
          return;
        }

        // Fetch full group details
        const { data: groupsData, error } = await supabase
          .from('groups')
          .select('*')
          .in('groupid', groupIds);

        if (error) {
          console.error('Error fetching groups:', error);
          setError(error.message);
          return;
        }

        // Get member counts for ALL groups in a single query
        const { data: memberCounts } = await supabase
          .from('peoplegroup')
          .select('groups_groupid')
          .in('groups_groupid', groupIds);

        // Count members per group
        const countMap: Record<string, number> = {};
        memberCounts?.forEach(mc => {
          countMap[mc.groups_groupid] = (countMap[mc.groups_groupid] || 0) + 1;
        });

        // Add member counts to groups
        const groupsWithCounts = (groupsData || []).map(group => ({
          ...group,
          member_count: countMap[group.groupid] || 0
        } as Group));

        setGroups(groupsWithCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  const createGroup = async (name: string, city?: string, cadence: 'monthly' | 'quarterly' | 'biweekly' = 'monthly', vibe?: string, hashtags?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          groupname: name,
          groupcity: city,
          dinner_cadence: cadence,
          admin_id: user.id,
          vibe: vibe || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as a member
      const { error: memberError } = await supabase
        .from('peoplegroup')
        .insert({ groups_groupid: data.groupid, users_userid: user.id });

      if (memberError) throw memberError;

      // Write hashtags through the normalized join tables
      if (hashtags && hashtags.length > 0) {
        for (const tag of hashtags) {
          // Get or create the hashtag row
          const { data: hashtagRow, error: hashtagError } = await supabase
            .from('hashtags')
            .upsert({ tag }, { onConflict: 'tag' })
            .select('hashtag_id')
            .single();

          if (hashtagError || !hashtagRow) continue;

          await supabase
            .from('group_hashtags')
            .insert({ group_id: data.groupid, hashtag_id: hashtagRow.hashtag_id });
        }
      }

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
