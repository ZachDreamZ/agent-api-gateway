import React, { type ReactNode } from 'react';
import { Quote } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  className?: string;
}

export function Testimonial({ quote, author, role, company, avatar, className = '' }: TestimonialProps) {
  return (
    <div className="surface-elevated rounded-xl p-6 hover-lift">
      <div className="mb-4" style={{ color: 'var(--color-accent-base)' }}>
        <Quote className="w-8 h-8" />
      </div>
      <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {quote}
      </p>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
            style={{ border: '2px solid var(--color-border-default)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
            style={{
              backgroundColor: 'var(--color-accent-subtle)',
              color: 'var(--color-accent-base)',
            }}
          >
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {author}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {role}
            {company && <> · {company}</>}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestimonialGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function TestimonialGrid({ children, columns = 3, className = '' }: TestimonialGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className="grid  gap-6">
      {children}
    </div>
  );
}
