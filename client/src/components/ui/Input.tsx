import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input ref={ref} className={`input ${className}`} {...props} />
      {error && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{error}</span>}
    </div>
  )
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className={`select-input ${className}`} {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
