'use client';

import { PageContainer, ContentContainer, Footer, PageHeader } from '@/components';
import { aboutContent } from '@/content/about';

export default function AboutPage() {
  return (
    <PageContainer>
      <ContentContainer className="pt-8 md:pt-12 px-4 md:px-8 max-w-3xl mx-auto">
        <PageHeader>About</PageHeader>
        
        {/* Intro card */}
        <div className=" border border-[#FBE6A6]/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <p className="text-[#F8F4F0] text-lg md:text-xl leading-relaxed text-center italic">
            {aboutContent.intro}
          </p>
        </div>

        {/* Spacer */}
        <div style={{ height: '10px', width: '100%' }}></div>

        {/* Sections */}
        <div className="space-y-12 md:space-y-16" style={{ paddingTop: '10px'}}>
          {aboutContent.sections.map((section, index) => (
            <div key={index} className="text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[#FBE6A6] mb-4 tracking-wide">
                {section.title}
              </h2>
              <p className="text-[#F8F4F0]/85 text-base md:text-lg leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom sparkle */}
        <div className="flex items-center justify-center mt-16 mb-8">
          <span className="text-[#FBE6A6]/60">✦</span>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}