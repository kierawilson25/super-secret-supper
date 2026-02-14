'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageContainer, ContentContainer, PageHeader, Footer } from '@/components';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        setValidSession(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        setLoading(false);
        return;
      }

      if (!/[a-z]/.test(password)) {
        setError('Password must contain at least one lowercase letter');
        setLoading(false);
        return;
      }

      if (!/[0-9]/.test(password)) {
        setError('Password must contain at least one number');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (validSession === null) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <p className="text-[#F8F4F0] text-center">Loading...</p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // Invalid or expired session
  if (!validSession) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Invalid Reset Link</PageHeader>
          <p className="text-[#F8F4F0] text-center text-base mb-8">
            This password reset link is invalid or has expired.
            Please request a new password reset link.
          </p>
          <Button onClick={() => router.push('/forgot-password')}>
            Request New Link
          </Button>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // Success state
  if (success) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Password Reset Successful!</PageHeader>
          <p className="text-[#F8F4F0] text-center text-base mb-8">
            Your password has been reset successfully. Redirecting to login...
          </p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // Reset password form
  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>Set New Password</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
          />

          <div className="text-[#FBE6A6] text-xs text-center -mt-2">
            <p className="mb-1">Password must:</p>
            <ul className="list-disc list-inside">
              <li>Be at least 8 characters long</li>
              <li>Contain uppercase and lowercase letters</li>
              <li>Contain at least one number</li>
            </ul>
          </div>

          {error && (
            <p className="text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
