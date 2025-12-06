'use client';

import { useState, useEffect } from 'react';
import { PageContainer, ContentContainer, Button, Input, Footer, Card, PageHeader } from '@/components';
import { profileContent } from '@/content/profile';
import { useProfile, useGroups } from '@/hooks';

export default function ProfilePage() {
  const { profile, loading, updateProfile, error } = useProfile();
  const { groups } = useGroups();
  const [formData, setFormData] = useState({
    username: '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setMessage(profileContent.messages.success);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage(profileContent.messages.error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentContainer>
          <p className="text-[#F8F4F0]">Loading...</p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-12">
        <PageHeader>{profileContent.title}</PageHeader>
        <p className="text-[#F8F4F0] text-base mb-8">
          {profileContent.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6 mb-8">
          <Input
            label={profileContent.labels.username}
            name="username"
            placeholder={profileContent.placeholders.username}
            value={formData.username}
            onChange={handleChange}
          />

          {(message || error) && (
            <p className={`text-center text-sm mb-6 ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message || error}
            </p>
          )}

          <div className="space-y-4 pt-4 w-full">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : profileContent.buttons.save}
            </Button>
          </div>
        </form>

        {groups.length > 0 && (
          <div className="w-full mt-8">
            <h2 className="text-2xl font-bold text-[#FBE6A6] mb-4 text-center">
              {profileContent.sections.groupMemberships.title}
            </h2>
            <p className="text-[#F8F4F0] text-base mb-4 text-center">
              {profileContent.sections.groupMemberships.description}
            </p>
            <div className="space-y-3">
              {groups.map(group => (
                <Card key={group.groupid}>
                  <h3 className="text-[#FBE6A6] font-bold text-lg">{group.groupname}</h3>
                  <p className="text-[#F8F4F0] text-sm">{group.groupcity || 'No city specified'}</p>
                  <p className="text-[#F8F4F0] text-xs mt-1">
                    Cadence: {group.dinner_cadence}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
