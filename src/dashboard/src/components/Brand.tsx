import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { easeOut, fadeUp, staggerContainer, staggerItem, viewportOnce } from '../lib/motion';

export function LogoMark({
  className = 'w-5 h-5',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

/** Soft grid + teal orbs — used on landing, auth, dashboard shells */
export function AmbientBg({ intensity = 'default' }: { intensity?: 'default' | 'subtle' | 'strong' }) {
  const opacity = intensity === 'strong' ? 0.55 : intensity === 'subtle' ? 0.28 : 0.4;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
      <div className="absolute inset-0 bg-grid" style={{ opacity: intensity === 'subtle' ? 0.22 : 0.32 }} />
      <div className="ambient-orb ambient-orb-a" style={{ opacity }} />
      <div className="ambient-orb ambient-orb-b" style={{ opacity: opacity * 0.85 }} />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-eyebrow mb-3" style={{ color: 'var(--color-accent-base)' }}>
      {children}
    </p>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      initial={reduce ? false : fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div>
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}

/** Scroll-triggered fade-up (landing sections, docs blocks) */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerContainer} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 ${className}`}
      style={{
        borderColor: 'var(--color-text-tertiary)',
        borderTopColor: 'var(--color-accent-base)',
      }}
      aria-hidden
    />
  );
}

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-3"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-tertiary)' }}
    >
      <AmbientBg intensity="subtle" />
      <Spinner className="h-6 w-6 relative z-10" />
      <p className="relative z-10 text-sm">{label}</p>
    </div>
  );
}
