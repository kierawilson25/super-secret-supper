'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer, PageHeader, Button, Footer, PageLoading } from '@/components';
import { useAvailability, usePairedMemberAvailability } from '@/hooks';
import { availabilityConfirmationContent as c } from '@/content/availabilityConfirmation';
import { availabilityContent } from '@/content/availability';
import type { PairedPartner } from '@/hooks/usePairedMemberAvailability';

const { days, months } = availabilityContent.calendar;

const cardStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

function formatDateLabel(dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00`);
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function SlotChip({ label }: { label: string }) {
  return (
    <span
      style={{
        backgroundColor: 'rgba(251,230,166,0.15)',
        color: '#FBE6A6',
        border: '1px solid rgba(251,230,166,0.4)',
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '12px',
      }}
    >
      {label}
    </span>
  );
}

function AvailabilityDateList({ availability }: { availability: Record<string, string[] | Set<string>> }) {
  const sortedDates = Object.keys(availability).sort();
  if (sortedDates.length === 0) {
    return <p style={{ color: '#F8F4F0', fontSize: '14px' }}>{c.noAvailability}</p>;
  }
  return (
    <>
      {sortedDates.map(dateKey => {
        const slots = Array.from(availability[dateKey]);
        return (
          <div key={dateKey} style={{ marginBottom: '10px' }}>
            <p style={{ color: '#F8F4F0', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              {formatDateLabel(dateKey)}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {slots.map(slot => <SlotChip key={slot} label={c.timeLabel(slot)} />)}
            </div>
          </div>
        );
      })}
    </>
  );
}

function PartnerCard({ partner }: { partner: PairedPartner }) {
  return (
    <div style={cardStyle}>
      <p style={{ color: '#FBE6A6', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>
        {c.partnerSection.title(partner.username)}
      </p>
      {Object.keys(partner.availability).length === 0 ? (
        <p style={{ color: '#F8F4F0', fontSize: '14px' }}>{c.partnerSection.noSlots}</p>
      ) : (
        <AvailabilityDateList availability={partner.availability} />
      )}
    </div>
  );
}

export default function AvailabilityConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const { availability, loading: availLoading } = useAvailability(groupId);
  const { partners, hasPairing, loading: pairingLoading, error } = usePairedMemberAvailability(groupId);

  if (availLoading || pairingLoading) return <PageLoading message="Loading your availability..." />;

  return (
    <PageContainer>
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '48px 16px 150px 16px',
          boxSizing: 'border-box',
        }}
      >
        <PageHeader>{c.title}</PageHeader>
        <p style={{ color: '#F8F4F0', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>
          {c.subtitle}
        </p>

        {/* ── Your submitted availability ─────────────────────────────────── */}
        <div style={cardStyle}>
          <p style={{ color: '#FBE6A6', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>
            {c.yourSection.title}
          </p>
          <AvailabilityDateList availability={availability} />
        </div>

        {/* ── Paired partner availability (or waiting state) ──────────────── */}
        {error ? (
          <div style={{ ...cardStyle, borderColor: '#f87171' }}>
            <p style={{ color: '#f87171', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
              {c.errorState.title}
            </p>
            <p style={{ color: '#F8F4F0', fontSize: '14px' }}>{c.errorState.description}</p>
          </div>
        ) : hasPairing ? (
          partners.map(partner => <PartnerCard key={partner.userId} partner={partner} />)
        ) : (
          <div style={cardStyle}>
            <p style={{ color: '#FBE6A6', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
              {c.waitingState.title}
            </p>
            <p style={{ color: '#F8F4F0', fontSize: '14px' }}>{c.waitingState.description}</p>
          </div>
        )}

        <Button onClick={() => router.push(`/groups/${groupId}`)}>
          {c.buttons.returnToGroup}
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/groups/${groupId}/availability`)}>
          {c.buttons.edit}
        </Button>
      </div>
      <Footer />
    </PageContainer>
  );
}
