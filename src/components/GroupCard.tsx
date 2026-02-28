import Link from 'next/link';

const cardStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
  cursor: 'pointer',
  display: 'block',
  textDecoration: 'none',
  transition: 'border-color 0.15s',
};

interface GroupCardProps {
  group: {
    groupid: string;
    groupname: string;
    groupcity?: string;
    member_count?: number;
  };
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.groupid}`} style={cardStyle}>
      <h3 className="text-[#FBE6A6] font-bold text-2xl mb-3">
        {group.groupname}
      </h3>
      <div className="flex items-center text-[#F8F4F0] text-sm mb-2">
        <span className="text-lg mr-[14px]">📍</span>
        <span>{group.groupcity || 'No city specified'}</span>
      </div>
      <div className="flex items-center text-[#F8F4F0] text-sm">
        <span className="text-lg mr-[14px]">👥</span>
        <span>{group.member_count || 0} {group.member_count === 1 ? 'member' : 'members'}</span>
      </div>
    </Link>
  );
}
