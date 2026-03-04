import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const isDisabled = props.disabled;

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: variant === 'primary' ? '#FBE6A6' : '#F8F4F0',
    border: `2px solid ${variant === 'primary' ? '#FBE6A6' : '#F8F4F0'}`,
    padding: '1rem 3rem',
    fontSize: '1.2rem',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    borderRadius: '10px',
    fontWeight: 600,
    transition: 'background 0.3s, color 0.3s, transform 0.2s',
    opacity: isDisabled ? 0.5 : 1,
  };

  const containerStyle: React.CSSProperties = {
    padding: '20px 10px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBE6A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#460C58] ${className}`}
        onMouseEnter={(e) => {
          if (isDisabled) return;
          e.currentTarget.style.backgroundColor = '#cfa94a';
          e.currentTarget.style.color = '#460C58';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          if (isDisabled) return;
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = variant === 'primary' ? '#FBE6A6' : '#F8F4F0';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
