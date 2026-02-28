'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PageContainer,
  ContentContainer,
  Button,
  Input,
  Select,
  Footer,
  PageHeader,
  PageLoading,
} from '@/components';
import { useProfile } from '@/hooks';
import { supabase } from '@/lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEREST_OPTIONS = [
  'Food & Wine', 'Coffee', 'Hiking', 'Art', 'Music',
  'Travel', 'Reading', 'Film', 'Fitness', 'Cooking',
  'Tech', 'Fashion', 'Sports', 'Gaming', 'Photography',
];

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select status...' },
  { value: 'single', label: 'Single' },
  { value: 'in_a_relationship', label: 'In a Relationship' },
  { value: 'married', label: 'Married' },
  { value: 'its_complicated', label: "It's Complicated" },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// ─── Inline style tokens ──────────────────────────────────────────────────────

const sectionCard: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

const sectionHeading: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#FBE6A6',
  marginBottom: '16px',
  opacity: 0.8,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#FBE6A6',
  marginBottom: '8px',
  letterSpacing: '0.05em',
};

// ─── Avatar section ───────────────────────────────────────────────────────────

interface AvatarSectionProps {
  username: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
  userId: string;
}

function AvatarSection({ username, avatarUrl, onAvatarChange, userId }: AvatarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initial = username ? username.charAt(0).toUpperCase() : '?';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      onAvatarChange(data.publicUrl);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const avatarContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '8px',
    paddingBottom: '24px',
  };

  const avatarWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '96px',
    height: '96px',
    cursor: 'pointer',
  };

  const avatarCircleStyle: React.CSSProperties = {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    backgroundColor: '#5c1270',
    border: '3px solid #FBE6A6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  };

  const editBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#FBE6A6',
    border: '2px solid #460C58',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  const initialsStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '36px',
    fontWeight: 700,
    color: '#FBE6A6',
    lineHeight: 1,
    userSelect: 'none',
  };

  const editLabelStyle: React.CSSProperties = {
    marginTop: '10px',
    fontSize: '12px',
    color: '#FBE6A6',
    opacity: 0.7,
    cursor: 'pointer',
    letterSpacing: '0.05em',
  };

  return (
    <div style={avatarContainerStyle}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload profile photo"
        id="avatar-upload"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={avatarWrapperStyle}
        aria-label={uploading ? 'Uploading photo...' : 'Change profile photo'}
        disabled={uploading}
      >
        <div style={avatarCircleStyle}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${username || 'User'}'s profile photo`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={initialsStyle} aria-hidden="true">
              {uploading ? '...' : initial}
            </span>
          )}
        </div>
        <div style={editBadgeStyle} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z"
              stroke="#460C58"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      <label
        htmlFor="avatar-upload"
        style={editLabelStyle}
      >
        {uploading ? 'Uploading...' : 'Edit photo'}
      </label>
    </div>
  );
}

// ─── Dinner score badge ───────────────────────────────────────────────────────

interface DinnerScoreBadgeProps {
  count: number;
  loading: boolean;
}

function DinnerScoreBadge({ count, loading }: DinnerScoreBadgeProps) {
  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  };

  const circleStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '3px solid #FBE6A6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 230, 166, 0.08)',
  };

  const countStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '28px',
    fontWeight: 700,
    color: '#FBE6A6',
    lineHeight: 1,
  };

  const dinnerWordStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '9px',
    fontWeight: 600,
    color: '#FBE6A6',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    opacity: 0.7,
  };

  const labelStyle2: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    color: '#F8F4F0',
    opacity: 0.7,
    textAlign: 'center' as const,
    marginTop: '4px',
  };

  return (
    <div style={badgeStyle}>
      <div style={circleStyle} role="img" aria-label={`Dinner score: ${count} dinners`}>
        <span style={countStyle} aria-hidden="true">
          {loading ? '—' : count}
        </span>
        <span style={dinnerWordStyle} aria-hidden="true">dinners</span>
      </div>
      <p style={labelStyle2}>Dinner Score</p>
    </div>
  );
}

// ─── Interests chip selector ──────────────────────────────────────────────────

interface InterestChipsProps {
  selected: string[];
  onChange: (interests: string[]) => void;
}

