import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <div className={`w-full border-2 border-[#FBE6A6] rounded-[12px] p-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}
