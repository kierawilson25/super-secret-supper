'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

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
          logger.error('Failed to get user for admin check', { errorMessage: authError.message });
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
          logger.error('Failed to fetch group for admin check', { groupId, errorMessage: groupError.message });
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const isUserAdmin = group?.admin_id === user.id;
        logger.info('Admin status checked', { groupId, userId: user.id, isAdmin: isUserAdmin });
        setIsAdmin(isUserAdmin);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('Admin status check failed', { groupId, errorMessage });
        setIsAdmin(false);
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [groupId]);

  return { isAdmin, currentUserId, loading };
}
