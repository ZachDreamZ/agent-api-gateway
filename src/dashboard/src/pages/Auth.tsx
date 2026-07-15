import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { signIn, signUp } from '../lib/auth';

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
    <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl glass-card p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {mode === 'signin' ? 'Sign in to manage your API keys' : 'Start building with the Agent API'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50"
          >
            {loading ? (
              <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : mode === 'signin' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="font-medium text-brand-400 hover:text-brand-300"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-white/30 hover:text-white/50">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
