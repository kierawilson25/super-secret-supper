import React from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
}

export function Alert({ type, message, className = '' }: AlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-900/30',
      border: 'border-red-400',
      text: 'text-red-100',
      icon: '⚠',
    },
    success: {
      bg: 'bg-green-900/30',
      border: 'border-green-400',
      text: 'text-green-100',
      icon: '✓',
    },
    info: {
      bg: 'bg-blue-900/30',
      border: 'border-blue-400',
      text: 'text-blue-100',
      icon: 'ℹ',
    },
    warning: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-400',
      text: 'text-yellow-100',
      icon: '!',
    },
  };

  const style = styles[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`${style.bg} ${style.border} ${style.text} border-2 rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      <span
        className="text-xl font-bold flex-shrink-0"
        aria-hidden="true"
      >
        {style.icon}
      </span>
      <p className="text-sm leading-relaxed flex-1">{message}</p>
    </div>
  );
}
