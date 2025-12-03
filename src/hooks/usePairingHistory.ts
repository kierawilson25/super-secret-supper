'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface PairingHistory {
  id: string;
  user_1_id: string;
  user_2_id: string;
  created_at: string;
}

export function usePairingHistory(groupId?: string) {
  const [history, setHistory] = useState<PairingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      try {
        const { data, error: queryError } = await supabase
          .from('pairing_history')
          .select('*');

        if (queryError) {
          setError(queryError.message);
        } else {
          setHistory(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [groupId]);

  return { history, loading, error };
}
