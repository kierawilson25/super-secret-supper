'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateSecureCode } from '@/lib/crypto';
import { logger } from '@/lib/logger';

export interface InviteLink {
  id: string;
  group_id: string;
  code: string;
  created_by: string;
  expires_at?: string;
  max_uses?: number;
  used_count: number;
  created_at: string;
}

export function useInviteLinks(groupId: string) {
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setInviteLinks([]);
      setLoading(false);
      return;
    }

    async function fetchInviteLinks() {
      try {
        const { data, error } = await supabase
          .from('invite_links')
          .select('*')
          .eq('group_id', groupId);

        if (error) {
          setError(error.message);
        } else {
          setInviteLinks(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchInviteLinks();
  }, [groupId]);

  const createInviteLink = async (expiresAt?: string, maxUses?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate a cryptographically secure code
      const code = generateSecureCode(24);

      const { data, error } = await supabase
        .from('invite_links')
        .insert({
          group_id: groupId,
          code,
          created_by: user.id,
          expires_at: expiresAt,
          max_uses: maxUses,
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('Invite link created', { groupId });
      setInviteLinks([...inviteLinks, data]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to create invite link', { groupId, error: errorMessage });
      setError(errorMessage);
      throw err;
    }
  };

  const useInviteLink = async (code: string, userId: string) => {
    try {
      // Find the invite link
      const { data: linkData, error: linkError } = await supabase
        .from('invite_links')
        .select('*')
        .eq('code', code)
        .single();

      if (linkError) throw new Error('Invalid invite code');

      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        throw new Error('Invite link has expired');
      }

      if (linkData.max_uses && linkData.used_count >= linkData.max_uses) {
        throw new Error('Invite link has reached maximum uses');
      }

      // Add user to group
      await supabase
        .from('peoplegroup')
        .insert({
          groups_groupid: linkData.group_id,
          users_userid: userId,
        });

      // Increment used count
      await supabase
        .from('invite_links')
        .update({ used_count: linkData.used_count + 1 })
        .eq('id', linkData.id);

      // Refetch links
      const { data } = await supabase
        .from('invite_links')
        .select('*')
        .eq('group_id', groupId);

      setInviteLinks(data || []);
      logger.info('Invite link redeemed', { groupId: linkData.group_id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to redeem invite link', { error: errorMessage });
      setError(errorMessage);
      throw err;
    }
  };

  return { inviteLinks, loading, error, createInviteLink, useInviteLink };
}
