import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { joinGroupContent } from '@/content/joinGroup';

interface GroupPreview {
  groupId: string;
  groupName: string;
}

interface UseJoinGroupReturn {
  validateCode: (code: string) => Promise<void>;
  joinGroup: () => Promise<void>;
  reset: () => void;
  preview: GroupPreview | null;
  error: string | null;
  isValidating: boolean;
  isJoining: boolean;
  isAlreadyMember: boolean;
}

export function useJoinGroup(): UseJoinGroupReturn {
  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [usedCount, setUsedCount] = useState<number>(0);

  const validateCode = async (code: string) => {
    setIsValidating(true);
    setError(null);
    setPreview(null);
    setIsAlreadyMember(false);

    try {
      // Check format
      if (code.length !== 24) {
        setError(joinGroupContent.messages.invalidFormat);
        setIsValidating(false);
        return;
      }

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to join a group');
      }

      // Fetch invite link with group info
      const { data: inviteData, error: inviteError } = await supabase
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

      if (inviteError || !inviteData) {
        setError(joinGroupContent.messages.invalidCode);
        setIsValidating(false);
        return;
      }

      // Check if expired
      if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
        setError(joinGroupContent.messages.expired);
        setIsValidating(false);
        return;
      }

      // Check if max uses reached
      if (inviteData.max_uses && inviteData.used_count >= inviteData.max_uses) {
        setError(joinGroupContent.messages.maxUsesReached);
        setIsValidating(false);
        return;
      }

      // Get group name
      const group = (inviteData.groups as any);
      const fetchedGroupName = group?.groupname || 'the group';
      const fetchedGroupId = inviteData.group_id;

      // Check if user is already a member
      const { data: memberCheck } = await supabase
        .from('peoplegroup')
        .select('*')
        .eq('groups_groupid', fetchedGroupId)
        .eq('users_userid', user.id)
        .single();

      if (memberCheck) {
        setIsAlreadyMember(true);
        setPreview({
          groupId: fetchedGroupId,
          groupName: fetchedGroupName,
        });
        setIsValidating(false);
        return;
      }

      // Store invite data for join step
      setInviteId(inviteData.id);
      setUsedCount(inviteData.used_count);

      // Set preview data
      setPreview({
        groupId: fetchedGroupId,
        groupName: fetchedGroupName,
      });

      setIsValidating(false);
    } catch (err) {
      console.error('Error validating code:', err);
      const errorMessage = err instanceof Error ? err.message : joinGroupContent.messages.error;
      setError(errorMessage);
      setIsValidating(false);
    }
  };

  const joinGroup = async () => {
    if (!preview) {
      setError('No group preview available');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to join a group');
      }

      // Add user to group
      const { error: joinError } = await supabase
        .from('peoplegroup')
        .insert({
          groups_groupid: preview.groupId,
          users_userid: user.id,
        });

      if (joinError) {
        console.error('Error joining group:', joinError);
        throw new Error('Failed to join group. Please try again.');
      }

      // Increment used_count
      if (inviteId) {
        const { error: updateError } = await supabase
          .from('invite_links')
          .update({ used_count: usedCount + 1 })
          .eq('id', inviteId);

        if (updateError) {
          console.error('Error updating invite count:', updateError);
          // Don't throw - user was added successfully
        }
      }

      setIsJoining(false);
    } catch (err) {
      console.error('Error joining group:', err);
      const errorMessage = err instanceof Error ? err.message : joinGroupContent.messages.error;
      setError(errorMessage);
      setIsJoining(false);
      throw err;
    }
  };

  const reset = () => {
    setPreview(null);
    setError(null);
    setIsAlreadyMember(false);
    setInviteId(null);
    setUsedCount(0);
  };

  return {
    validateCode,
    joinGroup,
    reset,
    preview,
    error,
    isValidating,
    isJoining,
    isAlreadyMember,
  };
}
