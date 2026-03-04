import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-[#FBE6A6] px-5 md:px-0" style={{ fontSize: '1.2rem', paddingTop: '5px', paddingLeft: '5px', fontWeight: 600 }}>
          {label}
        </label>
      )}
      <div className="px-5 md:px-0 flex justify-center">
        <input
          className={`w-full md:w-2/3 text-[1.2rem] px-6 border-[3px] border-[#FBE6A6] focus:outline-none focus:ring-2 focus:ring-[#CFA94A] focus:border-[#CFA94A] transition-all ${className}`}
          style={{ height: '48px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#F8F4F0', caretColor: '#FBE6A6' }}
          {...props}
        />
      </div>
    </div>
  );
}
