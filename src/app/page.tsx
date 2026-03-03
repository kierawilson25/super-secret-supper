'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Footer, PageLoading } from '@/components';
import { supabase } from '@/lib/supabase';

// ─── Design tokens ─────────────────────────────────────────────────────────
const gold = '#FBE6A6';
const offwhite = '#F8F4F0';
const purple = '#460C58';
const hoverGold = '#CFA94A';

// ─── Shared layout ──────────────────────────────────────────────────────────
const section: React.CSSProperties = { width: '100%', padding: '80px 24px' };
const col: React.CSSProperties = { maxWidth: '560px', margin: '0 auto' };

// ─── Reusable CTA button ────────────────────────────────────────────────────
function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        color: hovered ? purple : gold,
        backgroundColor: hovered ? hoverGold : 'transparent',
        border: `2px solid ${hovered ? hoverGold : gold}`,
        borderRadius: '10px',
        padding: '14px 32px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '1rem',
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '0.02em',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

// ─── Nav bar ────────────────────────────────────────────────────────────────
function NavSignUpButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/signup"
      style={{
        color: hovered ? purple : gold,
        backgroundColor: hovered ? hoverGold : 'transparent',
        border: `1px solid ${hovered ? hoverGold : gold}`,
        borderRadius: '8px',
        padding: '7px 18px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Create a new account"
    >
      Sign Up
    </Link>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '60px',
        backgroundColor: scrolled ? 'rgba(70,12,88,0.97)' : 'rgba(70,12,88,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: `1px solid rgba(251,230,166,${scrolled ? 0.25 : 0.12})`,
        transition: 'background-color 0.3s, border-color 0.3s',
      }}
    >
      <span style={{
        fontFamily: 'Great Vibes, cursive',
        fontSize: '1.6rem',
        color: gold,
        lineHeight: 1,
        userSelect: 'none',
      }}>
        Super Secret Supper
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          href="/login"
          className="footer-link"
          style={{ color: 'rgba(248,244,240,0.7)', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500 }}
          aria-label="Log in to your account"
        >
          Log In
        </Link>
        <NavSignUpButton />
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="hero" aria-labelledby="hero-heading" style={{ ...section, paddingTop: '100px', paddingBottom: '100px', textAlign: 'center' }}>
      <div style={{ ...col, maxWidth: '520px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(251,230,166,0.6)', marginBottom: '24px', marginTop: 0 }} aria-hidden="true">
          ✦&nbsp; Dinner &nbsp;·&nbsp; Friendship &nbsp;·&nbsp; Discovery &nbsp;·&nbsp; ✦
        </p>
        <h1
          id="hero-heading"
          style={{ fontFamily: 'Great Vibes, cursive', fontSize: 'clamp(3rem, 9vw, 5rem)', color: gold, lineHeight: 1.1, marginTop: 0, marginBottom: '28px' }}
        >
          One dinner. One friend. Every month.
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', color: offwhite, lineHeight: 1.75, maxWidth: '460px', margin: '0 auto 40px', opacity: 0.9 }}>
          Super Secret Supper pairs you with a different member of your friend group each month for a private one-on-one dinner. No awkward group scheduling. Just you, one friend, and a real conversation.
        </p>
        <CtaButton href="/signup">Create an Account →</CtaButton>
        <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }} aria-hidden="true">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ width: 130, height: 130, stroke: gold, fill: 'none', strokeWidth: 1.5, opacity: 0.2 }}>
            <circle cx="20" cy="32" r="12" />
            <circle cx="44" cy="32" r="12" />
            <path d="M32 18 L32 46" />
            <path d="M16 32 L48 32" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ───────────────────────────────────────────────────────────
