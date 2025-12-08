'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, Button, Card, Footer, PageHeader, Loading } from '@/components';
import { usePairingHistory } from '@/hooks';

export default function PairingHistoryPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { pairings, loading, error } = usePairingHistory(groupId);

  // Filter out pairings with no attendees and group by month
  const validPairings = pairings.filter(p => p.attendees && p.attendees.length > 0);

  // Group pairings by month and create month identifiers
  const monthsMap = validPairings.reduce((acc, pairing) => {
    const date = new Date(pairing.dinnerDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        label: monthLabel,
        count: 0
      };
    }
    acc[monthKey].count++;
    return acc;
  }, {} as Record<string, { label: string; count: number }>);

  const months = Object.entries(monthsMap).sort((a, b) => b[0].localeCompare(a[0]));

  if (loading) {
    return (
      <PageContainer>
        <div style={{ padding: '48px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <PageHeader>Previous Pairs</PageHeader>
          <Loading message="Loading pairing history..." />
        </div>
        <Footer />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ padding: '48px 16px', maxWidth: '500px', margin: '0 auto' }}>
          <PageHeader>Previous Pairs</PageHeader>
          <p style={{ color: '#f87171', textAlign: 'center' }}>Error: {error}</p>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href={`/groups/${groupId}/manage`}>
              <Button variant="secondary">Back to Manage</Button>
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
        <PageHeader>Previous Pairs</PageHeader>
        <p style={{ color: '#F8F4F0', fontSize: '16px', marginBottom: '24px', textAlign: 'center' }}>
          View past dinner pairings for this group
        </p>

        {months.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: '#F8F4F0', marginBottom: '24px' }}>
              No pairings have been generated yet.
            </p>
            <Link href={`/groups/${groupId}/manage`} style={{ textDecoration: 'none' }}>
              <Button>Back to Manage</Button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {months.map(([monthKey, monthData]) => (
                <Link key={monthKey} href={`/groups/${groupId}/pairs/${monthKey}`} style={{ textDecoration: 'none' }}>
                  <Card>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h3 style={{
                        color: '#FBE6A6',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {monthData.label}
                      </h3>
                      <p style={{
                        color: '#F8F4F0',
                        fontSize: '14px'
                      }}>
                        {monthData.count} pairing{monthData.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href={`/groups/${groupId}/manage`} style={{ textDecoration: 'none' }}>
                <Button variant="secondary">Back to Manage</Button>
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </PageContainer>
  );
}
