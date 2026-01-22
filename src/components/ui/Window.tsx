import React from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Window({ title, children, className = '' }: WindowProps) {
  return (
    <div className={`window ${className}`}>
      <div className="window-title-bar">
        <span className="window-title">{title}</span>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
}