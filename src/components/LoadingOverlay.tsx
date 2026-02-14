'use client';

import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed inset-0 bg-[#460C58]/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing circle animation */}
        <div className="relative w-20 h-20">
          <div
            className="absolute inset-0 rounded-full bg-[#FBE6A6]/20 animate-ping"
            style={{
              animationDuration: '1.5s',
            }}
          />
          <div
            className="absolute inset-0 rounded-full bg-[#FBE6A6]/40 animate-pulse"
            style={{
              animationDuration: '2s',
            }}
          />
          <div className="absolute inset-0 rounded-full border-4 border-[#FBE6A6] border-t-transparent animate-spin" />
        </div>

        {/* Loading message */}
        <p className="text-[#FBE6A6] text-xl font-semibold animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
