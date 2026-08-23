import { motion, useReducedMotion } from 'motion/react';
import { easeOut } from '../lib/motion';

/**
 * React Bits-inspired blur reveal for short, high-value copy.
 * The words remain real text in the DOM, while motion is skipped for
 * reduced-motion users and browsers that have not loaded the animation runtime.
 */
export function BlurText({
  text,
  className = '',
  delay = 0,
  step = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const reduce = useReducedMotion();
  const value = text;
  const words = value.split(' ');

  if (reduce) return <span className={className}>{value}</span>;

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block">
          <motion.span
            className="inline-block"
            // Keep the LCP candidate painted immediately; animate blur and position only.
            initial={{ opacity: 1, filter: 'blur(8px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.42, delay: delay + index * step, ease: easeOut }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? '\u00a0' : null}
        </span>
      ))}
    </span>
  );
}
