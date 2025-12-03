import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-[#460C58] flex flex-col items-center justify-center ${className}`}>
      {children}
    </div>
  );
}
