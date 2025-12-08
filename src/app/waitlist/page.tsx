'use client';

import { useState } from 'react';
import { PageContainer, ContentContainer, Button, Input, PageHeader } from '@/components';
import { supabase } from '@/lib/supabase';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({ email });

      if (insertError) throw insertError;

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <div className="flex flex-col items-center text-center px-2 pt-4 pb-4 md:pt-6">
          <h1 className="text-6xl md:text-8xl font-bold text-[#FBE6A6] mb-2">
            shhhh...
          </h1>
          <h2 className="text-2xl font-bold text-[#FBE6A6]">
            Super Secret Supper
          </h2>
          <p className="text-2xl md:text-4xl text-[#FBE6A6] mb-6">
            Join the Beta waitlist
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 text-center px-4">


          <p className="text-[#F8F4F0] max-w-md">
            Super Secret Supper helps you turn group friends into real friends through monthly dinner pairings.
            We handle the logistics, you enjoy the conversations.
          </p>

          <p className="text-[#F8F4F0] max-w-md">
            Enter your email below to be notified when we launch and get early access to create your first group.
          </p>

          {success ? (
            <div className="bg-green-900/30 border border-green-500 text-green-200 px-6 py-4 rounded-lg max-w-md">
              Thanks for joining! We'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>
          )}
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
