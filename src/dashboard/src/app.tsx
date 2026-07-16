import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Grid3x3,
  KeyRound,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  LogOut,
  FileText,
} from 'lucide-react';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Landing from './pages/AuraLanding';
import Docs from './pages/Docs';
import Auth from './pages/Auth';
import { useSession, signOut } from './lib/auth';

// ─── Logo Mark ───

function LogoMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// ─── Route protection ───

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-app)] text-[var(--color-text-tertiary)]">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

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
  { path: '/dashboard', label: 'Overview', icon: Grid3x3 },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: KeyRound },
  { path: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

// ─── Sidebar ───

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <aside className="flex h-full w-60 flex-col border-r" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg-surface)' }}>
      <Link to="/" className="flex items-center gap-2.5 px-5 pt-5 pb-4 link" onClick={onNavigate}>
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>AgentAPI</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                transitionDuration: 'var(--dur-fast)',
                transitionTimingFunction: 'var(--ease-out)',
                color: isActive ? 'var(--color-accent-base)' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--color-bg-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; } }}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)' }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-5 py-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <button
          onClick={async () => {
            await signOut();
            window.location.href = '/';
          }}
          className="flex w-full items-center gap-2 text-xs link"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
        <Link to="/docs" className="mt-2 flex items-center gap-2 text-xs link" style={{ color: 'var(--color-text-tertiary)' }} onClick={onNavigate}>
          <BookOpen className="w-3.5 h-3.5" />
          API Docs
        </Link>
        <p className="mt-1.5 text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--color-text-disabled)' }}>v0.1</p>
      </div>
    </aside>
  );
}

// ─── Mobile Header ───

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b px-4 lg:hidden"
      style={{
        borderColor: 'var(--color-border-subtle)',
        background: 'var(--color-bg-app)',
      }}
    >
      <Link to="/" className="flex items-center gap-2">
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>AgentAPI</span>
      </Link>
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg interactive"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Mobile Sidebar Overlay ───

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: 'oklch(0 0 0 / 0.6)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── User Bar ───

function UserBar({ user }: { user: UserInfo | null }) {
  if (!user) return null;
  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3 surface"
      style={{ background: 'var(--color-bg-elevated)' }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: 'var(--color-accent-subtle)' }}
      >
        <span className="text-xs font-bold" style={{ color: 'var(--color-accent-base)' }}>{user.tier.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Plan</p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{user.queries_per_month.toLocaleString()} queries this month</p>
      </div>
      <Link
        to="/dashboard/billing"
        className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium btn-ghost"
      >
        Manage
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

// ─── Dashboard Layout ───

function DashboardLayout() {
  const user = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content */}
      <main className="min-h-screen lg:ml-60">
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-12 lg:px-8 lg:pt-8">
          <UserBar user={user} />
          <Routes>
            <Route index element={<Overview />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="billing" element={<Billing />} />
          </Routes>
        </div>
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
        <Route path="/login" element={<Auth />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
