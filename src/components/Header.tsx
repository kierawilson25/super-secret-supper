'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Don't show header on landing page or auth pages
  const hideHeader = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/about' || pathname === '/waitlist';

  if (hideHeader || loading) {
    return null;
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#460C58',
        borderBottom: '2px solid #FBE6A6',
        zIndex: 1000,
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link
          href="/profile"
          style={{
            color: '#FBE6A6',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontFamily: 'Great Vibes, cursive',
            fontWeight: 'bold',
          }}
        >
          Super Secret Supper
        </Link>

        {user && (
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link
              href="/profile"
              style={{
                color: pathname === '/profile' ? '#FBE6A6' : '#F8F4F0',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s',
              }}
            >
              Profile
            </Link>
            <Link
              href="/groups"
              style={{
                color: pathname === '/groups' || pathname.startsWith('/groups/') ? '#FBE6A6' : '#F8F4F0',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s',
              }}
            >
              Groups
            </Link>
            <Link
              href="/create-group"
              style={{
                color: pathname === '/create-group' ? '#FBE6A6' : '#F8F4F0',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s',
              }}
            >
              Create Group
            </Link>
          </nav>
        )}
      </div>

      {user && (
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #FBE6A6',
            color: '#FBE6A6',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FBE6A6';
            e.currentTarget.style.color = '#460C58';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#FBE6A6';
          }}
        >
          Logout
        </button>
      )}
    </header>
  );
}
