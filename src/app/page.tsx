'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, ContentContainer, Button, Footer, PageHeader, PageLoading } from '@/components';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/home');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return <PageLoading message="Loading..." />;
  }

  return (
    <PageContainer>
      <ContentContainer className="pt-10">
        <PageHeader isLandingPage={true} />

      <p style={{ textAlign: 'center' }}>Monthly dinner pairings that turn <br/>group friends into real friends. <br/>
      Create a group, invite everyone, <br/> and we'll handle the rest.</p>


        <div className="flex flex-col gap-4 items-center">
          <Link href="/waitlist">
            <Button>Join The Waitlist →</Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary">Learn More</Button>
          </Link>
        </div>
                <div className="icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="32" r="12"/>
            <circle cx="44" cy="32" r="12"/>
            <path d="M32 18 L32 46"/>
            <path d="M16 32 L48 32"/>
          </svg>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
