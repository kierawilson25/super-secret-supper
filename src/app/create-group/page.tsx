'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Input, Select, Footer, PageHeader, PageLoading } from '@/components';
import { createGroupContent } from '@/content/createGroup';
import { useGroups } from '@/hooks';
import { supabase } from '@/lib/supabase';

const fieldWrapperStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#FBE6A6',
  fontSize: '1.2rem',
  fontWeight: 600,
  marginBottom: '8px',
  paddingLeft: '5px',
  paddingTop: '5px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#ffffff',
  border: '3px solid #FBE6A6',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '1.2rem',
  color: '#1f2937',
  caretColor: '#460C58',
  resize: 'none',
  lineHeight: '1.5',
  outline: 'none',
  boxSizing: 'border-box',
};

interface HashtagPickerProps {
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

function HashtagPicker({ options, selected, onToggle }: HashtagPickerProps) {
  const pillGridStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  };

  return (
    <div style={fieldWrapperStyle}>
      <span style={labelStyle}>{createGroupContent.labels.hashtags}</span>
      <div style={pillGridStyle} role="group" aria-label="Select hashtags">
        {options.map((tag) => {
          const isSelected = selected.includes(tag);
          const pillStyle: React.CSSProperties = {
            backgroundColor: isSelected ? 'rgba(251,230,166,0.25)' : 'transparent',
            border: isSelected ? '1px solid #FBE6A6' : '1px solid rgba(251,230,166,0.3)',
            borderRadius: '999px',
            padding: '8px 16px',
            fontSize: '0.9rem',
            color: isSelected ? '#FBE6A6' : 'rgba(251,230,166,0.55)',
            cursor: 'pointer',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
          };
          return (
            <button
              key={tag}
              type="button"
              style={pillStyle}
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { createGroup, error } = useGroups();
  const [formData, setFormData] = useState({
    groupName: '',
    city: 'charlotte',
    cadence: 'monthly',
    vibe: '',
    hashtags: [] as string[],
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnTo=/create-group');
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, [router]);

  const cityOptions = [
    { value: 'charlotte', label: 'Charlotte' },
    { value: 'new-york', label: 'New York' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHashtagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.includes(tag)
        ? prev.hashtags.filter(t => t !== tag)
        : [...prev.hashtags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGroup(
        formData.groupName,
        formData.city,
        formData.cadence as 'monthly' | 'quarterly' | 'biweekly',
        formData.vibe || undefined,
        formData.hashtags.length > 0 ? formData.hashtags : undefined,
      );
      setMessage(createGroupContent.messages.success);
      setTimeout(() => router.push('/groups'), 2000);
    } catch {
      setMessage(createGroupContent.messages.error);
      setIsSubmitting(false);
    }
  };

  const messageIsSuccess = message.toLowerCase().includes('created');

  if (isAuthenticated === null) {
    return <PageLoading message="Loading..." />;
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>{createGroupContent.title}</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          {createGroupContent.subtitle}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }} noValidate>
          <Input
            label={createGroupContent.labels.groupName}
            name="groupName"
            placeholder={createGroupContent.placeholders.groupName}
            value={formData.groupName}
            onChange={handleChange}
            required
            aria-required="true"
          />

          <Select
            label={createGroupContent.labels.city}
            name="city"
            value={formData.city}
            onChange={handleChange}
            options={cityOptions}
          />

          <Select
            label={createGroupContent.labels.dinnerCadence}
            name="cadence"
            value={formData.cadence}
            onChange={handleChange}
            options={createGroupContent.cadenceOptions}
          />

          <div style={{ ...fieldWrapperStyle, paddingLeft: '20px', paddingRight: '20px' }}>
            <label htmlFor="vibe" style={labelStyle}>
              {createGroupContent.labels.vibeCheck}
            </label>
            <textarea
              id="vibe"
              name="vibe"
              rows={2}
              maxLength={120}
              placeholder={createGroupContent.placeholders.vibeCheck}
              value={formData.vibe}
              onChange={handleChange}
              style={textareaStyle}
              aria-describedby="vibe-hint"
            />
            <span
              id="vibe-hint"
              style={{ display: 'block', color: 'rgba(248,244,240,0.5)', fontSize: '0.8rem', marginTop: '4px', paddingLeft: '4px' }}
            >
              {formData.vibe.length}/120
            </span>
          </div>

          <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <HashtagPicker
              options={createGroupContent.hashtagOptions}
              selected={formData.hashtags}
              onToggle={handleHashtagToggle}
            />
          </div>

          {(message || error) && (
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                marginBottom: '24px',
                color: messageIsSuccess ? '#4ade80' : '#f87171',
              }}
              role="status"
              aria-live="polite"
            >
              {message || error}
            </p>
          )}

          <div style={{ paddingTop: '16px', width: '100%' }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : createGroupContent.buttons.create}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {createGroupContent.buttons.cancel}
            </Button>
          </div>
        </form>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
