import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ───

interface ApiKeyItem {
  id: string;
  key_prefix: string;
  name: string;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface NewKeyResult {
  key: string;
  id: string;
  name: string;
  prefix: string;
  created_at: string;
}

// ─── Icons ───

function IconEye({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconCopy({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPlus({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconKey({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconTrash({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// ─── Copy Button ───

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
      } ${className}`}
    >
      {copied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Key Row ───

function KeyRow({
  item,
  onToggle,
  onRevoke,
  toggling,
}: {
  item: ApiKeyItem;
  onToggle: (id: string) => void;
  onRevoke: (id: string) => void;
  toggling: boolean;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl glass-card glass-card-hover p-4"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              item.active ? 'bg-brand-600/20' : 'bg-white/5'
            }`}>
              <IconKey className={`w-4 h-4 ${item.active ? 'text-brand-400' : 'text-white/30'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-white">{item.name}</span>
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  item.active
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/5 text-white/40'
                }`}>
                  {item.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <code className="font-mono text-xs text-white/40">
                  {item.key_prefix}...{showKey ? '****' : ''}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <IconEyeOff className="w-3 h-3" /> : <IconEye className="w-3 h-3" />}
                </button>
                <CopyButton text={`${item.key_prefix}...`} />
              </div>
            </div>
          </div>
          <p className="mt-2 ml-[42px] text-xs text-white/30">
            Created {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {item.last_used_at
              ? ` · Last used ${new Date(item.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : ' · Never used'}
          </p>
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onToggle(item.id)}
            disabled={toggling}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
              item.active
                ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                : 'bg-brand-600/20 text-brand-400 hover:bg-brand-600/30'
            }`}
          >
            {item.active ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onRevoke(item.id)}
            disabled={toggling}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            aria-label="Revoke key"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── New Key Modal ───

function NewKeyModal({
  result,
  onClose,
}: {
  result: NewKeyResult;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl glass-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/20">
                <IconKey className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Key Created</h2>
                <p className="text-sm text-white/50">Copy this key now. You won&apos;t see it again.</p>
              </div>
            </div>
          </div>

          {/* Key display */}
          <div className="px-6 py-4">
            <div className="rounded-xl bg-black/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <code className="block select-all break-all font-mono text-sm text-brand-400">
                  {result.key}
                </code>
                <CopyButton text={result.key} />
              </div>
            </div>
            <p className="mt-3 text-xs text-white/40">
              This key has been added to your account. Use it in the <code className="rounded bg-white/5 px-1">Authorization</code> header.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Confirm Dialog ───

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mx-4 w-full max-w-sm rounded-2xl glass-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm text-white/50">{message}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? 'Revoking...' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── ApiKeys Page ───

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeys | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch('/v1/api-keys');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { keys: ApiKeyItem[] };
      setKeys(data.keys);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = (await res.json()) as NewKeyResult;
      setNewKey(result);
      setName('');
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      const res = await fetch(`/v1/api-keys/${id}/toggle`, { method: 'PATCH' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle key');
    } finally {
      setToggling(null);
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setToggling(revokeTarget.id);
    try {
      const res = await fetch(`/v1/api-keys/${revokeTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRevokeTarget(null);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke key');
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-20 animate-pulse rounded-xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl glass-card border-red-500/20 px-4 py-3 text-sm text-red-400"
        >
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline hover:text-red-300">Dismiss</button>
        </motion.div>
      )}

      {/* Create new key */}
      <div className="mb-6 rounded-xl glass-card p-4">
        <p className="mb-3 text-sm font-medium text-white/70">Create new key</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Production, Development, Testing"
            className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/50"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {creating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <IconPlus className="w-4 h-4" />
            )}
            Create
          </button>
        </div>
      </div>

      {/* Keys list */}
      {keys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-white/10 p-12 text-center"
        >
          <IconKey className="mx-auto mb-4 w-10 h-10 text-white/15" />
          <p className="text-sm font-medium text-white/60">No API keys yet</p>
          <p className="mt-1 text-xs text-white/40">Create your first key above to start making requests</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {keys.map((item, i) => (
            <KeyRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onRevoke={(id) => setRevokeTarget(item as ApiKeys)}
              toggling={toggling === item.id}
            />
          ))}
        </div>
      )}

      {/* New key modal */}
      {newKey && <NewKeyModal result={newKey} onClose={() => setNewKey(null)} />}

      {/* Revoke confirmation */}
      <ConfirmDialog
        open={!!revokeTarget}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${revokeTarget?.name}"? This action cannot be undone and the key will stop working immediately.`}
        confirmLabel="Revoke Key"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
        loading={toggling === revokeTarget?.id}
      />
    </div>
  );
}
