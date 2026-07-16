import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Grid3x3,
  KeyRound,
  CreditCard,
  Menu,
  ChevronRight,
  BookOpen,
  LogOut,
} from 'lucide-react';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Landing from './pages/AuraLanding';
import Docs from './pages/Docs';
import Auth from './pages/Auth';
import Legal from './pages/Legal';
import ResetPassword from './pages/ResetPassword';
import { useSession, signOut } from './lib/auth';
import { LogoMark, AmbientBg, LoadingScreen } from './components/Brand';
import { easeOut, pageTransition, fadeUp } from './lib/motion';

// ─── Route protection ───

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  if (isPending) return <LoadingScreen label="Checking session…" />;
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

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: Grid3x3 },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: KeyRound },
  { path: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <aside className="sidebar-panel flex h-full w-60 flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-5 pt-5 pb-4" onClick={onNavigate}>
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Agent API
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-5 py-4 space-y-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <button
          type="button"
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
        <Link
          to="/docs"
          className="flex items-center gap-2 text-xs link"
          style={{ color: 'var(--color-text-tertiary)' }}
          onClick={onNavigate}
        >
          <BookOpen className="w-3.5 h-3.5" />
          API Docs
        </Link>
        <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--color-text-disabled)' }}>
          v0.1
        </p>
      </div>
    </aside>
  );
}

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="glass-nav fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 lg:hidden">
      <Link to="/" className="flex items-center gap-2">
        <LogoMark className="w-5 h-5" style={{ color: 'var(--color-accent-base)' }} />
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Agent API
        </span>
      </Link>
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-md interactive"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
}

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: 'oklch(0 0 0 / 0.55)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: easeOut }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-[var(--shadow-lg)]"
          >
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UserBar({ user }: { user: UserInfo | null }) {
  if (!user) return null;
  return (
    <motion.div
      className="mb-6 flex items-center gap-3 surface surface-glow px-4 py-3"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ duration: 0.35, ease: easeOut }}
    >
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: 'var(--color-accent-subtle)' }}
      >
        <span className="text-xs font-bold" style={{ color: 'var(--color-accent-base)' }}>
          {user.tier.charAt(0).toUpperCase()}
        </span>
        <span className="signal-dot absolute -right-0.5 -top-0.5" />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} plan
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {user.queries_per_month.toLocaleString()} queries this month
        </p>
      </div>
      <Link to="/dashboard/billing" className="ml-auto btn btn-ghost text-xs" style={{ padding: '0.375rem 0.75rem' }}>
        Manage
        <ChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}

function DashboardLayout() {
  const user = useUser();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
      <AmbientBg intensity="subtle" />

      <div className="relative z-10 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex">
        <Sidebar />
      </div>

      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="relative z-10 min-h-screen lg:ml-60">
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-12 lg:px-8 lg:pt-8 xl:max-w-6xl 2xl:max-w-7xl">
          <UserBar user={user} />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              exit={fadeUp.exit}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route index element={<Overview />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="billing" element={<Billing />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Legal kind="privacy" />} />
        <Route path="/terms" element={<Legal kind="terms" />} />
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
