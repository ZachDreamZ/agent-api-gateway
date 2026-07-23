import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // TODO: Integrate with email service (Resend, ConvertKit, etc.)
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox for confirmation.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="surface p-8 rounded-xl" style={{ background: 'oklch(0.98 0.008 195 / 0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-base)' }}>
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Stay updated
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Get product updates and engineering insights
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'oklch(0.72 0.14 155 / 0.12)', color: 'oklch(0.72 0.14 155)' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs">{message}</p>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-3" style={{ background: 'oklch(0.65 0.18 25 / 0.12)', color: 'oklch(0.65 0.18 25)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs">{message}</p>
        </div>
      ) : null}

      {status !== 'success' && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={status === 'loading'}
            className="flex-1 px-3 py-2 text-sm rounded-lg border transition-all"
            style={{
              background: 'var(--color-bg-app)',
              border: '1px solid var(--color-border-base)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105"
            style={{
              background: 'var(--color-accent-base)',
              color: 'white',
              opacity: status === 'loading' ? 0.6 : 1,
            }}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}
