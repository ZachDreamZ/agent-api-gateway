import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, BookOpen, LogIn } from 'lucide-react';
import { AmbientBg } from '../components/Brand';
import { easeOut } from '../lib/motion';

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-5 text-center overflow-hidden"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <AmbientBg intensity="subtle" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="relative z-10"
      >
        {/* Custom 404 illustration */}
        <div className="mb-8 flex justify-center">
          <svg viewBox="0 0 200 120" className="w-48 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Signal teal circle */}
            <circle cx="100" cy="55" r="40" stroke="oklch(0.74 0.12 195 / 0.2)" strokeWidth="2" />
            <circle cx="100" cy="55" r="28" stroke="oklch(0.74 0.12 195 / 0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Central data node */}
            <rect x="88" y="43" width="24" height="24" rx="4" fill="oklch(0.74 0.12 195 / 0.15)" stroke="oklch(0.74 0.12 195)" strokeWidth="1.5" />
            <path d="M96 55 L104 55" stroke="oklch(0.74 0.12 195)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M100 51 L100 59" stroke="oklch(0.74 0.12 195)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Orbital dots */}
            <circle cx="100" cy="15" r="3" fill="oklch(0.74 0.12 195 / 0.6)" />
            <circle cx="143" cy="38" r="2.5" fill="oklch(0.74 0.12 195 / 0.4)" />
            <circle cx="135" cy="82" r="2" fill="oklch(0.74 0.12 195 / 0.3)" />
            <circle cx="57" cy="38" r="2.5" fill="oklch(0.74 0.12 195 / 0.4)" />
            <circle cx="65" cy="82" r="2" fill="oklch(0.74 0.12 195 / 0.3)" />
            {/* Question mark */}
            <text x="100" y="107" textAnchor="middle" fill="oklch(0.74 0.12 195 / 0.5)" fontSize="16" fontFamily="DM Sans, system-ui, sans-serif" fontWeight="700">404</text>
            {/* Connection lines to dots */}
            <line x1="100" y1="18" x2="100" y2="42" stroke="oklch(0.74 0.12 195 / 0.15)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="143" y1="38" x2="112" y2="50" stroke="oklch(0.74 0.12 195 / 0.1)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="135" y1="82" x2="108" y2="65" stroke="oklch(0.74 0.12 195 / 0.1)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="57" y1="38" x2="88" y2="50" stroke="oklch(0.74 0.12 195 / 0.1)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="65" y1="82" x2="92" y2="65" stroke="oklch(0.74 0.12 195 / 0.1)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        <h1 className="text-display-sm mb-2">Page not found</h1>
        <p className="text-body max-w-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/" className="btn btn-primary text-sm">
            <Home className="w-3.5 h-3.5" />
            Go home
          </Link>
          <Link to="/docs" className="btn btn-secondary text-sm">
            <BookOpen className="w-3.5 h-3.5" />
            API docs
          </Link>
          <Link to="/login" className="btn btn-secondary text-sm">
            <LogIn className="w-3.5 h-3.5" />
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
