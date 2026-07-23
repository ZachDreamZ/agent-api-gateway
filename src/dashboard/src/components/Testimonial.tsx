import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  className?: string;
}

export function Testimonial({
  quote,
  author,
  role,
  company,
  avatar,
  className = '',
}: TestimonialProps) {
  return (
    <div
      className={surface-elevated p-6 rounded-lg }
      style={{ position: 'relative' }}
    >
      <div
        className="mb-4 flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          background: 'var(--color-accent-subtle)',
          color: 'var(--color-accent-base)',
        }}
      >
        <Quote className="w-4 h-4" />
      </div>
      
      <blockquote
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {quote}
      </blockquote>
      
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover"
            style={{ border: '2px solid var(--color-border-subtle)' }}
          />
        )}
        <div>
          <div
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {author}
          </div>
          {(role || company) && (
            <div
              className="text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {role}{role && company ? ' at ' : ''}{company}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TestimonialGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function TestimonialGrid({
  children,
  columns = 3,
  className = '',
}: TestimonialGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={grid gap-6  }>
      {children}
    </div>
  );
}
