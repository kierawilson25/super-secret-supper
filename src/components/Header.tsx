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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header>
      <style jsx>{`
        header {
          position: sticky;
          top: 0;
          background-color: #460C58;
          border-bottom: 2px solid #FBE6A6;
          z-index: 1000;
        }

        .header-content {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          color: #FBE6A6;
          font-size: 1.5rem;
          font-family: 'Great Vibes', cursive;
          font-weight: bold;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .hamburger span {
          width: 24px;
          height: 2px;
          background-color: #FBE6A6;
        }

        .mobile-menu {
          border-top: 1px solid #FBE6A6;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-end;
        }

        .nav {
          display: none;
        }

        .nav-link {
          color: #FBE6A6 !important;
          text-decoration: none !important;
          font-size: 1rem;
          transition: opacity 0.2s;
          padding: 0.5rem 0;
          display: block;
        }

        .nav-link:hover {
          opacity: 0.8;
          color: #FBE6A6 !important;
        }

        .nav-link:visited {
          color: #FBE6A6 !important;
        }

        .nav-link.active {
          font-weight: bold;
          color: #FBE6A6 !important;
        }

        .logout-btn {
          background-color: transparent;
          border: 1px solid #FBE6A6;
          color: #FBE6A6;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .logout-btn:hover {
          background-color: #FBE6A6;
          color: #460C58;
        }

        @media (min-width: 640px) {
          .hamburger {
            display: none;
          }

          .mobile-menu {
            display: none !important;
          }

          .nav {
            display: flex;
            gap: 1.5rem;
            align-items: center;
          }

          .logout-btn {
            width: auto;
          }
        }

        @media (min-width: 768px) {
          .header-content {
            padding: 1rem 2rem;
          }
        }
      `}</style>

      <div className="header-content">
        <button onClick={() => router.push('/profile')} className="logo">
          SSS
        </button>

        {user && (
          <>
            {/* Desktop Nav */}
            <nav className="nav">
              <Link
                href="/home"
                style={{
                  color: '#FBE6A6',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: pathname === '/home' ? 'bold' : 'normal',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Home
              </Link>
              <Link
                href="/profile"
                style={{
                  color: '#FBE6A6',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: pathname === '/profile' ? 'bold' : 'normal',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Profile
              </Link>
              <Link
                href="/groups"
                style={{
                  color: '#FBE6A6',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: pathname === '/groups' || pathname?.startsWith('/groups/') ? 'bold' : 'normal',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Groups
              </Link>
              <Link
                href="/create-group"
                style={{
                  color: '#FBE6A6',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: pathname === '/create-group' ? 'bold' : 'normal',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Create Group
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </nav>

            {/* Mobile Hamburger */}
            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="mobile-menu">
          <Link
            href="/home"
            style={{
              color: '#FBE6A6',
              textDecoration: pathname === '/home' ? 'underline' : 'none',
              fontSize: '1rem',
              padding: '0.5rem 0',
              fontWeight: pathname === '/home' ? 'bold' : 'normal'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/profile"
            style={{
              color: '#FBE6A6',
              textDecoration: pathname === '/profile' ? 'underline' : 'none',
              fontSize: '1rem',
              padding: '0.5rem 0',
              fontWeight: pathname === '/profile' ? 'bold' : 'normal'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/groups"
            style={{
              color: '#FBE6A6',
              textDecoration: pathname === '/groups' || pathname?.startsWith('/groups/') ? 'underline' : 'none',
              fontSize: '1rem',
              padding: '0.5rem 0',
              fontWeight: pathname === '/groups' || pathname?.startsWith('/groups/') ? 'bold' : 'normal'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Groups
          </Link>
          <Link
            href="/create-group"
            style={{
              color: '#FBE6A6',
              textDecoration: pathname === '/create-group' ? 'underline' : 'none',
              fontSize: '1rem',
              padding: '0.5rem 0',
              fontWeight: pathname === '/create-group' ? 'bold' : 'normal'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Create Group
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
