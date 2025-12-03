'use client';

import { PageContainer, ContentContainer, Footer, PageHeader } from '@/components';
import { aboutContent } from '@/content/about';

export default function AboutPage() {
  return (
    <PageContainer>
      <ContentContainer className="pt-12">
        <PageHeader>About</PageHeader>
        <p className="text-[#F8F4F0] text-base leading-relaxed mb-8">
          {aboutContent.intro}
        </p>

        <div className="w-full space-y-8">
          {aboutContent.sections.map((section, index) => (
            <div key={index} className="text-center">
              <h2 className="text-2xl font-bold text-[#FBE6A6] mb-3">
                {section.title}
              </h2>
              <p className="text-[#F8F4F0] text-base leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
