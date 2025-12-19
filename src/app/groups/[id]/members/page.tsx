'use client';

import { useParams } from 'next/navigation';
import { PageContainer, ContentContainer, Card, Footer, PageHeader, PageLoading } from '@/components';
import { useMembers } from '@/hooks';

export default function GroupMembersPage() {
  const params = useParams();
  const groupId = params?.id as string;
  const { members, loading, error } = useMembers(groupId);

  if (loading) {
    return <PageLoading message="Loading members..." />;
  }

  if (error) {
    return (
      <PageContainer>
        <ContentContainer className="pt-20">
          <p className="text-red-400">Error: {error}</p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader>Group Members</PageHeader>
        <p className="text-[#F8F4F0] text-base mb-8">
          {members.length} member{members.length !== 1 ? 's' : ''} in this group
        </p>

        <div className="w-full space-y-3">
          {members.map(member => (
            <Card key={member.id}>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-[#FBE6A6] font-bold">
                    {member.username || 'Anonymous'}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <p className="text-[#F8F4F0] text-center">No members yet.</p>
        )}
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
