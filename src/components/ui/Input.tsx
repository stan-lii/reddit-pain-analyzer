import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'password' | 'email';
}

export default function Input({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
  type = 'text'
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`win98-input ${className}`}
    />
  );
}