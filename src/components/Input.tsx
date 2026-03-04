import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-[#FBE6A6]" style={{ fontSize: '0.9375rem', paddingTop: '5px', paddingLeft: '2px', marginBottom: '6px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
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
          maxWidth: '400px',
          display: 'block',
          margin: '0 auto',
        }}
        {...props}
      />
    </div>
  );
}
