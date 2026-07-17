import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { resetPassword } from '../lib/auth';
import { AmbientBg, BrandLockup, Spinner } from '../components/Brand';
import { easeOut, scaleIn } from '../lib/motion';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError('Password must be at least 10 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing reset token. Open the link from your email again.');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(password, token);
      if (res.error) throw new Error(res.error.message || 'Reset failed');
      setDone(true);
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg-app)' }}>
      <AmbientBg intensity="strong" />
      <motion.div
        initial={scaleIn.initial}
        animate={scaleIn.animate}
        transition={{ duration: 0.4, ease: easeOut }}
        className="relative z-10 w-full max-w-sm surface-elevated surface-glow p-8"
      >
        <div className="mb-6 text-center">
          <div className="mb-5 flex justify-center">
            <BrandLockup variant="product" showOrgSubline markClassName="w-6 h-6" to="/" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {done ? 'Password updated' : 'Choose a new password'}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {done ? 'Redirecting you to sign in…' : 'Use at least 10 characters.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        {!done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                New password
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Confirm password
              </label>
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={10}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <Spinner /> : 'Update password'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs link" style={{ color: 'var(--color-text-disabled)' }}>
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
