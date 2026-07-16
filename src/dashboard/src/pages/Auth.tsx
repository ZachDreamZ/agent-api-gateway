import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { signIn, signUp } from '../lib/auth';
import { AmbientBg, LogoMark, Spinner } from '../components/Brand';
import { easeOut, scaleIn } from '../lib/motion';

type Mode = 'signin' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || 'Sign in failed');
      } else {
        const res = await signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message || 'Sign up failed');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg-app)' }}>
      <AmbientBg intensity="strong" />

      <motion.div
        key={mode}
        initial={scaleIn.initial}
        animate={scaleIn.animate}
        transition={{ duration: 0.4, ease: easeOut }}
        className="relative z-10 w-full max-w-sm surface-elevated surface-glow p-8"
      >
        <div className="mb-6 text-center">
          <Link to="/" className="mb-5 inline-flex items-center gap-2">
            <LogoMark className="w-6 h-6" style={{ color: 'var(--color-accent-base)' }} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Agent API
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {mode === 'signin' ? 'Sign in to manage keys and usage' : 'Free tier — no card required'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key={error}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-md px-3 py-2 text-sm"
              style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                  className="input"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={10}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="input"
            />
            {mode === 'signup' && (
              <p className="mt-1.5 text-[11px]" style={{ color: 'var(--color-text-disabled)' }}>
                At least 10 characters
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <Spinner /> : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="font-medium link-accent"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs link" style={{ color: 'var(--color-text-disabled)' }}>
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
