'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageContainer, ContentContainer, PageHeader, Footer } from '@/components';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Check Your Email</PageHeader>
          <p className="text-[#F8F4F0] text-center text-base mb-4">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <p className="text-[#F8F4F0] text-center text-base mb-8">
            Click the link in the email to reset your password.
          </p>
          <p className="text-[#FBE6A6] text-center text-sm mb-8">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <div className="space-y-4 w-full">
            <Button onClick={() => router.push('/login')}>
              Back to Login
            </Button>
            <Button onClick={() => setSuccess(false)} variant="secondary">
              Try Again
            </Button>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>Reset Password</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            autoComplete="email"
          />

          {error && (
            <p className="text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <p className="text-center text-sm text-[#F8F4F0]">
            <Link href="/login" className="text-[#FBE6A6] hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
