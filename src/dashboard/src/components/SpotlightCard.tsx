import { type PointerEvent, type ReactNode, useState } from 'react';
import { useReducedMotion } from 'motion/react';

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * React Bits-inspired pointer spotlight for static content cards.
 * The glow is purely decorative, never changes layout, and is disabled for
 * reduced-motion users so the card remains calm and fully keyboard-safe.
 */
export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const reduce = useReducedMotion();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, visible: false });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
      visible: true,
    });
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => !reduce && setSpotlight((current) => ({ ...current, visible: true }))}
      onPointerLeave={() => !reduce && setSpotlight((current) => ({ ...current, visible: false }))}
    >
      {!reduce && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: spotlight.visible ? 1 : 0,
            background: `radial-gradient(260px circle at ${spotlight.x}% ${spotlight.y}%, color-mix(in oklab, var(--color-accent-base) 16%, transparent), transparent 68%)`,
          }}
        />
      )}
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
