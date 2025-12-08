import React from 'react';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({ children, className = '' }: ContentContainerProps) {
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-start w-full max-w-[500px] mx-auto px-4 sm:px-6 pt-10 ${className}`}
      style={{ paddingBottom: '200px' }}
    >
      {children}
    </div>
  );
}