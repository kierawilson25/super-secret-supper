'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface Profile {
  userid: string;
  username?: string;
  isadmin?: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('people')
          .select('*')
          .eq('userid', user.id)
          .single();

        if (error) {
          logger.error('Failed to fetch profile', { errorMessage: error.message });
          setError(error.message);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      logger.info('Updating profile', { userId: user.id, fields: Object.keys(updates) });

      const { data, error } = await supabase
        .from('people')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('userid', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update profile', { userId: user.id, errorMessage: error.message });
        throw error;
      }

      logger.info('Profile updated successfully', { userId: user.id });
      setProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Profile update failed', { errorMessage });
      setError(errorMessage);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}
