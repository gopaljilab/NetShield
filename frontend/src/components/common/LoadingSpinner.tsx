import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <Loader2 className={`${sizeClass} animate-spin text-cyan-400`} />
      {text && <p className="text-xs text-slate-400 font-mono">{text}</p>}
    </div>
  );
};
