import Link from 'next/link';
import { Card, Button } from '@/components';

interface GroupCardProps {
  group: {
    groupid: string;
    groupname: string;
    groupcity?: string;
    member_count?: number;
    admin_id?: string;
  };
  currentUserId?: string;
}

export function GroupCard({ group, currentUserId }: GroupCardProps) {
  const isAdmin = currentUserId && group.admin_id === currentUserId;

  return (
    <div className="p-4">
      <Card>
        <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3">
          {/* Row 1: Group name spanning both columns */}
          <h3 className="col-span-2 text-[#FBE6A6] font-bold text-2xl">
            {group.groupname}
          </h3>

          {/* Row 2: City info and Manage button (admin only) */}
          <div className="flex items-center text-[#F8F4F0] text-sm">
            <span className="text-lg mr-[14px]">📍</span>
            <span>{group.groupcity || 'No city specified'}</span>
          </div>
          {isAdmin ? (
            <Link href={`/groups/${group.groupid}/manage`}>
              <Button variant="secondary" className="text-sm px-4 py-2 w-full">
                Manage
              </Button>
            </Link>
          ) : (
            <div></div>
          )}

          {/* Row 3: Member count and Members button */}
          <div className="flex items-center text-[#F8F4F0] text-sm">
            <span className="text-lg mr-[14px]">👥</span>
            <span>{group.member_count || 0} {group.member_count === 1 ? 'member' : 'members'}</span>
          </div>
          <Link href={`/groups/${group.groupid}/members`}>
            <Button variant="secondary" className="text-sm px-4 py-2 w-full">
              Members
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
