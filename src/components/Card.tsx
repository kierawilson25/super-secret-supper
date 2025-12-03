import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#460C58]/50 border border-[#FBE6A6] rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
