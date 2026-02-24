'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContainer, PageHeader, Button, Footer, PageLoading } from '@/components';
import { useAvailability } from '@/hooks';
import { availabilityContent } from '@/content/availability';

const { days, months } = availabilityContent.calendar;
const TIME_SLOTS = availabilityContent.timeSlots.options;

function getNext30Days(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// Use local date parts to avoid UTC offset shifting the day
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function organizeDatesIntoWeeks(dates: Date[]): (Date | null)[][] {
  const weeks: (Date | null)[][] = [];
  const firstDayOfWeek = dates[0].getDay();
  let currentWeek: (Date | null)[] = Array(firstDayOfWeek).fill(null);

  for (const date of dates) {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  while (currentWeek.length > 0 && currentWeek.length < 7) currentWeek.push(null);
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
}

export default function AvailabilityPage() {
  const params = useParams();
  const groupId = params?.id as string;
  const router = useRouter();

  const { availability, loading, saving, saveAvailability } = useAvailability(groupId);

  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const dates = getNext30Days();
  const weeks = organizeDatesIntoWeeks(dates);

  // Seed local state once availability loads
  useEffect(() => {
    if (!loading) {
      const copy: Record<string, Set<string>> = {};
      for (const [date, slots] of Object.entries(availability)) {
        copy[date] = new Set(slots);
      }
      setSelected(copy);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDate = (date: Date) => {
    const key = formatDateKey(date);
    setSelected(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = new Set(['dinner']); // default to dinner
      }
      return next;
    });
  };

  const toggleTimeSlot = (dateKey: string, slot: string) => {
    setSelected(prev => {
      const next = { ...prev };
      const slots = new Set(next[dateKey] ?? []);
      if (slots.has(slot)) {
        slots.delete(slot);
        if (slots.size === 0) {
          delete next[dateKey];
          return next;
        }
      } else {
        slots.add(slot);
      }
      next[dateKey] = slots;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaveError(null);
      await saveAvailability(selected as Parameters<typeof saveAvailability>[0]);
      router.push(`/groups/${groupId}/availability/confirmation`);
    } catch {
      setSaveError(availabilityContent.messages.saveError);
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const selectedDates = Object.keys(selected).sort();

  const sectionCard: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'transparent',
    border: '2px solid #FBE6A6',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FBE6A6',
    marginBottom: '12px',
  };

  const sectionText: React.CSSProperties = {
    color: '#F8F4F0',
    fontSize: '14px',
    marginBottom: '16px',
  };

  if (loading) return <PageLoading message="Loading availability..." />;

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
        <PageHeader>{availabilityContent.title}</PageHeader>

        <p style={{ color: '#F8F4F0', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
          {availabilityContent.subtitle}
        </p>

        {saveError && (
          <div style={{ ...sectionCard, borderColor: '#f87171', padding: '12px 16px' }}>
            <p style={{ color: '#f87171', fontSize: '14px', textAlign: 'center', margin: 0 }}>
              {saveError}
            </p>
          </div>
        )}

        {/* ── Calendar ───────────────────────────────────────────────────────── */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>{availabilityContent.calendar.title}</h2>
          <p style={sectionText}>{availabilityContent.calendar.description}</p>

          {/* Day-of-week header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '4px',
            }}
          >
            {days.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  color: '#FBE6A6',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 0',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginBottom: '4px',
              }}
            >
              {week.map((date, di) => {
                if (!date) return <div key={di} />;
                const key = formatDateKey(date);
                const isSelected = !!selected[key];
                return (
                  <button
                    key={di}
                    onClick={() => toggleDate(date)}
                    style={{
                      backgroundColor: isSelected ? '#FBE6A6' : 'transparent',
                      color: isSelected ? '#460C58' : '#F8F4F0',
                      border: `1px solid ${isSelected ? '#FBE6A6' : 'rgba(251,230,166,0.25)'}`,
                      borderRadius: '6px',
                      padding: '6px 2px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 400,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '9px', opacity: 0.65 }}>{months[date.getMonth()]}</span>
                    <span>{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Time slot preferences ───────────────────────────────────────────── */}
        {selectedDates.length > 0 && (
          <div style={sectionCard}>
            <h2 style={sectionTitle}>{availabilityContent.timeSlots.title}</h2>
            <p style={sectionText}>{availabilityContent.timeSlots.description}</p>

            {selectedDates.map(dateKey => {
              const d = new Date(`${dateKey}T00:00:00`);
              const label = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
              return (
                <div key={dateKey} style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#FBE6A6', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    {label}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TIME_SLOTS.map(slot => {
                      const isChecked = selected[dateKey]?.has(slot.value);
                      return (
                        <button
                          key={slot.value}
                          onClick={() => toggleTimeSlot(dateKey, slot.value)}
                          style={{
                            backgroundColor: isChecked ? '#FBE6A6' : 'transparent',
                            color: isChecked ? '#460C58' : '#F8F4F0',
                            border: `1px solid ${isChecked ? '#FBE6A6' : 'rgba(251,230,166,0.4)'}`,
                            borderRadius: '20px',
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: isChecked ? 600 : 400,
                            transition: 'all 0.15s',
                          }}
                        >
                          {slot.label}{' '}
                          <span style={{ opacity: 0.65, fontSize: '11px' }}>{slot.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? availabilityContent.buttons.saving : availabilityContent.buttons.save}
        </Button>
      </div>
      <Footer />
    </PageContainer>
  );
}
