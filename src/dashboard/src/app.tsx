import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Landing from './pages/AuraLanding';
import Docs from './pages/Docs';

// ─── SVG Logo Mark ───

function LogoMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

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
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-white/10 bg-[#0c0c0c]">
      <Link to="/" className="flex items-center gap-2 px-5 pt-5 pb-4 text-white/50 hover:text-white transition-colors">
        <LogoMark className="w-5 h-5" />
        <span className="text-sm font-semibold tracking-tight">AgentAPI</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <Link to="/docs" className="block text-xs text-white/40 hover:text-white/70 transition-colors">
          📖 API Docs
        </Link>
        <p className="mt-1 text-xs text-white/20">Agent API Gateway v0.1</p>
      </div>
    </aside>
  );
}

// ─── User Bar ───

function UserBar({ user }: { user: UserInfo | null }) {
  if (!user) return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg glass-card px-4 py-2.5 text-sm">
      <span className="text-white/50">Plan:</span>
      <span className="rounded bg-brand-600/20 px-2 py-0.5 text-xs font-medium text-brand-400 uppercase">
        {user.tier}
      </span>
      <span className="ml-auto text-white/40">
        {user.queries_per_month.toLocaleString()} queries / mo
      </span>
    </div>
  );
}

// ─── Dashboard Layout ───

function DashboardLayout() {
  const user = useUser();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0c0c0c] text-white selection:bg-brand-aura/30"
    >
      <Sidebar />
      <main className="ml-60 min-h-screen p-8">
        <UserBar user={user} />
        <Routes>
          <Route index element={<Overview />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="billing" element={<Billing />} />
        </Routes>
      </main>
    </motion.div>
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
