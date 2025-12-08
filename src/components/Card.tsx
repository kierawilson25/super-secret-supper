import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-[#460C58]/50 rounded-lg px-[30px] py-[22px] border-[2.5px] border-[#FBE6A6] mx-1.5 ${className}`}
    >
      {children}
    </div>
  );
}
