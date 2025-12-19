'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Input, Footer, PageHeader } from '@/components';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      logger.info('Login attempt started');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Login failed', { errorMessage: error.message });
        throw error;
      }

      logger.info('Login successful', { userId: data.user?.id });
      setMessage('Login successful! Redirecting...');
      const redirectPath = returnTo || '/profile';
      logger.info('Redirecting user', { path: redirectPath });
      setTimeout(() => router.push(redirectPath), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      logger.error('Login attempt failed', { errorMessage });
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>Welcome Back</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          Login to continue to Super Secret Supper
        </p>

        <form className="w-full space-y-6">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && (
            <p className={`text-center text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <div className="space-y-4 pt-4 w-full">
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </Button>

            <p className="text-center text-sm text-[#F8F4F0]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#FBE6A6] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Loading...</PageHeader>
        </ContentContainer>
        <Footer />
      </PageContainer>
    }>
      <LoginForm />
    </Suspense>
  );
}
