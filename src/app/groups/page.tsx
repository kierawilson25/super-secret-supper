'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, GroupCard, Footer, PageHeader, PageLoading } from '@/components';
import { useGroups } from '@/hooks';
import { supabase } from '@/lib/supabase';

// Styled anchor that matches the Button component's visual contract without
// the invalid anchor-wraps-button nesting pattern.
function ActionLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '0.75rem 1.25rem',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    textDecoration: 'none',
    border: `2px solid ${isPrimary ? '#FBE6A6' : '#F8F4F0'}`,
    borderRadius: '0',
    backgroundColor: 'transparent',
    color: isPrimary ? '#FBE6A6' : '#F8F4F0',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s, transform 0.15s',
    textAlign: 'center',
    minHeight: '44px',
  };

  return (
    <a
      href={href}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#CFA94A';
        e.currentTarget.style.color = '#460C58';
        e.currentTarget.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = isPrimary ? '#FBE6A6' : '#F8F4F0';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid #FBE6A6';
        e.currentTarget.style.outlineOffset = '3px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {children}
    </a>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, error } = useGroups();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnTo=/groups');
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, [router]);

  if (isAuthenticated === null || loading) {
    return <PageLoading message="Loading your groups..." />;
  }

  // ─── Styles ──────────────────────────────────────────────────────────────

  const ctaRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    width: '100%',
    marginBottom: '32px',
  };

  const dividerStyle: React.CSSProperties = {
    width: '100%',
    height: '1px',
    backgroundColor: '#FBE6A6',
    opacity: 0.2,
    marginBottom: '24px',
  };

  const emptyStateStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: '2px solid #FBE6A6',
    borderRadius: '12px',
    padding: '40px 24px',
    textAlign: 'center',
    marginBottom: '16px',
  };

  const emptyIconStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: '12px',
    display: 'block',
    lineHeight: 1,
  };

  const emptyHeadingStyle: React.CSSProperties = {
    color: '#FBE6A6',
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '8px',
    fontFamily: 'Inter, sans-serif',
  };

  const emptyBodyStyle: React.CSSProperties = {
    color: '#F8F4F0',
    fontSize: '0.95rem',
    opacity: 0.75,
    lineHeight: 1.5,
    marginBottom: '28px',
    fontFamily: 'Inter, sans-serif',
  };

  const emptyCtaRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    justifyContent: 'center',
  };

  const groupCountStyle: React.CSSProperties = {
    color: '#F8F4F0',
    fontSize: '0.85rem',
    opacity: 0.55,
    marginBottom: '16px',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    width: '100%',
  };

  const backLinkStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    color: '#F8F4F0',
    fontSize: '0.9rem',
    textDecoration: 'none',
    opacity: 0.45,
    padding: '12px 0 4px',
    fontFamily: 'Inter, sans-serif',
    transition: 'opacity 0.15s',
  };

  const errorStyle: React.CSSProperties = {
    color: '#f87171',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '24px',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.5,
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const hasGroups = groups.length > 0;

  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader>My Groups</PageHeader>

        {/* Primary action row — always visible above the list */}
        <div style={ctaRowStyle}>
          <ActionLink href="/create-group" variant="primary">
            + Create Group
          </ActionLink>
          <ActionLink href="/join" variant="secondary">
            Join with Code
          </ActionLink>
        </div>

        <div style={dividerStyle} aria-hidden="true" />

        {/* Error banner */}
        {error && (
          <p role="alert" style={errorStyle}>
            Could not load your groups. Please refresh and try again.
          </p>
        )}

        {/* Group list */}
        {hasGroups ? (
          <>
            <p style={groupCountStyle}>
              {groups.length} {groups.length === 1 ? 'group' : 'groups'}
            </p>
            {groups.map((group) => (
              <GroupCard key={group.groupid} group={group} />
            ))}
          </>
        ) : (
          /* Empty state */
          <div style={emptyStateStyle}>
            <span style={emptyIconStyle} aria-hidden="true">
              🍽️
            </span>
            <p style={emptyHeadingStyle}>No groups yet</p>
            <p style={emptyBodyStyle}>
              Start by creating your first dinner group, or enter an invite code
              to join one a friend has already set up.
            </p>
            <div style={emptyCtaRowStyle}>
              <ActionLink href="/create-group" variant="primary">
                Create Group
              </ActionLink>
              <ActionLink href="/join" variant="secondary">
                Join with Code
              </ActionLink>
            </div>
          </div>
        )}

        {/* Tertiary escape hatch */}
        <Link
          href="/"
          style={backLinkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.75';
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.45';
            e.currentTarget.style.textDecoration = 'none';
          }}
          onFocus={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.outline = '2px solid #FBE6A6';
            e.currentTarget.style.outlineOffset = '3px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.opacity = '0.45';
            e.currentTarget.style.outline = 'none';
          }}
        >
          Back to Home
        </Link>
      </ContentContainer>

      <Footer />
    </PageContainer>
  );
}
