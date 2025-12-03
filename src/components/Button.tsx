import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: variant === 'primary' ? '#FBE6A6' : '#F8F4F0',
    border: `2px solid ${variant === 'primary' ? '#FBE6A6' : '#F8F4F0'}`,
    padding: '1rem 3rem',
    fontSize: '1.2rem',
    cursor: 'pointer',
    borderRadius: '0',
    fontWeight: 600,
    transition: 'background 0.3s, color 0.3s, transform 0.2s',
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
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#cfa94a';
          e.currentTarget.style.color = '#F8F4F0';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
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
