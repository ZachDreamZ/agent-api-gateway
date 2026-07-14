import { useState, useEffect, useCallback } from 'react';

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
  return (
    <div className="flex items-center justify-between rounded-lg glass-card glass-card-hover px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              item.active ? 'bg-green-500' : 'bg-white/30'
            }`}
          />
          <span className="font-medium text-sm text-white">{item.name}</span>
          <code className="ml-2 rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-white/50">
            {item.key_prefix}...
          </code>
        </div>
        <p className="mt-1 text-xs text-white/40">
          Created {new Date(item.created_at).toLocaleDateString()}
          {item.last_used_at
            ? ` · Last used ${new Date(item.last_used_at).toLocaleDateString()}`
            : ' · Never used'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(item.id)}
          disabled={toggling}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
            item.active
              ? 'bg-white/10 text-white/60 hover:bg-white/15'
              : 'bg-brand-600/20 text-brand-400 hover:bg-brand-600/30'
          }`}
        >
          {item.active ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => onRevoke(item.id)}
          disabled={toggling}
          className="rounded bg-red-900/20 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/30 disabled:opacity-50"
        >
          Revoke
        </button>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-xl glass-card p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-bold text-white">Key Created</h2>
        <p className="mb-4 text-sm text-white/50">
          Copy this key now. You won&apos;t be able to see it again.
        </p>

        <div className="mb-4 rounded-lg bg-black/40 p-3">
          <code className="block select-all break-all font-mono text-sm text-brand-400">
            {result.key}
          </code>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(result.key).catch(() => {});
            onClose();
          }}
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          Copy & Close
        </button>
      </div>
    </div>
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

  async function handleRevoke(id: string) {
    if (!window.confirm('Revoke this key? It will stop working immediately.')) return;
    setToggling(id);
    try {
      const res = await fetch(`/v1/api-keys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
          <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg glass-card border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Key name (e.g. Production)"
          className="flex-1 rounded-lg glass-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-white/20 text-white"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {creating ? 'Creating...' : 'Create Key'}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
          No API keys yet. Create one above.
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((item) => (
            <KeyRow
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onRevoke={handleRevoke}
              toggling={toggling === item.id}
            />
          ))}
        </div>
      )}

      {newKey && <NewKeyModal result={newKey} onClose={() => setNewKey(null)} />}
    </div>
  );
}
