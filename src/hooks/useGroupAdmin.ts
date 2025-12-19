'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useGroupAdmin(groupId: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Error getting user:', authError);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setCurrentUserId(user?.id || null);

        if (!user || !groupId) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Get group admin_id
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('admin_id')
          .eq('groupid', groupId)
          .single();

        if (groupError) {
          console.error('Error fetching group:', groupError);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(group?.admin_id === user.id);
        setLoading(false);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [groupId]);

  return { isAdmin, currentUserId, loading };
}
