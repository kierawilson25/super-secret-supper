'use client';

import { useState } from 'react';
import { PageContainer, ContentContainer, Button, Input, Footer, PageHeader } from '@/components';
import { supabase } from '@/lib/supabase';

const SUPPORT_CATEGORIES = [
  { value: 'account', label: 'Account Issue' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'pairing', label: 'Pairing / Dinner Issue' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
];

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#FBE6A6',
  fontSize: '0.9375rem',
  marginBottom: '6px',
  fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: '#F8F4F0',
  caretColor: '#FBE6A6',
  fontSize: '1rem',
  padding: '14px 16px',
  border: '3px solid #FBE6A6',
  resize: 'vertical',
  minHeight: '140px',
  fontFamily: 'Inter, sans-serif',
  lineHeight: 1.6,
  outline: 'none',
};

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: dbError } = await supabase
      .from('support_requests')
      .insert({ name, email, category, subject, message });

    if (dbError) {
      setError('Something went wrong. Please try again or email us directly.');
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <PageContainer>
        <ContentContainer>
          <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 16px 120px', textAlign: 'center' }}>
            <PageHeader>We got it!</PageHeader>
            <p style={{ color: 'rgba(248,244,240,0.85)', fontFamily: 'Inter, sans-serif', fontSize: '1rem', lineHeight: 1.75, marginBottom: '32px' }}>
              Thanks for reaching out. We&apos;ll review your request and get back to you at <strong style={{ color: '#FBE6A6' }}>{email}</strong> as soon as possible.
            </p>
            <Button onClick={() => setSubmitted(false)}>Submit another request</Button>
          </div>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 16px 120px' }}>
          <PageHeader>Support</PageHeader>
          <p style={{ color: 'rgba(248,244,240,0.85)', fontFamily: 'Inter, sans-serif', fontSize: '1rem', lineHeight: 1.75, textAlign: 'center', marginBottom: '36px' }}>
            Having trouble? Fill out the form below and we&apos;ll get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-2">
            {error && (
              <div className="border-2 border-red-400 rounded-lg p-4 text-center mb-4">
                <p className="text-sm text-red-100">{error}</p>
              </div>
            )}

            <Input
              label="Name"
              name="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div style={{ width: '100%', marginBottom: '20px' }}>
              <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                <label
                  htmlFor="category"
                  style={{
                    display: 'block',
                    color: '#FBE6A6',
                    fontSize: '0.9375rem',
                    marginBottom: '6px',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full border-[3px] border-[#FBE6A6] focus:outline-none focus:ring-2 focus:ring-[#CFA94A] focus:border-[#CFA94A] transition-all"
                  style={{
                    height: '52px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: category === '' ? 'rgba(248,244,240,0.4)' : '#F8F4F0',
                    fontSize: '1rem',
                    paddingLeft: '16px',
                    paddingRight: '2.5rem',
                    width: '100%',
                    display: 'block',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FBE6A6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" disabled style={{ backgroundColor: '#460C58', color: 'rgba(248,244,240,0.4)' }}>
                    Select a category...
                  </option>
                  {SUPPORT_CATEGORIES.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      style={{ backgroundColor: '#460C58', color: '#F8F4F0' }}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Subject"
              name="subject"
              type="text"
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div style={{ width: '100%', marginBottom: '20px' }}>
              <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                <label htmlFor="message" style={labelStyle}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={textareaStyle}
                  className="focus:ring-2 focus:ring-[#CFA94A] focus:border-[#CFA94A] transition-all"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </div>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
