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

  const createGroup = async (name: string, city?: string, cadence: 'monthly' | 'quarterly' | 'biweekly' = 'monthly') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Creating group with:', { name, city, cadence, admin_id: user.id });

      const { data, error } = await supabase
        .from('groups')
        .insert({
          groupname: name,
          groupcity: city,
          dinner_cadence: cadence,
          admin_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }

      console.log('Group created successfully:', data);

      // Add creator as a member
      const { error: memberError } = await supabase
        .from('peoplegroup')
        .insert({
          groups_groupid: data.groupid,
          users_userid: user.id,
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        throw memberError;
      }

      console.log('Creator added as member successfully');

      setGroups([...groups, data]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('createGroup failed:', err);
      setError(errorMessage);
      throw err;
    }
  };

  return { groups, loading, error, createGroup };
}
