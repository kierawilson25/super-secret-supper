import React from 'react';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentContainer({ children, className = '' }: ContentContainerProps) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-4 md:py-8 w-full max-w-[500px] pt-10 mx-auto ${className}`} style={{ paddingBottom: '150px' }}>
      {children}
    </div>
  );
}
