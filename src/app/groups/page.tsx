'use client';

import Link from 'next/link';
import { PageContainer, ContentContainer, Button, GroupCard, Footer, PageHeader, PageLoading } from '@/components';
import { useGroups } from '@/hooks';

export default function GroupsPage() {
  const { groups, loading, error } = useGroups();

  if (loading) {
    return <PageLoading message="Loading your groups..." />;
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-12">
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
          <div className="p-4 space-y-4">
            {groups.map(group => (
              <GroupCard key={group.groupid} group={group} />

            ))}

          </div>
        )}

        <div className="flex flex-col gap-4 items-center pt-4">
          <Link href="/create-group">
            <Button>Create New Group</Button>
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
