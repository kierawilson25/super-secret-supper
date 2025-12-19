'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Input, Footer, PageHeader } from '@/components';
import { supabase } from '@/lib/supabase';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Username validation
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting signup with:', email);

      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Signup error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('Auth account created, updating username...');

        // Update username in people table
        const { error: updateError } = await supabase
          .from('people')
          .update({ username: username })
          .eq('userid', authData.user.id);

        if (updateError) {
          console.error('Error updating username:', updateError);
          // Don't throw - account is created, username can be updated later
        }
      }

      console.log('Signup successful:', authData);
      setMessage('Account created successfully! Redirecting to login...');

      // Redirect to login page (with returnTo if present)
      setTimeout(() => {
        if (returnTo) {
          router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        } else {
          router.push('/login');
        }
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      console.error('Signup failed:', err);
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>Create Account</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          Join Super Secret Supper and start making meaningful connections
        </p>

        <form onSubmit={handleSignUp} className="w-full space-y-6">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: undefined });
            }}
            required
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 -mt-4">{errors.email}</p>
          )}

          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors({ ...errors, username: undefined });
            }}
            required
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1 -mt-4">{errors.username}</p>
          )}

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: undefined });
            }}
            required
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1 -mt-4">{errors.password}</p>
          )}

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors({ ...errors, confirmPassword: undefined });
            }}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1 -mt-4">{errors.confirmPassword}</p>
          )}

          {message && (
            <p className={`text-center text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <div className="space-y-4 pt-4 w-full">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-[#F8F4F0]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FBE6A6] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <ContentContainer className="pt-20">
          <PageHeader>Loading...</PageHeader>
        </ContentContainer>
        <Footer />
      </PageContainer>
    }>
      <SignupForm />
    </Suspense>
  );
}
