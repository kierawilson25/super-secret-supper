'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Input, Footer, PageHeader } from '@/components';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo');
  const errorRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      logger.info('Login attempt started');

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        logger.error('Login failed', { errorMessage: authError.message });
        setError(authError.message);
        setLoading(false);
        setTimeout(() => errorRef.current?.focus(), 100);
        return;
      }

      logger.info('Login successful', { userId: data.user?.id });
      const redirectPath = returnTo || '/groups';
      logger.info('Redirecting user', { path: redirectPath });

      // Keep loading state active while redirecting
      router.push(redirectPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      logger.error('Login attempt failed', { errorMessage });
      setError(errorMessage);
      setLoading(false);
      setTimeout(() => errorRef.current?.focus(), 100);
    }
  };


  return (
    <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Welcome Back</PageHeader>
          <p className="text-[#F8F4F0] text-center text-base mb-8">
            Login to continue to Super Secret Supper
          </p>

          <form className="w-full space-y-6" onSubmit={handleLogin}>
            {error && (
              <div ref={errorRef} tabIndex={-1} className="outline-none flex justify-center">
                <div className="border-2 border-red-400 rounded-lg p-4 max-w-md w-full text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-bold text-red-100" aria-hidden="true">
                      ⚠
                    </span>
                    <p className="text-sm leading-relaxed text-red-100">{error}</p>
                  </div>
                  <p className="text-[#F8F4F0]" style={{ fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                    Need help?{' '}
                    <Link
                      href="/forgot-password"
                      className="text-[#FBE6A6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FBE6A6] rounded px-1"
                    >
                      Reset your password
                    </Link>
                  </p>
                </div>
              </div>
            )}

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            required
            autoComplete="current-password"
          />

          <div className="text-center -mt-2">
            <Link
              href="/forgot-password"
              className="text-[#FBE6A6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FBE6A6] focus:ring-offset-2 focus:ring-offset-[#460C58] rounded px-1"
              style={{ fontSize: '0.9375rem' }}
            >
              Forgot password?
            </Link>
          </div>

          <div className="space-y-4 pt-4 w-full">
            <Button
              type="submit"
              disabled={loading}
              aria-label={loading ? 'Logging in, please wait' : 'Log in to your account'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <p className="text-center text-sm text-[#F8F4F0]">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-[#FBE6A6] hover:underline focus:outline-none focus:ring-2 focus:ring-[#FBE6A6] focus:ring-offset-2 focus:ring-offset-[#460C58] rounded px-1"
              >
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
