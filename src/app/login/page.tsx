'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, ContentContainer, Button, Input, Footer } from '@/components';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Attempting login with:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data);
      setMessage('Login successful! Redirecting...');
      setTimeout(() => router.push('/create-group'), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('Login failed:', err);
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Attempting signup with:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup successful:', data);
      setMessage('Account created! You can now log in.');
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
      <ContentContainer className="pt-12">
        <h1 className="text-4xl font-bold text-[#FBE6A6] mb-4 text-center">
          Login / Sign Up (TEST)
        </h1>
        <p className="text-[#F8F4F0] text-center text-sm mb-8">
          Temporary login page for testing
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
            <Button onClick={handleSignUp} variant="secondary" disabled={loading}>
              Sign Up
            </Button>
          </div>
        </form>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
