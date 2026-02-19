import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface GroupPreview {
  groupId: string;
  groupName: string;
}

interface InviteWithGroup {
  id: string;
  code: string;
  group_id: string;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  groups: { groupid: string; groupname: string }[] | null;
}

interface UseJoinGroupReturn {
  validateCode: (code: string) => Promise<void>;
  joinGroup: () => Promise<void>;
  reset: () => void;
  preview: GroupPreview | null;
  error: string | null;
  validating: boolean;
  joining: boolean;
  joined: boolean;
}

export function useJoinGroup(): UseJoinGroupReturn {
  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [usedCount, setUsedCount] = useState(0);

  const validateCode = async (code: string) => {
    setValidating(true);
    setError(null);
    setPreview(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: inviteError } = await supabase
        .from('invite_links')
        .select(`
          id,
          code,
          group_id,
          expires_at,
          max_uses,
          used_count,
          groups:group_id (
            groupid,
            groupname
          )
        `)
        .eq('code', code)
        .single();

      if (inviteError || !data) {
        setError("This invite code is invalid or doesn't exist");
        return;
      }

      const inviteData = data as unknown as InviteWithGroup;

      if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
        setError('This invite code has expired');
        return;
      }

      if (inviteData.max_uses && inviteData.used_count >= inviteData.max_uses) {
        setError('This invite code has reached its maximum number of uses');
        return;
      }

      const { data: memberCheck } = await supabase
        .from('peoplegroup')
        .select('*')
        .eq('groups_groupid', inviteData.group_id)
        .eq('users_userid', user.id)
        .single();

      if (memberCheck) {
        setError("You're already a member of this group");
        return;
      }

      setInviteId(inviteData.id);
      setUsedCount(inviteData.used_count);
      setPreview({
        groupId: inviteData.group_id,
        groupName: inviteData.groups?.[0]?.groupname || 'Unknown Group',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const joinGroup = async () => {
    if (!preview || !inviteId) return;

    setJoining(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: joinError } = await supabase
        .from('peoplegroup')
        .insert({
          groups_groupid: preview.groupId,
          users_userid: user.id,
        });

      if (joinError) throw new Error('Failed to join group. Please try again.');

      await supabase
        .from('invite_links')
        .update({ used_count: usedCount + 1 })
        .eq('id', inviteId);

      setJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setError(null);
    setJoined(false);
    setInviteId(null);
  };

  return { validateCode, joinGroup, reset, preview, error, validating, joining, joined };
}
