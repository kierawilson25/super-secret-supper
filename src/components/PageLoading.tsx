import React from 'react';
import { PageContainer } from './PageContainer';
import { ContentContainer } from './ContentContainer';
import { Footer } from './Footer';

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <PageContainer>
      <div className="flex-1 flex flex-col items-center w-full max-w-[500px] mx-auto px-4 sm:px-6" style={{ paddingTop: '180px', paddingBottom: '200px' }}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse text-[#FBE6A6] text-xl font-semibold">
            {message}
          </div>
        </div>
      </div>
      <Footer />
    </PageContainer>
  );
}