const steps = [
  {
    num: '01',
    heading: 'Create or join a circle',
    desc: 'Start a circle with your friend group, or join one with an invite link. Roommates, teammates, college crew, work friends — any group you want to actually know better.',
  },
  {
    num: '02',
    heading: 'Share your availability',
    desc: "Each month, tell us when you're free. We handle the coordination so nobody's stuck in a ten-person thread trying to find a time that works.",
  },
  {
    num: '03',
    heading: 'Meet your match (secretly)',
    desc: "We pair you with a different circle member each round. The pairing stays secret until you both confirm — then it's just dinner.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" style={{ ...section, backgroundColor: 'rgba(255,255,255,0.025)' }}>
      <div style={col}>
        <h2 id="how-heading" style={{ fontFamily: 'Great Vibes, cursive', fontSize: 'clamp(2rem, 6vw, 2.8rem)', color: gold, textAlign: 'center', marginTop: 0, marginBottom: '48px', fontWeight: 400 }}>
          How it works
        </h2>
        {steps.map((step) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', border: `2px solid ${gold}`, borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'Great Vibes, cursive', fontSize: '2rem', color: gold, opacity: 0.45, flexShrink: 0, lineHeight: 1, minWidth: '40px' }}>
              {step.num}
            </span>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: offwhite, margin: '0 0 6px' }}>
                {step.heading}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(248,244,240,0.75)', lineHeight: 1.65, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Why It Matters ─────────────────────────────────────────────────────────
function WhyItMattersSection() {
  return (
    <section id="why-it-matters" aria-labelledby="why-heading" style={{ ...section, textAlign: 'center' }}>
      <div style={col}>
        <h2 id="why-heading" style={{ fontFamily: 'Great Vibes, cursive', fontSize: 'clamp(2rem, 6vw, 2.8rem)', color: gold, marginTop: 0, marginBottom: '32px', fontWeight: 400 }}>
          Friendship takes intention.
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', lineHeight: 1.8, color: offwhite, margin: '0 0 20px' }}>
          Most of us have a friend group — but how many people in that group do you actually know well? Group dinners are loud. Group chats are noise. Real connection happens one-on-one, but nobody ever makes it happen.
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', lineHeight: 1.8, color: 'rgba(248,244,240,0.8)', margin: '0 0 40px' }}>
          Super Secret Supper is the nudge your friendships need. One dinner. One friend. Every month. Over time, you&apos;ll actually know everyone in the circle — not just their face, but their story.
        </p>
        <blockquote style={{ border: `2px solid ${gold}`, borderRadius: '12px', padding: '28px', margin: 0 }}>
          <p style={{ fontFamily: 'Great Vibes, cursive', fontSize: '1.65rem', color: gold, lineHeight: 1.5, margin: '0 0 12px', fontWeight: 400 }}>
            &ldquo;The magic isn&apos;t in the app. It&apos;s in what happens when two people finally sit down together.&rdquo;
          </p>
          <footer style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(251,230,166,0.6)' }}>
            — The Circles Team
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

// ─── Social Proof ───────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "I've known these people for eight years. After three months of Secret Supper dinners, I felt like I was meeting half of them for the first time.",
    attribution: '— Alex, member since beta',
  },
  {
    quote: "I kept meaning to get one-on-one time with people in my friend group. This made it actually happen without me having to awkwardly organize it.",
    attribution: '— Jamie, member since beta',
  },
];

function SocialProofSection() {
  return (
    <section id="social-proof" aria-labelledby="proof-heading" style={{ ...section, backgroundColor: 'rgba(255,255,255,0.025)', textAlign: 'center' }}>
      <div style={col}>
        <h2 id="proof-heading" style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 600, color: offwhite, marginTop: 0, marginBottom: '32px', letterSpacing: '0.01em' }}>
          Built for real friend groups
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {testimonials.map((t, i) => (
            <figure key={i} style={{ border: '1px solid rgba(251,230,166,0.3)', borderRadius: '8px', padding: '20px', margin: 0, textAlign: 'left' }}>
              <blockquote style={{ margin: '0 0 10px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(248,244,240,0.85)', margin: 0, fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(251,230,166,0.6)' }}>
                {t.attribution}
              </figcaption>
            </figure>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(248,244,240,0.5)', margin: 0 }}>
          We built this because we needed it ourselves. Super Secret Supper is a small-team project rooted in the belief that structured serendipity is one of the best things you can do for your relationships.
        </p>
      </div>
    </section>
  );
}

// ─── Final CTA ──────────────────────────────────────────────────────────────
function FinalCtaSection() {
  return (
    <section id="join" aria-labelledby="join-heading" style={{ ...section, backgroundColor: 'rgba(251,230,166,0.045)', textAlign: 'center', paddingBottom: '120px' }}>
      <div style={{ ...col, maxWidth: '440px' }}>
        <h2 id="join-heading" style={{ fontFamily: 'Great Vibes, cursive', fontSize: 'clamp(2rem, 6vw, 2.8rem)', color: gold, marginTop: 0, marginBottom: '20px', fontWeight: 400, lineHeight: 1.2 }}>
          Ready to actually know your people?
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(248,244,240,0.8)', margin: '0 0 36px', lineHeight: 1.7 }}>
          Create your account and start your first circle today.
        </p>
        <CtaButton href="/signup">Create Your Account →</CtaButton>
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/home');
      else setChecking(false);
    });
  }, [router]);

  if (checking) return <PageLoading message="Loading..." />;

  return (
    <div style={{ backgroundColor: purple, minHeight: '100vh' }}>
      <NavBar />
      <main id="main-content" style={{ paddingTop: '60px' }}>
        <HeroSection />
        <HowItWorksSection />
        <WhyItMattersSection />
        <SocialProofSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
