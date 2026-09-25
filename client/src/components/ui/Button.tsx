import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size, loading, children, className = '', ...props }: ButtonProps) {
  const base = 'btn';
  const v = `btn-${variant}`;
  const s = size ? `btn-${size}` : '';
  return (
    <button className={`${base} ${v} ${s} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
      {children}
    </button>
  );
}
