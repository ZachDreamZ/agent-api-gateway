import { useState, useEffect, type ReactNode } from 'react';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';

// ─── Types ───

type Page = 'overview' | 'api-keys' | 'billing';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'api-keys', label: 'API Keys', icon: '🔑' },
  { id: 'billing', label: 'Billing', icon: '💳' },
];

// ─── Sidebar ───

function Sidebar({
  current,
  onNavigate,
}: {
  current: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-surface-800 bg-surface-950">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <span className="text-xl">⚡</span>
        <span className="text-sm font-semibold tracking-tight">AgentAPI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-800 px-5 py-4">
        <p className="text-xs text-surface-500">Agent API Gateway v0.1</p>
      </div>
    </aside>
  );
}

// ─── Page Shell ───

function PageShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}

// ─── User Info Bar ───

interface UserInfo {
  tier: string;
  queries_per_month: number;
}

function UserBar({ user }: { user: UserInfo | null }) {
  if (!user) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-surface-800 bg-surface-900/50 px-4 py-2.5 text-sm">
      <span className="text-surface-400">Plan:</span>
      <span className="rounded bg-brand-600/20 px-2 py-0.5 text-xs font-medium text-brand-400 uppercase">
        {user.tier}
      </span>
      <span className="ml-auto text-surface-500">
        {user.queries_per_month.toLocaleString()} queries / mo
      </span>
    </div>
  );
}

// ─── App ───

export default function App() {
  const [page, setPage] = useState<Page>('overview');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/current')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<UserInfo>;
      })
      .then(setUser)
      .catch((err: Error) => {
        console.error('Failed to load user:', err.message);
        setLoadError(null); // non-fatal — show pages anyway
      });
  }, []);

  function renderPage(): ReactNode {
    switch (page) {
      case 'api-keys':
        return (
          <PageShell title="API Keys">
            <ApiKeys />
          </PageShell>
        );
      case 'billing':
        return (
          <PageShell title="Billing">
            <Billing />
          </PageShell>
        );
      default:
        return (
          <PageShell title="Overview">
            <Overview />
          </PageShell>
        );
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <div className="rounded-lg border border-red-800 bg-red-900/20 px-6 py-4 text-red-400">
          <p className="font-medium">Failed to load dashboard</p>
          <p className="mt-1 text-sm">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded bg-red-800/30 px-3 py-1.5 text-sm hover:bg-red-800/50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <Sidebar current={page} onNavigate={setPage} />

      <main className="ml-60 min-h-screen p-8">
        <UserBar user={user} />
        {renderPage()}
      </main>
    </div>
  );
}
