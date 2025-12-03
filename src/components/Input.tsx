import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-[#FBE6A6] font-inter font-600 mb-4 px-5 md:px-0" style={{ fontSize: '1.2rem', paddingTop: '5px', paddingLeft: '5px' }}>
          {label}
        </label>
      )}
      <div className="px-5 md:px-0 flex justify-center">
        <input
          className={`w-full md:w-2/3 text-[1.2rem] px-6 bg-white border-[3px] border-[#FBE6A6] text-gray-800 text-base placeholder-gray focus:outline-none focus:ring-2 focus:ring-[#CFA94A] focus:border-[#CFA94A] transition-all shadow-sm ${className}`}
          style={{ height: '48px', borderRadius: '8px', caretColor: '#460C58' }}
          {...props}
        />
      </div>
    </div>
  );
}
