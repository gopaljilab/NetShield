import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.FC<{ className?: string }>;
  variant?: 'cyan' | 'green' | 'red' | 'amber' | 'purple' | 'neutral';
  badge?: {
    text: string;
    type?: 'positive' | 'negative' | 'neutral' | 'info';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  badge,
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/20',
      bg: 'bg-navy-900/90',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      valueColor: 'text-slate-100',
    },
    green: {
      border: 'border-emerald-500/20',
      bg: 'bg-navy-900/90',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      valueColor: 'text-emerald-300',
    },
    red: {
      border: 'border-rose-500/20',
      bg: 'bg-navy-900/90',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      valueColor: 'text-rose-400',
    },
    amber: {
      border: 'border-amber-500/20',
      bg: 'bg-navy-900/90',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      valueColor: 'text-amber-300',
    },
    purple: {
      border: 'border-purple-500/20',
      bg: 'bg-navy-900/90',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      valueColor: 'text-purple-300',
    },
    neutral: {
      border: 'border-navy-750',
      bg: 'bg-navy-900/90',
      iconBg: 'bg-navy-800 text-slate-300 border-navy-700',
      valueColor: 'text-slate-100',
    },
  }[variant];

  return (
    <div
      className={`rounded-xl border ${variantStyles.border} ${variantStyles.bg} p-4 sm:p-5 backdrop-blur-md transition-all hover:border-opacity-80 shadow-md hover:shadow-lg group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider line-clamp-1">
            {title}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${variantStyles.valueColor}`}>
              {value}
            </span>
            {badge && (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                  badge.type === 'positive'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                    : badge.type === 'negative'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                    : badge.type === 'info'
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    : 'bg-navy-800/80 text-slate-200 border-navy-700'
                }`}
              >
                {badge.type === 'positive' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {badge.type === 'negative' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                )}
                {badge.type === 'info' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
                <span>{badge.text}</span>
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-[11px] sm:text-xs text-slate-300 font-normal leading-relaxed line-clamp-2 min-h-[2.4rem]">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-2 sm:p-2.5 rounded-lg border ${variantStyles.iconBg} shrink-0 transition-transform group-hover:scale-105`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};
