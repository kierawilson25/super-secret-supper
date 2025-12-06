'use client';

import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Card, Footer, PageHeader } from '@/components';
import { useGroups } from '@/hooks';

export default function GroupsPage() {
  const { groups, loading, error } = useGroups();

  if (loading) {
    return (
      <PageContainer>
        <ContentContainer className="pt-12">
          <PageHeader>My Groups</PageHeader>
          <p className="text-[#F8F4F0] text-center">Loading your groups...</p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
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
            <Link href="/create-group">
              <Button>Create Your First Group</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {groups.map(group => (
              <Card key={group.groupid}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-[#FBE6A6] font-bold text-xl mb-2">
                      {group.groupname}
                    </h3>
                    <p className="text-[#F8F4F0] text-sm mb-1">
                      📍 {group.groupcity || 'No city specified'}
                    </p>
                    <p className="text-[#F8F4F0] text-sm">
                      🍽️ Dinners: {group.dinner_cadence}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/groups/${group.groupid}/manage`}>
                      <Button variant="secondary" className="text-sm px-4 py-2">
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/groups/${group.groupid}/members`}>
                      <Button variant="secondary" className="text-sm px-4 py-2">
                        Members
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
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
