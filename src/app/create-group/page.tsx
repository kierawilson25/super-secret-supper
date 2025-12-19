'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Input, Select, Footer, PageHeader, PageLoading } from '@/components';
import { createGroupContent } from '@/content/createGroup';
import { useGroups } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function CreateGroupPage() {
  const router = useRouter();
  const { createGroup, error } = useGroups();
  const [formData, setFormData] = useState({
    groupName: '',
    city: 'charlotte',
    cadence: 'monthly',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createGroup(
        formData.groupName,
        formData.city,
        formData.cadence as 'monthly' | 'quarterly' | 'biweekly'
      );
      setMessage(createGroupContent.messages.success);
      setTimeout(() => router.push('/groups'), 2000);
    } catch {
      setMessage(createGroupContent.messages.error);
      setIsSubmitting(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <Input
            label={createGroupContent.labels.groupName}
            name="groupName"
            placeholder={createGroupContent.placeholders.groupName}
            value={formData.groupName}
            onChange={handleChange}
            required
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

          {(message || error) && (
            <p className={`text-center text-sm mb-6 ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message || error}
            </p>
          )}

          <div className="space-y-4 pt-4 w-full">
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
