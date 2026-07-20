import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { apiKey } from '../lib/auth';
import { PageHeader, Spinner, Stagger, StaggerItem } from '../components/Brand';
import { easeOut, scaleIn } from '../lib/motion';

// ─── Types (Better Auth apiKey shape) ───

interface ApiKeyItem {
  id: string;
  name: string | null;
  prefix: string | null;
  start: string | null;
  enabled: boolean;
  createdAt: string;
  lastRequest: string | null;
}

interface NewKeyResult {
  key: string;
  id: string;
  name: string | null;
  prefix: string | null;
  createdAt: string;
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'Never used';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      className={`btn ${copied ? 'btn-primary' : 'btn-ghost'}`}
      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', gap: '0.25rem' }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
  const displayStart = item.start || item.prefix || 'sk';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className="surface surface-hover surface-glow p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: item.enabled ? 'var(--color-accent-subtle)' : 'var(--color-bg-hover)' }}
            >
              <KeyRound className="w-4 h-4" style={{ color: item.enabled ? 'var(--color-accent-base)' : 'var(--color-text-disabled)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{item.name || 'Untitled key'}</span>
                <span className={item.enabled ? 'badge badge-active shrink-0' : 'badge badge-inactive shrink-0'}>
                  {item.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                <code className="text-xs truncate max-w-[160px] sm:max-w-none" style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family-mono)' }}>
                  {displayStart}...{showKey ? '****' : ''}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="interactive shrink-0"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <CopyButton text={`${displayStart}...`} />
              </div>
            </div>
          </div>
          <p className="mt-2 ml-[42px] text-xs" style={{ color: 'var(--color-text-disabled)' }}>
            Created {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {` · Last used ${relativeTime(item.lastRequest)}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:self-center">
          <button
            onClick={() => onToggle(item.id)}
            disabled={toggling}
            className={item.enabled ? 'btn btn-secondary' : 'btn btn-primary'}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
          >
            {item.enabled ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onRevoke(item.id)}
            disabled={toggling}
            className="btn btn-ghost shrink-0"
            style={{ color: 'var(--color-error)', fontSize: '0.75rem', padding: '0.375rem' }}
            aria-label="Revoke key"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
        className="dialog-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={scaleIn.initial}
          animate={scaleIn.animate}
          exit={scaleIn.exit}
          transition={{ duration: 0.22, ease: easeOut }}
          className="dialog-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'var(--color-accent-subtle)' }}
              >
                <KeyRound className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Key Created</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Copy this key now. You won&apos;t see it again.</p>
              </div>
            </div>
          </div>

          {/* Key display */}
          <div className="px-6 py-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-app)' }}>
              <div className="flex items-center justify-between gap-3">
                <code
                  className="block select-all break-all font-mono text-sm"
                  style={{ color: 'var(--color-accent-base)', fontFamily: 'var(--font-family-mono)' }}
                >
                  {result.key}
                </code>
                <CopyButton text={result.key} />
              </div>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              This key has been added to your account. Use it in the <code className="code-inline">Authorization</code> header.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
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
        className="dialog-backdrop"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="dialog-panel p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{message}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-danger flex-1"
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
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyItem | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const res = await apiKey.list();
      setKeys((res.data?.apiKeys as ApiKeyItem[]) ?? []);
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
      const res = await apiKey.create({ name: name.trim() });
      if (!res.data) throw new Error('No key returned');
      setNewKey({
        key: res.data.key as string,
        id: res.data.id,
        name: res.data.name,
        prefix: res.data.prefix,
        createdAt: res.data.createdAt ?? new Date().toISOString(),
      });
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
      await apiKey.update({ keyId: id, enabled: !keys.find((k) => k.id === id)?.enabled });
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
      await apiKey.delete({ keyId: revokeTarget.id });
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
          <div key={i} className="surface skeleton" style={{ height: '5rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Credentials"
        title="API keys"
        description="Create bearer keys for agents and services. Full secret is shown only once."
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-md px-4 py-3 text-sm"
          style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}
        >
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 underline hover:opacity-80">
            Dismiss
          </button>
        </motion.div>
      )}

      <div className="surface surface-glow p-4 mb-6">
        <p className="mb-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Create new key
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Production, Development, Testing"
            className="input"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="btn btn-primary shrink-0"
          >
            {creating ? <Spinner /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </div>
      </div>

      {keys.length === 0 ? (
        <div
          className="rounded-lg p-12 text-center"
          style={{ border: '1px dashed var(--color-border-default)' }}
        >
          <KeyRound className="mx-auto mb-4 w-10 h-10" style={{ color: 'var(--color-text-disabled)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No API keys yet</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Create your first key above to start making requests
          </p>
        </div>
      ) : (
        <Stagger className="space-y-2">
          {keys.map((item) => (
            <StaggerItem key={item.id}>
              <KeyRow
                item={item}
                onToggle={handleToggle}
                onRevoke={(id) => setRevokeTarget(keys.find((k) => k.id === id) ?? null)}
                toggling={toggling === item.id}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* New key modal */}
      {newKey && <NewKeyModal result={newKey} onClose={() => setNewKey(null)} />}

      {/* Revoke confirmation */}
      <ConfirmDialog
        open={!!revokeTarget}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${revokeTarget?.name || 'this key'}"? This action cannot be undone and the key will stop working immediately.`}
        confirmLabel="Revoke Key"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
        loading={toggling === revokeTarget?.id}
      />
    </div>
  );
}
