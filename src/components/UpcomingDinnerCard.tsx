import React from 'react';
import Link from 'next/link';
import type { UpcomingDinner } from '@/hooks/useUpcomingDinners';

interface UpcomingDinnerCardProps {
  dinner: UpcomingDinner;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

const cadenceCopy: Record<string, string> = {
  monthly: 'this month',
  biweekly: 'in the next two weeks',
  quarterly: 'this quarter',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'transparent',
  border: '2px solid #FBE6A6',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  fontWeight: 700,
  marginBottom: '4px',
};

const subTextStyle: React.CSSProperties = {
  color: '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  marginBottom: '4px',
  opacity: 0.85,
};

const statusRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  margin: '12px 0',
};

const statusItemStyle = (set: boolean): React.CSSProperties => ({
  color: set ? '#FBE6A6' : '#F8F4F0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  opacity: set ? 1 : 0.8,
});

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
};

const buttonBase: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.95rem',
  fontWeight: 600,
  border: '2px solid #FBE6A6',
  borderRadius: '0',
  backgroundColor: 'transparent',
  color: '#FBE6A6',
  cursor: 'pointer',
  minHeight: '44px',
  transition: 'background 0.2s, color 0.2s',
};

const declineButtonBase: React.CSSProperties = {
  ...buttonBase,
  border: '2px solid #F8F4F0',
  color: '#F8F4F0',
};

const disabledOverride: React.CSSProperties = {
  opacity: 0.4,
  cursor: 'not-allowed',
};

const viewLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '12px',
  color: '#FBE6A6',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem',
  fontWeight: 600,
  textDecoration: 'none',
};

const inlineErrorStyle: React.CSSProperties = {
  color: '#f87171',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.85rem',
  marginTop: '8px',
};

export function UpcomingDinnerCard({ dinner, onAccept, onDecline }: UpcomingDinnerCardProps) {
  const [accepting, setAccepting] = React.useState(false);
  const [declining, setDeclining] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const handleAccept = async () => {
    setAccepting(true);
    setActionError(null);
    try {
      await onAccept(dinner.inviteId);
    } catch {
      setActionError('Could not accept the invite. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    setActionError(null);
    try {
      await onDecline(dinner.inviteId);
    } catch {
      setActionError('Could not decline the invite. Please try again.');
    } finally {
      setDeclining(false);
    }
  };

  const isBusy = accepting || declining;
  const partnerName = dinner.partner?.username ?? 'your partner';

  if (dinner.inviteStatus === 'pending') {
    return (
      <div style={cardStyle}>
        <p style={labelStyle}>
          Dinner coming up {cadenceCopy[dinner.cadence] ?? 'soon'}
        </p>
        <p style={subTextStyle}>Group: {dinner.groupName}</p>
        <p style={subTextStyle}>Accept to confirm — your dining partner is revealed once you respond.</p>
        <div style={actionRowStyle}>
          <button
            style={isBusy ? { ...buttonBase, ...disabledOverride } : buttonBase}
            onClick={handleAccept}
            disabled={isBusy}
            aria-label="Accept this dinner invite"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
          >
            {accepting ? 'Accepting…' : 'Accept'}
          </button>
          <button
            style={isBusy ? { ...declineButtonBase, ...disabledOverride } : declineButtonBase}
            onClick={handleDecline}
            disabled={isBusy}
            aria-label="Decline this dinner invite"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F4F0]"
          >
            {declining ? 'Declining…' : 'Decline'}
          </button>
        </div>
        {actionError && (
          <p style={inlineErrorStyle} role="alert">{actionError}</p>
        )}
      </div>
    );
  }

  // Accepted state
  return (
    <div style={cardStyle}>
      <p style={labelStyle}>Dinner with {partnerName}</p>
      <p style={subTextStyle}>Group: {dinner.groupName}</p>
      <div style={statusRowStyle}>
        <span style={statusItemStyle(dinner.userHasSetAvailability)}>
          <span aria-hidden="true">{dinner.userHasSetAvailability ? '✓ ' : '○ '}</span>
          You {dinner.userHasSetAvailability ? 'have set availability' : 'have not set availability'}
        </span>
        <span style={statusItemStyle(dinner.partnerHasSetAvailability === true)}>
          <span aria-hidden="true">{dinner.partnerHasSetAvailability ? '✓ ' : '○ '}</span>
          {partnerName} {dinner.partnerHasSetAvailability ? 'has set availability' : 'has not set availability yet'}
        </span>
      </div>
      <Link
        href={`/pairings/${dinner.eventId}`}
        style={viewLinkStyle}
        aria-label={`View details for dinner with ${partnerName}`}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBE6A6]"
      >
        View Details <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
