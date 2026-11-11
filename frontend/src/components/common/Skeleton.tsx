import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
}) => {
  const roundedClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'rectangular'
      ? 'rounded-none'
      : 'rounded-lg';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={style}
      className={`relative overflow-hidden bg-navy-850/70 border border-navy-750/30 animate-pulse ${roundedClass} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-navy-900/90 border border-navy-800 p-5 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height={14} />
        <Skeleton width={32} height={32} variant="circular" />
      </div>
      <Skeleton width="60%" height={28} />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton width="25%" height={12} />
        <Skeleton width="45%" height={12} />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="bg-navy-900/90 border border-navy-800 rounded-xl overflow-hidden p-4 space-y-3">
      {/* Table header */}
      <div className="flex items-center gap-4 pb-3 border-b border-navy-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="flex-1" height={16} />
        ))}
      </div>
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="flex-1" height={20} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 280 }) => {
  return (
    <div className="bg-navy-900/90 border border-navy-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="30%" height={16} />
        <Skeleton width="20%" height={14} />
      </div>
      <div
        style={{ height: `${height}px` }}
        className="w-full flex items-end gap-3 pt-6 pb-2 px-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={`${20 + ((i * 13) % 70)}%`}
          />
        ))}
      </div>
    </div>
  );
};

export const CyberRadarScan: React.FC<{ text?: string }> = ({
  text = 'Scanning flow telemetry...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Radar ping rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-cyan-500/40 animate-pulse" />
        <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-glow-cyan" />
      </div>
      <p className="text-xs font-mono text-cyan-300 tracking-wider animate-pulse uppercase">
        {text}
      </p>
    </div>
  );
};
