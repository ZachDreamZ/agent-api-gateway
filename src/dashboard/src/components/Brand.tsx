import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { easeOut, fadeUp, staggerContainer, staggerItem, viewportOnce } from '../lib/motion';

/**
 * NexusCore mark — central hexagonal core with six orbital nodes.
 * Uses currentColor so accent/ink tokens control color.
 */
export function LogoMark({
  className = 'w-5 h-5',
  style,
  title = 'NexusCore',
}: {
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <g transform="translate(32 32)">
        <circle r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="0" y1="-8" x2="0" y2="-20" />
          <line x1="6.93" y1="-4" x2="17.32" y2="-10" />
          <line x1="6.93" y1="4" x2="17.32" y2="10" />
          <line x1="0" y1="8" x2="0" y2="20" />
          <line x1="-6.93" y1="4" x2="-17.32" y2="10" />
          <line x1="-6.93" y1="-4" x2="-17.32" y2="-10" />
        </g>
        <g fill="currentColor">
          <circle cx="0" cy="-22" r="3.2" />
          <circle cx="19.05" cy="-11" r="3.2" />
          <circle cx="19.05" cy="11" r="3.2" />
          <circle cx="0" cy="22" r="3.2" />
          <circle cx="-19.05" cy="11" r="3.2" />
          <circle cx="-19.05" cy="-11" r="3.2" />
        </g>
        <path fill="currentColor" d="M0-9 L7.8-4.5 L7.8 4.5 L0 9 L-7.8 4.5 L-7.8-4.5 Z" />
        {/* hollow core reads as depth on dark UI */}
        <circle r="2.4" fill="var(--color-bg-app, #0a0e18)" />
      </g>
    </svg>
  );
}

export type BrandLockupVariant = 'product' | 'org' | 'stacked';

/**
 * Brand lockup applied by context:
 * - product: mark + "Agent API" (+ optional NexusCore subline)
 * - org: mark + "NexusCore"
 * - stacked: mark + Agent API title + NexusCore org line
 */
export function BrandLockup({
  variant = 'product',
  to = '/',
  className = '',
  markClassName = 'w-5 h-5',
  showOrgSubline = false,
  onClick,
}: {
  variant?: BrandLockupVariant;
  to?: string;
  className?: string;
  markClassName?: string;
  /** When product variant, show a small "NexusCore" line under the product name */
  showOrgSubline?: boolean;
  onClick?: () => void;
}) {
  const primary =
    variant === 'org' ? 'NexusCore' : 'Agent API';
  const secondary =
    variant === 'stacked' || (variant === 'product' && showOrgSubline)
      ? 'NexusCore'
      : null;

  const content = (
    <>
      <LogoMark
        className={markClassName}
        style={{ color: 'var(--color-accent-base)' }}
        title="NexusCore"
      />
      <span className="flex flex-col leading-none min-w-0">
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {primary}
        </span>
        {secondary && (
          <span
            className="mt-0.5 text-[10px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {secondary}
          </span>
        )}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}
        aria-label={secondary ? `${primary} by ${secondary}` : primary}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 min-w-0 ${className}`} aria-label={primary}>
      {content}
    </span>
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
      <LogoMark className="w-8 h-8 relative z-10" style={{ color: 'var(--color-accent-base)' }} />
      <Spinner className="h-5 w-5 relative z-10" />
      <p className="relative z-10 text-sm">{label}</p>
    </div>
  );
}
