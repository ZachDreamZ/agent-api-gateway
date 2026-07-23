import { Loader2 } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', variant = 'rect', width, height }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300';
  
  const variantStyles = {
    text: 'h-4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        width: width || (variant === 'circle' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '1rem' : variant === 'circle' ? '40px' : '200px'),
        background: 'linear-gradient(90deg, oklch(0.95 0.01 195) 0%, oklch(0.93 0.01 195) 50%, oklch(0.95 0.01 195) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 
        className="animate-spin" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          color: 'var(--color-accent-base)' 
        }} 
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="surface p-6 rounded-xl space-y-4">
      <Skeleton variant="rect" height="120px" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circle" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}
