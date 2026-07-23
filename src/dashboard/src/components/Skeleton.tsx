import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? ${width}px : width;
  if (height) style.height = typeof height === 'number' ? ${height}px : height;

  return (
    <div
      className={${baseClasses}   }
      style={style}
      aria-hidden="true"
    />
  );
};

// Pre-built skeleton layouts
export const SkeletonCard: React.FC = () => (
  <div className="surface p-6 space-y-4">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="space-y-2">
      <Skeleton width="60%" />
      <Skeleton width="80%" />
      <Skeleton width="40%" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      <Skeleton width="25%" height={32} />
      <Skeleton width="25%" height={32} />
      <Skeleton width="25%" height={32} />
      <Skeleton width="25%" height={32} />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton width="25%" height={24} />
        <Skeleton width="25%" height={24} />
        <Skeleton width="25%" height={24} />
        <Skeleton width="25%" height={24} />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="surface p-6">
      <Skeleton width="30%" height={28} className="mb-4" />
      <Skeleton variant="rounded" height={300} />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="surface p-4 flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
    ))}
  </div>
);
