import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Landing from './pages/AuraLanding';
import Docs from './pages/Docs';

// ─── User Info ───

interface UserInfo {
  tier: string;
  queries_per_month: number;
}

function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  useEffect(() => {
    fetch('/v1/billing/current')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<UserInfo>;
      })
      .then(setUser)
      .catch(() => {});
  }, []);
  return user;
}

// ─── Nav Items ───

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: '📊' },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: '🔑' },
  { path: '/dashboard/billing', label: 'Billing', icon: '💳' },
];

// ─── Sidebar ───

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-surface-800 bg-surface-950">
      <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-4 hover:opacity-80">
        <span className="text-xl">⚡</span>
        <span className="text-sm font-semibold tracking-tight">AgentAPI</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-800 px-5 py-4">
        <Link to="/docs" className="block text-xs text-surface-500 hover:text-surface-300">
          📖 API Docs
        </Link>
        <p className="mt-1 text-xs text-surface-600">Agent API Gateway v0.1</p>
      </div>
    </aside>
  );
}

// ─── User Bar ───

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

// ─── Dashboard Layout ───

function DashboardLayout() {
  const user = useUser();
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <Sidebar />
      <main className="ml-60 min-h-screen p-8">
        <UserBar user={user} />
        <Routes>
          <Route index element={<Overview />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="billing" element={<Billing />} />
        </Routes>
      </main>
    </div>
  );
}

// ─── App ───

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
