import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { signIn, signUp, signInWithGitHub } from '../lib/auth';
import { AmbientBg, LogoMark, Spinner } from '../components/Brand';
import { easeOut, scaleIn } from '../lib/motion';

type Mode = 'signin' | 'signup';

function GitHubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
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

  async function handleGitHub() {
    setGithubLoading(true);
    setError(null);
    try {
      const res = await signInWithGitHub('/dashboard');
      if (res?.error) {
        throw new Error(res.error.message || 'GitHub sign-in failed');
      }
      // Browser redirects to GitHub; if we return, something failed silently
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'GitHub sign-in is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
      );
      setGithubLoading(false);
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
            {mode === 'signin' ? 'Sign in to manage keys and usage' : 'Free tier. No card required.'}
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

        <button
          type="button"
          onClick={handleGitHub}
          disabled={githubLoading || loading}
          className="btn btn-secondary w-full mb-4"
          style={{ fontWeight: 600 }}
        >
          {githubLoading ? <Spinner /> : <GitHubIcon />}
          Continue with GitHub
        </button>

        <div className="relative mb-4 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'var(--color-border-subtle)' }} />
          <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-text-disabled)' }}>
            or email
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--color-border-subtle)' }} />
        </div>

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

          <button type="submit" disabled={loading || githubLoading} className="btn btn-primary w-full btn-shine">
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
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
