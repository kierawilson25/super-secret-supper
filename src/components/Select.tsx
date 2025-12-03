import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
}

export function Select({
  label,
  name,
  value,
  onChange,
  options,
}: SelectProps) {
  return (
    <div className="mb-6">
      <label
        className="block text-[#FBE6A6] font-inter font-600 mb-4 px-5 md:px-0"
        style={{ fontSize: '1.2rem', paddingTop: '5px', paddingLeft: '5px' }}
      >
        {label}
      </label>
      <div className="px-5 md:px-0 flex justify-center">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full md:w-2/3 px-6 bg-white text-[1.2rem] border-[3px] border-[#FBE6A6] text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-[#CFA94A] focus:border-[#CFA94A] transition-all shadow-sm appearance-none cursor-pointer"
          style={{
            height: '48px',
            borderRadius: '8px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            paddingRight: '2.5rem',
            caretColor: '#460C58',
          }}
        >
          {options.map(option => (
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
  );
}
