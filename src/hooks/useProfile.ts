'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface Profile {
  userid: string;
  username?: string | null;
  isadmin?: boolean;
  created_at: string;
  updated_at: string;
  profile_photo_path?: string | null;
  interests?: string[] | null;
  occupation?: string | null;
  flake_score?: number;
  dinners_attended?: number;
  // relationship_status: column not yet in DB — add with:
  // ALTER TABLE public.user_profiles ADD COLUMN relationship_status text;
  relationship_status?: string | null;
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
          .from('user_profiles')
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

      // Strip fields that don't exist as DB columns yet
      const { relationship_status, ...safeUpdates } = updates;

      logger.info('Updating profile', { userId: user.id, fields: Object.keys(safeUpdates) });

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq('userid', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update profile', { userId: user.id, errorMessage: error.message });
        throw error;
      }

      logger.info('Profile updated successfully', { userId: user.id });
      // Preserve local relationship_status since it isn't persisted yet
      setProfile({ ...data, relationship_status });
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
