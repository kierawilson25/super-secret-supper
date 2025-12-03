'use client';

import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Footer, PageHeader } from '@/components';

export default function HomePage() {
  return (
    <PageContainer>
      <ContentContainer className="pt-20">
        <PageHeader isLandingPage={true} />

        <p style={{ textAlign: 'center' }}>Pairing you with someone new for an <br/>unforgettable dinner. <br/>
       Sign up once. Sit down once a month. <br/> Meet someone new each time.</p>

        <div className="icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="32" r="12"/>
            <circle cx="44" cy="32" r="12"/>
            <path d="M32 18 L32 46"/>
            <path d="M16 32 L48 32"/>
          </svg>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <Link href="/create-group">
            <Button>Create a Group →</Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary">Learn More</Button>
          </Link>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
