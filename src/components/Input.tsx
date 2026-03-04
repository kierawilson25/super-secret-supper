import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        {label && (
          <label style={{
            display: 'block',
            color: '#FBE6A6',
            fontSize: '0.9375rem',
            marginBottom: '6px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
          }}>
            {label}
          </label>
        )}
        <input
          className={`w-full border-[3px] border-[#FBE6A6] focus:outline-none focus:ring-2 focus:ring-[#CFA94A] focus:border-[#CFA94A] transition-all ${className}`}
          style={{
            height: '52px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#F8F4F0',
            caretColor: '#FBE6A6',
            fontSize: '1rem',
            paddingLeft: '16px',
            paddingRight: '16px',
            width: '100%',
            display: 'block',
          }}
          {...props}
        />
      </div>
    </div>
  );
}
