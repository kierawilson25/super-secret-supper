'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function usePairingResponse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respond = async (inviteId: string, response: 'accepted' | 'declined') => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('dinner_invites')
        .update({ status: response })
        .eq('id', inviteId)
        .eq('invitee_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { respond, loading, error };
}
