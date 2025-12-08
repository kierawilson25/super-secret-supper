'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, Button, Card, Footer, PageHeader, Loading } from '@/components';
import { usePairingHistory } from '@/hooks';

export default function MonthPairingsPage() {
  const params = useParams();
  const groupId = params?.id as string;
  const monthKey = params?.month as string;
  const { pairings, loading, error } = usePairingHistory(groupId);

  // Parse month key (format: YYYY-MM)
  const [year, month] = monthKey.split('-').map(Number);
  const monthDate = new Date(year, month - 1, 1);
  const monthLabel = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  // Filter pairings for this specific month
  const monthPairings = pairings.filter(pairing => {
    if (!pairing.attendees || pairing.attendees.length === 0) return false;

    const date = new Date(pairing.dinnerDate);
    const pairingYear = date.getFullYear();
    const pairingMonth = date.getMonth() + 1;
    const pairingMonthKey = `${pairingYear}-${String(pairingMonth).padStart(2, '0')}`;
    return pairingMonthKey === monthKey;
  });

  if (loading) {
    return (
      <PageContainer>
        <div style={{ padding: '48px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <PageHeader>{monthLabel}</PageHeader>
          <Loading message="Loading pairings..." />
        </div>
        <Footer />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ padding: '48px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <PageHeader>{monthLabel}</PageHeader>
          <p style={{ color: '#f87171', textAlign: 'center' }}>Error: {error}</p>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href={`/groups/${groupId}/pairs`} style={{ textDecoration: 'none' }}>
              <Button variant="secondary">Back to All Months</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageContainer>
    );
  }

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
        <PageHeader>{monthLabel}</PageHeader>
        <p style={{ color: '#F8F4F0', fontSize: '16px', marginBottom: '24px', textAlign: 'center' }}>
          {monthPairings.length} pairing{monthPairings.length !== 1 ? 's' : ''} this month
        </p>

        {monthPairings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: '#F8F4F0', marginBottom: '24px' }}>
              No pairings found for this month.
            </p>
            <Link href={`/groups/${groupId}/pairs`} style={{ textDecoration: 'none' }}>
              <Button>Back to All Months</Button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {monthPairings.map((pairing) => {
                const date = new Date(pairing.dinnerDate);
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <Card key={pairing.dinnerID}>
                    <div>
                      <p style={{
                        color: '#F8F4F0',
                        fontSize: '12px',
                        marginBottom: '8px',
                        opacity: 0.8
                      }}>
                        {formattedDate}
                      </p>

                      <div style={{
                        marginBottom: '8px',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {pairing.attendees.map((attendee, index) => (
                          <span key={attendee.userid}>
                            <span style={{ color: '#FBE6A6', fontWeight: 'bold' }}>
                              {attendee.username}
                            </span>
                            {index < pairing.attendees.length - 1 && (
                              <span style={{ color: '#F8F4F0', margin: '0 6px' }}>•</span>
                            )}
                          </span>
                        ))}
                      </div>

                      {pairing.location && (
                        <p style={{
                          color: '#F8F4F0',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          <span style={{ flexShrink: 0 }}>📍</span>
                          <span>{pairing.location.locationName}, {pairing.location.locationCity}</span>
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href={`/groups/${groupId}/pairs`} style={{ textDecoration: 'none' }}>
                <Button variant="secondary">Back to All Months</Button>
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </PageContainer>
  );
}