function InterestChips({ selected, onChange }: InterestChipsProps) {
  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter(i => i !== interest));
    } else {
      onChange([...selected, interest]);
    }
  };

  const wrapStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  };

  return (
    <div style={wrapStyle} role="group" aria-label="Select your interests">
      {INTEREST_OPTIONS.map(interest => {
        const isSelected = selected.includes(interest);
        const chipStyle: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 14px',
          borderRadius: '20px',
          border: `1.5px solid #FBE6A6`,
          backgroundColor: isSelected ? '#FBE6A6' : 'transparent',
          color: isSelected ? '#460C58' : '#FBE6A6',
          fontSize: '13px',
          fontWeight: isSelected ? 600 : 400,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'background-color 0.15s, color 0.15s',
          userSelect: 'none' as const,
          WebkitTapHighlightColor: 'transparent',
        };

        return (
          <button
            key={interest}
            type="button"
            onClick={() => toggle(interest)}
            style={chipStyle}
            aria-pressed={isSelected}
          >
            {interest}
          </button>
        );
      })}
    </div>
  );
}

// ─── Feedback banner ──────────────────────────────────────────────────────────

interface FeedbackBannerProps {
  message: string;
  isError: boolean;
}

function FeedbackBanner({ message, isError }: FeedbackBannerProps) {
  if (!message) return null;

  const bannerStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${isError ? '#f87171' : '#4ade80'}`,
    backgroundColor: isError ? 'rgba(248, 113, 113, 0.1)' : 'rgba(74, 222, 128, 0.1)',
    marginBottom: '16px',
  };

  const textStyle: React.CSSProperties = {
    color: isError ? '#f87171' : '#4ade80',
    fontSize: '14px',
    textAlign: 'center' as const,
    margin: 0,
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={bannerStyle} role="alert" aria-live="polite">
      <p style={textStyle}>{message}</p>
    </div>
  );
}

// ─── Profile page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, updateProfile, error: profileError } = useProfile();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form state
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [occupation, setOccupation] = useState('');

  // Dinner count
  const [dinnerCount, setDinnerCount] = useState(0);
  const [dinnerLoading, setDinnerLoading] = useState(true);

  // Edit-lock state for sensitive fields
  const [isEditingOccupation, setIsEditingOccupation] = useState(false);
  const [isEditingRelationship, setIsEditingRelationship] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnTo=/profile');
      } else {
        setIsAuthenticated(true);
        setCurrentUserId(user.id);
      }
    }
    checkAuth();
  }, [router]);

  // Sync profile data into form
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url ?? null);
      setInterests(profile.interests ?? []);
      setRelationshipStatus(profile.relationship_status ?? '');
      setOccupation(profile.occupation ?? '');
    }
  }, [profile]);

  // Fetch dinner count
  const fetchDinnerCount = useCallback(async (userId: string) => {
    setDinnerLoading(true);
    try {
      const { count } = await supabase
        .from('peopledinner')
        .select('*', { count: 'exact', head: true })
        .eq('users_userid', userId);
      setDinnerCount(count ?? 0);
    } catch {
      setDinnerCount(0);
    } finally {
      setDinnerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchDinnerCount(currentUserId);
    }
  }, [currentUserId, fetchDinnerCount]);

  const showFeedback = (msg: string, error = false) => {
    setFeedbackMessage(msg);
    setIsError(error);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        username: username.trim(),
        avatar_url: avatarUrl,
        interests,
        relationship_status: relationshipStatus || null,
        occupation: occupation.trim() || null,
      });
      showFeedback('Profile saved successfully!', false);
    } catch {
      showFeedback('Failed to save. Please try again.', true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthenticated === null || loading) {
    return <PageLoading message="Loading profile..." />;
  }

  const pageWrapStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '48px 16px 180px 16px',
    boxSizing: 'border-box' as const,
  };

  const dividerStyle: React.CSSProperties = {
    width: '40px',
    height: '2px',
    backgroundColor: '#FBE6A6',
    margin: '0 auto 24px auto',
    opacity: 0.4,
    borderRadius: '1px',
  };

  const memberSinceStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    color: '#F8F4F0',
    opacity: 0.5,
    textAlign: 'center' as const,
    marginBottom: '32px',
    letterSpacing: '0.05em',
  };

  const scoreRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '4px',
    paddingBottom: '4px',
  };

  const relationshipLabel =
    RELATIONSHIP_OPTIONS.find(o => o.value === relationshipStatus)?.label || 'Not set';

  const memberSinceDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <PageContainer>
      <form onSubmit={handleSave} style={pageWrapStyle} noValidate>
        <PageHeader>My Profile</PageHeader>

        {/* Avatar hero */}
        {currentUserId && (
          <AvatarSection
            username={username}
            avatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
            userId={currentUserId}
          />
        )}

        {memberSinceDate && (
          <p style={memberSinceStyle}>Member since {memberSinceDate}</p>
        )}

        <div style={dividerStyle} aria-hidden="true" />

        {feedbackMessage && (
          <FeedbackBanner message={feedbackMessage} isError={isError} />
        )}

        {profileError && !feedbackMessage && (
          <FeedbackBanner message="There was a problem loading your profile." isError={true} />
        )}

        {/* Dinner score */}
        <div style={sectionCard}>
          <p style={sectionHeading}>Dinner Score</p>
          <div style={scoreRowStyle}>
            <DinnerScoreBadge count={dinnerCount} loading={dinnerLoading} />
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#F8F4F0',
            opacity: 0.55,
            textAlign: 'center' as const,
            marginTop: '12px',
            margin: '12px 0 0 0',
          }}>
            Total dinners you&apos;ve been paired for
          </p>
        </div>

        {/* Username */}
        <div style={sectionCard}>
          <p style={sectionHeading}>About You</p>
          <div style={{ marginBottom: '4px' }}>
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose your username"
              autoComplete="username"
              style={{
                width: '100%',
                height: '48px',
                padding: '0 16px',
                borderRadius: '8px',
                border: '2px solid #FBE6A6',
                backgroundColor: 'white',
                color: '#1a1a1a',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box' as const,
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#CFA94A'; e.target.style.boxShadow = '0 0 0 2px rgba(207, 169, 74, 0.3)'; }}
              onBlur={e => { e.target.style.borderColor = '#FBE6A6'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Occupation */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionHeading, marginBottom: 0 }}>What You Do</p>
            <button
              type="button"
              onClick={() => setIsEditingOccupation(v => !v)}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FBE6A6',
                background: 'transparent',
                border: '1px solid #FBE6A6',
                borderRadius: '4px',
                padding: '3px 10px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {isEditingOccupation ? 'Done' : 'Edit'}
            </button>
          </div>
          {isEditingOccupation ? (
            <div style={{ marginBottom: '4px' }}>
              <label htmlFor="occupation" style={labelStyle}>Occupation</label>
              <input
                id="occupation"
                name="occupation"
                type="text"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                placeholder="e.g. Designer, Teacher, Chef..."
                autoComplete="organization-title"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '2px solid #FBE6A6',
                  backgroundColor: 'white',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box' as const,
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#CFA94A'; e.target.style.boxShadow = '0 0 0 2px rgba(207, 169, 74, 0.3)'; }}
                onBlur={e => { e.target.style.borderColor = '#FBE6A6'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ) : (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              color: occupation ? '#F8F4F0' : '#F8F4F0',
              opacity: occupation ? 1 : 0.4,
              margin: 0,
            }}>
              {occupation || 'Not set'}
            </p>
          )}
        </div>

        {/* Relationship status */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionHeading, marginBottom: 0 }}>Relationship Status</p>
            <button
              type="button"
              onClick={() => setIsEditingRelationship(v => !v)}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FBE6A6',
                background: 'transparent',
                border: '1px solid #FBE6A6',
                borderRadius: '4px',
                padding: '3px 10px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {isEditingRelationship ? 'Done' : 'Edit'}
            </button>
          </div>
          {isEditingRelationship ? (
            <Select
              label="Status"
              name="relationship_status"
              value={relationshipStatus}
              onChange={e => setRelationshipStatus(e.target.value)}
              options={RELATIONSHIP_OPTIONS}
            />
          ) : (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              color: '#F8F4F0',
              opacity: relationshipStatus ? 1 : 0.4,
              margin: 0,
            }}>
              {relationshipStatus ? relationshipLabel : 'Not set'}
            </p>
          )}
        </div>

        {/* Interests */}
        <div style={sectionCard}>
          <p style={sectionHeading}>Interests</p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: '#F8F4F0',
            opacity: 0.7,
            marginBottom: '16px',
            margin: '0 0 16px 0',
          }}>
            Pick what you love — your dinner match will thank you.
          </p>
          <InterestChips selected={interests} onChange={setInterests} />
        </div>

        {/* Save */}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
      <Footer />
    </PageContainer>
  );
}
