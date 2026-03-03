'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const linkStyle = { color: '#F8F4F0', textDecoration: 'none' } as const;
const hoverOn = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.textDecoration = 'underline'; };
const hoverOff = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.textDecoration = 'none'; };

export function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  return (
    <footer style={{
      position: 'fixed',
      bottom: '0',
      fontSize: '0.9rem',
      color: '#F8F4F0',
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      width: '100%',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      backgroundColor: '#460C58',
    }}>
      <Link href="/about" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>About</Link>
      <Link href="/" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Contact</Link>
      {isAuthenticated === false && (
        <>
          <Link href="/terms-of-service" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Terms</Link>
          <Link href="/privacy-policy" style={linkStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>Privacy</Link>
        </>
      )}
    </footer>
  );
}
