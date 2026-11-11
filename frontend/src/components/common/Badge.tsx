import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'normal' | 'attack' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  pulse = false,
}) => {
  const styles = {
    normal: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    attack: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    neutral: 'bg-navy-800 text-slate-300 border-navy-700',
  }[variant];

  const dotStyles = {
    normal: 'bg-emerald-400',
    attack: 'bg-rose-500',
    warning: 'bg-amber-400',
    info: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${styles} ${sizeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </span>
  );
};
