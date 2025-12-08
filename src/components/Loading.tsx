import React from 'react';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-pulse text-[#FBE6A6] text-xl font-semibold">
        {message}
      </div>
    </div>
  );
}
