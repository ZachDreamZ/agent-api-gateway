import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react';
import {
  signIn,
  signUp,
  signInWithGitHub,
  signInWithGoogle,
  oauthErrorMessage,
  resendVerificationEmail,
  requestPasswordReset,
} from '../lib/auth';
import { AmbientBg, BrandLockup, Spinner } from '../components/Brand';
import { easeOut, scaleIn } from '../lib/motion';

type Mode = 'signin' | 'signup' | 'check-email' | 'forgot';

function GitHubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function isUnverifiedError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('verif') ||
    m.includes('email not verified') ||
    m.includes('not verified') ||
    m.includes('confirm your email')
  );
}

export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [oauthFlags, setOauthFlags] = useState({ github: true, google: false });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  function requireAgreement(): boolean {
    if (mode === 'signup' && !agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return false;
    }
    return true;
  }

  // Surface OAuth callback errors (?error=account_not_linked) on this page
  useEffect(() => {
    const code = searchParams.get('error');
    if (!code) return;
    const msg = oauthErrorMessage(code);
    if (msg) setError(msg);
    // Clear the query so refresh doesn't re-show forever
    const next = new URLSearchParams(searchParams);
    next.delete('error');
    next.delete('error_description');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Which social buttons are live on this deployment
  useEffect(() => {
    let cancelled = false;
    fetch('/health')
      .then((r) => r.json())
      .then((h: { github_oauth?: boolean; google_oauth?: boolean }) => {
        if (cancelled) return;
        setOauthFlags({
          github: h.github_oauth !== false,
          google: Boolean(h.google_oauth),
        });
      })
      .catch(() => { /* keep defaults */ });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'signup' && !requireAgreement()) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'forgot') {
        const res = await requestPasswordReset(email, `${window.location.origin}/reset-password`);
        if (res.error) throw new Error(res.error.message || 'Could not send reset email');
        setInfo('If that address has an account, a reset link is on the way.');
        return;
      }

      if (mode === 'signin') {
        const res = await signIn.email({
          email,
          password,
          callbackURL: `${window.location.origin}/dashboard`,
        });
        if (res.error) {
          const msg = res.error.message || 'Sign in failed';
          if (isUnverifiedError(msg)) {
            setMode('check-email');
            setInfo('Verify your email before signing in. We can resend the link below.');
            return;
          }
          throw new Error(msg);
        }
        navigate('/dashboard');
        return;
      }

      // signup
      const res = await signUp.email({
        email,
        password,
        name,
        callbackURL: `${window.location.origin}/dashboard`,
      });
      if (res.error) throw new Error(res.error.message || 'Sign up failed');
      // requireEmailVerification: no session until verified
      setMode('check-email');
      setInfo('Account created. Check your inbox for a verification link.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHub() {
    if (!requireAgreement()) return;
    setGithubLoading(true);
    setError(null);
    try {
      const res = await signInWithGitHub('/dashboard');
      if (res?.error) {
        throw new Error(res.error.message || 'GitHub sign-in failed');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'GitHub sign-in is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
      );
      setGithubLoading(false);
    }
  }

  async function handleGoogle() {
    if (!requireAgreement()) return;
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle('/dashboard');
      if (res?.error) {
        throw new Error(res.error.message || 'Google sign-in failed');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      );
      setGoogleLoading(false);
    }
  }

  const socialBusy = githubLoading || googleLoading || loading;
  const signupBlocked = mode === 'signup' && !agreed;

  async function handleResend() {
    if (!email.trim()) {
      setError('Enter your email above first.');
      return;
    }
    setResendLoading(true);
    setError(null);
    try {
      const res = await resendVerificationEmail(email, `${window.location.origin}/dashboard`);
      if (res.error) throw new Error(res.error.message || 'Could not resend');
      setInfo('Verification email sent. Check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend verification email');
    } finally {
      setResendLoading(false);
    }
  }

  const title =
    mode === 'signup'
      ? 'Create your account'
      : mode === 'check-email'
        ? 'Verify your email'
        : mode === 'forgot'
          ? 'Reset password'
          : 'Welcome back';

  const subtitle =
    mode === 'signup'
      ? 'Free tier. Confirm your email to activate the account.'
      : mode === 'check-email'
        ? `We sent a link to ${email || 'your email'}. Open it to finish setup.`
        : mode === 'forgot'
          ? 'We will email a one-time reset link.'
          : 'Sign in to manage keys and usage';

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg-app)' }}>
      <AmbientBg intensity="strong" />

      <motion.div
        key={mode === 'check-email' ? 'check' : mode}
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
            {title}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {subtitle}
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
          {info && !error && (
            <motion.div
              key={info}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-md px-3 py-2 text-sm"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
            >
              {info}
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'check-email' ? (
          <div className="space-y-4 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}
            >
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Click the link in the email to verify. The link expires in one hour.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="btn btn-primary w-full"
            >
              {resendLoading ? <Spinner /> : 'Resend verification email'}
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => {
                setMode('signin');
                setInfo(null);
                setError(null);
              }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {mode === 'signup' && (
              <label
                className="mb-4 flex items-start gap-2.5 rounded-md px-3 py-2.5 text-xs leading-relaxed cursor-pointer"
                style={{
                  background: 'var(--color-bg-app)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  aria-required="true"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="link-accent" target="_blank" rel="noreferrer">
                    Terms of Service
                  </Link>
                  ,{' '}
                  <Link to="/privacy" className="link-accent" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </Link>
                  , and{' '}
                  <Link to="/aup" className="link-accent" target="_blank" rel="noreferrer">
                    Acceptable Use Policy
                  </Link>
                  .
                </span>
              </label>
            )}

            {mode !== 'forgot' && (oauthFlags.github || oauthFlags.google) && (
              <>
                <div className="mb-4 space-y-2">
                  {oauthFlags.github && (
                    <button
                      type="button"
                      onClick={handleGitHub}
                      disabled={socialBusy || signupBlocked}
                      className="btn btn-secondary w-full"
                      style={{ fontWeight: 600 }}
                    >
                      {githubLoading ? <Spinner /> : <GitHubIcon />}
                      Continue with GitHub
                    </button>
                  )}
                  {oauthFlags.google && (
                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={socialBusy || signupBlocked}
                      className="btn btn-secondary w-full"
                      style={{ fontWeight: 600 }}
                    >
                      {googleLoading ? <Spinner /> : <GoogleIcon />}
                      Continue with Google
                    </button>
                  )}
                </div>

                <div className="relative mb-4 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: 'var(--color-border-subtle)' }} />
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-text-disabled)' }}>
                    or email
                  </span>
                  <div className="h-px flex-1" style={{ background: 'var(--color-border-subtle)' }} />
                </div>
              </>
            )}

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
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-disabled)" }} strokeWidth={1.75} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        required
                        autoComplete="name"
                        className="input pl-11"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-disabled)" }} strokeWidth={1.75} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="input pl-11"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        className="text-[11px] link-accent"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                          setInfo(null);
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-disabled)' }} strokeWidth={1.75} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={10}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      className="input pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 cursor-pointer"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="mt-1.5 text-[11px]" style={{ color: 'var(--color-text-disabled)' }}>
                      At least 10 characters. We will email a verification link.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={socialBusy || signupBlocked}
                className="btn btn-primary w-full btn-shine"
              >
                {loading ? (
                  <Spinner />
                ) : mode === 'signup' ? (
                  'Create account'
                ) : mode === 'forgot' ? (
                  'Send reset link'
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {mode === 'signin' && (
              <p className="mt-4 text-center text-[11px] leading-relaxed" style={{ color: 'var(--color-text-disabled)' }}>
                By signing in you confirm you accept our{' '}
                <Link to="/terms" className="link-accent">
                  Terms
                </Link>
                {' · '}
                <Link to="/privacy" className="link-accent">
                  Privacy
                </Link>
                {' · '}
                <Link to="/aup" className="link-accent">
                  AUP
                </Link>
              </p>
            )}

            <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {mode === 'forgot' ? (
                <>
                  Remembered it?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setInfo(null);
                    }}
                    className="font-medium link-accent"
                  >
                    Sign in
                  </button>
                </>
              ) : mode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setAgreed(false);
                      setError(null);
                      setInfo(null);
                    }}
                    className="font-medium link-accent"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setInfo(null);
                    }}
                    className="font-medium link-accent"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
        )}

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs link" style={{ color: 'var(--color-text-disabled)' }}>
            Back to home
          </Link>
          {' · '}
          <Link to="/terms" className="text-xs link" style={{ color: 'var(--color-text-disabled)' }}>
            Terms
          </Link>
          {' · '}
          <Link to="/privacy" className="text-xs link" style={{ color: 'var(--color-text-disabled)' }}>
            Privacy
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
