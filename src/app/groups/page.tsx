'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, GroupCard, Footer, PageHeader, PageLoading } from '@/components';
import { useGroups } from '@/hooks';
import { supabase } from '@/lib/supabase';

export default function GroupsPage() {
  const router = useRouter();
  const { groups, loading, error } = useGroups();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>My Groups</PageHeader>
        <p className="text-[#F8F4F0] text-center text-base mb-8">
          View and manage your dinner groups
        </p>

        {error && (
          <p className="text-red-400 text-center text-sm mb-6">
            Error loading groups: {error}
          </p>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#F8F4F0] mb-6">
              You're not part of any groups yet.
            </p>
          </div>
        ) : (
          <div className="p-4">
            {groups.map(group => (
              <GroupCard key={group.groupid} group={group} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 items-center pt-4">
          <Link href="/create-group">
            <Button>Create New Group</Button>
          </Link>
          <Link href="/join">
            <Button variant="secondary">Join with Code</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
